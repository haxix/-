/**
 * ===================================
 * 智能存储管理器
 * ===================================
 * @description 自动检测并使用可用的存储方式
 * - 优先使用 MySQL（如果可用）
 * - 自动降级到 LocalStorage
 * - 数据自动同步
 */

const StorageManager = (function() {
    'use strict';
    
    // 存储模式：'mysql' 或 'localStorage'
    let storageMode = 'localStorage';
    const API_BASE = 'php/api';
    
    /**
     * 检测 MySQL 是否可用
     */
    async function checkMySQLAvailability() {
        try {
            const response = await fetch(`${API_BASE}/health.php`, {
                method: 'GET',
                timeout: 3000
            });
            const result = await response.json();
            return result.mysql_available === true;
        } catch (error) {
            console.log('MySQL 不可用，使用 LocalStorage:', error);
            return false;
        }
    }
    
    /**
     * 初始化存储管理器
     */
    async function init() {
        const mysqlAvailable = await checkMySQLAvailability();
        storageMode = mysqlAvailable ? 'mysql' : 'localStorage';
        
        console.log(`📦 存储模式：${storageMode === 'mysql' ? 'MySQL' : 'LocalStorage'}`);
        return storageMode;
    }
    
    /**
     * 获取数据
     */
    async function get(key, userId = null) {
        if (storageMode === 'mysql' && userId) {
            try {
                const response = await fetch(`${API_BASE}/storage.php?action=get&key=${encodeURIComponent(key)}&user_id=${userId}`);
                const result = await response.json();
                if (result.success) {
                    return JSON.parse(result.value);
                }
            } catch (error) {
                console.error('MySQL 读取失败，降级到 LocalStorage:', error);
                storageMode = 'localStorage';
            }
        }
        
        // LocalStorage 模式
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
    
    /**
     * 保存数据
     */
    async function set(key, value, userId = null) {
        if (storageMode === 'mysql' && userId) {
            try {
                const response = await fetch(`${API_BASE}/storage.php?action=set`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        key: key,
                        value: JSON.stringify(value),
                        user_id: userId
                    })
                });
                const result = await response.json();
                if (result.success) {
                    return true;
                }
            } catch (error) {
                console.error('MySQL 写入失败，降级到 LocalStorage:', error);
                storageMode = 'localStorage';
            }
        }
        
        // LocalStorage 模式
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    }
    
    /**
     * 删除数据
     */
    async function remove(key, userId = null) {
        if (storageMode === 'mysql' && userId) {
            try {
                await fetch(`${API_BASE}/storage.php?action=remove`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: key, user_id: userId })
                });
            } catch (error) {
                storageMode = 'localStorage';
            }
        }
        
        localStorage.removeItem(key);
    }
    
    /**
     * 清空数据
     */
    async function clear(userId = null) {
        if (storageMode === 'mysql' && userId) {
            try {
                await fetch(`${API_BASE}/storage.php?action=clear`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId })
                });
            } catch (error) {
                storageMode = 'localStorage';
            }
        }
        
        localStorage.clear();
    }
    
    /**
     * 获取当前存储模式
     */
    function getMode() {
        return storageMode;
    }
    
    /**
     * 手动切换存储模式
     */
    function setMode(mode) {
        if (mode === 'mysql' || mode === 'localStorage') {
            storageMode = mode;
            console.log(`🔄 存储模式已切换：${mode}`);
        }
    }
    
    // 公共 API
    return {
        init,
        get,
        set,
        remove,
        clear,
        getMode,
        setMode
    };
})();

// 导出到全局
window.StorageManager = StorageManager;
