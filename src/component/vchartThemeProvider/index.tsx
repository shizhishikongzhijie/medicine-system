'use client'

import { initVChartSemiTheme } from '@visactor/vchart-semi-theme'
import { useEffect } from 'react'

import { checkAndRunOnClient } from '@/tools/storage'

const VChartSemiThemeProvider = ({
    children
}: {
    children: React.ReactNode
}) => {
    useEffect(() => {
        checkAndRunOnClient(initVChartSemiTheme)
    }, [])
    return <>{children}</>
}
export default VChartSemiThemeProvider
