import axios from 'axios'

interface AxiosConfig {
    headers?: { [key: string]: string }
}

const apiClient = axios.create({
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器
apiClient.interceptors.request.use(
    (request) => {
        // console.log(request);
        const cookies = request.headers?.cookies
        return request
    },
    (error) => Promise.reject(error)
)

export async function getNewAccessToken(RefreshToken: string) {
    console.log({
        pos: '- -> -',
        content: 'getNewAccessToken - old:' + RefreshToken
    })
    try {
        const res = await axios.post(`/api/auth/refresh-token`, {
            refreshToken: RefreshToken
        })
        console.log({ pos: '- -> -', content: 'res:' + res.data.code })
        if (res.data.code === 200) {
            const accessToken = res.data.data.AccessToken
            console.log({
                pos: '- -> -',
                content: 'getNewAccessToken - new:' + accessToken
            })
            return accessToken
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}

// 响应拦截器
apiClient.interceptors.response.use(
    (response) => response?.data,
    async (error) => {
        if (error.message === 'Network Error') {
            console.error({ content: '网络连接异常！', duration: 3 })
        }
        if (error.code === 'ECONNABORTED') {
            console.error({ content: '请求超时，请重试', duration: 3 })
        }
        if (error.response) {
            const status = error.response?.data.code || error.response.status
            switch (status) {
                case 300:
                    console.error({
                        content:
                            'AccessToken过期: ' +
                            error.config.headers.RefreshToken,
                        duration: 3
                    })
                    const newAccessToken = await getNewAccessToken(
                        error.config.headers.RefreshToken
                    )
                    if (newAccessToken) {
                        // 重新发送请求
                        const res: any = await apiClient.request({
                            ...error.config,
                            headers: {
                                ...error.config.headers,
                                end: newAccessToken
                            }
                        })
                        console.log({ res: res, duration: 3 })
                        return Promise.reject({
                            code: res.code,
                            message: res.message,
                            data: { ...res?.data }
                        })
                    } else {
                        console.error({
                            content: '刷新RefreshToken失败，请重新登录',
                            duration: 3
                        })
                        return Promise.reject({
                            code: 302,
                            message: '刷新RefreshToken失败，请重新登录'
                        })
                    }
                case 403:
                    console.error({
                        content: '您没有访问此资源的权限',
                        duration: 3
                    })
                    break
                default:
                    console.error(
                        'Error:',
                        JSON.stringify(error.response?.data)
                    )
            }
            return Promise.reject({ ...error.response.data })
        } else {
            // 如果没有response，可能是由于请求被取消或其他原因
            console.error('Error without response:', error.message)
            return Promise.reject({ message: error.message })
        }
    }
)
// 封装 GET 请求
export const get = (
    url: string,
    cookies: string | string[] | undefined,
    isEnd?: string | string[] | undefined,
    params?: any,
    config?: AxiosConfig
) =>
    apiClient.get(url, {
        params: { ...params },
        ...config,
        headers: {
            ...(config?.headers || {}),
            ...(cookies ? { cookies } : {}),
            ...(isEnd ? { isEnd } : {})
        }
    })

// 封装 POST 请求
export const post = (
    url: string,
    cookies: string | string[] | undefined,
    isEnd?: string | string[] | undefined,
    data?: any,
    config?: AxiosConfig
) =>
    apiClient.post(url, data, {
        ...config,
        headers: {
            ...(config?.headers || {}),
            ...(cookies ? { cookies } : {}),
            ...(isEnd ? { isEnd } : {})
        }
    })

// 封装 PUT 请求
export const put = (
    url: string,
    cookies: string | string[] | undefined,
    isEnd?: string | string[] | undefined,
    data?: any,
    config?: AxiosConfig
) =>
    apiClient.put(url, data, {
        ...config,
        headers: {
            ...(config?.headers || {}),
            ...(cookies ? { cookies } : {}),
            ...(isEnd ? { isEnd } : {})
        }
    })

// 封装 DELETE 请求
export const del = (
    url: string,
    cookies: string | string[] | undefined,
    isEnd?: string | string[] | undefined,
    params?: any,
    config?: AxiosConfig
) =>
    apiClient.delete(url, {
        params: { ...params },
        ...config,
        headers: {
            ...(config?.headers || {}),
            ...(cookies ? { cookies } : {}),
            ...(isEnd ? { isEnd } : {})
        }
    })
// 封装 PATCH 请求
export const patch = (
    url: string,
    cookies: string | string[] | undefined,
    isEnd?: string | string[] | undefined,
    data?: any,
    config?: AxiosConfig
) =>
    apiClient.patch(url, data, {
        ...config,
        headers: {
            ...(config?.headers || {}),
            ...(cookies ? { cookies } : {}),
            ...(isEnd ? { isEnd } : {})
        }
    })
