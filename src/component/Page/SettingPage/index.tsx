'use client'
import { IconCamera, IconUpload } from '@douyinfe/semi-icons'
import { Avatar, Button, Cropper, Form, Modal, TabPane, Tabs, Upload } from '@douyinfe/semi-ui'
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react'

const SettingPage = () => {
    const cropperBoxRef = useRef<any>(null)
    const style = {
        backgroundColor: 'var(--semi-color-overlay-bg)',
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
    const hover = (
        <div style={style}>
            <IconCamera size={'large'} />
        </div>
    )
    return (
        <Tabs tabPosition={'left'}>
            <TabPane tab={<span>个人信息</span>} itemKey="1">
                <CropperBox ref={cropperBoxRef} />
                <Form
                    style={{
                        display: 'flex',
                        marginLeft: '20px',
                        position: 'relative',
                        width: ' 100%'
                    }}
                >
                    <Form.Section text={'基本信息'} style={{ flex: '1 1' }}>
                        <Form.Input
                            label={'用户名'}
                            field={'username'}
                            placeholder={'昵称'}
                            style={{ width: 'auto' }}
                        />
                        <Form.Input
                            label={'真实姓名'}
                            field={'full_name'}
                            placeholder={'真实姓名'}
                            style={{ width: 'auto' }}
                        />

                        <Form.Input
                            label={'身份证号'}
                            field={'id_number'}
                            placeholder={'身份证号'}
                            style={{ width: 'auto' }}
                        />
                        <Form.Input
                            label={'籍贯'}
                            field={'districts'}
                            placeholder={'籍贯'}
                            style={{ width: 'auto' }}
                        />
                    </Form.Section>
                    <Form.Section
                        text={'头像'}
                        style={{
                            left: '260px',
                            position: 'absolute',
                            width: '160px',
                            height: '195px',
                            borderLeft: '1px solid #e8e8e8'
                        }}
                    >
                        <Avatar
                            size={'large'}
                            hoverMask={hover}
                            style={{
                                margin: '40px'
                            }}
                            onClick={() => {
                                cropperBoxRef.current.openModal()
                            }}
                            src={
                                'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/image.png'
                            }
                        />
                    </Form.Section>
                </Form>
            </TabPane>
        </Tabs>
    )
}

const CropperBox = forwardRef((props, ref) => {
    const cropperRef = useRef<any>(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [cropperUrl, setCropperUrl] = useState('')
    const onButtonClick = useCallback(() => {
        if (!cropperRef.current) {
            return
        }
        const canvas = cropperRef.current.getCropperCanvas()
        const url = canvas.toDataURL()
        setCropperUrl(url)
    }, [])
    const preview = useCallback(() => {
        const element = document.getElementById('previewWrapper')
        // 添加非空判断，防止返回 null
        if (!element) {
            // 可创建一个临时 div 作为兜底方案
            const tempDiv = document.createElement('div')
            tempDiv.id = 'previewWrapper'
            document.body.appendChild(tempDiv)
            return tempDiv
        }
        return element
    }, [])
    useImperativeHandle(ref, () => ({
        openModal: () => {
            setModalVisible(true)
        },
        closeModal: () => setModalVisible(false)
    }))
    const handleOk = useCallback(() => {
        setModalVisible(false)
    }, [])
    const handleCancel = useCallback(() => {
        setModalVisible(false)
    }, [])
    return (
        <Modal
            title="更新头像信息"
            visible={modalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
            closeOnEsc={true}
            okText="裁剪并提交"
            centered
            // 移除调试日志（或根据需求保留）
            // afterClose={() => console.log('afterClose')}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Cropper
                    aspectRatio={1}
                    style={{ width: 200, height: 200 }}
                    ref={cropperRef}
                    src={
                        'https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/other/image.png'
                    }
                    preview={preview}
                ></Cropper>
                <div
                    id={'previewWrapper'}
                    style={{
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        margin: 'auto'
                    }}
                ></div>
            </div>
            {/*@ts-ignore*/}
            <Form layout="horizontal">
                <Form.Input
                    noLabel
                    label={'头像'}
                    field={'avatar'}
                    placeholder={'头像'}
                    style={{ width: 'auto' }}
                />
                <Upload
                    action="/api/upload/image"
                    accept={'.jpg,.jpeg,.png,.gif,.bmp,.webp'}
                >
                    <Button icon={<IconUpload />} theme="light">
                        点击上传
                    </Button>
                </Upload>
            </Form>
        </Modal>
    )
})
export default SettingPage
