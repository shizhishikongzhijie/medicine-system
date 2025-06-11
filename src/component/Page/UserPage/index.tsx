'use client'
import './index.css'

import { Button, Image, Input, Table } from '@douyinfe/semi-ui'
import { Workbook } from 'exceljs'
import { saveAs } from 'file-saver'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { UserUploadForm } from '@/component'
import type { UserInfo } from '@/component/Page/LoginPage/type'
import type { User } from '@/component/userInfoAddition/type'
import { getBase64FromImageUrl, UTCFormat } from '@/tools'
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
        title: '头像',
        width: 200,
        dataIndex: 'avatar_path',
        render: (text: string) => {
            return <Image width={100} height={100} src={text} alt={text} />
        },
        ellipsis: true
    },
    {
        title: '用户密码',
        width: 200,
        dataIndex: 'password',
        render: (text: string) => <div>{text}</div>,
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
        title: '住址',
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
const UserPage = () => {
    const [dataSource, setData] = useState<UserInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [searchInfo, setSearchInfo] = useState<string>('')
    const [allCount, setAllCount] = useState(0)
    const [selectedRowKeys, setSelectedRowKeys] = useState<
        (string | number)[] | undefined
    >([])
    const [index, setIndex] = useState(1)
    const [pageSize, setPageSize] = useState(5)
    const scroll = useMemo(() => ({ y: 280 }), [])
    const UserUploadFormRef = useRef<{
        openModal: () => void
        closeModal: () => void
        setFormValues: (values: User) => void
    }>()
    //  浏览器环境下的 Excel 导出函数
    const generateExcel = async () => {
        const workbook = new Workbook()
        const worksheet = workbook.addWorksheet('User')

        // 添加标题行
        worksheet.addRow(['用户名', '头像', '住址'])

        let rowIdx = 2 // 数据从第2行开始

        for (const item of dataSource) {
            try {
                const base64 = await getBase64FromImageUrl(item.avatar_path)

                // 添加一行数据（头像列暂时留空）
                worksheet.addRow([item.username, '', item.address])

                // 添加图片到工作簿
                const imageId = workbook.addImage({
                    base64: base64,
                    extension: 'png'
                })

                // 插入图片到指定位置
                worksheet.addImage(imageId, {
                    tl: { col: 1, row: rowIdx - 1 }, // 图片左上角定位在第2列（B列）、当前行
                    ext: { width: 100, height: 100 } // 图片尺寸
                })
            } catch (error) {
                console.error(
                    `Error converting image for user ${item.username}:`,
                    error
                )

                // 插入数据行，头像列为 'N/A'
                worksheet.addRow([item.username, 'N/A', item.address])
            }

            rowIdx++
        }

        // 设置列宽
        worksheet.columns = [
            { key: 'username', width: 15 },
            { key: 'avatar', width: 15 },
            { key: 'address', width: 30 }
        ]

        // 生成 Blob 并触发下载
        const buffer = await workbook.xlsx.writeBuffer() //  使用 writeBuffer 生成 Blob
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        saveAs(blob, 'User.xlsx') //  使用 file-saver 保存
        console.log('Excel 文件已生成')
    }

    const getData = useCallback(() => {
        const fetchData = async () => {
            const res: ResType = await NextAxios({
                map: 'get',
                url: `/api/user`,
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
    const onUpdate = () => {
        const id = selectedRowKeys?.[0] as number
        UserUploadFormRef?.current?.setFormValues(
            dataSource.find((item: User) => item.key === id) as User
        )
        setLoading(true)
        getData()
    }
    return (
        <>
            <UserUploadForm ref={UserUploadFormRef} />
            <div className={'user-table-header'}>
                <div className={'user-table-header__left'}>
                    {/*<Button*/}
                    {/*    onClick={() => {*/}
                    {/*        console.log('UserUploadFormRef', UserUploadFormRef)*/}
                    {/*        UserUploadFormRef?.current?.openModal()*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    导入*/}
                    {/*</Button>*/}
                    <Button
                        disabled={
                            !(selectedRowKeys && selectedRowKeys?.length > 0)
                        }
                    >
                        删除
                    </Button>
                    <Button
                        disabled={selectedRowKeys?.length != 1}
                        onClick={onUpdate}
                    >
                        更新
                    </Button>
                    <Button onClick={generateExcel}>导出</Button>
                </div>
                <div className={'user-table-header__right'}>
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
export default UserPage
