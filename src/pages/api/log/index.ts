import type {NextApiRequest, NextApiResponse} from "next";
import logger from "@/tools/logger";
import pool from "@/db/index.js";
import ResponseService from "@/tools/res";
import {parseCookies, setCookie} from "nookies";
import jwtService from "@/tools/jwt";
import {getIp} from "@/tools";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            return getLog(req, res);
        case 'POST':
            return addLog(req, res);
        case 'PATCH':
            return updateLog(req, res);
        // case 'DELETE':
        //     return deleteMedicine(req, res);
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

async function getLog(req: NextApiRequest, res: NextApiResponse) {
    try {
        const {index, pageSize} = req.query;
        const cookies = parseCookies({req});
        const pageNumber = parseInt(index as string);
        const pageSizeNum = parseInt(pageSize as string);
        const offset = (pageNumber - 1) * pageSizeNum;
        const queryCount = 'SELECT COUNT(*) AS count FROM online_user_logs WHERE user_id = ?';

        const query = `SELECT *
                       FROM online_user_logs
                       WHERE user_id = ?
                       ORDER BY id DESC
                       LIMIT ? OFFSET ?`;

        let token = cookies.AccessToken;
        // 检查请求的 cookies 中是否包含 'AccessToken'，如果没有则尝试从 'RefreshToken' 中获取
        if (!token) {
            token = cookies.RefreshToken;
            //更新AccessToken
            setCookie({res}, 'AccessToken', token, {
                maxAge: process.env.EXPIRATION_TIME_ACCESS_TOKEN,
                path: '/',
                httpOnly: false, // 确保这个不是 true，否则 JavaScript 无法访问
                secure: false, // 根据环境变量决定是否开启安全属性
            })
        }
        let uid;
        if (token && !jwtService.isTokenExpired(token)) {
            try {
                const user: any = jwtService.verifyToken(token); // 验证 Token
                uid = user.id;
                logger.info("Token 验证成功: 用户信息:", user); // 示例：打印用户信息（根据需求使用）
            } catch (error) {
                logger.error("Token 验证失败:", error);
                return ResponseService.error(res, 401, "Token 验证失败");
            }
        }
        const [countResult]: any[] = await pool.query(queryCount, [uid]);
        const [dataResult]: any[] = await pool.query(query, [uid, pageSizeNum, offset]);
        // 以这种方式记录日志，使得对象被作为metadata处理
        logger.info('查询计数结果', {countResult});
        logger.info('查询数据结果', {dataResult});
        return ResponseService.success(res, "查询成功", {
            count: countResult[0].count,
            data: dataResult
        });
    } catch (error) {
        logger.error(error);
        return ResponseService.error(res, 400, String(error));
    }
}

async function addLog(req: NextApiRequest, res: NextApiResponse) {
    try {
        const cookies = parseCookies({req});
        let token = cookies.AccessToken;
        // 检查请求的 cookies 中是否包含 'AccessToken'，如果没有则尝试从 'RefreshToken' 中获取
        if (!token) {
            token = cookies.RefreshToken;
            //更新AccessToken
            setCookie({res}, 'AccessToken', token, {
                maxAge: process.env.EXPIRATION_TIME_ACCESS_TOKEN,
                path: '/',
                httpOnly: false, // 确保这个不是 true，否则 JavaScript 无法访问
                secure: false, // 根据环境变量决定是否开启安全属性
            })
        }
        let uid;
        if (token && !jwtService.isTokenExpired(token)) {
            try {
                const user: any = jwtService.verifyToken(token); // 验证 Token
                uid = user.id;
                logger.info("Token 验证成功: 用户信息:", user); // 示例：打印用户信息（根据需求使用）
            } catch (error) {
                logger.error("Token 验证失败:", error);
                return ResponseService.error(res, 401, "Token 验证失败");
            }
        }
        const query = 'INSERT INTO online_user_logs (user_id, ip_address) VALUES (?, ?)';
        const [result] = await pool.query(query, [uid, getIp(req)]);
        logger.info('插入日志结果', {result});
        return ResponseService.success(res, "插入成功", result);
    } catch (error) {
        logger.error(error);
        return ResponseService.error(res, 400, String(error));
    }
}

async function updateLog(req: NextApiRequest, res: NextApiResponse) {
    try {
        const cookies = parseCookies({req});
        let token = cookies.AccessToken;
        // 检查请求的 cookies 中是否包含 'AccessToken'，如果没有则尝试从 'RefreshToken' 中获取
        if (!token) {
            token = cookies.RefreshToken;
            //更新AccessToken
            setCookie({res}, 'AccessToken', token, {
                maxAge: process.env.EXPIRATION_TIME_ACCESS_TOKEN,
                path: '/',
                httpOnly: false, // 确保这个不是 true，否则 JavaScript 无法访问
                secure: false, // 根据环境变量决定是否开启安全属性
            })
        }
        let uid;
        if (token && !jwtService.isTokenExpired(token)) {
            try {
                const user: any = jwtService.verifyToken(token); // 验证 Token
                uid = user.id;
                logger.info("Token 验证成功: 用户信息:", user); // 示例：打印用户信息（根据需求使用）
            } catch (error) {
                logger.error("Token 验证失败:", error);
                return ResponseService.error(res, 401, "Token 验证失败");
            }
        }
        const query = 'UPDATE online_user_logs SET logout_time = ? WHERE user_id = ? AND logout_time IS NULL';
        const [result] = await pool.query(query, [new Date(), uid]);
        logger.info('更新日志结果', {result});
        return ResponseService.success(res, "更新成功", result);
    } catch (error) {
        logger.error(error);
        return ResponseService.error(res, 400, String(error));
    }
}