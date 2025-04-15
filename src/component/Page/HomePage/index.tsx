'use client'

import { Skeleton } from '@douyinfe/semi-ui'
import { useEffect, useState } from 'react'

import {
    LineChart,
    PerformanceCard,
    PieChart,
    RopeSimulation
} from '@/component'
import { NextAxios } from '@/tools/axios/NextAxios'
import type { ResType } from '@/tools/axios/type'

const HomePage = () => {
    const [provinceMedicine, setProvinceMedicine] = useState([])
    const [provinceMedicineLoading, setProvinceMedicineLoading] =
        useState<boolean>(true)
    useEffect(() => {
        fetchProvinceMedicine()
    }, [])
    const fetchProvinceMedicine = async () => {
        const res: ResType = await NextAxios({
            url: '/api/charts',
            map: 'get'
        })
        if (res.code === 200) {
            setProvinceMedicine(res.data)
            setProvinceMedicineLoading(false)
        }
    }
    const placeholder = (
        <div style={{ display: 'flex', gap: '20px' }}>
            <Skeleton.Image style={{ width: '100%', height: '300px' }} />
            <Skeleton.Image style={{ width: '100%', height: '300px' }} />
        </div>
    )

    return (
        <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
            <RopeSimulation />
            <PerformanceCard />
            <Skeleton
                active
                placeholder={placeholder}
                loading={provinceMedicineLoading}
                style={{
                    width: '-webkit-fill-available',
                    height: '300px',
                    position: 'relative'
                }}
            >
                <div style={{ display: 'flex', gap: '20px' }}>
                    <LineChart
                        style={{
                            height: '300px'
                        }}
                    />
                    <PieChart
                        barData={provinceMedicine}
                        style={{
                            height: '300px'
                        }}
                        categoryField={'province'}
                        valueField={'medicine_count'}
                    />
                </div>
            </Skeleton>
        </div>
    )
}
export default HomePage
