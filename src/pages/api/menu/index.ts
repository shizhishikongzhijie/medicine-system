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
            return getMenus(req, res)
        // case 'POST':
        //     return addMenus(req, res);
        // case 'PATCH':
        //     return updateMenus(req, res);
        // case 'DELETE':
        //     return deleteMenus(req, res);
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
const getMenus = async (req: NextApiRequest, res: NextApiResponse) => {
    const queryRolMenu = `
        SELECT m.*
        FROM menus m
                 INNER JOIN role_menu_permissions rpm ON m.id = rpm.menu_id
                 INNER JOIN user_roles ur ON rpm.role_id = ur.role_id
    `

    try {
        const [roleMenus]: any[] = await pool.query(queryRolMenu)
        return ResponseService.success(res, '查询成功', roleMenus)
    } catch (error) {
        logger.error('Error fetching Menus:', error)
        return ResponseService.error(res, 400, String(error))
    }
}
