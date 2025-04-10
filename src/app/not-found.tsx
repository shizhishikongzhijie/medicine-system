'use client'
import { Button, Empty } from '@douyinfe/semi-ui'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function NotFoundImage() {
    return (
        <div>
            <Image src={'/NotFound.png'} alt={'404'} width={450} height={450} />
        </div>
    )
}

export default function NotFound() {
    const [countingDown, setCountingDown] = useState(5)

    const router = useRouter()

    useEffect(() => {
        const interval = setInterval(() => {
            setCountingDown((prev) => {
                if (prev === 1) {
                    clearInterval(interval)
                    router.push('/home')
                }
                return prev - 1
            })
        }, 1000)

        // 清理函数：组件卸载时清除计时器
        return () => clearInterval(interval)
    }, [router]) // 注意：如果 router 变化，重新运行 effect

    return (
        <div
            className={'not-found-cover'}
            style={{
                position: 'fixed',
                zIndex: 9999,
                background: 'white',
                top: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column'
            }}
        >
            <Empty
                image={<NotFoundImage />}
                style={{
                    marginBottom: '10px'
                }}
                description={'啊哦，页面不见了，稍后再试吧...'}
            />
            <Button onClick={() => router.push('/home')}>
                点击返回首页 ({countingDown})
            </Button>
        </div>
    )
}
