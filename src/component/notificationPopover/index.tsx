import './index.css'

import { Badge, Collapsible, Empty, List } from '@douyinfe/semi-ui'
import { useEffect, useState } from 'react'

import type { Notification } from '@/component/layout/type'
import { NextAxios } from '@/tools/axios/NextAxios'
import { ResType } from '@/tools/axios/type'

interface NotificationPopoverProps {
    dataSource?: Notification[]
}

const NotificationPopover: React.FC<NotificationPopoverProps> = ({
    dataSource
}) => {
    const [dataSourceDot, setDataSourceDot] = useState<boolean[]>([])

    useEffect(() => {
        // 检查 dataSource 是否存在，若不存在则设置为空数组
        if (dataSource) {
            setDataSourceDot(dataSource.map((item) => item.has_read ?? false))
        } else {
            setDataSourceDot([])
        }
    }, [dataSource]) // 添加依赖项以确保在 dataSource 更新时重新执行

    const fetchRead = async (id: number, index: number) => {
        const res: ResType = await NextAxios({
            url: '/api/notifications/read',
            map: 'post',
            data: {
                id: id
            }
        })
        if (res.code === 200) {
            setDataSourceDot((prevDots) =>
                prevDots.map((dot, i) => (i === index ? true : dot))
            )
        }
    }
    return (
        <List
            dataSource={dataSource}
            className={'message-popover'}
            emptyContent={<Empty description="暂无系统通知" />}
            renderItem={(item: Notification, index: number) => (
                <List.Item
                    main={
                        <Collapsible isOpen={!dataSourceDot[index]}>
                            <div onClick={() => fetchRead(item.id,index)}>
                                <span
                                    style={{
                                        color: 'var(--semi-color-text-0)',
                                        fontWeight: 500
                                    }}
                                >
                                    {item.title}
                                    {dataSourceDot[index] ? (
                                        <></>
                                    ) : (
                                        <Badge dot></Badge>
                                    )}
                                </span>
                                <p
                                    className={'message-popover-content'}
                                    style={{
                                        color: 'var(--semi-color-text-2)',
                                        margin: '4px 0'
                                    }}
                                >
                                    {item.content}
                                </p>
                            </div>
                        </Collapsible>
                    }
                />
            )}
            header={
                <div
                    style={{
                        fontWeight: 500,
                        color: 'var(--semi-color-text-0)'
                    }}
                >
                    系统通知
                </div>
            }
            footer={<a href="/notification">查看全部</a>}
        />
    )
}
export default NotificationPopover
