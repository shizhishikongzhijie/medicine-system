import type {NextApiRequest, NextApiResponse} from "next";
import {User} from "@/component/Page/LoginPage/type";
import logger from "@/tools/logger";
import pool from "@/db/index.js";
import argon2 from "argon2";
import {destroyCookie, setCookie} from "nookies";
import jwtService from "@/tools/jwt";
import ResponseService from "@/tools/res";
import {getIp} from "@/tools";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            return logOut(req, res);
        // case 'POST':
        //     return Register(req, res);
        // case 'PATCH':
        //     return updateAccount(req, res);
        // case 'DELETE':
        //     return deleteMedicine(req, res);
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

async function logOut(req: NextApiRequest, res: NextApiResponse) {
    try {
        destroyCookie({res}, "AccessToken");
        destroyCookie({res}, "RefreshToken");
        return ResponseService.success(res, "Logout successfully");
    } catch (e) {
        logger.error(e);
        return ResponseService.error(res, 400, "Logout failed");
    }
}