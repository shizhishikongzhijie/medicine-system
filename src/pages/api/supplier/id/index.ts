import type { NextApiRequest, NextApiResponse } from 'next'

import pool from '@/db/index.js'
import logger from '@/tools/logger'
import ResponseService from '@/tools/res'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { supplierId } = req.query || req.body
    if (!supplierId) return ResponseService.info(res, 400, 'Missing supplierId')
    const idNumber = Number(supplierId)
    const query = `
        SELECT *
        FROM suppliers
        WHERE id = ?
    `
    try {
        const [rows]: any[] = await pool.query(query, idNumber)
        return ResponseService.success(res, '查询成功', rows[0])
    } catch (error) {
        logger.error('Error fetching supplier:', error)
        return ResponseService.error(res, 400, String(error))
    }
}
