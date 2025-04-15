import { Legend, Pie, PieChart, Tooltip } from '@visactor/react-vchart'
import React, { useRef } from 'react'

const App = ({
    barData,
    style,
    titleContent,
    categoryField,
    valueField
}: {
    barData?: { type: string; value: number }[]
    style?: React.CSSProperties
    titleContent?: string
    categoryField?: string
    valueField?: string
}) => {
    const chartRef = useRef(null)

    // 图表配置项
    //const barData = [
    // { type: 'oxygen', value: 46.6 },
    // { type: 'silicon', value: 27.72 },
    // { type: 'aluminum', value: 8.13 },
    // { type: 'iron', value: 5 },
    // { type: 'calcium', value: 3.63 },
    // { type: 'sodium', value: 2.83 },
    // { type: 'potassium', value: 2.59 },
    // { type: 'others', value: 3.5 }
    //]

    return (
        <PieChart
            ref={chartRef}
            style={style}
            data={[{ id: 'id1', values: barData || [{}] }]}
            title={{ text: titleContent || '' }}
        >
            <Legend orient={'left'} />
            <Pie
                categoryField={categoryField || 'type'}
                valueField={valueField || 'value'}
                innerRadius={0}
            />
            <Tooltip
                mark={{
                    content: [
                        {
                            key: (datum) => datum?.[categoryField || 'type'],
                            value: (datum) => datum?.[valueField || 'value']
                        }
                    ]
                }}
            />
        </PieChart>
    )
}

export default App
