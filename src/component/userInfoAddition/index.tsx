import {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {Button, Cascader, Input} from "@douyinfe/semi-ui";
import {CascaderData} from "@douyinfe/semi-ui/lib/es/cascader";
import {Districts, User} from "@/component/userInfoAddition/type";
import {IconChevronRightStroked} from "@douyinfe/semi-icons";
import './index.css'
import {NextAxios} from "@/tools/axios/NextAxios";

interface UserInfoAdditionProps {
    onBack?: (event?: any) => void | undefined,
    onComplete?: () => void
}

const UserInfoAddition = forwardRef((props: UserInfoAdditionProps, ref) => {
    const {onBack, onComplete} = props;
    const [addressData, setAddressData] = useState<CascaderData[]>([]);
    const [userInfo, setUserInfo] = useState<User>({
        address_code: "",
        birth_date: "",
        created_at: "",
        full_name: "",
        id: 0,
        id_number: "",
        password: "",
        updated_at: "",
        username: ""
    });
    useImperativeHandle(ref, () => ({
        getValues: () => {
            return userInfo;
        }
    }));
    useEffect(() => {
        const fetchData = async () => {
            let res = await NextAxios({
                map: 'get',
                url: '/api/districts',
                data: {
                    parentCode: null
                },
            });
            let newRes: { districts: Districts[] } = res.data
            let address: CascaderData[] = [];
            newRes.districts.forEach((item) => {
                address.push({
                    label: item.name,
                    value: item.code,
                })
            })
            setAddressData(address);
        }
        fetchData()
    }, []);
    //验证身份信息 方法
    const handleSubmit = () => {
        // const data = {
        //     IdCard: "642223200410270613",
        //     Name: "张若腾"
        // }
        // // 提交表单逻辑
        // axios.get('http://101.35.2.25/api/shiming/idcard.php',
        //     {
        //         params: {
        //             number: data.IdCard,
        //             name: data.Name,
        //             key: '7b2fd75ecff54a0a335eab5df9c60886',
        //             id:10003444
        //         }
        //     }
        // ).then((res) => {
        //     console.log("res:" + res.data)
        // })
        onComplete?.();
    };
    const updateTreeData = (list: any, value: any, children: any) => {
        return list.map((node: CascaderData) => {
            if (node.value === value) {
                return {...node, children};
            }
            if (node.children) {
                return {...node, children: updateTreeData(node.children, value, children)};
            }
            return node;
        });
    };

    const onLoadData = (selectedOpt: string | any[]) => {
        const targetOpt = selectedOpt[selectedOpt.length - 1];
        const {label, value} = targetOpt;
        return new Promise<void>(resolve => {
            if (targetOpt.children) {
                resolve();
                return;
            }
            // console.log("selectedOpt:" + JSON.stringify(selectedOpt) + ",opt:" + JSON.stringify(targetOpt))
            const fetchData = async () => {
                let res = await NextAxios({
                    map: 'get',
                    url: '/api/districts',
                    data: {
                        parentCode: value
                    },
                });
                let newRes: { districts: Districts[] } = res.data
                let address: CascaderData[] = [];
                newRes.districts.forEach((item) => {
                    address.push({
                        label: item.name,
                        value: item.code,
                        isLeaf: item.isLeaf
                    })
                })
                setAddressData(origin =>
                    updateTreeData(origin, value, address),
                );
            }
            fetchData().then(() => resolve());
        });
    };
    return (
        <>
            <div className={"user-info-addition-header"}>
                <div className={"user-info-addition-title"}>
                    用户信息补全
                </div>
                <Button theme='outline' type='tertiary'
                        className={"user-info-addition-back"}
                        icon={<IconChevronRightStroked rotate={180}/>}
                        onClick={() => {
                            onBack?.()
                        }}
                >返回</Button>
            </div>
            <div className={"user-info-addition-content"}>
                <Cascader
                    treeData={addressData}
                    loadData={onLoadData}
                    placeholder="请选择所在地区"
                    multiple={false}
                    onChange={(value) => {
                        console.log("Cascadervalue:" + value);
                        console.log("Cascadervalue:" + JSON.stringify(addressData));
                        let valueList = String(value).split(",");
                        let lastCode = valueList[valueList.length - 1];
                        setUserInfo((prevState) => {
                            return {
                                ...prevState,
                                address_code: lastCode
                            }
                        })
                    }}
                />
                <Input
                    name={'full_name'}
                    aria-label={'真实姓名'}
                    placeholder={'请输入真实姓名'}
                    value={userInfo?.full_name}
                    onChange={(value) => {
                        setUserInfo((prevState) => {
                            return {
                                ...prevState,
                                full_name: String(value)
                            }
                        })
                    }}/>
                <Input
                    name={'id_number'}
                    aria-label={'身份证号'}
                    onChange={(value) => {
                        setUserInfo((prevState) => {
                            return {
                                ...prevState,
                                id_number: value
                            }
                        })
                    }}
                    placeholder={'请输入身份证号'}/>
                <Button type="primary" onClick={handleSubmit}>提交</Button>
            </div>
        </>
    )
});
export default UserInfoAddition;