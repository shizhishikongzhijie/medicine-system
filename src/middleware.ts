// ./middleware.ts

// 导入 Next.js 服务器相关的类型和响应对象
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// 从工具模块导入获取客户端 IP 地址的函数
import { getIp } from '@/tools'
import { MiddleAxios } from '@/tools/axios/MiddleAxios'
// import { httpRequestDurationMicroseconds } from '@/tools/httpRequestDurationMicroseconds'

// 定义白名单 IP 地址列表，这些 IP 地址可以绕过中间件检查
const allowedIPs: string[] = ['192.168.1.1', '127.0.0.1', '::1'] // 你的白名单列表

// 导出异步中间件函数，用于处理每个请求
export async function middleware(req: NextRequest) {
    // 获取客户端 IP 地址
    //const start = Date.now()
    const clientIp: string | undefined = getIp(req)
    const url = process.env.BASE_URL
    const setCookieAccessTokenConfig = {
        isSetCookie: false,
        cookieValue: 'string'
    }
    // 从请求的 URL 中解构出路径名、查询参数、原始 URL 和基础路径
    //const {pathname, search, origin, basePath} = req.nextUrl;
    // 打印客户端 IP 地址和请求 URL，用于调试和日志记录
    console.info({ clientIp: clientIp, reqUrl: req.url })

    if (req.url.includes('/api/redis') || req.url.includes('/api/jwt')) {
        // 检查 IP 是否在白名单中
        const ip = getIp(req)
        if (ip === undefined || !allowedIPs.includes(ip)) {
            console.error(`IP ${ip} is not in the allowed list.`)
            return new NextResponse('Forbidden', { status: 403 })
        }
    }

    // 检查请求 URL 是否包含 '/login' 或 '/auth'，如果不包含则进行进一步检查
    const excludedPaths = [
        '/login',
        '/auth',
        '/api/redis',
        '/api/jwt',
        '/api/districts',
        '/api/performance'
    ]
    if (!excludedPaths.some((path) => req.url.includes(path))) {
        // 检查请求的 cookies 中是否包含 'RefreshToken'，如果没有则重定向到登录页面
        if (!req.cookies.has('RefreshToken')) {
            console.error('RefreshToken is missing.')
            return NextResponse.redirect(new URL('/login', req.url))
        } else {
            const refreshToken = req.cookies.get('RefreshToken')?.value
            //检验合法性
            const tokenRes = await MiddleAxios({
                url: url + '/api/jwt',
                map: 'get',
                data: {
                    token: refreshToken
                }
            })
            if (typeof refreshToken === 'string' && tokenRes.code == 200) {
                //解析，和redis对比
                const user = tokenRes.data
                let exp: { EXP_A: number; EXP_R: number } | undefined
                const res = await MiddleAxios({
                    url: url + '/api/redis',
                    map: 'get',
                    data: {
                        db: 0,
                        key: `online_user:${user.id}`
                    }
                })
                if (res.code == 200) {
                    exp = res.data.value
                    if (
                        exp === undefined ||
                        (exp.EXP_A !== user.exp && exp.EXP_R !== user.exp)
                    ) {
                        // 删除 Redis 中的数据
                        console.info({ redisExps: exp, tokenExp: user.exp })
                        const res = await MiddleAxios({
                            url: url + '/api/redis',
                            map: 'delete',
                            data: {
                                db: 0,
                                key: `online_user:${user.id}`
                            }
                        })
                        // 删除 cookies 中的数据
                        res.cookies.delete('AccessToken')
                        res.cookies.delete('RefreshToken')
                        // 重定向到登录页面
                        console.error('Token is old and deleted.')
                        return NextResponse.redirect(new URL('/login', req.url))
                    }
                } else {
                    console.error('Token is old and deleted.')
                    return NextResponse.redirect(new URL('/login', req.url))
                }
            } else {
                console.error('RefreshToken is missing or invalid.')
                return NextResponse.redirect(new URL('/login', req.url))
            }
            if (!req.cookies.has('AccessToken')) {
                // 获取 AccessToken 的值并检查是否存在
                console.error('AccessToken is missing.')
                // 设置 AccessToken，确保值为 string 类型
                setCookieAccessTokenConfig.cookieValue = refreshToken
                setCookieAccessTokenConfig.isSetCookie = true
            }
        }
    }
    const res = NextResponse.next()
    if (setCookieAccessTokenConfig.isSetCookie) {
        res.cookies.set('AccessToken', setCookieAccessTokenConfig.cookieValue, {
            maxAge: Number(process.env.EXPIRATION_TIME_ACCESS_TOKEN),
            path: '/',
            httpOnly: false, // 确保这个不是 true，否则 JavaScript 无法访问
            secure: false // 根据环境变量决定是否开启安全属性
        })
    }
    // const duration = (Date.now() - start) / 1000
    //
    // httpRequestDurationMicroseconds
    //     .labels({
    //         method: req.method,
    //         route: req.nextUrl.pathname,
    //         status: res.status.toString()
    //     })
    //     .observe(duration)
    return res
}

// 导出中间件的配置对象，用于指定中间件应用的路径匹配规则
export const config = {
    // matcher: ["/admin/:path*", "/api/:path*"], // 仅在 admin 和 API 路由执行 Middleware};
    runtime: 'nodejs',
    matcher: [
        '/home/:path*',
        '/medicine/:path*',
        '/stock/:path*',
        '/login/:path*',
        '/api/:path*',
        '/auth/:path*',
        '/log/:path*',
        '/notification/:path*'
    ]
}
