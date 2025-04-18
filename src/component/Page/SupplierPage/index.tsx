'use client'
import './index.css'

import { Button, Input, Modal, Notification, Table } from '@douyinfe/semi-ui'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { SupplierUploadForm } from '@/component'
import type { Supplier } from '@/component/Page/SupplierPage/type'
import { UTCFormat } from '@/tools'
import { NextAxios } from '@/tools/axios/NextAxios'
import type { ResType } from '@/tools/axios/type'

const columns = [
    {
        title: '供应商',
        width: 200,
        dataIndex: 'name',
        fixed: true,
        render: (text: string) => {
            return <div>{text}</div>
        },
        ellipsis: true
    },
    {
        title: '联系人',
        width: 100,
        dataIndex: 'contact_person',
        render: (text: string) => <div>{text}</div>,
        ellipsis: true
    },
    {
        title: '联系电话',
        width: 200,
        dataIndex: 'phone',
        render: (text: string) => {
            return <div>{text}</div>
        }
    },
    {
        title: '邮箱地址',
        width: 200,
        dataIndex: 'email',
        render: (text: string) => {
            return <div>{text}</div>
        },
        ellipsis: true
    },
    {
        title: '供应商地址',
        width: 200,
        dataIndex: 'address',
        render: (text: string) => {
            return <div>{text}</div>
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
    },
    {
        title: '更新日期',
        width: 200,
        dataIndex: 'updated_at',
        render: (value: string) => {
            return <span>{UTCFormat(value)}</span>
        }
    }
]
const SupplierPage = () => {
    const [dataSource, setData] = useState<Supplier[]>([])
    const [loading, setLoading] = useState(true)
    const [searchInfo, setSearchInfo] = useState<string>('')
    const [allCount, setAllCount] = useState(0)
    const [selectedRowKeys, setSelectedRowKeys] = useState<
        (string | number)[] | undefined
    >([])
    const [index, setIndex] = useState(1)
    const [pageSize, setPageSize] = useState(5)
    const scroll = useMemo(() => ({ y: 280 }), [])
    const SupplierUploadFormRef = useRef<{
        openModal: () => void
        closeModal: () => void
        setFormValues: (values: Supplier) => void
    }>()

    const getData = useCallback(async () => {
        const newRes: ResType = await NextAxios({
            map: 'get',
            url: '/api/supplier',
            data: {
                searchInfo: searchInfo,
                index: index,
                pageSize: pageSize
            }
        })
        console.log(newRes.data)
        setData(
            newRes.data.data.map((item: any) => {
                item.key = item.id
                delete item.id
                return item
            })
        )
        setAllCount(newRes.data.count)
        setLoading(false)
    }, [index, searchInfo, pageSize])
    useEffect(() => {
        getData()
    }, [index, pageSize])

    function deleteConfirm() {
        const names =
            selectedRowKeys?.map((id: any) => {
                const item: Supplier | undefined = dataSource.find(
                    (item: Supplier) => item.key === id
                )
                return item?.name
            }) ?? [] // 处理 selectedRowKeys 为 null/undefined 的情况
        const validNames = names.filter((name) => name !== undefined)
        const content =
            validNames.length > 0 ? validNames.join(', ') : '未选中任何药品'
        Modal.confirm({
            title: '确定删除此药品？',
            content: content,
            onOk: onDelete
        })
    }

    const onDelete = async () => {
        if (!selectedRowKeys || selectedRowKeys.length === 0) {
            return
        }
        const res: ResType = await NextAxios({
            map: 'delete',
            url: '/api/medicine',
            data: {
                ids: selectedRowKeys
            }
        })
        if (res.code === 200) {
            Notification.success({
                title: '删除成功',
                content: '删除成功'
            })
        }
        getData()
    }

    const onUpdate = () => {
        const id = selectedRowKeys?.[0] as number
        SupplierUploadFormRef?.current?.setFormValues(
            dataSource.find((item: Supplier) => item.key === id) as Supplier
        )
        setLoading(true)
        getData()
    }

    return (
        <>
            <SupplierUploadForm
                ref={SupplierUploadFormRef}
                callBack={getData}
            />
            <div className={'supplier-table-header'}>
                <div className={'supplier-table-header__left'}>
                    <Button
                        onClick={() => {
                            console.log(
                                'SupplierUploadFormRef',
                                SupplierUploadFormRef
                            )
                            SupplierUploadFormRef?.current?.openModal()
                        }}
                    >
                        导入
                    </Button>
                    <Button
                        disabled={
                            !(selectedRowKeys && selectedRowKeys?.length > 0)
                        }
                        onClick={deleteConfirm}
                    >
                        删除
                    </Button>
                    <Button
                        disabled={selectedRowKeys?.length != 1}
                        onClick={onUpdate}
                    >
                        更新
                    </Button>
                </div>
                <div className={'supplier-table-header__right'}>
                    <Input
                        placeholder={'请输入供应商名'}
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

export default SupplierPage
