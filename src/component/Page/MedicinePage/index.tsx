'use client'
import './index.css'

import { Button, Input, Modal, Notification, Table } from '@douyinfe/semi-ui'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { MedicineUploadForm } from '@/component'
import type { Medicine } from '@/component/Page/MedicinePage/type'
import { UTCFormat } from '@/tools'
import { NextAxios } from '@/tools/axios/NextAxios'
import type { ResType } from '@/tools/axios/type'

const columns = [
    {
        title: '药品名',
        width: 200,
        dataIndex: 'name',
        fixed: true,
        render: (text: string) => {
            return <div>{text}</div>
        },
        ellipsis: true
    },
    {
        title: '规格',
        width: 200,
        dataIndex: 'specification',
        render: (text: string) => <div>{text}</div>,
        ellipsis: true
    },
    {
        title: '单位',
        width: 100,
        dataIndex: 'unit',
        render: (text: string) => {
            return <div>{text}</div>
        }
    },
    {
        title: '生产厂商',
        width: 200,
        dataIndex: 'manufacturer',
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
const MedicinePage = () => {
    const [dataSource, setData] = useState<Medicine[]>([])
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

    const getData = useCallback(async () => {
        const newRes: ResType = await NextAxios({
            map: 'get',
            url: '/api/medicine',
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
                const item: Medicine | undefined = dataSource.find(
                    (item: Medicine) => item.key === id
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
        MedicineUploadFormRef?.current?.setFormValues(
            dataSource.find((item: Medicine) => item.key === id) as Medicine
        )
        setLoading(true)
        getData()
    }

    return (
        <>
            <MedicineUploadForm
                ref={MedicineUploadFormRef}
                callBack={getData}
            />
            <div className={'medicine-table-header'}>
                <div className={'medicine-table-header__left'}>
                    <Button
                        onClick={() => {
                            console.log(
                                'MedicineUploadFormRef',
                                MedicineUploadFormRef
                            )
                            MedicineUploadFormRef?.current?.openModal()
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
                <div className={'medicine-table-header__right'}>
                    <Input
                        placeholder={'请输入药品名'}
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

export default MedicinePage
