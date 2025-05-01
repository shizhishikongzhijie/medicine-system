'use client'

import { Spin, Table } from '@douyinfe/semi-ui'
import { useEffect, useState } from 'react'

import type { Menus } from '@/component/layout/type'
import { buildMenu } from '@/tools'
import { NextAxios } from '@/tools/axios/NextAxios'
import type { ResType } from '@/tools/axios/type'

const columns = [
    {
        title: '名称',
        dataIndex: 'name',
        width: 200
    },
    {
        title: '路径',
        dataIndex: 'path',
        width: 200
    },
    {
        title: '菜单图标',
        dataIndex: 'icon',
        width: 200
    }
]
const MenuPage = () => {
    const [dataSource, setDataSource] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const fetchRoleMenus = async () => {
            const res: ResType = await NextAxios({
                url: '/api/menu',
                map: 'get'
            })
            if (res.code === 200) {
                const menu: Menus[] = res.data
                setDataSource(buildMenu(menu))
                setLoading(false)
            }
        }
        fetchRoleMenus()
    }, [])
    return (
        <Spin size="large" spinning={loading}>
            <Table
                columns={columns}
                defaultExpandAllRows
                dataSource={dataSource}
            />
        </Spin>
    )
}
export default MenuPage
