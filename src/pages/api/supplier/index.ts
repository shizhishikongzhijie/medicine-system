import type { NextApiRequest, NextApiResponse } from 'next'

import pool from '@/db/index.js'
import ResponseService from '@/tools/res'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case 'GET':
            return getSupplier(req, res)
        // case 'POST':
        //     return addSupplier(req, res)
        // case 'PATCH':
        //     return updateSupplier(req, res)
        // case 'DELETE':
        //     return deleteSupplier(req, res)
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
const getSupplier = async (req: NextApiRequest, res: NextApiResponse) => {
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
    const queryCount = `
        SELECT COUNT(1) AS count
        FROM suppliers
        WHERE (
                  name LIKE ?
                      OR contact_person LIKE ?
                  )`
    const query = `
        SELECT *
        FROM suppliers
        WHERE (
                  name LIKE ?
                      OR contact_person LIKE ?
                  )
        ORDER BY id DESC
        LIMIT ? OFFSET ?
    `
    const dataList: (string | number)[] = [
        `%${searchValue}%`,
        `%${searchValue}%`
    ]
    try {
        const [countResult]: any[] = await pool.query(queryCount, [...dataList])
        const [dataResult]: any[] = await pool.query(query, [
            ...dataList,
            pageSizeNum,
            offset
        ])
        return ResponseService.success(res, '查询成功', {
            count: countResult[0].count,
            data: dataResult
        })
    } catch (error) {
        console.error('Error fetching medicine:', error)
        return ResponseService.error(res, 400, String(error))
    }
}
