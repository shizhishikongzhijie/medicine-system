import type {NextApiRequest, NextApiResponse} from "next";
import {User} from "@/component/Page/LoginPage/type";
import logger from "@/tools/logger";
import pool from "@/db/index.js";
import argon2 from "argon2";
import {setCookie} from "nookies";
import jwtService from "@/tools/jwt";
import ResponseService from "@/tools/res";
import {getIp} from "@/tools";
import {RedisClientInstance} from "@/tools/redis";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            return Login(req, res);
        case 'POST':
            return Register(req, res);
        // case 'PATCH':
        //     return updateAccount(req, res);
        // case 'DELETE':
        //     return deleteMedicine(req, res);
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

const Login = async (req: NextApiRequest, res: NextApiResponse) => {
    const {username, password}: { username?: string | string[]; password?: string | string[] } = req.query;
    if (!username || !password) {
        return ResponseService.error(res, 400, 'Missing username or password');
    }
    try {
        const query = `
            SELECT password, id
            FROM users
            WHERE username = ?
        `;
        const [rows]: any[] = await pool.query(query, [username]);

        if (rows.length === 0) {
            return ResponseService.info(res, 400, '用户名不存在');
        }

        const storedHashedPassword = rows[0].password;

        // 使用 argon2 验证密码
        const isPasswordValid = await argon2.verify(storedHashedPassword, password as string);
        if (!isPasswordValid) {
            return ResponseService.info(res, 400, '用户名或密码错误');
        }
        //设置cookie
        const id = rows[0].id;
        //存储登录日志
        const queryLog = `
            INSERT INTO online_user_logs (user_id, login_time, ip_address)
            VALUES (?, NOW(), ?)
        `;
        await pool.query(queryLog, [id, getIp(req) || "未知"]);
        logger.info(`User ${id} logged in ${getIp(req) || "未知"}`);
        const payload = {id: rows[0].id, username: username};
        const accessToken = jwtService.generateToken(payload, {expiresIn: '1h'});
        await RedisClientInstance.selectDb(0);
        const tokenVerified: any = jwtService.verifyToken(accessToken);
        logger.info(`User ${id} token is ${tokenVerified || "未知"}`);
        setCookie({res}, 'AccessToken', accessToken, {
            maxAge: process.env.EXPIRATION_TIME_ACCESS_TOKEN,
            path: '/',
            httpOnly: false, // 确保这个不是 true，否则 JavaScript 无法访问
            secure: false, // 根据环境变量决定是否开启安全属性
        })
        const refreshToken = jwtService.generateToken(payload, {expiresIn: '7d'});
        const rTokenVerified: any = jwtService.verifyToken(refreshToken);
        logger.info(`User ${id} token is ${rTokenVerified || "未知"}`);
        await RedisClientInstance.set(`online_user:${id}`, {EXP_A: tokenVerified.exp, EXP_R: rTokenVerified.exp});
        setCookie({res}, 'RefreshToken', refreshToken, {
            maxAge: process.env.EXPIRATION_TIME_REFRESH_TOKEN,
            path: '/',
            httpOnly: false, // 确保这个不是 true，否则 JavaScript 无法访问
            secure: false, // 根据环境变量决定是否开启安全属性
        })
        return ResponseService.success(res, "登录成功");
    } catch (error) {
        logger.error('Error fetching user:', error);
        return ResponseService.error(res, 500, String(error));
    }
};
const Register = async (req: NextApiRequest, res: NextApiResponse) => {
    const {...user}: User = req.body;
    logger.info('Received user information:', user);
    if (!user) {
        return ResponseService.error(res, 400, 'Missing user information');
    }

    if (!user.username || !user.password || !user.full_name || !user.birth_date || !user.id_number || !user.address_code) {
        return ResponseService.error(res, 400, 'Missing required user information');
    }
    try {
        // 使用 argon2 加密密码
        const hashedPassword = await argon2.hash(user.password);

        // 开启事务
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 创建用户
            const queryUsers = `
                INSERT INTO users (username, password, full_name, birth_date, id_number, address_code)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const [userResult] = await connection.query(queryUsers, [
                user.username,
                hashedPassword, // 使用 argon2 加密后的密码
                user.full_name,
                user.birth_date,
                user.id_number,
                user.address_code
            ]);
            // 确保 userResult 是 QueryResult 类型
            const insertId = (userResult as { insertId: number }).insertId;

            // 关联角色
            const queryRoles = `
                INSERT INTO user_roles (user_id, role_id)
                VALUES (?, 1)
            `;
            await connection.query(queryRoles, [insertId]);

            // 提交事务
            await connection.commit();
            return ResponseService.success(res, 'User registered successfully');
        } catch (error) {
            // 回滚事务
            await connection.rollback();
            logger.error('Error registering user:', error);
            return ResponseService.error(res, 400, String(error));
        } finally {
            // 释放连接
            connection.release();
        }
    } catch (error) {
        logger.error('Error processing request:', error);
        return ResponseService.error(res, 400, String(error));
    }
};