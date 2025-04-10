'use client'
import {Button, Input, Table} from "@douyinfe/semi-ui";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Medicine} from "@/component/Page/MedicinePage/type";
import {UserInfo} from "@/component/Page/LoginPage/type";
import {UTCFormat} from "@/tools";
import {NextAxios} from "@/tools/axios/NextAxios";
import './index.css'

const columns = [
    {
        title: '用户名',
        width: 200,
        dataIndex: 'username',
        fixed: true,
        render: (text: string) => {
            return (
                <div>{text}</div>
            );
        },
        ellipsis: true,
    },
    {
        title: '用户密码',
        width: 200,
        dataIndex: 'password',
        render: (text: string) => <div>{text}</div>,
        ellipsis: true,
    },
    {
        title: '真实姓名',
        width: 100,
        dataIndex: 'full_name',
        render: (text: string) => {
            return (
                <div>{text}</div>
            );
        },
    },
    {
        title: '身份证号',
        width: 200,
        dataIndex: 'id_number',
        render: (text: string) => {
            return (
                <div>{text}</div>
            );
        },
        ellipsis: true,
    },
    {
        title: '住址',
        width: 200,
        dataIndex: 'address',
        render: (text: string) => {
            return (
                <div>{text}</div>
            );
        },
        ellipsis: true,
    },
    {
        title: '创建日期',
        width: 200,
        dataIndex: 'created_at',
        render: (value: string) => {
            return <span>{UTCFormat(value)}</span>
        },
    },
    {
        title: '更新日期',
        width: 200,
        dataIndex: 'updated_at',
        render: (value: string) => {
            return <span>{UTCFormat(value)}</span>
        },
    }
];
const UserPage = () => {
    const [dataSource, setData] = useState<UserInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchInfo, setSearchInfo] = useState<string>('')
    const [allCount, setAllCount] = useState(0);
    const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[] | undefined>([]);
    const [index, setIndex] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const scroll = useMemo(() => ({y: 280,}), []);
    const MedicineUploadFormRef = useRef<{
        openModal: () => void
        closeModal: () => void
        setFormValues: (values: Medicine) => void
    }>();
    const getData = useCallback(() => {
        const fetchData = async () => {
            const res = await NextAxios({
                map: 'get',
                url: `/api/user`,
                data: {
                    searchInfo: searchInfo,
                    index: index,
                    pageSize: pageSize
                }
            })
            const newRes = res.data;
            console.log(newRes.data)
            setData(newRes?.data.map((item: any) => {
                item.key = item.id
                delete item.id;
                return item
            }));
            setAllCount(newRes.count)
        }
        fetchData().then(() => setLoading(false))
    }, [index, searchInfo, pageSize]);
    useEffect(() => {
        getData();
    }, [index, pageSize]);
    return (
        <>
            <div className={'user-table-header'}>
                <div className={'user-table-header__left'}>
                    <Button onClick={() => {
                        console.log('MedicineUploadFormRef', MedicineUploadFormRef)
                        MedicineUploadFormRef?.current?.openModal();
                    }}>导入</Button>
                    <Button disabled={!(selectedRowKeys && selectedRowKeys?.length > 0)}
                    >删除</Button>
                    <Button disabled={selectedRowKeys?.length != 1}>更新</Button>
                </div>
                <div className={'user-table-header__right'}>
                    <Input placeholder={'请输入用户名'} value={searchInfo}
                           onChange={(value) => {
                               setSearchInfo(value)
                           }}
                    />
                    <Button onClick={() => {
                        console.log('searchInfo', searchInfo)
                        setLoading(true);
                        setIndex(1);
                        getData();
                    }}>搜索</Button>
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
                        console.log(page);
                        setLoading(true);
                        setIndex(page);
                    },
                    onPageSizeChange: (pageSize) => {
                        console.log(pageSize);
                        setLoading(true);
                        setPageSize(pageSize);
                    }
                }}
                rowSelection={{
                    onChange: (selectedRowKeys, selectedRows) => {
                        setSelectedRowKeys(selectedRowKeys);
                        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                    },
                    fixed: true,
                }}
                dataSource={dataSource}/>
        </>
    );
};
export default UserPage;