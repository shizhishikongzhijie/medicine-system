'use client'
import { IconCamera } from '@douyinfe/semi-icons'
import {
    Avatar,
    Form,
    Modal,
    Notification,
    Toast,
    Upload
} from '@douyinfe/semi-ui'
import type { FormApi } from '@douyinfe/semi-ui/lib/es/form'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'

import type { User } from '@/component/userInfoAddition/type'
import { NextAxios } from '@/tools/axios/NextAxios'
import type { ResType } from '@/tools/axios/type'

interface UserUploadFormProps {
    callBack?: () => Promise<void>
}

const UserUploadForm = forwardRef((props: UserUploadFormProps, ref) => {
    const { callBack } = props
    const [modalVisible, setModalVisible] = useState(false)
    const [checked, setChecked] = useState(true)
    const [axiosPost, setAxiosPost] = useState<boolean>(true)
    const [formInitialValues, setFormInitialValues] = useState<any>()
    const initialValues = useRef<any>()
    const formApiRef = useRef<FormApi>()
    const [url, setUrl] = useState('')
    const onCheckChange = (checked: boolean) => {
        setChecked(checked)
    }
    const handleOk = () => {
        const values = formApiRef.current?.getValues()
        if (axiosPost) {
            const getData = async () => {
                const res: ResType = await NextAxios({
                    map: 'post',
                    url: '/api/user',
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
                    url: '/api/user',
                    data: {
                        ...values,
                        id: initialValues.current.key,
                        username: initialValues.current.username,
                        avatar_path: url
                    }
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
    const style = {
        backgroundColor: 'var(--semi-color-overlay-bg)',
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--semi-color-white)'
    }

    const hoverMask = (
        <div style={style}>
            <IconCamera />
        </div>
    )

    const api = 'http://localhost:3000/api/upload/image'
    const imageOnly = 'image/*'

    const onSuccess = (response, file) => {
        console.log(response, file)
        Toast.success('头像更新成功')
        setUrl(response.message)
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
        setFormValues: (values: User) => {
            const cleanedValues = { ...values } as { [key: string]: any } // 添加索引签名            initialValues.current = cleanedValues;
            initialValues.current = cleanedValues
            setChecked(false)
            setAxiosPost(false)
            setFormInitialValues(cleanedValues)
            setUrl(values.avatar_path)
            setModalVisible(true)
        }
    }))

    return (
        <Modal
            title="导入用户信息"
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
                    field="username"
                    label="用户名"
                    trigger="blur"
                    style={{ width: 200 }}
                    rules={[
                        { required: true, message: 'required error' },
                        { type: 'string', message: 'type error' }
                        // {validator: (rule, value) => value === 'semi', message: 'should be semi'}
                    ]}
                />
                <Upload
                    className="avatar-upload"
                    action={api}
                    onSuccess={onSuccess}
                    accept={imageOnly}
                    showUploadList={false}
                    onError={() => Toast.error('上传失败')}
                >
                    <Avatar
                        src={url}
                        style={{ margin: 4 }}
                        size={'extra-large'}
                        hoverMask={hoverMask}
                    />
                </Upload>
            </Form>
        </Modal>
    )
})

export default UserUploadForm
