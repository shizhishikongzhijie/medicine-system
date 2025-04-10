'use client'
import {Descriptions, Popover} from "@douyinfe/semi-ui";
import {ReactNode, useCallback, useEffect, useState} from "react";
import {Medicine} from "@/component/Page/MedicinePage/type";
import {UTCFormat} from "@/tools";
import {NextAxios} from "@/tools/axios/NextAxios";

const MedicinePopover = (props: { medicineId?: number; children: ReactNode; initialValue?: Medicine }) => {
    const {medicineId, children, initialValue} = props
    const [medicine, setMedicine] = useState<Medicine>(initialValue as Medicine)
    useEffect(() => {
        if (initialValue) {
            return
        }
        const fetchData = async () => {
            const newRes = await NextAxios({
                map: 'get',
                url: `/api/medicine/id`,
                data: {
                    medicineId: medicineId
                }
            })
            setMedicine(newRes.data);
        }
        fetchData()
    }, []);
    const medicineDescription = useCallback(() => {
        if (!medicine) {
            return <div>loading...</div>
        }
        return (
            <MedicineDescription data={medicine}/>
        )
    }, [medicine])
    return (
        <Popover content={medicineDescription()}>
            {children}
        </Popover>
    )
}
const formatData = (medicine: Medicine) => {
    console.log("Medicine:" + medicine.created_at)
    return [
        {
            key: '药品名称',
            value: medicine.name,
        },
        {
            key: '规格',
            value: medicine.specification,
        },
        {
            key: '单位',
            value: medicine.unit,
        },
        {
            key: '生产厂商',
            value: medicine.manufacturer,
        },
        {
            key: '创建时间',
            value: UTCFormat(medicine.created_at),
        },
        {
            key: '更新时间',
            value: UTCFormat(medicine.updated_at),
        },
    ]
}
const MedicineDescription = ({data}: { data: Medicine }) => {
    console.log("Desdata:" + JSON.stringify(data))
    return (
        <div style={{
            padding: 10,
        }}>
            <Descriptions data={formatData(data)}/>
        </div>
    )
}
export default MedicinePopover