import type { NextApiRequest, NextApiResponse } from "next";

import pool from "@/db/index.js";
import logger from "@/tools/logger";
import ResponseService from "@/tools/res";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { medicineId } = req.query || req.body;
  if (!medicineId) return ResponseService.info(res, 400, "Missing medicineId");
  const idNumber = Number(medicineId);
  const query = `
        SELECT *
        FROM medicines
        WHERE id = ?
    `;
  try {
    const [rows]: any[] = await pool.query(query, idNumber);
    return ResponseService.success(res, "查询成功", rows[0]);
  } catch (error) {
    logger.error("Error fetching medicine:", error);
    return ResponseService.error(res, 400, String(error));
  }
}
