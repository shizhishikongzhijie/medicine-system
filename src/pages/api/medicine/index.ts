import type {NextApiRequest, NextApiResponse} from 'next';

import pool from "@/db/index.js";
import logger from "@/tools/logger";
import ResponseService from "@/tools/res";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            return getMedicine(req, res);
        case 'POST':
            return addMedicine(req, res);
        case 'PATCH':
            return updateMedicine(req, res);
        case 'DELETE':
            return deleteMedicine(req, res);
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
const getMedicine = async (req: NextApiRequest, res: NextApiResponse) => {
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
                        FROM medicines
                        WHERE name LIKE ?`;
    const query = `
        SELECT *
        FROM medicines
        WHERE name LIKE ?
        ORDER BY id DESC
        LIMIT ? OFFSET ?
    `;

    try {
        // 使用参数化查询防止SQL注入
        // 在try块内修改以下两处：
        const [countResult]: any[] = await pool.query(queryCount, [`%${searchValue}%`]);
        const [dataResult]: any[] = await pool.query(query, [`%${searchValue}%`, pageSizeNum, offset]);
        // 以这种方式记录日志，使得对象被作为metadata处理
        logger.info('查询计数结果', {countResult});
        logger.info('查询数据结果', {dataResult});
        return ResponseService.success(res, "查询成功", {
            count: countResult[0].count,
            data: dataResult
        });
    } catch (error) {
        logger.error('Error fetching medicine:', error);
        return ResponseService.error(res, 400, String(error));
    }
}

const addMedicine = async (req: NextApiRequest, res: NextApiResponse) => {
    const {name, specification, unit, manufacturer} = req.body;

    const query = `
        INSERT INTO medicines (name, specification, unit, manufacturer)
        VALUES (?, ?, ?, ?)
    `;
    try {
        // 使用参数化查询防止SQL注入
        const result = await pool.query(query, [name, specification, unit, manufacturer]);
        return ResponseService.success(res, 'Medicine added successfully');
    } catch (error) {
        console.error('Error adding medicine:', error);
        return ResponseService.error(res, 400, String(error));
    }
}
const updateMedicine = async (req: NextApiRequest, res: NextApiResponse) => {
    const {id, name, specification, unit, manufacturer} = req.body;

    const query = `
        UPDATE medicines
        SET name          = ?,
            specification = ?,
            unit          = ?,
            manufacturer  = ?
        WHERE id = ?
    `;
    try {
        // 使用参数化查询防止SQL注入
        const result = await pool.query(query, [name, specification, unit, manufacturer, id]);
        return ResponseService.success(res, 'Medicine updated successfully');
    } catch (error) {
        console.error('Error updating medicine:', error);
        return ResponseService.error(res, 400, String(error));
    }
}
const deleteMedicine = async (req: NextApiRequest, res: NextApiResponse) => {
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
        FROM medicines
        WHERE id IN (${placeholders})
    `;

    try {
        const result = await pool.query(query, numericIds);
        return ResponseService.success(res,
            'Medicine deleted successfully',
            {affectedRows: result}
        );
    } catch (error) {
        console.error('Error deleting medicine:', error);
        return ResponseService.error(res, 400, String(error));
    }
};
