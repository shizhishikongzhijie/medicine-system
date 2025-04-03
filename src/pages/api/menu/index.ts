import type {NextApiRequest, NextApiResponse} from 'next';
import pool from "@/db/index.js";
import logger from "@/tools/logger";
import ResponseService from "@/tools/res";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const {uid} = req.query || req.body;
    if (!uid) return ResponseService.info(res, 400, 'Missing uid');
    const idNumber = Number(uid);
    const query = `
        SELECT m.*
        FROM menus m
                 INNER JOIN role_menu_permissions rpm ON m.id = rpm.menu_id
                 INNER JOIN user_roles ur ON rpm.role_id = ur.role_id
        WHERE ur.user_id = ?
    `;

    try {
        const [rows]: any[] = await pool.query(query, idNumber);
        return ResponseService.success(res, "查询成功", rows[0]);
    } catch (error) {
        logger.error('Error fetching medicine:', error);
        return ResponseService.error(res, 400, String(error));
    }
}