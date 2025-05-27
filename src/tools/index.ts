import type { IncomingHttpHeaders } from 'node:http'

import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import type { NextApiRequest } from 'next'
import type { NextRequest } from 'next/server'

import type { Menus } from '@/component/layout/type'
import { initNavItems } from '@/config/navigation'
import { routerMap } from '@/config/routes'

/**
 * 将UTC时间字符串转换为指定时区的时间格式
 * @param utcTimeString UTC时间字符串，表示需要转换的时间
 * @returns 返回转换后的日期字符串，格式为 'yyyy-MM-dd HH:mm:ss'
 */
export function UTCFormat(utcTimeString: string) {
    const timeZone = 'UTC' // 或者其它有效的时区标识符
    // 将UTC时间字符串转换为指定时区的时间，并格式化为'yyyy-MM-dd HH:mm:ss'
    return format(toZonedTime(utcTimeString, timeZone), 'yyyy-MM-dd HH:mm:ss')
}

/**
 * 获取客户端 IP 地址
 *
 * 该函数从请求对象中提取客户端的 IP 地址。它支持 Next.js 的两种请求类型：
 * NextApiRequest 和 NextRequest。函数首先检查 'x-forwarded-for' 头部，
 * 如果不存在，则尝试从其他头部或请求属性中获取 IP 地址。最后，函数还处理
 * IPv6 到 IPv4 的映射，并过滤掉无效的 IP 地址。
 *
 * @param req - 请求对象，可以是 NextApiRequest 或 NextRequest 类型
 * @returns 客户端 IP 地址，如果无法获取则返回 undefined
 */
export function getIp(req: NextRequest | NextApiRequest): string | undefined {
    let clientIp: string | undefined

    // 检查请求对象和头部是否存在
    if (!req || !req.headers) {
        return undefined
    }

    try {
        if (isNextApiRequest(req)) {
            // 处理 Node.js API 路由 (NextApiRequest)
            const headers = req.headers as IncomingHttpHeaders

            // 优先检查 x-forwarded-for
            const forwardedFor = headers['x-forwarded-for']
            if (forwardedFor) {
                clientIp = Array.isArray(forwardedFor)
                    ? forwardedFor[0].trim()
                    : forwardedFor.trim()
                clientIp = clientIp.split(',')[0].trim()
            }

            // 如果没有 x-forwarded-for，尝试从 socket 获取
            if (!clientIp && req.socket?.remoteAddress) {
                clientIp = req.socket.remoteAddress
            }
        } else {
            // 处理 Edge API 路由或 Middleware (NextRequest)
            const forwardedFor = req.headers.get('x-forwarded-for')
            if (forwardedFor) {
                clientIp = forwardedFor.split(',')[0].trim()
            }

            // 尝试其他可能的头（如 x-real-ip）
            if (!clientIp) {
                const realIp = req.headers.get('x-real-ip')
                if (realIp) {
                    clientIp = realIp.split(',')[0].trim()
                }
            }

            // 在 Edge 环境中尝试 req.ip（可能由某些服务器设置）
            if (!clientIp && req.ip) {
                clientIp = req.ip
            }
        }

        // 处理 IPv6 到 IPv4 的映射（如 ::ffff:127.0.0.1 → 127.0.0.1）
        if (clientIp?.startsWith('::ffff:')) {
            clientIp = clientIp.replace('::ffff:', '')
        }

        // 过滤掉无效的 IP（如 ::1）
        if (clientIp && !isValidIp(clientIp)) {
            clientIp = undefined
        }
    } catch (error) {
        console.error('Error getting client IP:', error)
        return undefined
    }

    return clientIp
}

/**
 * 类型守卫函数：判断是否为 NextApiRequest。
 *
 * @param req - 要判断的请求对象，可能是 NextRequest 或 NextApiRequest 类型。
 * @returns 如果请求对象是 NextApiRequest 类型，则返回 true；否则返回 false。
 *
 * //t: 该函数通过检查请求对象中是否存在 "socket" 属性，并且该属性不为空，
 * //r: 来判断请求对象是否为 NextApiRequest 类型。
 * //n: 这是因为 NextApiRequest 类型的请求对象通常包含一个 socket 属性，
 * //n: 而 NextRequest 类型的请求对象则没有。
 */
function isNextApiRequest(
    req: NextRequest | NextApiRequest
): req is NextApiRequest {
    return 'socket' in req && !!req.socket
}

/**
 * 检查给定的字符串是否是一个有效的IP地址（IPv4或IPv6）。
 *
 * @param ip - 要检查的字符串。
 * @returns 如果字符串是一个有效的IPv4或IPv6地址，则返回true；否则返回false。
 *
 * //t 正则表达式用于匹配IPv4地址。
 * //t IPv4地址由四个数字组成，每个数字的范围是0-255，数字之间用点号分隔。
 * //r 正则表达式用于匹配IPv6地址。
 * //r IPv6地址由八组十六进制数字组成，每组数字的范围是0-FFFF，组之间用冒号分隔。
 * //n 该函数首先使用IPv4的正则表达式进行匹配，如果匹配失败，则使用IPv6的正则表达式进行匹配。
 */
function isValidIp(ip: string): boolean {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/
    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}
// 构建最终菜单函数
type MenuItem = {
    id: number
    key: number
    name: string
    path: string
    icon?: React.ReactNode
    children?: MenuItem[]
}

export function buildMenu(rawMenuData: Menus[]): MenuItem[] {
    // 创建原始数据的 map，方便通过 name 快速查找
    const menuMap = new Map<string, Menus[][number]>(
        rawMenuData.map((item) => [item.name, item])
    )

    return initNavItems.map((navItem) => {
        // 找到对应名称的原始数据项
        const rawData = menuMap.get(navItem.text)
        const id = rawData?.id ?? Math.random() // 如果没找到用随机数代替
        const url = rawData?.url ?? '#'

        const menuItem: MenuItem = {
            id,
            key: id,
            name: navItem.text,
            path: url,
            icon: navItem.icon,
            children: []
        }

        if (navItem.items && navItem.items.length > 0) {
            menuItem.children = navItem.items
                .map((subNavItem) => {
                    const subRawData = menuMap.get(subNavItem.text)
                    const subId = subRawData?.id ?? Math.random()
                    return {
                        id: subId,
                        key: subId,
                        name: subNavItem.text,
                        path:
                            routerMap[
                                subNavItem.itemKey as keyof typeof routerMap
                            ] || '#',
                        icon: null
                    }
                })
                .filter(Boolean)
        }

        return menuItem
    })
}

export const getBase64FromImageUrl = async (url: string): Promise<string> => {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch image from ${url}`)

    const blob = await response.blob()
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string) // Base64
        reader.onerror = (error) => reject(error)
        reader.readAsDataURL(blob)
    })
}
