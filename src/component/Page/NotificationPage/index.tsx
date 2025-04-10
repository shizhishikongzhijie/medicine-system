'use client'
import './index.css'

import { Button, Input, Table, Tag } from '@douyinfe/semi-ui'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { Medicine } from '@/component/Page/MedicinePage/type'
import type { NotificationUser } from '@/component/Page/NotificationPage/type'
import { UTCFormat } from '@/tools'
import { NextAxios } from '@/tools/axios/NextAxios'
import type { ResType } from '@/tools/axios/type'

const columns = [
    {
        title: '标题',
        width: 150,
        dataIndex: 'title',
        fixed: true,
        render: (text: string) => {
            return <div>{text}</div>
        },
        ellipsis: true
    },
    {
        title: '内容',
        width: 200,
        dataIndex: 'content',
        render: (text: string) => <div>{text}</div>,
        ellipsis: true
    },
    {
        title: '创建者',
        width: 100,
        dataIndex: 'created_by_name',
        render: (text: string) => {
            return <div>{text}</div>
        }
    },
    {
        title: '是否展示',
        width: 100,
        dataIndex: 'is_read',
        render: (text: number) => {
            return (
                <Tag color={text === 0 ? 'green' : 'red'}>
                    {' '}
                    {text === 0 ? '展示' : '禁止'}{' '}
                </Tag>
            )
        },
        ellipsis: true
    },
    {
        title: '创建日期',
        width: 200,
        dataIndex: 'created_at',
        render: (value: string) => {
            return <span>{UTCFormat(value)}</span>
        }
    }
]

const NotificationPage = () => {
    const [dataSource, setData] = useState<NotificationUser[]>([])
    const [loading, setLoading] = useState(true)
    const [searchInfo, setSearchInfo] = useState<string>('')
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
                url: `/api/notifications`,
                data: {
                    searchInfo: searchInfo,
                    index: index,
                    pageSize: pageSize
                }
            })
            const newRes = res.data
            console.log(newRes.data)
            setData(
                newRes?.data.map((item: any) => {
                    item.key = item.id
                    delete item.id
                    return item
                })
            )
            setAllCount(newRes.count)
        }
        fetchData().then(() => setLoading(false))
    }, [index, searchInfo, pageSize])
    useEffect(() => {
        getData()
    }, [index, pageSize])
    return (
        <>
            <div className={'notification-table-header'}>
                <div className={'notification-table-header__left'}>
                    <Button
                        onClick={() => {
                            MedicineUploadFormRef?.current?.openModal()
                        }}
                    >
                        导入
                    </Button>
                    <Button
                        disabled={
                            !(selectedRowKeys && selectedRowKeys?.length > 0)
                        }
                    >
                        删除
                    </Button>
                    <Button disabled={selectedRowKeys?.length != 1}>
                        更新
                    </Button>
                </div>
                <div className={'notification-table-header__right'}>
                    <Input
                        placeholder={'请输入信息'}
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
export default NotificationPage
