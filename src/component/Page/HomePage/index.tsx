'use client'

import { Skeleton } from '@douyinfe/semi-ui'
import { useEffect, useState } from 'react'

import { LineChart, PerformanceCard, PieChart } from '@/component'
import { NextAxios } from '@/tools/axios/NextAxios'
import type { ResType } from '@/tools/axios/type'

const HomePage = () => {
    const [provinceMedicine, setProvinceMedicine] = useState([])
    const [provinceMedicineLoading, setProvinceMedicineLoading] =
        useState<boolean>(true)
    const [provinceUserLoading, setProvinceUserLoading] =
        useState<boolean>(true)
    const [provinceUser, setProvinceUser] = useState([])
    useEffect(() => {
        Promise.all([fetchProvinceMedicine(), fetchProvienceUser()])
    }, [])
    const fetchProvinceMedicine = async () => {
        const res: ResType = await NextAxios({
            url: '/api/charts',
            map: 'get',
            data: {
                type: 1
            }
        })
        if (res.code === 200) {
            setProvinceMedicine(res.data)
            setProvinceMedicineLoading(false)
        }
    }
    const fetchProvienceUser = async () => {
        const res: ResType = await NextAxios({
            url: '/api/charts',
            map: 'get',
            data: {
                type: 2
            }
        })
        if (res.code === 200) {
            setProvinceUser(res.data)
            setProvinceUserLoading(false)
        }
    }
    const placeholder = (
        <Skeleton.Image style={{ width: '100%', height: '300px' }} />
    )

    return (
        <div>
            <PerformanceCard />
            {/*<Skeleton*/}
            {/*    active*/}
            {/*    placeholder={placeholder}*/}
            {/*    loading={provinceMedicineLoading}*/}
            {/*    style={{*/}
            {/*        width: '-webkit-fill-available',*/}
            {/*        height: '300px',*/}
            {/*        position: 'relative'*/}
            {/*    }}*/}
            {/*>*/}
            <div
                style={{
                    display: 'grid',
                    gap: '20px',
                    gridTemplateColumns: '1fr 1fr'
                }}
            >
                <Skeleton
                    placeholder={placeholder}
                    active={true}
                    loading={provinceMedicineLoading}
                >
                    <PieChart
                        barData={provinceMedicine}
                        style={{
                            height: '300px'
                        }}
                        titleContent={'省份药品数量'}
                        categoryField={'province'}
                        valueField={'medicine_count'}
                    />
                </Skeleton>
                <Skeleton
                    placeholder={placeholder}
                    active={true}
                    loading={provinceUserLoading}
                >
                    <PieChart
                        barData={provinceUser}
                        style={{
                            height: '300px'
                        }}
                        titleContent={'省份用户数量'}
                        categoryField={'province'}
                        valueField={'user_count'}
                    />
                </Skeleton>
                <Skeleton>
                    <LineChart
                        style={{
                            height: '300px'
                        }}
                    />
                </Skeleton>
            </div>
            {/*</Skeleton>*/}
        </div>
    )
}
export default HomePage
