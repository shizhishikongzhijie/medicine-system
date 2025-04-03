'use client'
// 定义一个通用的类型别名，用于存储操作中的键和值
type StorageValue = string | number | boolean | object | null | [];

/**
 * 检查是否在客户端执行环境，并运行回调函数。
 * @param callback - 要在客户端环境中运行的回调函数。
 */
function checkAndRunOnClient<T>(callback: () => T): T | null {
    if (typeof window !== 'undefined') {
        return callback();
    }
    return null;
}

/**
 * 设置 localStorage 的值。
 * @param key - 存储的键。
 * @param value - 要存储的值。
 */
export function setLocalStorage(key: string, value: StorageValue): void {
    checkAndRunOnClient(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error setting item in localStorage:', e);
        }
    });
}

/**
 * 获取 localStorage 中的值。
 * @param key - 存储的键。
 * @param initialValue - 如果没有找到对应的键时返回的初始值。
 * @returns 返回存储的值或初始值。
 */
export function getLocalStorage<T extends StorageValue>(key: string, initialValue: T): T {
    return checkAndRunOnClient(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) as T : initialValue;
        } catch (e) {
            console.error('Error getting item from localStorage:', e);
            return initialValue;
        }
    }) as T;
}

/**
 * 设置 sessionStorage 的值。
 * @param key - 存储的键。
 * @param value - 要存储的值。
 */
export function setSessionStorage(key: string, value: StorageValue): void {
    checkAndRunOnClient(() => {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error setting item in sessionStorage:', e);
        }
    });
}

/**
 * 获取 sessionStorage 中的值。
 * @param key - 存储的键。
 * @param initialValue - 如果没有找到对应的键时返回的初始值。
 * @returns 返回存储的值或初始值。
 */
export function getSessionStorage<T extends StorageValue>(key: string, initialValue: T): T {
    return checkAndRunOnClient(() => {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) as T : initialValue;
        } catch (e) {
            console.error('Error getting item from sessionStorage:', e);
            return initialValue;
        }
    }) as T;
}