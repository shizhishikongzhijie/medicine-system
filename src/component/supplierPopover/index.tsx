'use client'
import { Descriptions, Popover } from '@douyinfe/semi-ui'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'

import type { Medicine } from '@/component/Page/MedicinePage/type'
import type { Supplier } from '@/component/Page/SupplierPage/type'
import { UTCFormat } from '@/tools'
import { NextAxios } from '@/tools/axios/NextAxios'
import type { ResType } from '@/tools/axios/type'

const SupplierPopover = (props: {
    supplierId?: number
    children: ReactNode
    initialValue?: Medicine
}) => {
    const { supplierId, children, initialValue } = props
    const [supplier, setSupplier] = useState<Supplier>(initialValue as Supplier)
    useEffect(() => {
        if (initialValue) {
            return
        }
        const fetchData = async () => {
            const newRes: ResType = await NextAxios({
                map: 'get',
                url: `/api/supplier/id`,
                data: {
                    supplierId: supplierId
                }
            })
            setSupplier(newRes.data)
        }
        fetchData()
    }, [])
    const supplierDescription = useCallback(() => {
        if (!supplier) {
            return <div>loading...</div>
        }
        return <SupplierDescription data={supplier} />
    }, [supplier])
    return <Popover content={supplierDescription()}>{children}</Popover>
}
const formatData = (supplier: Supplier) => {
    console.log('Medicine:' + supplier.created_at)
    return [
        {
            key: '供应商名称',
            value: supplier.name
        },
        {
            key: '联系人姓名',
            value: supplier.contact_person
        },
        {
            key: '联系电话',
            value: supplier.phone
        },
        {
            key: '邮箱地址',
            value: supplier.email
        },
        {
            key: '地址',
            value: supplier.address
        },
        {
            key: '创建时间',
            value: UTCFormat(supplier.created_at)
        },
        {
            key: '更新时间',
            value: UTCFormat(supplier.updated_at)
        }
    ]
}
const SupplierDescription = ({ data }: { data: Supplier }) => {
    console.log('Desdata:' + JSON.stringify(data))
    return (
        <div
            style={{
                padding: 10
            }}
        >
            <Descriptions data={formatData(data)} />
        </div>
    )
}
export default SupplierPopover
