'use client'
import {Button, Checkbox, Form, Notification} from "@douyinfe/semi-ui";
import styles from './index.module.css'
import {CSSProperties, useEffect, useMemo, useRef, useState} from "react";
import './index.css'
import {FormApi} from "@douyinfe/semi-ui/lib/es/form";
import UserInfoAddition from "@/component/UserInfoAddition";
import {User} from "@/component/Page/LoginPage/type";
import {NextAxios} from "@/tools/axios/NextAxios";
import {useRouter} from "next/navigation";

const LoginPage = () => {
    const loginRef = useRef<HTMLDivElement>(null)
    const formApiRef = useRef<FormApi>();
    const router = useRouter();
    const UserInfoAdditionRef = useRef<{
        getValues: () => any
    }>(null)
    const [loginLeft, setLoginLeft] = useState<number>(0);
    const [type, setType] = useState<0 | 1>(0)// 0 登录 1 注册
    const [registerMaskTop, setRegisterMaskTop] = useState<boolean>(false)
    const [registerMaskStyles, setRegisterMaskStyles] = useState<CSSProperties>({
        height: 'auto',
    })
    const resizeUpdate = () => {
        if (loginRef.current) {
            setLoginLeft(loginRef.current.offsetLeft - 44 - 5);
            setRegisterMaskStyles({
                height: `${loginRef.current.clientHeight - 48 * 2}px`,
            })
        }
    }
    useEffect(() => {
        resizeUpdate()
        window.addEventListener('resize', resizeUpdate);
        return () => {
            window.removeEventListener('resize', resizeUpdate);
        };
    }, []);
    const selectTabStyle: CSSProperties = useMemo(
        () => ({
                display: 'flex',
                flexDirection: 'column',
                padding: '5px 0 5px 5px',
                gap: '5px',
                width: '44px',
                height: 'auto',
                position: 'absolute',
                top: 'auto',
                backgroundColor: 'var(--semi-color-fill-0)',
                borderRadius: 'var(--semi-border-radius-large) 0 0 var(--semi-border-radius-large)',
                left: `${loginLeft}px`
            }
        ), [loginLeft])

    const onLogin = () => {
        console.log('登录');
        const values = formApiRef.current?.getValues();
        if (values && values.username && values.password) {
            const fetchData = async () => {
                let res = await NextAxios({
                    map: 'get',
                    url: '/api/login',
                    data: values
                })
                if (res.code === 200) {
                    Notification.success({
                        title: '登录成功',
                        content: '登录成功',
                        duration: 3
                    });
                    router.push('/home');
                }
            }
            fetchData()
        } else {
            Notification.error({
                title: '登录失败',
                content: '请填写完整信息',
                duration: 3
            });
        }
    }
    const onRegister = () => {
        console.log('注册')
        // UserInfoAdditionRef.current?.openModal()
        const values = formApiRef.current?.getValues();
        console.log('values', values)
        if (values && values.username && values.password) {
            setRegisterMaskTop(true)
        } else {
            Notification.error({
                title: '注册失败',
                content: '请填写完整信息',
                duration: 3
            });
        }
    }
    const onRegisterComplete = () => {
        let values: User = UserInfoAdditionRef.current?.getValues();
        let addressCodeList = String(values.address_code).split(',');
        let lastValue = addressCodeList[addressCodeList.length - 1];
        console.log('values', values)
        console.log('lastValue', lastValue)
        let formValues: {
            username: string,
            password: string,
        } = formApiRef.current?.getValues();
        values.username = formValues.username;
        values.password = formValues.password;
        console.log('values', values)
        // 请求
        const fetchData = async () => {
            let res = await NextAxios({
                map: 'post',
                url: '/api/login',
                data: values
            })
            if (res.code === 200) {
                Notification.success({
                    title: '注册成功',
                    content: '注册成功',
                    duration: 3
                });
            }
        }
        fetchData()
    }
    return (
        <>
            <div className={styles.main}>
                <div className={`register-mask ${type == 0 ? 'opacity-0' : ''} ${registerMaskTop ? 'top' : ''}`}
                     style={registerMaskStyles}>
                    {type == 1 ? <UserInfoAddition ref={UserInfoAdditionRef} onBack={() => setRegisterMaskTop(false)}
                                                   onComplete={onRegisterComplete}/> : <></>}
                </div>
                <div ref={loginRef} className={`${styles.login} ${registerMaskTop ? 'login-bottom' : ''}`}>
                    <div className="select-tab-container" style={selectTabStyle}>
                        <div className={`select-tab-item ${type == 0 ? 'active' : ''}`}
                             style={{
                                 borderRadius: 'var(--semi-border-radius-large) 0 0 var(--semi-border-radius-medium)'
                             }}
                             onClick={() => setType(0)}
                        >
                            <div className={'select-tab-item-text'}>登录</div>
                        </div>
                        <div className={`select-tab-item ${type == 1 ? 'active' : ''}`}
                             style={{
                                 borderRadius: 'var(--semi-border-radius-medium) 0 0 var(--semi-border-radius-large)'
                             }}
                             onClick={() => setType(1)}
                        >
                            <div className={'select-tab-item-text'}>注册</div>
                        </div>
                    </div>
                    <div className={styles.component66}>
                        <img
                            src="https://lf6-static.semi.design/obj/semi-tos/template/99042ce4-7934-4188-b15a-90ea03b3f63d.svg"
                            className={styles.logo}
                            alt={'logo'}/>
                        <div className={styles.header}>
                            <p className={styles.title}>欢迎回来</p>
                            <p className={styles.text}>
                                <span className={styles.text2}>登录</span>
                                <span className={styles.text3}> Semi Design </span>
                                <span className={styles.text2}>账户</span>
                            </p>
                        </div>
                    </div>
                    <div className={styles.form}>
                        <Form className={styles.inputs} getFormApi={formApi => (formApiRef.current = formApi)}>
                            <Form.Input
                                label={{text: "用户名"}}
                                field="username"
                                placeholder="输入用户名"
                                fieldStyle={{padding: 0}}
                                style={{width: 440}}
                                className={styles.formField}
                            />
                            <Form.Input
                                label={{text: "密码"}}
                                field="password"
                                placeholder="输入密码"
                                fieldStyle={{padding: 0}}
                                style={{width: 440}}
                                className={styles.formField}
                            />
                        </Form>
                        <Checkbox type="default" className={styles.checkbox}>
                            记住我
                        </Checkbox>
                        <Button theme="solid" className={styles.button} onClick={() => {
                            if (type == 0) {
                                onLogin()
                            } else {
                                onRegister()
                            }
                        }}>
                            {type == 0 ? '登录' : '注册'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}
export default LoginPage