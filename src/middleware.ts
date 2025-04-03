// ./middleware.ts

// 导入 Next.js 服务器相关的类型和响应对象
import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";
// 从工具模块导入获取客户端 IP 地址的函数
import {getIp} from "@/tools";
import jwtService from "@/tools/jwt";
import {RedisClientInstance} from "@/tools/redis";

// 定义白名单 IP 地址列表，这些 IP 地址可以绕过中间件检查
//const allowedIPs: string[] = ["192.168.1.1", "127.0.0.1", "::1"]; // 你的白名单列表

// 导出异步中间件函数，用于处理每个请求
export async function middleware(req: NextRequest, res: NextResponse) {
    // 获取客户端 IP 地址
    let clientIp: string | undefined = getIp(req);
    // 从请求的 URL 中解构出路径名、查询参数、原始 URL 和基础路径
    //const {pathname, search, origin, basePath} = req.nextUrl;
    // 打印客户端 IP 地址和请求 URL，用于调试和日志记录
    console.info({clientIp: clientIp, reqUrl: req.url})


    // 检查请求 URL 是否包含 '/login' 或 '/auth'，如果不包含则进行进一步检查
    if (!req.url.includes('/login') && !req.url.includes('/auth')) {
        // 检查请求的 cookies 中是否包含 'RefreshToken'，如果没有则重定向到登录页面
        if (!req.cookies.has('RefreshToken')) {
            console.error("RefreshToken is missing.");
            return NextResponse.redirect(new URL('/login', req.url));
        } else {
            const refreshToken = req.cookies.get('RefreshToken')?.value;
            //检验合法性
            if (typeof refreshToken === "string" && jwtService.isTokenExpired(refreshToken)) {
                //解析，和redis对比
                let user: any = jwtService.verifyToken(refreshToken);
                let isValid = await RedisClientInstance.exists(user.id);
                let exp: number | undefined | null;
                if (isValid) {
                    exp = await RedisClientInstance.get(user.id);
                }
                if (exp === undefined || exp !== user.exp) {
                    // 删除 Redis 中的数据
                    await RedisClientInstance.del(user.id);
                    // 删除 cookies 中的数据
                    res.cookies.delete('AccessToken');
                    res.cookies.delete('RefreshToken');
                    // 重定向到登录页面
                    console.error("Token is old and deleted.");
                    return NextResponse.redirect(new URL('/login', req.url));
                }
            } else {
                console.error("RefreshToken is missing or invalid.");
                return NextResponse.redirect(new URL('/login', req.url));
            }
            if (!req.cookies.has('AccessToken')) {
                // 获取 AccessToken 的值并检查是否存在
                console.error("AccessToken is missing.");
                // 设置 AccessToken，确保值为 string 类型
                req.cookies.set({
                    name: 'AccessToken',
                    value: refreshToken,
                    maxAge: process.env.EXPIRATION_TIME_ACCESS_TOKEN,
                    path: '/',
                    httpOnly: false, // 确保这个不是 true，否则 JavaScript 无法访问
                    secure: false, // 根据环境变量决定是否开启安全属性
                });
            }

        }
    }

    // 如果所有检查都通过，则继续处理请求
    return NextResponse.next();
}

// 导出中间件的配置对象，用于指定中间件应用的路径匹配规则
export const config = {
    // matcher: ["/admin/:path*", "/api/:path*"], // 仅在 admin 和 API 路由执行 Middleware};
    matcher: [
        "/home/:path*",
        "/medicine/:path*",
        "/stock/:path*",
        "/login/:path*",
        "/api/:path*",
        "/auth/:path*",
        "/log/:path*",
        "/notification/:path*",
        "/",
    ],
}