import type {NextApiRequest, NextApiResponse} from 'next';
import pool from "@/db/index.js";
import logger from "@/tools/logger";
import ResponseService from "@/tools/res";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            return getStock(req, res);
        case 'POST':
            return addStock(req, res);
        case 'PATCH':
            return updateStock(req, res);
        case 'DELETE':
            return deleteStock(req, res);
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
const getStock = async (req: NextApiRequest, res: NextApiResponse) => {

    // 使用可选属性和类型断言
    const {searchInfo, index, pageSize}: {
        searchInfo?: string | string[];
        index?: string | string[],
        pageSize?: string | string[]
    } = req.query;

    // 处理类型转换和默认值
    const searchValue = typeof searchInfo === 'string' ? searchInfo : '';
    const pageNum = typeof index === 'string' ? parseInt(index, 10) : 1;
    const pageSizeNum = typeof pageSize === 'string' ? parseInt(pageSize, 10) : 5;
    // 安全处理分页参数
    const offset = (pageNum - 1) * pageSizeNum;
    const queryCount = `SELECT COUNT(1) AS count
                        FROM stock_in_records s,
                             medicines m
                        WHERE medicine_id = m.id
                          AND m.name LIKE ?`;
    const query = `
        SELECT m.name medicine_name,
               s.*
        FROM stock_in_records s,
             medicines m
        WHERE medicine_id = m.id
          AND name LIKE ?
        ORDER BY s.id DESC
        LIMIT ? OFFSET ?
    `;
    try {
        const [countResult]: any[] = await pool.query(queryCount, [`%${searchValue}%`]);
        const [dataResult]: any[] = await pool.query(query, [`%${searchValue}%`, pageSizeNum, offset]);
        return ResponseService.success(res, "查询成功", {
            count: countResult[0].count,
            data: dataResult
        });
    } catch (error) {
        console.error('Error fetching medicine:', error);
        return ResponseService.error(res, 400, String(error));
    }
}

const addStock = async (req: NextApiRequest, res: NextApiResponse) => {
    const {medicine_id, quantity, batch_number, production_date, expiry_date, remark} = req.body;

    // 验证参数有效性
    if (!medicine_id || !quantity || !batch_number || !production_date || !expiry_date) {
        return ResponseService.info(res, 400, 'Missing required parameters');
    }
    try {
        const result = await pool.query(
            'INSERT INTO stock_in_records (medicine_id, quantity, batch_number, production_date, expiry_date, remark, stock_in_date) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [medicine_id, quantity, batch_number, production_date, expiry_date, remark]
        );
        return ResponseService.success(res,
            'Stock added successfully',
            {affectedRows: result}
        );
    } catch (error) {
        logger.error('Error adding stock:', error);
        return ResponseService.error(res, 400, String(error));
    }
}
const updateStock = async (req: NextApiRequest, res: NextApiResponse) => {
    const {id, medicine_id, quantity, batch_number, production_date, expiry_date, remark} = req.body;
    const query = `
        UPDATE stock_in_records
        SET medicine_id     = ?,
            quantity        = ?,
            batch_number    = ?,
            production_date = ?,
            expiry_date     = ?,
            remark          = ?
        WHERE id = ?`
    try {
        // 使用参数化查询防止SQL注入
        const result = await pool.query(query, [medicine_id, quantity, batch_number, production_date, expiry_date, remark, id]);
        return ResponseService.success(res, 'Stock updated successfully');
    } catch (error) {
        console.error('Error updating stock:', error);
        return ResponseService.error(res, 400, String(error));
    }
};
const deleteStock = async (req: NextApiRequest, res: NextApiResponse) => {
    const {ids} = req.body;
    const idsParam = ids as (string | number)[];
    let numericIds: number[];

    // 将参数转换为数字数组并验证
    if (Array.isArray(idsParam)) {
        numericIds = idsParam.map(id => parseInt(id as string, 10));
    } else {
        return ResponseService.info(res, 400, 'Invalid ids parameter');
    }

    // 验证ID有效性
    if (numericIds.some(id => isNaN(id)) || numericIds.length === 0) {
        return ResponseService.info(res, 400, 'Invalid or empty ids');
    }

    // 动态生成IN子句的占位符
    const placeholders = numericIds.map(() => '?').join(', ');
    const query = `
        DELETE
        FROM stock_in_records
        WHERE id IN (${placeholders})
    `;

    try {
        const result = await pool.query(query, numericIds);
        return ResponseService.success(res,
            'Stock deleted successfully',
            {
                affectedRows: result
            }
        );
    } catch (error) {
        logger.error('Error deleting medicine:', error);
        return ResponseService.error(res, 400, String(error));
    }
};