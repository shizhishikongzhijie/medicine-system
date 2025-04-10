import type {Metadata} from "next";
import localFont from "next/font/local";
import "@douyinfe/semi-ui/dist/css/semi.min.css" // --turbo需要，否则没样式
import {ReduxProvider} from "@/store";
import {cookies} from "next/headers";
import "./globals.css";
import jwtService from "@/tools/jwt";
import pool from "@/db/index.js";
import logger from "@/tools/logger";
import {Menus} from "@/component/layout/type";
import {CustomLayout} from "@/component";

// const geistSans = localFont({
//     src: "./fonts/GeistVF.woff",
//     variable: "--font-geist-sans",
//     weight: "100 900",
// });
const MiSans = localFont({
    src: "./fonts/MiSans-Regular.woff2",
    variable: "--font-mi-sans-regular",
    // weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "医药管理系统",
    description: "医药管理系统",
};

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {
    // 请求菜单
    const cookieStore = cookies();
    const tokenCookies = cookieStore.get("AccessToken"); // 获取所有名为 AccessToken 的 Cookie
    // logger.info("cookie:", tokenCookies);

    const token = tokenCookies?.value; // 提取第一个 Cookie 的 value
    logger.info("cookie:", {token: token});
    let menus: Menus[] | undefined = undefined;
    if (token && !jwtService.isTokenExpired(token)) {
        try {
            const user: any = jwtService.verifyToken(token); // 验证 Token
            console.log("Token 验证成功:", user);
            menus = await getMenusPool(user.id);
            logger.info("getMenusSync result:", menus);

            logger.info("用户信息:", user); // 示例：打印用户信息（根据需求使用）
        } catch (error) {
            logger.error("Token 验证失败:", error);
        }
    } else {
        logger.warn("未找到 AccessToken Cookie");
    }
    logger.info("getMenusSync results:", menus);

    return (
        <html lang="Zh-CN">
        <body className={`${MiSans.variable} ${geistMono.variable}`}>
        <ReduxProvider>
            <CustomLayout menus={menus}>
                {children}
            </CustomLayout>
        </ReduxProvider>
        </body>
        </html>
    );
}
// 定义 SQL 查询字符串为常量，便于维护
const MENU_QUERY = `
    SELECT m.*
    FROM menus m
             INNER JOIN role_menu_permissions rpm ON m.id = rpm.menu_id
             INNER JOIN user_roles ur ON rpm.role_id = ur.role_id
    WHERE ur.user_id = ?
`;

// 改进后的 getMenusPool 函数
const getMenusPool = async (uid: string | number): Promise<any[]> => {
    // 校验 uid 是否为合法的数字类型
    const idNumber = Number(uid);
    if (isNaN(idNumber)) {
        throw new Error("Invalid UID: Must be a valid number.");
    }

    try {
        // 执行数据库查询
        const [rows]: any[] = await pool.query(MENU_QUERY, idNumber);
        return rows;
    } catch (error) {
        // 捕获并处理数据库查询错误
        console.error("Database query failed:", error);
        throw new Error("Failed to fetch menus from the database.");
    }
};