'use client'
import './index.css'

import { Button, Dropdown, Input, Select, Table, Tag } from '@douyinfe/semi-ui'
import type { TagColor } from '@douyinfe/semi-ui/lib/es/tag'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { Medicine } from '@/component/Page/MedicinePage/type'
import type { Role, UserRole } from '@/component/Page/RolePage/tyoe'
import { NextAxios } from '@/tools/axios/NextAxios'
import type { ResType } from '@/tools/axios/type'

const columns = [
    {
        title: '用户名',
        width: 200,
        dataIndex: 'username',
        fixed: true,
        render: (text: string) => {
            return <div>{text}</div>
        },
        ellipsis: true
    },
    {
        title: '真实姓名',
        width: 100,
        dataIndex: 'full_name',
        render: (text: string) => {
            return <div>{text}</div>
        }
    },
    {
        title: '身份证号',
        width: 200,
        dataIndex: 'id_number',
        render: (text: string) => {
            return <div>{text}</div>
        },
        ellipsis: true
    },
    {
        title: '权限',
        width: 200,
        dataIndex: 'role_name',
        render: (text: string, record: UserRole) => {
            let color: TagColor = 'white'
            switch (record.role_id) {
                case 1:
                    color = 'green'
                    break
                case 2:
                    color = 'blue'
                    break
                case 3:
                    color = 'red'
                    break
                default:
                    break
            }
            return <Tag color={color}>{text}</Tag>
        },
        ellipsis: true
    }
]
const RolePage = () => {
    const [dataSource, setData] = useState<UserRole[]>([])
    const [roleData, setRoleData] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [searchInfo, setSearchInfo] = useState<string>('')
    const [roleId, setRoleId] = useState<number>()
    const [allCount, setAllCount] = useState(0)
    const [selectedRowKeys, setSelectedRowKeys] = useState<
        (string | number)[] | undefined
    >([])
    const [index, setIndex] = useState(1)
    const [pageSize, setPageSize] = useState(5)
    const scroll = useMemo(() => ({ y: 280 }), [])
    const MedicineUploadFormRef = useRef<{
        openModal: () => void
        closeModal: () => void
        setFormValues: (values: Medicine) => void
    }>()
    const getData = useCallback(() => {
        const fetchData = async () => {
            const res: ResType = await NextAxios({
                map: 'get',
                url: `/api/role`,
                data: {
                    searchInfo: searchInfo,
                    role_id: roleId,
                    index: index,
                    pageSize: pageSize
                }
            })
            const newRes: {
                data: UserRole[]
                count: number
                role: Role[]
            } = res.data
            console.log(newRes.data)
            setData(
                newRes?.data.map((item: any) => {
                    item.key = item.id
                    delete item.id
                    return item
                })
            )
            setRoleData(newRes.role)
            setAllCount(newRes.count)
        }
        fetchData().then(() => setLoading(false))
    }, [searchInfo, roleId, index, pageSize])

    const onUpdateRole = useCallback(
        (id: number) => {
            const fetchData = async () => {
                const res: ResType = await NextAxios({
                    map: 'patch',
                    url: `/api/role`,
                    data: {
                        role_id: id,
                        user_ids: selectedRowKeys
                    }
                })
                if (res.code === 200) {
                    getData()
                }
            }
            fetchData()
        },
        [getData, selectedRowKeys]
    )
    useEffect(() => {
        getData()
    }, [roleId, index, pageSize, getData])
    return (
        <>
            <div className={'role-table-header'}>
                <div className={'role-table-header__left'}>
                    <Dropdown
                        trigger={'click'}
                        position={'bottomLeft'}
                        menu={roleData?.map((item) => {
                            return {
                                node: 'item',
                                name: item.name,
                                onClick: () => {
                                    onUpdateRole(item.id)
                                }
                            }
                        })}
                    >
                        <Button
                            disabled={
                                selectedRowKeys && selectedRowKeys?.length == 0
                            }
                        >
                            更新
                        </Button>
                    </Dropdown>
                </div>
                <div className={'role-table-header__right'}>
                    <Select
                        placeholder="权限"
                        style={{ width: 200 }}
                        value={roleId}
                        showClear
                        optionList={roleData?.map((item) => {
                            return {
                                label: item.name,
                                value: item.id,
                                type: item.id
                            }
                        })}
                        onChange={(value) => {
                            console.log('value', value)
                            setRoleId(value as number)
                        }}
                    />
                    <Input
                        placeholder={'请输入用户名'}
                        value={searchInfo}
                        onChange={(value) => {
                            setSearchInfo(value)
                        }}
                    />
                    <Button
                        onClick={() => {
                            console.log('searchInfo', searchInfo)
                            setLoading(true)
                            setIndex(1)
                            getData()
                        }}
                    >
                        搜索
                    </Button>
                </div>
            </div>
            <Table
                loading={loading}
                columns={columns}
                scroll={scroll}
                pagination={{
                    currentPage: index,
                    pageSize: pageSize,
                    pageSizeOpts: [5, 10, 20, 50],
                    total: allCount,
                    showSizeChanger: true,
                    onPageChange: (page) => {
                        console.log(page)
                        setLoading(true)
                        setIndex(page)
                    },
                    onPageSizeChange: (pageSize) => {
                        console.log(pageSize)
                        setLoading(true)
                        setPageSize(pageSize)
                    }
                }}
                rowSelection={{
                    onChange: (selectedRowKeys, selectedRows) => {
                        setSelectedRowKeys(selectedRowKeys)
                        console.log(
                            `selectedRowKeys: ${selectedRowKeys}`,
                            'selectedRows: ',
                            selectedRows
                        )
                    },
                    fixed: true
                }}
                dataSource={dataSource}
            />
        </>
    )
}
export default RolePage
