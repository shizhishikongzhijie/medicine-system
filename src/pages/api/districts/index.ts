import type { NextApiRequest, NextApiResponse } from "next";

import pool from "@/db/index.js";
import logger from "@/tools/logger";
import ResponseService from "@/tools/res";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "GET":
      return searchByParentCode(req, res);
    // case 'POST':
    //     return loginAndRegister(req, res);
    // case 'PATCH':
    //     return updateAccount(req, res);
    // case 'DELETE':
    //     return deleteMedicine(req, res);
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
const searchByParentCode = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  try {
    const { parentCode } = req.query;
    let query = `
            SELECT d.*,
                   (SELECT COUNT(*) = 0 AS isLeaf FROM districts dc WHERE dc.parent_code = d.code) AS isLeaf
            FROM districts d
            WHERE d.parent_code = ?
        `;
    if (!parentCode) {
      query = `
                SELECT d.*,
                       (SELECT COUNT(*) = 0 AS isLeaf FROM districts dc WHERE dc.parent_code = d.code) AS isLeaf
                FROM districts d
                WHERE d.parent_code IS NULL
            `;
    }
    // if (!parentCode) return res.status(400).json({message: 'Missing parentCode'});
    const [districts] = await pool.query(query, [parentCode]);
    return ResponseService.success(res, "查询成功", {
      districts: districts,
    });
  } catch (e) {
    logger.error(e);
    return ResponseService.error(res, 500, "Internal Server Error");
  }
};
