'use client'
import {forwardRef, ReactNode, useEffect, useImperativeHandle, useRef, useState} from "react";
import {Form, JsonViewer, Modal, Notification, Select} from "@douyinfe/semi-ui";
import {FormApi} from "@douyinfe/semi-ui/lib/es/form";
import {Medicine} from "@/component/Page/MedicinePage/type";
import {NextAxios} from "@/tools/axios/NextAxios";
import {MedicinePopover} from "@/component";

interface StockUploadFormProps {
    callBack?: () => Promise<void>
}

const StockUploadForm = forwardRef((props: StockUploadFormProps, ref) => {
    const {callBack} = props;
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [jsonData, setJsonData] = useState<string>();// json数据
    const [axiosPost, setAxiosPost] = useState<boolean>(true);
    const [formInitialValues, setFormInitialValues] = useState<any>();
    const [selectInitialValues, setSelectInitialValues] = useState<any>(null);
    const [searchValue, setSearchValue] = useState('');
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [selectOptionList, setSelectOptionList] = useState<{
        label: string | ReactNode;
        value: string;
        all: any
    }[]>([]);
    const [selectLoading, setSelectLoading] = useState<boolean>(false);
    const initialValues = useRef<any>();
    const formApiRef = useRef<FormApi>();
    const jsonViewerRef = useRef();

    const handleOk = () => {
        const values = formApiRef.current?.getValues();
        // 格式化日期
        values.production_date = values.date[0].toISOString().split('T')[0];
        values.expiry_date = values.date[1].toISOString().split('T')[0];
        values.medicine_id = JSON.parse(jsonData as string)?.id;
        if (axiosPost) {
            const fetchData = async () => {
                let res = await NextAxios({
                    map: 'post',
                    url: '/api/stock',
                    data: values
                })
                if (res.code === 200) {
                    Notification.success({
                        title: '入库成功',
                        content: '药品入库成功',
                        duration: 3
                    });
                }
            }
            fetchData()
        } else {
            const fetchData = async () => {
                let res = await NextAxios({
                    map: 'patch',
                    url: '/api/stock',
                    data: {...values, id: initialValues.current.key}
                })
                if (res.code === 200) {
                    Notification.success({
                        title: '更新成功',
                        content: '入库信息更新成功',
                        duration: 3
                    });
                }
            }
            fetchData()
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
            setAxiosPost(false);
            setFormInitialValues(cleanedValues);
            setSelectInitialValues(values.id);
            setModalVisible(true);
        }
    }));
    const onSearchMedicine = (value: string) => {
        if (!value) {
            return;
        }
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            setSelectLoading(true);
            setSearchValue(value);
        }, 1000); // 延迟1000毫秒
    };
    useEffect(() => {
        if (searchValue) {
            const getData = async () => {
                let res = await NextAxios({
                    map: 'get',
                    url: '/api/medicine',
                    data: {
                        searchInfo: searchValue
                    }
                });
                res = res.data;
                if (res.data.length > 0) {
                    setSelectOptionList(res.data.map((item: any) => ({
                        label: <MedicinePopover initialValue={item}>{item.id}-{item.name}</MedicinePopover>,
                        value: item.id,
                        all: item
                    })));
                } else {
                    setSelectOptionList([]);
                }
                setSelectLoading(false);
            }
            getData();
        }
    }, [searchValue]);
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
                <Form.Section text={"药品选择"}>
                    <Select
                        filter
                        defaultValue={selectInitialValues || ''}
                        searchPosition='dropdown'
                        onSearch={onSearchMedicine}
                        style={{width: 200}}
                        loading={selectLoading}
                        placeholder='我的搜索框在下拉菜单中'
                        searchPlaceholder="带搜索功能的单选"
                        optionList={selectOptionList}
                        onSelect={(value) => {
                            console.log("onSelect:" + value)
                            setJsonData(JSON.stringify(selectOptionList.find((item: any) => item.value === value)?.all, null, '\t'));
                        }}
                    />
                    <JsonViewer
                        style={{
                            marginBottom: 24
                        }}
                        ref={jsonViewerRef}
                        height={150}
                        width={400}
                        value={jsonData}
                        showSearch={false}
                        options={{
                            // formatOptions: {tabSize: 4, insertSpaces: true, eol: '\n'},
                            // customRenderRule,
                            readOnly: true,
                            autoWrap: true
                        }}
                    />
                </Form.Section>
                <Form.InputNumber field={'quantity'} label={'入库数量'}/>
                <Form.Input field={'batch_number'} label={'批号'}/>
                <Form.DatePicker field={'date'} label={'有效期'} type="dateRange" density="compact"
                                 placeholder={['生产日期', '有效期日期']}
                                 style={{width: 260}}/>
                <Form.TextArea field={'remark'} label={'备注'}/>
            </Form>
        </Modal>
    );
});

export default StockUploadForm;