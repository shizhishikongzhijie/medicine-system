import type { NextApiRequest, NextApiResponse } from 'next'

import pool from '@/db/index.js'
import ResponseService from '@/tools/res'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case 'GET':
            return getCharts(req, res)
        // case 'PATCH':
        //     return updateUserInfo(req, res);
        // case 'DELETE':
        //     return deleteJwt(req, res);
        default:
            return ResponseService.error(
                res,
                405,
                `Method ${req.method} Not Allowed`
            )
    }
}

async function getCharts(req: NextApiRequest, res: NextApiResponse) {
    const { type } = req.query
    const resultQuery = `
        WITH matched_medicines AS (
            -- 匹配 medicines.manufacturer 和 districts.name
            SELECT m.id    AS medicine_id,
                   d.code  AS district_code,
                   d.name  AS district_name,
                   d.level AS district_level
            FROM medicines m
                     LEFT JOIN
                 districts d
                 ON
                     LEFT(m.manufacturer, 2) = LEFT(d.name, 2) -- 至少前两个字符匹配
            WHERE d.level = 1 -- 只匹配省级行政区划
        ),
             grouped_results AS (
                 -- 统计每个省份的药品数量
                 SELECT COALESCE(mm.district_name, '其他') AS province, -- 如果没有匹配到，则归类为“其他”
                        COUNT(*)                           AS medicine_count
                 FROM medicines m
                          LEFT JOIN
                      matched_medicines mm
                      ON
                          m.id = mm.medicine_id
                 GROUP BY COALESCE(mm.district_name, '其他'))
-- 输出最终结果
        SELECT province,
               medicine_count
        FROM grouped_results
        ORDER BY province;
    `
    try {
        const [result]: any[] = await pool.query(resultQuery)
        return ResponseService.success(res, '查询成功', result)
    } catch (error) {
        return ResponseService.error(res, 500, 'Internal Server Error')
    }
}
