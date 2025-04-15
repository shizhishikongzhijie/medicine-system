import { Indicator, Liquid, LiquidChart } from '@visactor/react-vchart'
import { useRef } from 'react'

const App = ({
    values,
    valueField,
    titleContent,
    indicatorTitle,
    indicatorTextContent
}: {
    values: any[]
    valueField?: string
    titleContent?: string
    indicatorTitle?: string
    indicatorTextContent?: string
}) => {
    const chartRef = useRef(null)
    return (
        <LiquidChart
            ref={chartRef}
            indicatorSmartInvert
            data={{
                id: 'data',
                values: values
            }}
            title={{ text: titleContent || '' }}
        >
            <Liquid valueField={valueField || 'value'} />
            <Indicator
                title={{
                    visible: !!indicatorTitle,
                    style: {
                        text: indicatorTitle,
                        fontSize: 20
                    }
                }}
                content={[
                    {
                        visible: !!indicatorTextContent,
                        style: {
                            text: indicatorTextContent
                        }
                    }
                ]}
            />
        </LiquidChart>
    )
}
export default App
