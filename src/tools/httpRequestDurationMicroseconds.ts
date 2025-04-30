// 自定义业务指标（示例：HTTP 请求计数和耗时）
import { Histogram } from 'prom-client'

const httpRequestDurationMicroseconds = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP 请求耗时（秒）',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5]
})
export { httpRequestDurationMicroseconds }
