'use client'

import { IconHome, IconSafe } from '@douyinfe/semi-icons'
import { Table } from '@douyinfe/semi-ui'
import { useEffect, useState } from 'react'

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
    useEffect(() => {
        const fetchRoleMenus = async () => {
            const res: ResType = await NextAxios({
                url: '/api/menu',
                map: 'get'
            })
            if (res.code === 200) {
                console.log(res.data)
            }
        }
        fetchRoleMenus()
        setDataSource([
            {
                id: 1,
                key: 1,
                name: '首页',
                path: '/home',
                icon: <IconHome size="large" />
            },
            {
                id: 2,
                key: 2,
                name: '角色管理',
                path: '/root',
                icon: <IconSafe size="large" />,
                children: [
                    {
                        id: 3,
                        key: 3,
                        name: '权限管理',
                        path: '/permission',
                        icon: <IconHome size="large" />
                    }
                ]
            }
        ])
    }, [])
    return (
        <div>
            <Table
                columns={columns}
                defaultExpandAllRows
                dataSource={dataSource}
            />
        </div>
    )
}
export default MenuPage
