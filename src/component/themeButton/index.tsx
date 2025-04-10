'use client'
import {useEffect, useState} from 'react';
import {Button} from '@douyinfe/semi-ui';
import {IconMoon, IconSun} from "@douyinfe/semi-icons";
import {getLocalStorage, setLocalStorage} from "@/tools/storage";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "@/store";
import {setTheme} from "@/reducer/themeSlice";

function ThemeButton() {
    const [modeLight, setModeLight] = useState<boolean>(useSelector((state: RootState) => state.theme.value) === 'light');
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        const theme = getLocalStorage('theme-mode', null)
        console.log('theme-modess:' + theme)
        console.log(theme + ':' + modeLight)
        if (!theme) {
            //获取当前系统的主题
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setLocalStorage('theme-mode', 'dark');
                setModeLight(false);
            } else {
                setLocalStorage('theme-mode', 'light');
                setModeLight(true);
            }
        } else {
            dispatch(setTheme({theme: theme}))
            setModeLight(theme === 'light');
        }
    }, []);
    const switchMode = () => {
        const body = document.body;
        if (body.hasAttribute('theme-mode')) {
            setLocalStorage('theme-mode', 'light');
            dispatch(setTheme({theme: 'light'}));
            setModeLight(true);
        } else {
            setLocalStorage('theme-mode', 'dark');
            dispatch(setTheme({theme: 'dark'}));
            setModeLight(false);
        }
    };
    const setBodyThemeMode = () => {
        if (modeLight) {
            document.body.removeAttribute('theme-mode');
        } else {
            document.body.setAttribute('theme-mode', 'dark');
        }
    }
    useEffect(() => {
        setBodyThemeMode();
    }, [modeLight]);
    return (
        <Button
            onClick={switchMode}
            theme="borderless"
            icon={modeLight ? <IconMoon size={'large'}/> : <IconSun size={'large'}/>}
            style={{
                color: 'var(--semi-color-text-2)',
                marginRight: '12px',
            }}
        />
    );
}

export default ThemeButton;