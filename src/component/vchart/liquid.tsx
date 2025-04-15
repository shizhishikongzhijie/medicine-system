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
        <div style={{ width: '100%', height: '300px' }}>
            <LiquidChart
                ref={chartRef}
                indicatorSmartInvert
                data={[{ id: 'id0', values: values || [{ value: 0.3 }] }]}
                title={{ text: titleContent || '' }}
            >
                <Liquid valueField={valueField || 'value'} />
                <Indicator
                    title={{
                        visible: !!indicatorTitle,
                        style: {
                            text: indicatorTitle
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
        </div>
    )
}
export default App
