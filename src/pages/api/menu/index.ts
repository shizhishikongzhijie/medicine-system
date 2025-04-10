import type {NextApiRequest, NextApiResponse} from 'next';
import pool from "@/db/index.js";
import logger from "@/tools/logger";
import ResponseService from "@/tools/res";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            return getMenus(req, res);
        // case 'POST':
        //     return addMenus(req, res);
        // case 'PATCH':
        //     return updateMenus(req, res);
        // case 'DELETE':
        //     return deleteMenus(req, res);
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
const getMenus = async (req: NextApiRequest, res: NextApiResponse) => {
    const queryRolMenu = `
        SELECT r.id                       as role_id,
               r.name                     as role_name,
               JSON_ARRAYAGG(m.name)      as menu_names,
               JSON_ARRAYAGG(m.id)        as menu_ids,
               JSON_ARRAYAGG(m.url)       as menu_paths,
               JSON_ARRAYAGG(m.parent_id) as menu_parent_ids
        FROM menus m
                 INNER JOIN role_menu_permissions rmp ON m.id = rmp.menu_id
                 INNER JOIN roles r ON rmp.role_id = r.id
        GROUP BY r.id;
    `;

    try {
        const [roleMenus]: any[] = await pool.query(queryRolMenu);
        return ResponseService.success(res, "查询成功", roleMenus);
    } catch (error) {
        logger.error('Error fetching medicine:', error);
        return ResponseService.error(res, 400, String(error));
    }
}