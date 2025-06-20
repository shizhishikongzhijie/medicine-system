import type { NextApiRequest, NextApiResponse } from 'next'

import pool from '@/db/index.js'
import logger from '@/tools/logger'
import ResponseService from '@/tools/res'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case 'GET':
            return getUserInfo(req, res)
        case 'PATCH':
            return updateUserInfo(req, res)
        case 'DELETE':
            return deleteUserInfo(req, res)
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
const getUserInfo = async (req: NextApiRequest, res: NextApiResponse) => {
    // 使用可选属性和类型断言
    const {
        searchInfo,
        index,
        pageSize
    }: {
        searchInfo?: string | string[]
        index?: string | string[]
        pageSize?: string | string[]
    } = req.query

    // 处理类型转换和默认值
    const searchValue = typeof searchInfo === 'string' ? searchInfo : ''
    const pageNum = typeof index === 'string' ? parseInt(index, 10) : 1
    const pageSizeNum =
        typeof pageSize === 'string' ? parseInt(pageSize, 10) : 5
    // 安全处理分页参数
    const offset = (pageNum - 1) * pageSizeNum

    const queryCount = `SELECT COUNT(1) AS count
                        FROM users
                        WHERE users.username LIKE ?`
    const query = `
        WITH RECURSIVE district_hierarchy AS (
            -- 基础查询：找到用户地址对应的初始记录
            SELECT d.code,
                   d.name,
                   d.parent_code,
                   CAST(d.name AS CHAR(255)) AS full_address,
                   users.id                  AS user_id
            FROM districts d
                     INNER JOIN
                 users ON users.address_code = d.code
            UNION ALL
            -- 递归查询：向上查找父级行政区划
            SELECT d.code,
                   d.name,
                   d.parent_code,
                   CONCAT_WS('/', d.name, dh.full_address) AS full_address,
                   dh.user_id
            FROM districts d
                     INNER JOIN
                 district_hierarchy dh ON d.code = dh.parent_code)
-- 只选择最终的完整地址记录
        SELECT users.*,
               dh.full_address AS address
        FROM users
                 LEFT JOIN district_hierarchy dh ON users.id = dh.user_id
        WHERE parent_code IS NULL
           OR parent_code NOT IN (SELECT code FROM districts)
            AND users.username LIKE ?
        ORDER BY users.id DESC
        LIMIT ? OFFSET ?;
    `
    try {
        // 使用参数化查询防止SQL注入
        // 在try块内修改以下两处：
        const [countResult]: any[] = await pool.query(queryCount, [
            `%${searchValue}%`
        ])
        const [dataResult]: any[] = await pool.query(query, [
            `%${searchValue}%`,
            pageSizeNum,
            offset
        ])
        // 以这种方式记录日志，使得对象被作为metadata处理
        logger.info('查询计数结果', { countResult })
        logger.info('查询结果', { dataResult })
        return ResponseService.success(res, '查询成功', {
            count: countResult[0].count, // 修改此处
            data: dataResult // 修改此处
        })
    } catch (error) {
        logger.error('Error fetching user:', error)
        return ResponseService.error(res, 400, String(error))
    }
}

const updateUserInfo = async (req: NextApiRequest, res: NextApiResponse) => {
    const { id, username, avatar_path } = req.body
    if (!id || !username || !avatar_path) {
        return ResponseService.info(res, 400, 'Invalid parameters')
    }
    console.log('Received user information:', req.body)
    const query = `
        UPDATE users
        SET username = ?,
            avatar_path = ?
        WHERE id = ?
    `
    try {
        const [result]: any[] = await pool.query(query, [
            username,
            avatar_path,
            id
        ])
        return ResponseService.success(res, '更新成功', result)
    } catch (error) {
        logger.error('Error fetching user:', error)
        return ResponseService.error(res, 400, String(error))
    }
}
const deleteUserInfo = async (req: NextApiRequest, res: NextApiResponse) => {
    const { ids } = req.body
    const idsParam = ids as (string | number)[]
    let numericIds: number[]

    // 将参数转换为数字数组并验证
    if (Array.isArray(idsParam)) {
        numericIds = idsParam.map((id) => parseInt(id as string, 10))
    } else {
        return ResponseService.info(res, 400, 'Invalid ids parameter')
    }

    // 验证ID有效性
    if (numericIds.some((id) => isNaN(id)) || numericIds.length === 0) {
        return ResponseService.info(res, 400, 'Invalid or empty ids')
    }

    // 动态生成IN子句的占位符
    const placeholders = numericIds.map(() => '?').join(', ')
    const query = `
        DELETE
        FROM users
        WHERE id IN (${placeholders})
    `

    try {
        const result = await pool.query(query, numericIds)
        return ResponseService.success(res, 'Medicine deleted successfully', {
            affectedRows: result
        })
    } catch (error) {
        console.error('Error deleting medicine:', error)
        return ResponseService.error(res, 400, String(error))
    }
}
