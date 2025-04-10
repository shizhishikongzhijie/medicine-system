'use client'
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {NotificationUser} from "@/component/Page/NotificationPage/type";
import {Medicine} from "@/component/Page/MedicinePage/type";
import {NextAxios} from "@/tools/axios/NextAxios";
import {Table} from "@douyinfe/semi-ui";
import {UTCFormat} from "@/tools";

const columns = [
    {
        title: 'ip地址',
        width: 150,
        dataIndex: 'ip_address',
        fixed: true,
        render: (text: string) => {
            return (
                <div>{text}</div>
            );
        },
        ellipsis: true,
    },
    {
        title: '登录时间',
        width: 200,
        dataIndex: 'login_time',
        render: (value: string) => {
            return <span>{UTCFormat(value)}</span>
        },
    },
    {
        title: '登出时间',
        width: 200,
        dataIndex: 'logout_time',
        render: (value: string | null) => {

            return <span>{value ? UTCFormat(value) : '未退出'}</span>
        },
    }
];

const LogPage = () => {
    const [dataSource, setData] = useState<NotificationUser[]>([]);
    const [loading, setLoading] = useState(true);
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
                url: `/api/log`,
                data: {
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
    }, [index, pageSize]);
    useEffect(() => {
        getData();
    }, [index, pageSize]);
    return (
        <>
            {/*<div className={'notification-table-header'}>*/}
            {/*    <div className={'notification-table-header__left'}>*/}
            {/*        <Button onClick={() => {*/}
            {/*            MedicineUploadFormRef?.current?.openModal();*/}
            {/*        }}>导入</Button>*/}
            {/*        <Button disabled={!(selectedRowKeys && selectedRowKeys?.length > 0)}*/}
            {/*        >删除</Button>*/}
            {/*        <Button disabled={selectedRowKeys?.length != 1}>更新</Button>*/}
            {/*    </div>*/}
            {/*    <div className={'notification-table-header__right'}>*/}
            {/*        <Input placeholder={'请输入信息'} value={searchInfo}*/}
            {/*               onChange={(value) => {*/}
            {/*                   setSearchInfo(value)*/}
            {/*               }}*/}
            {/*        />*/}
            {/*        <Button onClick={() => {*/}
            {/*            console.log('searchInfo', searchInfo)*/}
            {/*            setLoading(true);*/}
            {/*            setIndex(1);*/}
            {/*            getData();*/}
            {/*        }}>搜索</Button>*/}
            {/*    </div>*/}
            {/*</div>*/}
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
                // rowSelection={{
                //     onChange: (selectedRowKeys, selectedRows) => {
                //         setSelectedRowKeys(selectedRowKeys);
                //         console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                //     },
                //     fixed: true,
                // }}
                dataSource={dataSource}/>
        </>
    );
}
export default LogPage