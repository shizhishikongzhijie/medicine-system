// 导入所需的库
import type { NextApiRequest, NextApiResponse } from 'next'
import si from 'systeminformation'

import logger from '@/tools/logger'
import ResponseService from '@/tools/res'

// 定义 API 路由处理函数
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        // 获取 CPU 和内存使用情况的数据
        const [cpuData, memoryData, diskIoData, osData] = await Promise.all([
            si.currentLoad(), // 获取当前 CPU 负载
            si.mem(), // 获取内存使用情况
            si.disksIO() // 获取磁盘 I/O 使用情况
            // si.osInfo()
        ])

        // 返回 JSON 格式的响应
        ResponseService.success(res, '获取性能数据成功', {
            cpu: {
                usage: cpuData.currentLoad // 当前 CPU 使用率
            },
            memory: {
                total: memoryData.total, // 总内存
                used: memoryData.used, // 已使用内存
                free: memoryData.free // 空闲内存
            },
            diskIo: {
                percent: diskIoData?.tWaitPercent || 0 // 磁盘 I/O 等待百分比
            }
            // os: {
            //     platform: osData.platform, // 操作系统平台
            //     distro: osData.distro, // 操作系统发行版
            //     release: osData.release, // 操作系统版本
            //     kernel: osData.kernel // 操作系统内核版本
            // }
        })
    } catch (error) {
        logger.error('Error fetching performance data:', error)
        ResponseService.error(res, 500, '获取性能数据失败')
    }
}
