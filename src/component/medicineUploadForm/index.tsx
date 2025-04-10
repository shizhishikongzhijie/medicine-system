'use client'
import {Form, Modal, Notification, Space, Switch} from "@douyinfe/semi-ui";
import {FormApi} from "@douyinfe/semi-ui/lib/es/form";
import {forwardRef, useImperativeHandle, useRef, useState} from "react";

import {Medicine} from "@/component/Page/MedicinePage/type";
import {NextAxios} from "@/tools/axios/NextAxios";

interface MedicineUploadFormProps {
    callBack?: () => Promise<void>
}

const MedicineUploadForm = forwardRef((props:MedicineUploadFormProps, ref) => {
    const {callBack} = props;
    const [modalVisible, setModalVisible] = useState(false);
    const [checked, setChecked] = useState(true);
    const [axiosPost, setAxiosPost] = useState<boolean>(true);
    const [formInitialValues, setFormInitialValues] = useState<any>();
    const initialValues = useRef<any>();
    const formApiRef = useRef<FormApi>();

    const onCheckChange = (checked: boolean) => {
        setChecked(checked);
    };
    const handleOk = () => {
        const values = formApiRef.current?.getValues();
        if (values.specification_1 && values.specification_2 && values.specification_3) {
            values.specification = values.specification_1 + values.specification_2 + '*' + values.specification_3
        }
        if (axiosPost) {
            const getData = async () => {
                const res = await NextAxios({
                    map: 'post',
                    url: '/api/medicine',
                    data: values
                })
                if (res.code === 200) {
                    Notification.success({
                        title: '导入成功',
                        content: '药品信息导入成功',
                        duration: 3
                    });
                }
            }
            getData();
        } else {
            const getData = async () => {
                const res = await NextAxios({
                    map: 'patch',
                    url: '/api/medicine',
                    data: {...values, id: initialValues.current.key}
                })
                if (res.code === 200) {
                    Notification.success({
                        title: '更新成功',
                        content: '药品信息更新成功',
                        duration: 3
                    });
                }
            }
            getData();
            // axios.patch('/api/medicine', {...values, id: initialValues.current.key}).then(res => {
            //     Notification.success({
            //         title: '更新成功',
            //         content: '药品信息更新成功',
            //         duration: 3
            //     });
            // })
        }
        console.log(values)
        callBack?.();
        setModalVisible(false);
    };

    const handleCancel = () => {
        callBack?.();
        setModalVisible(false);
    };

    useImperativeHandle(ref, () => ({
        openModal: () => {
            setAxiosPost(true);
            setModalVisible(true)
        },
        closeModal: () => setModalVisible(false),
        setFormValues: (values: Medicine) => {
            const cleanedValues = {...values} as { [key: string]: any }; // 添加索引签名            initialValues.current = cleanedValues;
            initialValues.current = cleanedValues;
            const optionalKeys = ['key', 'created_at', 'updated_at', 'id'];
            optionalKeys.forEach(key => {
                if (cleanedValues.hasOwnProperty(key)) {
                    delete cleanedValues[key];
                }
            });
            setChecked(false);
            setAxiosPost(false);
            setFormInitialValues(cleanedValues);
            setModalVisible(true);
        }
    }));

    return (
        <Modal
            title="导入药品信息"
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
                getFormApi={formApi => (formApiRef.current = formApi)}
            >
                <Form.Input field="name"
                            label="药品名"
                            trigger='blur'
                            style={{width: 200}}
                            rules={[
                                {required: true, message: 'required error'},
                                {type: 'string', message: 'type error'},
                                // {validator: (rule, value) => value === 'semi', message: 'should be semi'}
                            ]}
                />
                <Form.Section text={
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        规格 {checked ? '(模版)' : '(自定义)'}
                        <Switch style={{marginLeft: 10}} checked={checked} onChange={onCheckChange}/>
                    </div>}>
                    {checked ? (
                        <Space>
                            <Form.InputNumber field="specification_1"
                                              label={'含量'}
                                              min={0}
                                              labelPosition={'top'}
                                              placeholder={'例：300'}
                                              trigger='blur'
                                              style={{width: 100}}
                                              rules={[
                                                  {required: true, message: 'required error'},
                                                  {type: 'number', message: 'type error'},
                                                  // {validator: (rule, value) => value === 'semi', message: 'should be semi'}
                                              ]}
                            />
                            <Form.Select field='specification_2' label={'单位'} labelPosition={'top'}
                                         placeholder={'例：mg'}>
                                <Form.Select.Option value="mg">mg</Form.Select.Option>
                                <Form.Select.Option value="ug">ug</Form.Select.Option>
                                <Form.Select.Option value="%">%</Form.Select.Option>
                            </Form.Select>
                            <div style={{margin: '0 10px'}}>*</div>
                            <Form.Input field="specification_3"
                                        label={'含量单位'}
                                        labelPosition={'top'}
                                        placeholder={'例：片'}
                                        trigger='blur'
                                        style={{width: 100}}
                                        rules={[
                                            {required: true, message: 'required error'},
                                            {type: 'string', message: 'type error'},
                                            // {validator: (rule, value) => value === 'semi', message: 'should be semi'}
                                        ]}
                            />
                        </Space>
                    ) : (
                        <Space>
                            <Form.Input field='specification' label='自定义'/>
                        </Space>
                    )}
                </Form.Section>
                <Form.Input field="unit"
                            placeholder={'例：瓶'}
                            label="药品单位"
                            trigger='blur'
                            style={{width: 200}}
                            rules={[
                                {required: true, message: 'required error'},
                                {type: 'string', message: 'type error'},
                                // {validator: (rule, value) => value === 'semi', message: 'should be semi'}
                            ]}
                />
                <Form.Input field="manufacturer"
                            placeholder={'例：山东六阿制药厂'}
                            label="生产厂家"
                            trigger='blur'
                            style={{width: 200}}
                            rules={[
                                {required: true, message: 'required error'},
                                {type: 'string', message: 'type error'},
                                // {validator: (rule, value) => value === 'semi', message: 'should be semi'}
                            ]}
                />
            </Form>
        </Modal>
    );
});

export default MedicineUploadForm;
