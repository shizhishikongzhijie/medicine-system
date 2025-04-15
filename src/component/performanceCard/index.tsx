import { useEffect, useRef, useState } from 'react'

import { LiquidChart } from '@/component'
import { NextAxios } from '@/tools/axios/NextAxios'
import type { ResType } from '@/tools/axios/type'

const App = () => {
    const fetchInterval = 2000 // 提取时间间隔为变量
    const isGettingRef = useRef(false)
    const [cpuPercent, setCpuPercent] = useState(0)
    const [diskIoPercent, setDiskIoPercent] = useState(0)
    const [memoryPercent, setMemoryPercent] = useState(0)
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (isGettingRef.current) {
                return
            } else {
                isGettingRef.current = true
                fetchPerformance()
            }
        }, fetchInterval)

        // 清理定时器
        return () => clearInterval(intervalId)
    }, [])
    const fetchPerformance = async () => {
        const res: ResType = await NextAxios({
            url: '/api/performance',
            map: 'get'
        })
        if (res.code === 200) {
            const newRes = res.data
            setCpuPercent(Number((newRes.cpu.usage / 100).toFixed(2)))
            setDiskIoPercent(Number((newRes.diskIo.percent / 100).toFixed(2)))
            setMemoryPercent(
                Number((newRes.memory.used / newRes.memory.total).toFixed(2))
            )
            isGettingRef.current = false
        }
    }
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                height: '200px'
            }}
        >
            <LiquidChart
                values={[{ value: cpuPercent }]}
                indicatorTitle={'CPU使用率'}
                indicatorTextContent={`${cpuPercent * 100}%`}
            />
            <LiquidChart
                values={[{ value: diskIoPercent }]}
                indicatorTitle={'磁盘IO使用率'}
                indicatorTextContent={`${diskIoPercent * 100}%`}
            />
            <LiquidChart
                values={[{ value: memoryPercent }]}
                indicatorTitle={'内存使用率'}
                indicatorTextContent={`${memoryPercent * 100}%`}
            />
        </div>
    )
}
export default App
