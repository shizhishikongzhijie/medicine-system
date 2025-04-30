'use client'
import { Form, Modal, Notification, Switch } from '@douyinfe/semi-ui'
import type { FormApi } from '@douyinfe/semi-ui/lib/es/form'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'

import type { NotificationUser } from '@/component/Page/NotificationPage/type'
import { NextAxios } from '@/tools/axios/NextAxios'
import type { ResType } from '@/tools/axios/type'

interface NotificationUploadFormProps {
    callBack?: () => Promise<void> | void
}

const NotificationUploadForm = forwardRef(
    (props: NotificationUploadFormProps, ref) => {
        const { callBack } = props
        const [modalVisible, setModalVisible] = useState(false)
        const [showChecked, setShowChecked] = useState(true)
        const [axiosPost, setAxiosPost] = useState<boolean>(true)
        const [formInitialValues, setFormInitialValues] = useState<any>()
        const initialValues = useRef<any>()
        const formApiRef = useRef<FormApi>()

        const handleOk = () => {
            const values = formApiRef.current?.getValues()
            values.is_read = showChecked ? 0 : 1
            if (axiosPost) {
                const getData = async () => {
                    const res: ResType = await NextAxios({
                        map: 'post',
                        url: '/api/notifications',
                        data: values
                    })
                    if (res.code === 200) {
                        Notification.success({
                            title: '导入成功',
                            content: '药品信息导入成功',
                            duration: 3
                        })
                    }
                }
                getData()
            } else {
                const getData = async () => {
                    const res: ResType = await NextAxios({
                        map: 'patch',
                        url: '/api/notifications',
                        data: { ...values, id: initialValues.current.key }
                    })
                    if (res.code === 200) {
                        Notification.success({
                            title: '更新成功',
                            content: '药品信息更新成功',
                            duration: 3
                        })
                    }
                }
                getData()
                // axios.patch('/api/medicine', {...values, id: initialValues.current.key}).then(res => {
                //     Notification.success({
                //         title: '更新成功',
                //         content: '药品信息更新成功',
                //         duration: 3
                //     });
                // })
            }
            console.log(values)
            callBack?.()
            setModalVisible(false)
        }

        const handleCancel = () => {
            callBack?.()
            setModalVisible(false)
        }

        useImperativeHandle(ref, () => ({
            openModal: () => {
                setAxiosPost(true)
                setModalVisible(true)
            },
            closeModal: () => setModalVisible(false),
            setFormValues: (values: NotificationUser) => {
                const cleanedValues = { ...values } as { [key: string]: any } // 添加索引签名            initialValues.current = cleanedValues;
                initialValues.current = cleanedValues
                const optionalKeys = ['key', 'created_at', 'created_by', 'id']
                optionalKeys.forEach((key) => {
                    if (cleanedValues.hasOwnProperty(key)) {
                        delete cleanedValues[key]
                    }
                })
                setShowChecked(cleanedValues.is_read === 0)
                setAxiosPost(false)
                setFormInitialValues(cleanedValues)
                setModalVisible(true)
            }
        }))

        return (
            <Modal
                title="导入通知信息"
                visible={modalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                closeOnEsc={true}
                okText="提交"
                centered
                // 移除调试日志（或根据需求保留）
                // afterClose={() => console.log('afterClose')}
            >
                <Form
                    initValues={formInitialValues}
                    labelAlign={'left'}
                    labelPosition={'left'}
                    getFormApi={(formApi) => (formApiRef.current = formApi)}
                >
                    <Form.Input
                        field="title"
                        label="标题"
                        trigger="blur"
                        style={{ width: 200 }}
                        rules={[
                            { required: true, message: 'required error' },
                            { type: 'string', message: 'type error' }
                            // {validator: (rule, value) => value === 'semi', message: 'should be semi'}
                        ]}
                    />
                    <Form.TextArea
                        field="content"
                        label="内容"
                        trigger="blur"
                        style={{ width: 200 }}
                        maxCount={100}
                        showClear
                        rules={[
                            { required: true, message: 'required error' },
                            { type: 'string', message: 'type error' }
                            // {validator: (rule, value) => value === 'semi', message: 'should be semi'}
                        ]}
                    />
                    <div
                        style={{
                            marginTop: 20,
                            display: 'flex',
                            justifyContent: 'flex-start'
                        }}
                    >
                        <Form.Label>是否展示</Form.Label>
                        <Switch
                            // label="是否展示"
                            checked={showChecked}
                            onChange={setShowChecked}
                        />
                    </div>
                </Form>
            </Modal>
        )
    }
)

export default NotificationUploadForm
