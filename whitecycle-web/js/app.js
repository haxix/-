/**
 * ===================================
 * 白循 WhiteCycle - 主应用文件
 * ===================================
 * @version 6.0.0
 * @description 企业版核心应用逻辑
 */

// 应用命名空间
const app = (function() {
    'use strict';
    
    // 私有变量
    let records = [];
    let userProfile = null;
    let currentRecording = null;
    let timerInterval = null;
    let startTime = null;
    let confirmCallback = null;
    let currentMonth = new Date();
    let isLightTheme = false;
    let selectedParticipations = new Set();
    let selectedEmotion = null; // 当前选择的情绪
    let emotionWheelScroll = 0; // 情绪轮盘滚动位置
    
    // 常量配置
    const CONFIG = {
        STORAGE_KEYS: {
            RECORDS: 'whitecycle_records_v6',
            PROFILE: 'whitecycle_profile_v6',
            THEME: 'whitecycle_theme_v6'
        },
        
        IDENTITY_MAP: {
            'MALE': { displayName: '男生', emoji: '👦' },
            'FEMALE': { displayName: '女生', emoji: '👧' },
            'GAY': { displayName: 'Gay', emoji: '🏳️' },
            'LESBIAN': { displayName: '拉拉', emoji: '🌸' },
            'OTHER': { displayName: 'Other', emoji: '✨' },
            'FRIEND': { displayName: '友谊助手', emoji: '💕' }
        },
        
        PARTICIPATION_MAP: {
            'solo': { label: '独处时光', emoji: '🧘' },
            'together': { label: '二人世界', emoji: '💑' },
            'teacher': { label: '导师指导', emoji: '👨‍🏫' }
        },
        
        ACHIEVEMENTS: [
            { id: 'first', name: '第一次记录', desc: '完成你的第一次记录', icon: '🎯' },
            { id: 'five', name: '五次记录', desc: '完成 5 次记录', icon: '🌟' },
            { id: 'ten', name: '十次记录', desc: '完成 10 次记录', icon: '⭐' },
            { id: 'monthly', name: '月度达人', desc: '单月记录超过 10 次', icon: '🏆' },
            { id: 'weekly', name: '周冠军', desc: '单周记录超过 5 次', icon: '🥇' },
            { id: 'diverse', name: '多样化', desc: '尝试 3 种不同的参与方式', icon: '🎨' }
        ],
        
        EMOTIONS: [
            { id: 'happy', label: '开心', emoji: '😊', color: '#fbbf24' },
            { id: 'excited', label: '兴奋', emoji: '🤩', color: '#f472b6' },
            { id: 'calm', label: '平静', emoji: '😌', color: '#60a5fa' },
            { id: 'loved', label: '被爱', emoji: '😍', color: '#ec4899' },
            { id: 'relaxed', label: '放松', emoji: '😌', color: '#34d399' },
            { id: 'tired', label: '疲惫', emoji: '😴', color: '#6b7280' },
            { id: 'sad', label: '伤心', emoji: '😢', color: '#60a5fa' },
            { id: 'anxious', label: '焦虑', emoji: '😰', color: '#a78bfa' },
            { id: 'empty', label: '空虚', emoji: '😐', color: '#9ca3af' },
            { id: 'energetic', label: '元气满满', emoji: '💪', color: '#f59e0b' }
        ]
    };
    
    // ====================
    // 工具函数
    // ====================
    
    /**
     * 显示 Toast 通知
     */
    function showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const icon = document.getElementById('toast-icon');
        const msg = document.getElementById('toast-message');
        
        const icons = {
            success: '✓',
            error: '✗',
            info: 'ℹ'
        };
        
        icon.textContent = icons[type] || icons.info;
        msg.textContent = message;
        
        toast.className = `toast toast-${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    /**
     * 显示确认对话框
     */
    function showConfirm(options) {
        const overlay = document.getElementById('confirm-modal');
        const icon = document.getElementById('confirm-icon');
        const title = document.getElementById('confirm-title');
        const message = document.getElementById('confirm-message');
        const okBtn = document.getElementById('confirm-ok-btn');
        
        icon.textContent = options.icon || '⚠️';
        title.textContent = options.title || '确认操作';
        message.textContent = options.message || '确定吗？';
        
        okBtn.className = options.type === 'danger' ? 'btn btn-danger' : 'btn btn-primary';
        
        overlay.classList.add('active');
        confirmCallback = options.onConfirm;
        
        document.getElementById('confirm-ok-btn').onclick = () => {
            overlay.classList.remove('active');
            if (confirmCallback) confirmCallback();
        };
        
        document.getElementById('confirm-cancel-btn').onclick = () => {
            overlay.classList.remove('active');
        };
    }
    
    /**
     * 格式化时间
     */
    function formatDuration(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    
    /**
     * 格式化为"几分几秒"
     */
    function formatMinutesSeconds(seconds) {
        if (!seconds || isNaN(seconds)) {
            return '0 分 0 秒';
        }
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}分${s}秒`;
    }
    
    /**
     * 获取分钟数
     */
    function getMinutes(seconds) {
        if (!seconds || isNaN(seconds)) {
            return 0;
        }
        return Math.floor(seconds / 60);
    }
    
    /**
     * 格式化日期为字符串
     */
    function formatDate(dateStr) {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                return '未知日期';
            }
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}/${month} ${day}`;
        } catch (error) {
            return '未知日期';
        }
    }
    
    /**
     * 格式化时间为字符串
     */
    function formatTime(dateStr) {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                return '00:00';
            }
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        } catch (error) {
            return '00:00';
        }
    }
    
    // ====================
    // 数据管理
    // ====================
    
    /**
     * 加载数据（临时 LocalStorage 方案）
     */
    async function loadData() {
        // 修复：不再依赖 userId，直接加载 LocalStorage 中的数据
        // 这样即使刷新页面，也能正确加载用户配置
        try {
            console.log('🔄 开始加载数据...');
            
            // 从 LocalStorage 加载记录
            const recordsData = localStorage.getItem('whitecycle_records_v1');
            console.log('📊 LocalStorage 中的记录数据:', recordsData);
            
            if (recordsData) {
                records = JSON.parse(recordsData);
                console.log('✅ 加载记录成功:', records.length, '条记录');
                console.log('📝 记录详情:', records);
            } else {
                console.log('⚠️ LocalStorage 中没有记录数据');
                records = [];
            }
            
            // 加载用户信息（关键修复：始终加载）
            const userProfileData = localStorage.getItem('whitecycle_profile_v1');
            if (userProfileData) {
                userProfile = JSON.parse(userProfileData);
                console.log('✅ 加载用户信息成功:', userProfile);
            } else {
                console.log('⚠️ LocalStorage 中没有用户信息');
            }
        } catch (error) {
            console.error('❌ 加载数据失败:', error);
            showToast('数据加载失败', 'error');
        }
    }
    
    /**
     * 保存数据到 LocalStorage
     */
    function saveData() {
        try {
            localStorage.setItem('whitecycle_records_v1', JSON.stringify(records));
            localStorage.setItem('whitecycle_profile_v1', JSON.stringify(userProfile));
            console.log('💾 数据已保存到 LocalStorage');
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            showToast('保存失败', 'error');
            return false;
        }
    }
    
    /**
     * 保存记录到 LocalStorage（不需要登录）
     */
    async function saveRecord(record) {
        try {
            console.log('📝 准备保存记录:', record);
            
            // 确保有 actualDuration 字段
            if (!record.actualDuration && record.duration_seconds) {
                record.actualDuration = record.duration_seconds;
            }
            if (!record.actualDuration && record.duration_minutes) {
                record.actualDuration = record.duration_minutes * 60;
            }
            
            // 保存到 LocalStorage
            record.id = Date.now();
            records.push(record);
            localStorage.setItem('whitecycle_records_v1', JSON.stringify(records));
            
            console.log('💾 记录已保存到 LocalStorage');
            console.log('📊 当前记录总数:', records.length);
            console.log('📊 LocalStorage 数据:', localStorage.getItem('whitecycle_records_v1'));
            
            showToast('保存成功', 'success');
            return record;
        } catch (error) {
            console.error('❌ 保存失败:', error);
            showToast('保存失败', 'error');
            return null;
        }
    }
    
    /**
     * 保存用户资料到后端 API
     */
    async function saveUserProfile() {
        const userId = sessionStorage.getItem('whitecycle_user_id');
        if (!userId || !userProfile) {
            return false;
        }
        
        try {
            // 这里可以创建一个专门的 API 来更新用户资料
            // 暂时先不实现，因为用户资料主要是 identity
            // 可以在 auth.php 中添加 updateProfile 方法
            console.log('保存用户资料:', userProfile);
            return true;
        } catch (error) {
            console.error('保存用户资料失败:', error);
            return false;
        }
    }
    
    /**
     * 加载主题
     */
    function loadTheme() {
        const theme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
        if (theme === 'light') {
            isLightTheme = true;
            document.documentElement.setAttribute('data-theme', 'light');
            document.getElementById('theme-toggle').checked = true;
            // 加载主题时修复白色字体
            fixWhiteTextColors();
        }
    }
    
    /**
     * 保存主题
     */
    function saveTheme() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, isLightTheme ? 'light' : 'dark');
    }
    
    // ====================
    // 页面管理
    // ====================
    
    /**
     * 切换页面
     */
    function switchPage(pageName, element) {
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        
        // 显示目标页面
        document.getElementById(`page-${pageName}`).classList.add('active');
        element.classList.add('active');
        
        // 页面特定逻辑
        if (pageName === 'history') {
            renderRecordList();
            renderCalendar();
        } else if (pageName === 'stats') {
            updateStats();
            updateAchievements();
            updateSuggestions();
        }
    }
    
    /**
     * 更新欢迎语
     */
    function updateWelcome() {
        const hour = new Date().getHours();
        let title, subtitle;
        
        if (hour >= 5 && hour < 12) {
            title = '早上好';
            subtitle = '新的一天，保持健康的生活方式';
        } else if (hour >= 12 && hour < 18) {
            title = '下午好';
            subtitle = '适度放松，保持身心平衡';
        } else if (hour >= 18 && hour < 23) {
            title = '晚上好';
            subtitle = '记录你的健康生活';
        } else {
            title = '夜深了';
            subtitle = '注意休息，不要熬夜哦';
        }
        
        document.getElementById('welcome-title').textContent = title;
        document.getElementById('welcome-subtitle').textContent = subtitle;
        
        // 更新日期显示
        updateDateDisplay();
    }
    
    /**
     * 更新日期显示
     */
    function updateDateDisplay() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        const weekDay = weekDays[now.getDay()];
        
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            dateElement.textContent = `${year}.${month}.${day} 周${weekDay}`;
        }
    }
    
    // ====================
    // 身份管理
    // ====================
    
    /**
     * 选择身份
     */
    function selectIdentity(key, element) {
        userProfile = {
            identity: key,
            createdAt: Date.now()
        };
        
        saveUserProfile();
        updateIdentityDisplay();
        
        const identity = CONFIG.IDENTITY_MAP[key];
        document.getElementById('user-avatar').textContent = identity.emoji;
        
        // 设置主题色
        document.documentElement.setAttribute('data-identity', key);
        
        // 关闭所有模态框（包括 onboarding 和 identity modal）
        closeIdentityModal();
        document.getElementById('onboarding-modal').classList.remove('active');
        
        showToast(`身份设置成功：${identity.displayName}`, 'success');
    }
    
    /**
     * 更新身份显示
     */
    function updateIdentityDisplay() {
        if (userProfile) {
            const identity = CONFIG.IDENTITY_MAP[userProfile.identity];
            document.getElementById('current-identity').textContent = `${identity.emoji} ${identity.displayName}`;
        }
    }
    
    /**
     * 显示身份选择器
     */
    function showIdentitySelector() {
        const modal = document.getElementById('identity-modal');
        modal.classList.add('active');
    }
    
    /**
     * 关闭身份选择器
     */
    function closeIdentityModal() {
        document.getElementById('identity-modal').classList.remove('active');
    }
    
    /**
     * 显示用户信息
     */
    function showProfile() {
        if (userProfile) {
            const identity = CONFIG.IDENTITY_MAP[userProfile.identity];
            showToast(`当前身份：${identity.emoji} ${identity.displayName}`, 'info');
        }
    }
    
    // ====================
    // 参与方式管理（支持多选）
    // ====================
    
    /**
     * 切换参与方式（支持多选）
     */
    function toggleParticipation(type, element) {
        if (selectedParticipations.has(type)) {
            selectedParticipations.delete(type);
            element.classList.remove('selected');
        } else {
            selectedParticipations.add(type);
            element.classList.add('selected');
        }
        
        // 显示/隐藏导师信息
        const teacherGroup = document.getElementById('teacher-info-group');
        if (selectedParticipations.has('teacher')) {
            teacherGroup.style.display = 'block';
            // 动画效果
            teacherGroup.style.opacity = '0';
            setTimeout(() => {
                teacherGroup.style.transition = 'opacity 0.3s';
                teacherGroup.style.opacity = '1';
            }, 10);
        } else {
            teacherGroup.style.display = 'none';
        }
    }
    
    /**
     * 显示统计详情
     */
    function showStatDetail(type) {
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
        
        let title, message, filteredRecords;
        
        switch(type) {
            case 'total':
                title = '📊 总记录';
                filteredRecords = records;
                message = `共 ${records.length} 次记录`;
                break;
                
            case 'week':
                title = '📅 本周记录';
                filteredRecords = records.filter(r => {
                    const st = r.startTime || r.start_time;
                    if (!st) return false;
                    const rt = typeof st === 'string' ? new Date(st.replace(/-/g, '/')).getTime() : new Date(st).getTime();
                    return rt >= weekAgo;
                });
                message = `本周共 ${filteredRecords.length} 次记录`;
                break;
                
            case 'month':
                title = '📅 本月记录';
                filteredRecords = records.filter(r => {
                    const st = r.startTime || r.start_time;
                    if (!st) return false;
                    const rt = typeof st === 'string' ? new Date(st.replace(/-/g, '/')).getTime() : new Date(st).getTime();
                    return rt >= monthAgo;
                });
                message = `本月共 ${filteredRecords.length} 次记录`;
                break;
                
            case 'avg':
                title = '⏱️ 平均时长';
                const avgDuration = records.length > 0 
                    ? Math.floor(records.reduce((sum, r) => sum + (r.duration_seconds || r.actualDuration || 0), 0) / records.length / 60)
                    : 0;
                message = `平均每次 ${avgDuration} 分钟`;
                filteredRecords = records;
                break;
                
            default:
                return;
        }
        
        // 创建详情模态框
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.style.zIndex = '999';
        
        modal.innerHTML = `
            <div class="modal modal-center" style="max-width: 700px;">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-content" style="padding: 0;">
                    <div style="text-align: center; padding: var(--spacing-2xl); background: var(--bg-secondary); border-bottom: 1px solid var(--border);">
                        <div class="stat-detail-number">
                            ${type === 'avg' ? Math.floor(records.reduce((sum, r) => sum + r.actualDuration, 0) / (records.length || 1) / 60) : filteredRecords.length}
                        </div>
                        <div style="color: var(--text-secondary); margin-top: 8px;">${message}</div>
                    </div>
                    
                    ${filteredRecords.length > 0 ? `
                        <div class="stat-detail-list">
                            ${filteredRecords.map((r, index) => {
                                const date = new Date(r.startTime);
                                const durationSeconds = r.duration_seconds || r.actualDuration || 0;
                                const duration = Math.floor(durationSeconds / 60);
                                const emotionDisplay = r.emotion ? `<span class="stat-detail-emotion" title="${r.emotion.label}">${r.emotion.emoji}</span>` : '';
                                
                                // 计算周次和日期类型
                                const weekNum = getWeekNumber(date);
                                const dayType = getDayType(date);
                                const dayTypeClass = dayType === '周末' ? 'stat-detail-weekend' : (dayType === '节假日' ? 'stat-detail-holiday' : 'stat-detail-weekday');
                                
                                return `
                                    <div class="stat-detail-item">
                                        <div class="stat-detail-info">
                                            <div class="stat-detail-date-row">
                                                <span class="stat-detail-week">第${weekNum}周</span>
                                                <span class="${dayTypeClass}">${dayType}</span>
                                            </div>
                                            <div class="stat-detail-date-main">
                                                <span class="stat-detail-month">${date.getMonth()+1}</span>
                                                <span class="stat-detail-divider">.</span>
                                                <span class="stat-detail-day-num">${date.getDate()}</span>
                                                <span class="stat-detail-weekday">周${['日','一','二','三','四','五','六'][date.getDay()]}</span>
                                            </div>
                                            <div class="stat-detail-time-row">
                                                <span class="stat-detail-time">${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}</span>
                                                ${emotionDisplay}
                                            </div>
                                        </div>
                                        <div class="stat-detail-duration">${duration}<span style="font-size: 12px; margin-left: 2px;">min</span></div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : `
                        <div class="stat-detail-empty">
                            <div style="font-size: 64px; margin-bottom: 16px;">📝</div>
                            <div>暂无记录</div>
                        </div>
                    `}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    /**
     * 计算日期是一年中的第几周
     */
    function getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDays = Math.floor((date - firstDayOfYear) / (24 * 60 * 60 * 1000));
        return Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
    }
    
    /**
     * 判断日期类型（工作日/周末/节假日）
     */
    function getDayType(date) {
        const day = date.getDay();
        const month = date.getMonth() + 1;
        const dayOfMonth = date.getDate();
        const year = date.getFullYear();
        
        // 中国法定节假日（固定日期）
        const fixedHolidays = [
            { month: 1, day: 1, name: '元旦' },
            { month: 2, day: 14, name: '情人节' },
            { month: 3, day: 8, name: '妇女节' },
            { month: 3, day: 12, name: '植树节' },
            { month: 3, day: 14, name: '白色情人节' },
            { month: 4, day: 1, name: '愚人节' },
            { month: 4, day: 5, name: '清明节' },
            { month: 5, day: 1, name: '劳动节' },
            { month: 5, day: 4, name: '青年节' },
            { month: 5, day: 20, name: '网络情人节' },
            { month: 6, day: 1, name: '儿童节' },
            { month: 7, day: 1, name: '建党节' },
            { month: 8, day: 1, name: '建军节' },
            { month: 9, day: 10, name: '教师节' },
            { month: 10, day: 1, name: '国庆节' },
            { month: 10, day: 31, name: '万圣节' },
            { month: 12, day: 24, name: '平安夜' },
            { month: 12, day: 25, name: '圣诞节' }
        ];
        
        // 农历节日（需要计算，这里使用近似日期）
        // 2026 年春节是 2 月 17 日
        // 2026 年端午是 6 月 19 日
        // 2026 年中秋是 9 月 25 日
        // 2026 年重阳是 10 月 29 日
        const lunarHolidays = {
            2026: [
                { month: 2, day: 17, name: '春节' },
                { month: 2, day: 24, name: '元宵节' },
                { month: 6, day: 19, name: '端午节' },
                { month: 9, day: 25, name: '中秋节' },
                { month: 10, day: 29, name: '重阳节' }
            ],
            2025: [
                { month: 1, day: 29, name: '春节' },
                { month: 2, day: 12, name: '元宵节' },
                { month: 5, day: 31, name: '端午节' },
                { month: 10, day: 6, name: '中秋节' },
                { month: 10, day: 29, name: '重阳节' }
            ]
        };
        
        // 检查是否是固定节假日
        const isFixedHoliday = fixedHolidays.some(h => h.month === month && h.day === dayOfMonth);
        if (isFixedHoliday) return '节假日';
        
        // 检查是否是农历节日
        if (lunarHolidays[year]) {
            const isLunarHoliday = lunarHolidays[year].some(h => h.month === month && h.day === dayOfMonth);
            if (isLunarHoliday) return '节假日';
        }
        
        // 检查是否是周末
        if (day === 0 || day === 6) return '周末';
        
        return '工作日';
    }
    
    // ====================
    // 智能鼓励和时间确认
    // ====================
    
    /**
     * 显示时间确认模态框（支持修改时间，使用秒数）
     */
    function showTimeConfirmationModal(durationSeconds, onConfirm) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.style.zIndex = '9999';
        
        // 计算分钟和秒
        const minutes = Math.floor(durationSeconds / 60);
        const seconds = durationSeconds % 60;
        const timeDisplay = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
        
        // 判断是否需要特殊提示
        let title, message, showWarning = false;
        
        if (durationSeconds >= 30 * 60) {
            title = '⏰ 时间有点长哦';
            message = '要注意适当休息，保持健康的生活方式！';
            showWarning = true;
        } else if (durationSeconds < 60) {
            title = '⚡ 快速完成';
            message = `时长只有 ${timeDisplay}，确定要保存吗？`;
        } else {
            title = '✅ 记录完成';
            message = '辛苦了！确认时间后保存记录。';
        }
        
        modal.innerHTML = `
            <div class="modal modal-center" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-content">
                    ${showWarning ? `
                        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <span style="font-size: 32px;">⚠️</span>
                                <div style="color: var(--warning); font-size: 14px; line-height: 1.6;">
                                    <strong>温馨提示：</strong><br>
                                    ${message}
                                </div>
                            </div>
                        </div>
                    ` : `
                        <div style="text-align: center; color: var(--text-secondary); margin-bottom: 20px;">
                            ${message}
                        </div>
                    `}
                    
                    <div style="background: var(--bg-secondary); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                        <div style="text-align: center; margin-bottom: 16px;">
                            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">记录时长</div>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
                                <div id="duration-display" style="font-size: 28px; font-weight: 800; color: var(--text-primary); min-width: 150px; text-align: center;">
                                    ${timeDisplay}
                                </div>
                                <input type="number" id="confirm-duration" value="${durationSeconds}" 
                                     min="0" max="9999"
                                     style="width: 80px; padding: 12px; background: var(--bg-card); border: 2px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 20px; font-weight: 800; text-align: center; display: none;"
                                     onfocus="this.select()"
                                     onchange="updateDurationDisplay(this.value)">
                                <button onclick="toggleDurationInput()" style="padding: 8px 16px; font-size: 14px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-secondary); cursor: pointer;">
                                    ✏️ 编辑
                                </button>
                            </div>
                            <div style="font-size: 12px; color: var(--text-tertiary); margin-top: 8px;">
                                💡 点击编辑按钮可以修改时长（单位：秒）
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                            <button onclick="adjustDuration(-300)" 
                                    class="btn btn-secondary" 
                                    style="padding: 8px 16px; font-size: 14px;">
                                -5 分钟
                            </button>
                            <button onclick="adjustDuration(-60)" 
                                    class="btn btn-secondary" 
                                    style="padding: 8px 16px; font-size: 14px;">
                                -1 分钟
                            </button>
                            <button onclick="adjustDuration(60)" 
                                    class="btn btn-secondary" 
                                    style="padding: 8px 16px; font-size: 14px;">
                                +1 分钟
                            </button>
                            <button onclick="adjustDuration(300)" 
                                    class="btn btn-secondary" 
                                    style="padding: 8px 16px; font-size: 14px;">
                                +5 分钟
                            </button>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 12px;">
                        <button class="btn btn-secondary btn-block" onclick="this.closest('.modal-overlay').remove()">
                            取消
                        </button>
                        <button class="btn btn-primary btn-block" onclick="confirmWithDuration(this, ${durationSeconds})">
                            ✅ 确认保存
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 存储回调函数到全局
        window.timeConfirmCallback = onConfirm;
        window.originalDuration = durationSeconds;
    }
    
    // 全局函数：切换输入框显示
    window.toggleDurationInput = function() {
        const display = document.getElementById('duration-display');
        const input = document.getElementById('confirm-duration');
        
        if (display && input) {
            if (input.style.display === 'none') {
                input.style.display = 'block';
                display.style.display = 'none';
                input.focus();
                input.select();
            } else {
                input.style.display = 'none';
                display.style.display = 'block';
                updateDurationDisplay(input.value);
            }
        }
    };
    
    // 全局函数：更新显示
    window.updateDurationDisplay = function(seconds) {
        const display = document.getElementById('duration-display');
        const input = document.getElementById('confirm-duration');
        const secs = parseInt(seconds) || 0;
        const mins = Math.floor(secs / 60);
        const secsRemainder = secs % 60;
        const timeDisplay = mins > 0 ? `${mins}分${secsRemainder}秒` : `${secsRemainder}秒`;
        
        if (display) {
            display.textContent = timeDisplay;
        }
    };
    
    // 全局函数：调整时长
    window.adjustDuration = function(delta) {
        const input = document.getElementById('confirm-duration');
        if (input) {
            const currentValue = parseInt(input.value) || window.originalDuration || 0;
            const newValue = Math.max(0, currentValue + delta);
            input.value = newValue;
            updateDurationDisplay(newValue);
        }
    };
    
    /**
     * 确认时长（全局函数）- 使用秒数
     */
    window.confirmWithDuration = function(btn, originalDurationSeconds) {
        const modal = btn.closest('.modal-overlay');
        const inputDuration = parseInt(document.getElementById('confirm-duration').value) || originalDurationSeconds;
        
        // 如果用户修改了时长，更新记录（以秒为单位）
        if (currentRecording && inputDuration !== originalDurationSeconds) {
            currentRecording.actualDuration = inputDuration;
            // 重新计算结束时间
            currentRecording.endTime = currentRecording.startTime + (inputDuration * 1000);
        }
        
        // 关闭模态框
        modal.remove();
        
        // 执行回调
        if (window.timeConfirmCallback) {
            window.timeConfirmCallback();
        }
    };
    
    /**
     * 显示统计详情
     */
    function generateEncouragement(durationSeconds, allRecords) {
        const durationMinutes = Math.floor(durationSeconds / 60);
        
        // 计算平均时长
        const avgDuration = allRecords.length > 0 
            ? Math.floor(allRecords.reduce((sum, r) => sum + r.actualDuration, 0) / allRecords.length / 60)
            : 0;
        
        // 获取上次的记录
        const lastRecord = allRecords.length > 1 ? allRecords[1] : null;
        const lastDuration = lastRecord ? Math.floor(lastRecord.actualDuration / 60) : null;
        
        // 智能鼓励语生成
        let messages = [];
        
        // 基础鼓励（8 种随机）
        const baseEncouragements = [
            { emoji: '🎉', text: '太棒了！又完成了一次健康记录' },
            { emoji: '✨', text: '干得漂亮！自律的你最有魅力' },
            { emoji: '💪', text: '优秀！保持这个节奏' },
            { emoji: '🌟', text: '厉害！每一次记录都是进步' },
            { emoji: '🔥', text: '燃起来了！坚持就是胜利' },
            { emoji: '💖', text: '真棒！好好爱护自己的身体' },
            { emoji: '🎊', text: '恭喜！又向着健康迈进了一步' },
            { emoji: '⭐', text: '闪耀！你的自律值得点赞' }
        ];
        
        // 安慰关怀类（8 种随机）
        const comfortMessages = [
            { emoji: '🍵', text: '放松一下，喝杯温水，好好休息' },
            { emoji: '🛀', text: '洗个热水澡，让身心都温暖起来' },
            { emoji: '😌', text: '放轻松，你已经做得很好了' },
            { emoji: '💆', text: '按摩一下肩膀，缓解疲劳吧' },
            { emoji: '🎵', text: '听首舒缓的音乐，让心情平静下来' },
            { emoji: '📖', text: '看会儿书，转移一下注意力' },
            { emoji: '🌙', text: '早点休息，明天又是元气满满的一天' },
            { emoji: '🤗', text: '给自己一个拥抱，你值得被温柔对待' }
        ];
        
        // 健康建议类（8 种随机）
        const healthMessages = [
            { emoji: '🏃', text: '记得起来活动活动，久坐对身体不好' },
            { emoji: '🥗', text: '多吃蔬菜水果，保持均衡饮食' },
            { emoji: '💧', text: '多喝水，保持身体水分充足' },
            { emoji: '🧘', text: '做几个深呼吸，让身心放松下来' },
            { emoji: '🏋️', text: '适当运动，让身体更加健康' },
            { emoji: '😴', text: '保证充足睡眠，让身体充分休息' },
            { emoji: '🌞', text: '晒晒太阳，补充维生素 D' },
            { emoji: '🚶', text: '出去散散步，呼吸新鲜空气' }
        ];
        
        // 正能量激励类（8 种随机）
        const positiveMessages = [
            { emoji: '🌈', text: '每一次克制，都是对自己的成全' },
            { emoji: '🎯', text: '目标明确，步伐坚定，你可以的' },
            { emoji: '💫', text: '相信自己，你比想象中更强大' },
            { emoji: '🌻', text: '像向日葵一样，永远向着阳光生长' },
            { emoji: '🦋', text: '蜕变的过程很痛，但结果很美' },
            { emoji: '⛰️', text: '翻过这座山，你会看到更美的风景' },
            { emoji: '🌊', text: '乘风破浪，勇往直前' },
            { emoji: '🦅', text: '展翅高飞，天空才是极限' }
        ];
        
        // 时长相关鼓励
        let durationMessage = null;
        if (durationMinutes < 5) {
            durationMessage = { emoji: '⚡', text: '快速解决，效率很高嘛！' };
        } else if (durationMinutes >= 5 && durationMinutes < 15) {
            durationMessage = { emoji: '👍', text: '时间控制得很好，继续保持！' };
        } else if (durationMinutes >= 15 && durationMinutes < 30) {
            durationMessage = { emoji: '😊', text: '适度的放松，身心愉悦！' };
        } else {
            durationMessage = { emoji: '🛌', text: '时间有点长呢，记得多休息哦~' };
        }
        
        // 与上次对比
        let comparisonMessage = null;
        if (lastDuration !== null) {
            const diff = durationMinutes - lastDuration;
            if (diff > 0) {
                comparisonMessage = { 
                    emoji: '📈', 
                    text: `比上次多了 ${diff} 分钟，进步了！` 
                };
            } else if (diff < 0) {
                comparisonMessage = { 
                    emoji: '📉', 
                    text: `比上次少了 ${Math.abs(diff)} 分钟，控制力增强了！` 
                };
            } else {
                comparisonMessage = { 
                    emoji: '🎯', 
                    text: '和上次一样稳定，厉害！' 
                };
            }
        }
        
        // 与平均对比
        let avgMessage = null;
        if (avgDuration > 0) {
            const diffFromAvg = durationMinutes - avgDuration;
            if (Math.abs(diffFromAvg) > 5) {
                if (diffFromAvg > 0) {
                    avgMessage = { emoji: '🔝', text: `比平均水平高了 ${diffFromAvg} 分钟` };
                } else {
                    avgMessage = { emoji: '🔽', text: `比平均水平低了 ${Math.abs(diffFromAvg)} 分钟` };
                }
            }
        }
        
        // 成就相关
        const totalRecords = allRecords.length;
        if (totalRecords === 1) {
            messages.push({ emoji: '🎯', text: '完成了第一次记录，这是个开始！' });
        } else if (totalRecords === 5) {
            messages.push({ emoji: '🌟', text: '已经 5 次记录了，坚持就是胜利！' });
        } else if (totalRecords === 10) {
            messages.push({ emoji: '⭐', text: '10 次记录达成！你真的很自律！' });
        } else if (totalRecords === 20) {
            messages.push({ emoji: '🏆', text: '20 次记录！你是真正的自律达人！' });
        }
        
        // 组合消息 - 随机选择不同类型的消息
        const mainMessage = baseEncouragements[Math.floor(Math.random() * baseEncouragements.length)];
        messages.unshift(mainMessage);
        
        // 随机添加一条安慰/关怀/建议/正能量消息
        const messageType = Math.floor(Math.random() * 4);
        let extraMessage = null;
        if (messageType === 0) {
            extraMessage = comfortMessages[Math.floor(Math.random() * comfortMessages.length)];
        } else if (messageType === 1) {
            extraMessage = healthMessages[Math.floor(Math.random() * healthMessages.length)];
        } else if (messageType === 2) {
            extraMessage = positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
        } else {
            extraMessage = comfortMessages[Math.floor(Math.random() * comfortMessages.length)];
        }
        messages.push(extraMessage);
        
        messages.push(durationMessage);
        
        if (comparisonMessage) {
            messages.push(comparisonMessage);
        }
        
        if (avgMessage) {
            messages.push(avgMessage);
        }
        
        return messages.filter(m => m !== null);
    }
    
    /**
     * 显示庆祝效果
     */
    function showCelebration(messages) {
        // 创建庆祝模态框
        const celebration = document.createElement('div');
        celebration.className = 'modal-overlay active';
        celebration.style.zIndex = '9999';
        
        celebration.innerHTML = `
            <div class="modal modal-center celebrate">
                <div style="font-size: 80px; margin-bottom: 24px; animation: celebrateSuccess 0.6s ease-out;">🎉</div>
                <div style="font-size: 24px; font-weight: 800; margin-bottom: 24px; background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                    ${messages[0].emoji} ${messages[0].text}
                </div>
                ${messages.slice(1).map(m => `
                    <div style="font-size: 16px; color: var(--text-secondary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; justify-content: center;">
                        <span>${m.emoji}</span>
                        <span>${m.text}</span>
                    </div>
                `).join('')}
                <button class="btn btn-primary btn-lg" onclick="this.closest('.modal-overlay').remove()" style="margin-top: 32px;">
                    继续加油 💪
                </button>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        // 播放彩带效果
        createConfetti();
        
        // 3 秒后自动关闭
        setTimeout(() => {
            if (celebration.parentNode) {
                celebration.remove();
            }
        }, 10000); // 10 秒后自动关闭
    }
    
    /**
     * 创建彩带效果
     */
    function createConfetti() {
        const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#10b981', '#f59e0b', '#ef4444'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 4000);
            }, i * 50);
        }
    }
    
    // ====================
    // 记录管理
    // ====================
    
    /**
     * 开始记录
     */
    function startRecording() {
        if (selectedParticipations.size === 0) {
            showToast('请至少选择一种参与方式', 'error');
            return;
        }
        
        // 检查记录间隔并显示提醒
        const intervalMessage = checkRecordIntervalAndShowMessage();
        if (intervalMessage.showWarning && intervalMessage.type === 'too_frequent') {
            showConfirm({
                icon: '⚠️',
                title: intervalMessage.title,
                message: intervalMessage.message,
                type: 'warning',
                okText: '仍要开始',
                cancelText: '取消',
                onConfirm: () => {
                    startRecordingProcess();
                }
            });
            return;
        } else if (intervalMessage.showEncouragement) {
            showToast(intervalMessage.message, 'success');
        }
        
        startRecordingProcess();
    }
    
    /**
     * 开始记录流程（内部函数）
     */
    function startRecordingProcess() {
        const participations = Array.from(selectedParticipations).map(type => {
            return CONFIG.PARTICIPATION_MAP[type].label;
        });
        
        let teacherData = null;
        if (selectedParticipations.has('teacher')) {
            const teacherName = document.getElementById('teacher-name').value.trim();
            const teacherNotes = document.getElementById('teacher-notes').value.trim();
            teacherData = {
                name: teacherName || '未命名导师',
                notes: teacherNotes || ''
            };
        }
        
        const now = Date.now();
        
        // 计算当天/本周/本月次数
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStart = today.getTime();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
        
        console.log('📊 开始计算统计数据...');
        console.log('📊 当前 records 数组:', records.length, '条记录');
        
        // 修复：正确处理 startTime 字段，支持两种格式
        const recordsToday = records.filter(r => {
            const startTime = r.startTime || r.start_time;
            if (!startTime) return false;
            const recordTime = typeof startTime === 'string' ? new Date(startTime.replace(/-/g, '/')).getTime() : new Date(startTime).getTime();
            return recordTime >= todayStart;
        }).length;
        
        const recordsThisWeek = records.filter(r => {
            const startTime = r.startTime || r.start_time;
            if (!startTime) return false;
            const recordTime = typeof startTime === 'string' ? new Date(startTime.replace(/-/g, '/')).getTime() : new Date(startTime).getTime();
            return recordTime >= weekAgo;
        }).length;
        
        const recordsThisMonth = records.filter(r => {
            const startTime = r.startTime || r.start_time;
            if (!startTime) return false;
            const recordTime = typeof startTime === 'string' ? new Date(startTime.replace(/-/g, '/')).getTime() : new Date(startTime).getTime();
            return recordTime >= monthAgo;
        }).length;
        
        console.log('📊 统计结果 - 今天:', recordsToday, '本周:', recordsThisWeek, '本月:', recordsThisMonth);
        
        currentRecording = {
            id: Date.now(),
            startTime: Date.now(),
            tool: document.getElementById('tool-input').value.trim() || null,
            participations: participations,
            participationTypes: Array.from(selectedParticipations),
            teacherData: teacherData
        };
        
        startTime = currentRecording.startTime;
        
        // 清空选择状态，但不重置 UI，让用户知道已经开始了
        selectedParticipations.clear();
        
        // 检查用户设置
        const showStats = localStorage.getItem('whitecycle_show_stats') !== 'false'; // 默认开启
        const showCoupleReminder = localStorage.getItem('whitecycle_couple_reminder') !== 'false'; // 默认开启
        
        // 显示统计信息
        if (showStats) {
            let statsMessage = `📊 当前统计：今天${recordsToday}次 | 本周${recordsThisWeek}次 | 本月${recordsThisMonth}次`;
            
            // 如果是二人世界，给出特别提醒
            if (showCoupleReminder && participations.includes('二人世界')) {
                if (recordsToday >= 2) {
                    statsMessage += `\n💕 二人世界次数较多，注意休息和节制哦~`;
                } else {
                    statsMessage += `\n💕 享受美好的二人时光吧~`;
                }
            }
            
            showToast(statsMessage, 'success');
        } else {
            showToast('记录已开始', 'success');
        }
        
        document.getElementById('timer-section').style.display = 'block';
        updateTimer();
        
        timerInterval = setInterval(updateTimer, 1000);
        
        document.getElementById('timer-section').scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
    
    /**
     * 更新计时器
     */
    function updateTimer() {
        const diff = Date.now() - startTime;
        document.getElementById('timer-display').textContent = formatDuration(Math.floor(diff / 1000));
    }
    
    /**
     * 停止记录
     */
    function stopRecording() {
        if (!currentRecording) return;
        
        currentRecording.actualDuration = Math.floor((Date.now() - currentRecording.startTime) / 1000);
        currentRecording.endTime = Date.now();
        
        // 智能时间确认（使用自定义模态框）- 传递秒数
        showTimeConfirmationModal(currentRecording.actualDuration, () => {
            // 用户确认后的回调
            saveAndFinish();
        });
    }
    
    /**
     * 保存并完成记录
     */
    function saveAndFinish() {
        // 使用新的 API 保存记录 - 保存秒数
        // 修复：从 selectedParticipations 中读取参与方式
        const participationArray = Array.from(selectedParticipations);
        const participation = participationArray.length > 0 ? participationArray[0] : 'solo';
        
        const recordToSave = {
            startTime: new Date(currentRecording.startTime).toISOString().replace('T', ' ').substr(0, 19),
            endTime: new Date(currentRecording.endTime).toISOString().replace('T', ' ').substr(0, 19),
            duration_minutes: Math.floor(currentRecording.actualDuration / 60),
            duration_seconds: currentRecording.actualDuration,
            participation: participation,
            participationTypes: participationArray.length > 0 ? participationArray : ['solo'],
            tool: currentRecording.tool || null,
            teacherData: currentRecording.teacherData || null,
            emotion: currentRecording.emotion || null,
            note: currentRecording.note || '',
            actualDuration: currentRecording.actualDuration
        };
        
        console.log(' 保存记录:', {
            id: currentRecording.id,
            duration: recordToSave.duration_seconds + '秒',
            tool: recordToSave.tool,
            teacher: recordToSave.teacherData,
            emotion: recordToSave.emotion
        });
        
        saveRecord(recordToSave).then(savedRecord => {
            if (savedRecord) {
                // 保存成功
                currentRecording = null;
                clearInterval(timerInterval);
                
                // 重置 UI
                document.getElementById('timer-section').style.display = 'none';
                document.getElementById('tool-input').value = '';
                document.getElementById('teacher-name').value = '';
                document.getElementById('teacher-notes').value = '';
                document.querySelectorAll('.form-option').forEach(el => el.classList.remove('selected'));
                document.getElementById('teacher-info-group').style.display = 'none';
                
                // 智能鼓励语和时间对比
                const encouragement = generateEncouragement(savedRecord.duration_seconds || savedRecord.actualDuration || 0, records);
                
                // 更新所有相关组件
                updateAchievements();
                updateStats();
                renderCalendar();
                renderRecordList();
                
                // 显示合并的完成弹窗（包含情绪选择）- 直接使用刚保存的记录
                setTimeout(() => {
                    showCompleteModal(savedRecord);
                }, 300);
            }
        });
    }
    
    /**
     * 渲染记录列表（分组显示 + 关怀提示）
     */
    function renderRecordList() {
        console.log('📋 渲染记录列表，当前记录数:', records.length);
        
        const list = document.getElementById('record-list');
        
        if (!list) {
            console.error('❌ 找不到 record-list 元素！');
            return;
        }
        
        console.log('✅ 找到 record-list 元素');
        console.log('📊 records 数组内容:', records);
        
        if (records.length === 0) {
            console.log('ℹ️ 没有记录，显示空状态');
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <div class="empty-state-title">暂无记录</div>
                    <div class="empty-state-desc">开始你的第一次记录吧</div>
                    <button class="btn btn-primary" onclick="app.switchToRecord()">
                        开始记录
                    </button>
                </div>
            `;
            return;
        }
        
        console.log('✅ 开始渲染', records.length, '条记录');
        
        // 测试第一条记录的时间戳
        if (records.length > 0) {
            const firstRecord = records[0];
            console.log('📝 测试第一条记录的时间戳:', firstRecord.startTime);
            let testDate;
            if (typeof firstRecord.startTime === 'string') {
                testDate = new Date(firstRecord.startTime.replace(/-/g, '/'));
                console.log('✅ 字符串格式解析成功:', testDate);
            } else {
                testDate = new Date(firstRecord.startTime);
                console.log('✅ 数字格式解析成功:', testDate);
            }
            console.log('📅 解析后的日期:', testDate);
        }
        
        // 按天分组
        const grouped = {};
        records.forEach(r => {
            try {
                const startTime = r.startTime || r.start_time;
                if (!startTime) {
                    console.warn('⚠️ 记录缺少 startTime 字段:', r);
                    return;
                }
                
                let date;
                if (typeof startTime === 'string') {
                    date = new Date(startTime.replace(/-/g, '/'));
                } else {
                    date = new Date(startTime);
                }
                
                if (isNaN(date.getTime())) {
                    console.warn('无效的时间戳:', r, 'startTime:', startTime);
                    return;
                }
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const recordDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                recordDay.setHours(0, 0, 0, 0);
                
                const diffDays = Math.floor((today - recordDay) / (1000 * 60 * 60 * 24));
                let label;
                if (diffDays === 0) {
                    label = '今天';
                } else if (diffDays === 1) {
                    label = '昨天';
                } else if (diffDays === 2) {
                    label = '前天';
                } else if (diffDays < 7) {
                    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                    label = weekDays[recordDay.getDay()];
                } else {
                    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
                    label = `${months[recordDay.getMonth()]}${recordDay.getDate()}日`;
                }
                
                const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}_${label}`;
                
                if (!grouped[key]) {
                    grouped[key] = {
                        label,
                        timestamp: recordDay.getTime(),
                        records: [],
                        totalDuration: 0,
                        count: 0
                    };
                }

                grouped[key].records.push(r);
                const duration = r.actualDuration || r.duration || 0;
                grouped[key].totalDuration += duration;
                grouped[key].count++;
            } catch (error) {
                console.error('处理记录时出错:', r, error);
            }
        });
        
        const sortedKeys = Object.keys(grouped).sort((a, b) => grouped[b].timestamp - grouped[a].timestamp);
        
        // 生成分组 HTML
        let html = '';
        
        for (const key of sortedKeys) {
            const group = grouped[key];
            const avgDuration = group.count > 0 ? Math.floor(group.totalDuration / group.count / 60) : 0;
            const totalMinutes = Math.floor(group.totalDuration / 60);
            
            html += `
                <div class="record-summary" onclick="toggleGroup(this)">
                    <div class="record-summary-icon">📅</div>
                    <div class="record-summary-content">
                        <div class="record-summary-title">${group.label}</div>
                        <div class="record-summary-desc">${group.count} 次记录 · 平均 ${avgDuration} 分钟</div>
                    </div>
                    <div class="record-summary-stats">
                        <div class="record-summary-stat">
                            <div class="record-summary-stat-value">${group.count}</div>
                            <div class="record-summary-stat-label">次数</div>
                        </div>
                        <div class="record-summary-stat">
                            <div class="record-summary-stat-value">${totalMinutes}</div>
                            <div class="record-summary-stat-label">总分钟</div>
                        </div>
                    </div>
                </div>
            `;
            
            html += `<div class="record-group">`;
            
            group.records.forEach(r => {
                try {
                    const startTime = r.startTime || r.start_time;
                    if (!startTime) return;
                    
                    let date;
                    if (typeof startTime === 'string') {
                        date = new Date(startTime.replace(/-/g, '/'));
                    } else {
                        date = new Date(startTime);
                    }
                    
                    if (!r.participationTypes) {
                        r.participationTypes = r.participation ? [r.participation] : ['solo'];
                    }
                    
                    const durationSeconds = r.duration_seconds || r.actualDuration || r.duration || 0;
                    const timeDisplay = formatMinutesSeconds(durationSeconds);
                    
                    console.log('📋 渲染记录项 - ID:', r.id, '时长:', durationSeconds, '秒', '显示:', timeDisplay);
                    
                    const hasTeacher = r.teacherData ? true : false;
                    const timeStr = isNaN(date.getTime()) ? '00:00' : `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                    
                    const emotionDisplay = r.emotion ? `<span class="record-emotion" title="${r.emotion.label || ''}">${r.emotion.emoji || '😊'}</span>` : '';
                    
                    const participationTags = (r.participations || []).map(p => {
                        return `<span class="record-participation-tag">${p}</span>`;
                    }).join('');
                    
                    html += `
                        <div class="record-item" onclick="openDetailFromRecord(${r.id})">
                            <div class="record-header">
                                <div class="record-time">
                                    <span style="color: var(--text-tertiary); font-size: 12px;">${timeStr}</span>
                                </div>
                                ${emotionDisplay}
                            </div>
                            <div class="record-body">
                                <div class="record-info">
                                    <span class="record-tag duration">⏱️ ${timeDisplay}</span>
                                    ${r.tool ? `<span class="record-tag tool">🛠️ ${r.tool}</span>` : ''}
                                </div>
                                <div class="record-tags">
                                    ${participationTags}
                                    ${hasTeacher ? `<span class="record-tag teacher">📝</span>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                } catch (error) {
                    console.error('渲染记录项失败:', r, error);
                }
            });
            
            html += `</div>`;
        }
        
        list.innerHTML = html;
    }
    
    /**
     * 切换分组展开/收起
     */
    window.toggleGroup = function(element) {
        const group = element.nextElementSibling;
        if (group) {
            group.style.display = group.style.display === 'none' ? 'block' : 'none';
        }
    };
    
    /**
     * 从记录项打开详情（全局函数）
     */
    window.openDetailFromRecord = function(id) {
        openDetail(id);
    };
    
    /**
     * 打开记录详情（模态框）
     */
    function openDetail(id) {
        console.log('✅ 点击了记录，ID:', id);
        const record = records.find(r => r.id === id);
        console.log('✅ 找到的记录:', record);
        if (!record) {
            console.error('❌ 未找到记录:', id);
            alert('未找到记录');
            return;
        }
        console.log('✅ 准备打开详情窗口...');
        
        // 修复：同时支持 startTime 和 start_time 两种字段名
        const startTime = record.startTime || record.start_time;
        const endTime = record.endTime || record.end_time;
        
        if (!startTime) {
            console.error('❌ 记录缺少 startTime 字段:', record);
            alert('记录数据不完整');
            return;
        }
        
        // 修复：正确处理时间戳字符串
        let date, endDate;
        if (typeof startTime === 'string') {
            date = new Date(startTime.replace(/-/g, '/'));
        } else {
            date = new Date(startTime);
        }
        
        if (endTime) {
            if (typeof endTime === 'string') {
                endDate = new Date(endTime.replace(/-/g, '/'));
            } else {
                endDate = new Date(endTime);
            }
        } else {
            endDate = new Date(date.getTime() + (record.duration_seconds || record.actualDuration || 0) * 1000);
        }
        
        // 核心修复：获取时长（秒数）
        const durationSeconds = record.duration_seconds || record.actualDuration || 0;
        const timeDisplay = formatMinutesSeconds(durationSeconds);
        
        // 调试：输出时长数据
        console.log('时长数据检查:', {
            id: record.id,
            duration_seconds: record.duration_seconds,
            actualDuration: record.actualDuration,
            '使用值': durationSeconds,
            '显示': timeDisplay
        });
        
        // 计算本周/本月次数
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 今天零点
        const weekAgo = today.getTime() - 7 * 24 * 60 * 60 * 1000; // 7 天前的零点
        const monthAgo = today.getTime() - 30 * 24 * 60 * 60 * 1000; // 30 天前的零点
        
        console.log('📊 详情窗口 - 当前时间:', now.toISOString());
        console.log('📊 详情窗口 - 今天零点:', today.toISOString());
        console.log('📊 详情窗口 - 7 天前:', new Date(weekAgo).toISOString());
        console.log('📊 详情窗口 - 30 天前:', new Date(monthAgo).toISOString());
        
        // 修复：正确处理 startTime 字段
        const recordsThisWeek = records.filter(r => {
            const startTime = r.startTime || r.start_time;
            if (!startTime) return false;
            const recordTime = typeof startTime === 'string' ? new Date(startTime.replace(/-/g, '/')).getTime() : new Date(startTime).getTime();
            const isInWeek = recordTime >= weekAgo;
            console.log('📊 检查记录 - 时间:', new Date(recordTime).toISOString(), '是否在本周:', isInWeek);
            return isInWeek;
        }).length;
        
        const recordsThisMonth = records.filter(r => {
            const startTime = r.startTime || r.start_time;
            if (!startTime) return false;
            const recordTime = typeof startTime === 'string' ? new Date(startTime.replace(/-/g, '/')).getTime() : new Date(startTime).getTime();
            const isInMonth = recordTime >= monthAgo;
            console.log('📊 检查记录 - 时间:', new Date(recordTime).toISOString(), '是否在本月:', isInMonth);
            return isInMonth;
        }).length;
        
        console.log('📊 详情窗口统计 - 本周:', recordsThisWeek, '本月:', recordsThisMonth);
        
        // 生成关怀提示
        const careMessage = generateCareMessage(recordsThisWeek, recordsThisMonth);
        
        // 获取当前主题色
        const themeColors = getThemeColors();
        
        const content = document.getElementById('detail-content');
        content.innerHTML = `
            <div class="detail-hero">
                <span class="detail-hero-icon">${getRecordEmoji(record)}</span>
                <div class="detail-hero-title">${careMessage.title}</div>
                <div class="detail-hero-subtitle">${careMessage.subtitle}</div>
            </div>
            
            <div class="detail-stats-grid">
                <div class="detail-stat-card">
                    <span class="detail-stat-icon">⏱️</span>
                    <div class="detail-stat-value">${timeDisplay}</div>
                    <div class="detail-stat-label">记录时长</div>
                </div>
                <div class="detail-stat-card">
                    <span class="detail-stat-icon">📊</span>
                    <div class="detail-stat-value">${recordsThisWeek}</div>
                    <div class="detail-stat-label">本周</div>
                </div>
                <div class="detail-stat-card">
                    <span class="detail-stat-icon">📅</span>
                    <div class="detail-stat-value">${recordsThisMonth}</div>
                    <div class="detail-stat-label">本月</div>
                </div>
            </div>
            
            <div class="detail-section">
                <div class="detail-label">📝 记录时间</div>
                <div class="detail-value" style="font-weight: 600;">${formatDateTime(date)}</div>
                <div class="detail-value" style="font-size: 14px; color: var(--text-secondary); margin-top: 6px;">
                    💤 结束：${formatDateTime(endDate)}
                </div>
                <div class="detail-value" style="font-size: 13px; color: var(--text-tertiary); margin-top: 8px;">
                    ⏱️ 时长：${timeDisplay}
                </div>
            </div>
            
            ${record.tool ? `
                <div class="detail-section">
                    <div class="detail-label">🛠️ 使用工具</div>
                    <div class="detail-value" style="font-size: 17px; font-weight: 600;">${record.tool}</div>
                </div>
            ` : ''}
            
            <div class="detail-section">
                <div class="detail-label">👥 参与方式</div>
                <div class="participation-tags" style="margin-top: 10px;">
                    ${(record.participationTypes && record.participationTypes.length > 0) ? `
                        ${record.participationTypes.map(p => `
                            <span class="participation-tag">${p}</span>
                        `).join('')}
                    ` : '<div style="color: var(--text-tertiary); font-size: 14px;">无</div>'}
                </div>
            </div>
            
            ${record.teacherData ? `
                <div class="detail-section teacher-section" style="background: linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(168,85,247,0.08) 100%); padding: 20px; border-radius: 12px; border: 1px solid rgba(139,92,246,0.3);">
                    <div class="detail-label" style="color: var(--accent-primary); margin-bottom: 16px; font-size: 15px;">👨‍🏫 导师信息</div>
                    <div style="margin-bottom: 16px;">
                        <div class="detail-label" style="font-size: 13px; opacity: 0.8;">导师称呼</div>
                        <div class="detail-value" style="font-size: 16px; font-weight: 600; margin-top: 4px;">${record.teacherData.name || '未命名'}</div>
                    </div>
                    ${record.teacherData.notes ? `
                        <div>
                            <div class="detail-label" style="font-size: 13px; opacity: 0.8;">指导建议</div>
                            <div class="detail-value" style="font-size: 15px; line-height: 1.8; white-space: pre-wrap; background: var(--bg-primary); padding: 14px; border-radius: 10px; margin-top: 8px; border: 1px solid var(--border);">${record.teacherData.notes}</div>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
            
            ${careMessage.care ? `
                <div class="care-message" style="background: linear-gradient(135deg, rgba(255,107,129,0.1) 0%, rgba(255,159,67,0.1) 100%); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,107,129,0.25); margin-top: 16px;">
                    <div style="display: flex; gap: 14px; align-items: flex-start;">
                        <div style="font-size: 28px; flex-shrink: 0;">💝</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 10px; font-size: 15px;">${careMessage.care.title}</div>
                            <div style="font-size: 14px; line-height: 1.7; color: var(--text-secondary);">${careMessage.care.content}</div>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            ${record.emotion ? `
                <div class="emotion-display">
                    <div class="emotion-display-emoji">${record.emotion.emoji}</div>
                    <div class="emotion-display-info">
                        <div class="emotion-display-label">当时的心情</div>
                        <div class="emotion-display-value" style="color: ${record.emotion.color};">${record.emotion.label}</div>
                    </div>
                    <button class="emotion-edit-btn" onclick="app.editRecordEmotion(${record.id})">
                        ✏️ 编辑
                    </button>
                </div>
            ` : `
                <div style="margin-top: 20px; text-align: center; padding: 16px; background: var(--bg-secondary); border-radius: 12px; border: 1px dashed var(--border);">
                    <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 10px;">💭 还没有记录当时的心情</div>
                    <button class="emotion-edit-btn" onclick="app.editRecordEmotion(${record.id})">
                        ✏️ 添加心情
                    </button>
                </div>
            `}
            
            <div class="delete-section">
                <button class="delete-btn" onclick="app.deleteRecord(${record.id})">
                    删除
                </button>
            </div>
        `;
        
        // 苹果风格动画打开弹窗
        const modal = document.getElementById('detail-modal');
        
        // 检查是否是二人世界模式，添加动画效果
        const recordParticipationTypes = record.participationTypes || (record.participation ? [record.participation] : ['solo']);
        const isCoupleMode = recordParticipationTypes.includes('together');
        
        console.log('💑 详情窗口 - 检查二人世界模式:', isCoupleMode, 'participationTypes:', recordParticipationTypes);
        
        if (isCoupleMode) {
            console.log('💑 详情窗口 - 启用二人世界动画效果');
            modal.classList.add('couple-mode');
            addCoupleEffects(modal);
        } else {
            console.log('💑 详情窗口 - 非二人世界模式');
            modal.classList.remove('couple-mode');
            const existingEffects = modal.querySelectorAll('.couple-heart, .couple-star');
            existingEffects.forEach(el => el.remove());
        }
        
        // 确保弹窗完全关闭后再打开
        if (modal.classList.contains('active')) {
            modal.classList.remove('active');
            setTimeout(() => {
                openDetailWithAnimation(modal);
            }, 100);
        } else {
            openDetailWithAnimation(modal);
        }
        
        console.log('✅ Modal 已打开带动画效果');
    }
    
    /**
     * 打开详情弹窗动画（内部函数）
     */
    function openDetailWithAnimation(modal) {
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        modal.classList.add('active');
        
        // 设置标志位，防止动画过程中被关闭
        modal.dataset.animating = 'true';
        
        // 强制重绘后设置透明度
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                modal.style.opacity = '1';
                // 动画完成后移除标志位
                setTimeout(() => {
                    modal.dataset.animating = 'false';
                }, 300);
            });
        });
    }
    
    /**
     * 关闭详情模态框
     */
    function closeDetail() {
        const modal = document.getElementById('detail-modal');
        if (modal) {
            // 如果正在动画中，等待动画完成
            if (modal.dataset.animating === 'true') {
                setTimeout(() => closeDetail(), 100);
                return;
            }
            
            // 添加淡出动画
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.classList.remove('active');
                modal.style.opacity = '';
                modal.style.transition = '';
                modal.style.display = ''; // 清理 display 属性
                modal.dataset.animating = 'false';
                console.log('✅ Modal 已关闭带动画');
            }, 300);
        }
    }
    
    // 监听模态框点击事件 - 点击空白处关闭
    document.addEventListener('click', function(event) {
        const modal = document.getElementById('detail-modal');
        if (modal && modal.classList.contains('active') && modal.dataset.animating !== 'true') {
            const modalContent = modal.querySelector('.modal');
            if (modalContent && !modalContent.contains(event.target)) {
                closeDetail();
            }
        }
    });
    
    /**
     * 删除记录（临时 LocalStorage 方案）
     */
    async function deleteRecord(id) {
        showConfirm({
            icon: '🗑️',
            title: '删除记录',
            message: '确定要删除此记录吗？',
            type: 'danger',
            onConfirm: () => {
                records = records.filter(r => r.id !== id);
                localStorage.setItem('whitecycle_records_v1', JSON.stringify(records));
                closeDetail();
                renderRecordList();
                renderCalendar();
                updateStats();
                showToast('记录已删除', 'success');
            }
        });
    }
    
    // ====================
    // 日历功能
    // ====================
    
    /**
     * 渲染日历
     */
    function renderCalendar() {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);
        const startingDay = firstDay.getDay();
        
        document.getElementById('calendar-title').textContent = `${year}年${month + 1}月`;
        
        const grid = document.getElementById('calendar-grid');
        let html = '';
        
        // 星期标题
        const days = ['日', '一', '二', '三', '四', '五', '六'];
        days.forEach(day => {
            html += `<div style="text-align: center; font-size: 12px; color: var(--text-secondary); font-weight: 600; padding: 8px 0;">${day}</div>`;
        });
        
        // 上月日期
        for (let i = startingDay; i > 0; i--) {
            const day = prevLastDay.getDate() - i + 1;
            html += `<div class="calendar-day" style="opacity: 0.3;">${day}</div>`;
        }
        
        // 当月日期
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const hasRecord = records.some(r => {
                // 修复：同时支持 startTime 和 start_time 两种字段名
                const startTime = r.startTime || r.start_time;
                
                if (!startTime) {
                    return false;
                }
                
                // 修复：正确处理时间戳字符串
                let rDate;
                if (typeof startTime === 'string') {
                    rDate = new Date(startTime.replace(/-/g, '/'));
                } else {
                    rDate = new Date(startTime);
                }
                return rDate.getDate() === day && 
                       rDate.getMonth() === month && 
                       rDate.getFullYear() === year;
            });
            
            html += `<div class="calendar-day ${hasRecord ? 'has-record' : ''}">${day}</div>`;
        }
        
        // 下月日期
        const totalCells = startingDay + lastDay.getDate();
        const remainingDays = 42 - totalCells;
        for (let i = 1; i <= remainingDays; i++) {
            html += `<div class="calendar-day" style="opacity: 0.3;">${i}</div>`;
        }
        
        grid.innerHTML = html;
    }
    
    /**
     * 切换月份
     */
    function changeMonth(delta) {
        currentMonth.setMonth(currentMonth.getMonth() + delta);
        renderCalendar();
    }
    
    // ====================
    // 统计功能
    // ====================
    
    /**
     * 更新统计（从后端 API 获取）
     */
    async function updateStats() {
        // 修复：从 localStorage 读取统计数据，不依赖登录
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
        
        // 计算统计数据
        const weekRecords = records.filter(r => {
            const st = r.startTime || r.start_time;
            if (!st) return false;
            const rt = typeof st === 'string' ? new Date(st.replace(/-/g, '/')).getTime() : new Date(st).getTime();
            return rt >= weekAgo;
        });
        
        const monthRecords = records.filter(r => {
            const st = r.startTime || r.start_time;
            if (!st) return false;
            const rt = typeof st === 'string' ? new Date(st.replace(/-/g, '/')).getTime() : new Date(st).getTime();
            return rt >= monthAgo;
        });
        
        const avgDuration = records.length > 0 
            ? Math.floor(records.reduce((sum, r) => sum + (r.duration_seconds || r.actualDuration || 0), 0) / records.length / 60)
            : 0;
        
        document.getElementById('stat-total').textContent = records.length;
        document.getElementById('stat-week').textContent = weekRecords.length;
        document.getElementById('stat-month').textContent = monthRecords.length;
        document.getElementById('stat-avg').textContent = avgDuration;
        
        // 渲染周图表
        renderWeekChart();
        
        // 更新新功能
        updateStreak();
        updateWeeklyReport();
        updateMoodTrend();
        updateGoalProgress();
    }
    
    /**
     * 渲染周图表
     */
    function renderWeekChart() {
        const chart = document.getElementById('week-chart');
        const days = ['日', '一', '二', '三', '四', '五', '六'];
        const today = new Date();
        let counts = [];
        let maxCount = 1;
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
            const end = start + 24 * 60 * 60 * 1000;
            
            // 修复：正确解析 startTime 字符串为时间戳
            const count = records.filter(r => {
                const st = r.startTime || r.start_time;
                if (!st) return false;
                const rt = typeof st === 'string' ? new Date(st.replace(/-/g, '/')).getTime() : new Date(st).getTime();
                return rt >= start && rt < end;
            }).length;
            
            counts.push(count);
            maxCount = Math.max(maxCount, count);
        }
        
        chart.innerHTML = counts.map((count, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - (6 - i));
            const height = (count / maxCount) * 180;
            return `
                <div class="chart-bar-wrapper">
                    <div class="chart-bar" style="height: ${height}px;"></div>
                    <div class="chart-bar-label">${days[d.getDay()]}</div>
                </div>
            `;
        }).join('');
    }
    
    // ====================
    // 成就系统
    // ====================
    
    /**
     * 更新成就
     */
    function updateAchievements() {
        const now = new Date();
        const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
        const monthAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
        
        const achievements = CONFIG.ACHIEVEMENTS.map(a => {
            let unlocked = false;
            
            switch(a.id) {
                case 'first':
                    unlocked = records.length >= 1;
                    break;
                case 'five':
                    unlocked = records.length >= 5;
                    break;
                case 'ten':
                    unlocked = records.length >= 10;
                    break;
                case 'monthly':
                    unlocked = records.filter(r => r.startTime >= monthAgo).length >= 10;
                    break;
                case 'weekly':
                    unlocked = records.filter(r => r.startTime >= weekAgo).length >= 5;
                    break;
                case 'diverse':
                    const types = new Set(records.flatMap(r => r.participationTypes || ['solo']));
                    unlocked = types.size >= 3;
                    break;
            }
            
            return { ...a, unlocked };
        });
        
        const list = document.getElementById('achievements-list');
        list.innerHTML = achievements.map(a => `
            <div class="achievement-badge ${a.unlocked ? 'unlocked' : ''}">
                <div class="achievement-icon">${a.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${a.name}</div>
                    <div class="achievement-desc">${a.desc}</div>
                </div>
                <div style="font-size: 24px;">${a.unlocked ? '✅' : '🔒'}</div>
            </div>
        `).join('');
    }
    
    // ====================
    // 智能建议
    // ====================
    
    /**
     * 更新建议
     */
    function updateSuggestions() {
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
        
        const weekCount = records.filter(r => r.startTime >= weekAgo).length;
        const monthCount = records.filter(r => r.startTime >= monthAgo).length;
        const avgDuration = records.length > 0 
            ? Math.floor(records.reduce((sum, r) => sum + r.actualDuration, 0) / records.length / 60) 
            : 0;
        
        let suggestions = [];
        
        if (weekCount === 0) {
            suggestions.push({ icon: '🌱', text: '本周还没有记录，适度放松有助于身心健康' });
        } else if (weekCount >= 5) {
            suggestions.push({ icon: '⚠️', text: '本周记录较多，注意休息，保持适度' });
        }
        
        if (avgDuration > 60) {
            suggestions.push({ icon: '⏰', text: '平均时长较长，建议适当控制时间' });
        } else if (avgDuration > 0 && avgDuration < 10) {
            suggestions.push({ icon: '✓', text: '时长控制得很好，继续保持' });
        }
        
        if (monthCount >= 15) {
            suggestions.push({ icon: '🎯', text: '本月记录频繁，注意劳逸结合' });
        }
        
        if (suggestions.length === 0) {
            suggestions.push({ icon: '💡', text: '你的记录很健康，继续保持良好的生活习惯' });
        }
        
        const list = document.getElementById('ai-suggestions');
        list.innerHTML = suggestions.map(s => `
            <div class="suggestion-item">
                <span class="suggestion-icon">${s.icon}</span>
                <div class="suggestion-text">${s.text}</div>
            </div>
        `).join('');
    }
    
    // ====================
    // 新功能实现
    // ====================
    
    /**
     * 检查长时间未登录
     */
    function checkLongTimeNoSee() {
        const lastVisit = localStorage.getItem('whitecycle_last_visit');
        const now = Date.now();
        
        if (lastVisit) {
            const daysSinceLastVisit = Math.floor((now - parseInt(lastVisit)) / (24 * 60 * 60 * 1000));
            
            if (daysSinceLastVisit >= 30) {
                setTimeout(() => {
                    showLongTimeNoSeeModal(daysSinceLastVisit);
                }, 1000);
            } else if (daysSinceLastVisit >= 7) {
                showToast(`欢迎回来！已经 ${daysSinceLastVisit} 天没见了呢~`, 'success');
            }
        }
        
        // 更新最后登录时间
        localStorage.setItem('whitecycle_last_visit', now.toString());
    }
    
    /**
     * 显示长时间未登录弹窗
     */
    function showLongTimeNoSeeModal(days) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.style.zIndex = '9999';
        
        let encouragement = '';
        if (days >= 90) {
            encouragement = '🎉 哇！好久不见了！能坚持这么久没有记录，说明你的自控力真的非常棒！继续保持这种健康的生活状态，你真的很厉害！';
        } else if (days >= 60) {
            encouragement = '✨ 太棒了！这么长时间没有记录，说明你的生活很充实健康！为你感到骄傲，继续加油！';
        } else if (days >= 30) {
            encouragement = '💪 很不错！一个月没有记录了，说明你很好地控制了自己！保持这样的节奏，生活会更美好！';
        }
        
        modal.innerHTML = `
            <div class="modal modal-center" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title">💖 欢迎回来！</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-content" style="text-align: center; padding: var(--spacing-2xl);">
                    <div style="font-size: 64px; margin-bottom: var(--spacing-lg);">🎊</div>
                    <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--text-primary); margin-bottom: var(--spacing-md);">
                        已经 <span style="color: var(--accent-primary);">${days}</span> 天没见了
                    </div>
                    <div style="color: var(--text-secondary); margin-bottom: var(--spacing-xl); line-height: 1.8;">
                        ${encouragement}
                    </div>
                    <button class="btn btn-primary btn-block" onclick="this.closest('.modal-overlay').remove()">
                        继续记录
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    /**
     * 检查记录间隔并给出提醒
     */
    function checkRecordIntervalAndShowMessage() {
        if (records.length === 0) {
            return {
                showWarning: false,
                message: ''
            };
        }
        
        const now = Date.now();
        
        // 找到最近一次的记录时间（使用所有记录中最大的 startTime）
        const lastTime = Math.max(...records.map(r => new Date(r.startTime).getTime()));
        const intervalHours = (now - lastTime) / (60 * 60 * 1000);
        
        // 间隔太短（小于 2 小时）
        if (intervalHours < 2) {
            return {
                showWarning: true,
                type: 'too_frequent',
                message: `⚠️ 距离上次记录只有 ${Math.floor(intervalHours * 60)} 分钟，频率有点高哦~ 要注意身体健康，适当运动，多出去走走吧！`,
                title: '频率提醒'
            };
        }
        
        // 间隔较长（超过 7 天）
        if (intervalHours > 168) { // 7 天
            const intervalDays = Math.floor(intervalHours / 24);
            return {
                showWarning: false,
                showEncouragement: true,
                message: `🎉 太棒了！距离上次记录已经 ${intervalDays} 天了！你的自控力真的很强，继续保持这种健康的生活节奏！`,
                title: '坚持鼓励'
            };
        }
        
        // 间隔适中（3-7 天）
        if (intervalHours > 72) {
            return {
                showWarning: false,
                showEncouragement: true,
                message: `✨ 很好！距离上次记录 ${Math.floor(intervalHours / 24)} 天，频率控制得很不错！`,
                title: '频率良好'
            };
        }
        
        return {
            showWarning: false,
            message: ''
        };
    }
    
    /**
     * 更新连续记录
     */
    function updateStreak() {
        if (records.length === 0) {
            document.getElementById('streak-count').textContent = '0';
            document.getElementById('streak-history').innerHTML = '';
            return;
        }
        
        // 计算连续天数
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let streak = 0;
        let currentDay = new Date(today);
        
        while (true) {
            const dayStart = currentDay.getTime();
            const dayEnd = dayStart + 24 * 60 * 60 * 1000;
            
            const hasRecord = records.some(r => {
                const rTime = new Date(r.startTime).getTime();
                return rTime >= dayStart && rTime < dayEnd;
            });
            
            if (hasRecord) {
                streak++;
                currentDay.setDate(currentDay.getDate() - 1);
            } else if (streak === 0) {
                // 检查是否是今天
                const todayStart = new Date(today).getTime();
                const hasTodayRecord = records.some(r => {
                    const rTime = new Date(r.startTime).getTime();
                    return rTime >= todayStart;
                });
                
                if (!hasTodayRecord) {
                    break;
                }
                currentDay.setDate(currentDay.getDate() - 1);
            } else {
                break;
            }
        }
        
        document.getElementById('streak-count').textContent = streak;
        
        // 显示最近 7 天的记录情况
        const historyContainer = document.getElementById('streak-history');
        let html = '';
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dayStart = d.getTime();
            const dayEnd = dayStart + 24 * 60 * 60 * 1000;
            
            const hasRecord = records.some(r => {
                const rTime = new Date(r.startTime).getTime();
                return rTime >= dayStart && rTime < dayEnd;
            });
            
            const isToday = i === 0;
            const dayName = isToday ? '今' : weekDays[d.getDay()];
            
            html += `<div class="streak-day ${hasRecord ? 'active' : ''} ${isToday ? 'today' : ''}">${dayName}</div>`;
        }
        
        historyContainer.innerHTML = html;
    }
    
    /**
     * 更新健康周报
     */
    function updateWeeklyReport() {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const weekRecords = records.filter(r => {
            const st = r.startTime || r.start_time;
            if (!st) return false;
            const rt = typeof st === 'string' ? new Date(st.replace(/-/g, '/')).getTime() : new Date(st).getTime();
            return rt >= weekAgo.getTime();
        });
        
        if (weekRecords.length === 0) {
            document.getElementById('report-summary').innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">
                    本周还没有记录，生成周报需要数据哦~
                </div>
            `;
            return;
        }
        
        const totalDuration = weekRecords.reduce((sum, r) => sum + (r.duration_seconds || r.actualDuration || r.duration || 0), 0);
        const avgDuration = Math.floor(totalDuration / weekRecords.length / 60);
        const avgEmotion = weekRecords.filter(r => r.emotion).length;
        const emotionRate = avgEmotion > 0 ? Math.round((avgEmotion / weekRecords.length) * 100) : 0;
        
        document.getElementById('report-summary').innerHTML = `
            <div class="report-summary-title">📊 本周健康报告</div>
            <div style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--spacing-md);">
                过去 7 天的记录总结
            </div>
            <div class="report-summary-stats">
                <div class="report-stat">
                    <div class="report-stat-value">${weekRecords.length}</div>
                    <div class="report-stat-label">记录次数</div>
                </div>
                <div class="report-stat">
                    <div class="report-stat-value">${avgDuration}</div>
                    <div class="report-stat-label">平均时长 (min)</div>
                </div>
                <div class="report-stat">
                    <div class="report-stat-value">${emotionRate}%</div>
                    <div class="report-stat-label">心情记录率</div>
                </div>
                <div class="report-stat">
                    <div class="report-stat-value">${Math.round(weekRecords.length / 7 * 100)}%</div>
                    <div class="report-stat-label">活跃度</div>
                </div>
            </div>
        `;
    }
    
    /**
     * 生成详细周报
     */
    function generateWeeklyReport() {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekRecords = records.filter(r => {
            const st = r.startTime || r.start_time;
            if (!st) return false;
            const rt = typeof st === 'string' ? new Date(st.replace(/-/g, '/')).getTime() : new Date(st).getTime();
            return rt >= weekAgo.getTime();
        });
        
        if (weekRecords.length === 0) {
            showToast('本周数据不足，无法生成周报', 'error');
            return;
        }
        
        const totalDuration = weekRecords.reduce((sum, r) => sum + (r.duration_seconds || r.actualDuration || r.duration || 0), 0);
        const avgDuration = Math.floor(totalDuration / weekRecords.length / 60);
        
        let report = `📊 白循·本周健康报告\n\n`;
        report += `📅 统计时间：${weekAgo.toLocaleDateString()} - ${now.toLocaleDateString()}\n\n`;
        report += `📈 核心数据：\n`;
        report += `  • 记录次数：${weekRecords.length} 次\n`;
        report += `  • 总时长：${Math.floor(totalDuration / 60)} 分钟\n`;
        report += `  • 平均时长：${avgDuration} 分钟\n`;
        report += `  • 最活跃日：${getMostActiveDay(weekRecords)}\n\n`;
        
        if (avgDuration > 60) {
            report += `⚠️ 温馨提示：本周平均时长较长，注意休息哦~\n`;
        } else if (weekRecords.length > 5) {
            report += `⚠️ 温馨提示：本周记录频繁，劳逸结合更健康~\n`;
        } else {
            report += `✓ 本周记录很健康，继续保持良好习惯！\n`;
        }
        
        showToast('周报已生成', 'success');
        alert(report);
    }
    
    function getMostActiveDay(weekRecords) {
        const dayCounts = [0, 0, 0, 0, 0, 0, 0];
        weekRecords.forEach(r => {
            const st = r.startTime || r.start_time;
            const rt = typeof st === 'string' ? new Date(st.replace(/-/g, '/')) : new Date(st);
            dayCounts[rt.getDay()]++;
        });
        
        const maxCount = Math.max(...dayCounts);
        const maxDay = dayCounts.indexOf(maxCount);
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        
        return `${days[maxDay]} (${maxCount}次)`;
    }
    
    /**
     * 更新心情趋势
     */
    function updateMoodTrend() {
        const moodContainer = document.getElementById('mood-trend');
        
        if (records.length === 0) {
            moodContainer.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">
                    还没有心情记录，下次记录时选个心情吧~
                </div>
            `;
            return;
        }
        
        // 获取最近 7 次记录的心情
        const recentRecords = records.slice(-7);
        const emotionMap = {};
        CONFIG.EMOTIONS.forEach(e => {
            emotionMap[e.id] = e;
        });
        
        let html = '<div class="mood-chart">';
        recentRecords.forEach((r, i) => {
            if (r.emotion) {
                const emotion = emotionMap[r.emotion.id];
                const height = 40 + Math.random() * 120;
                html += `
                    <div class="mood-bar" style="height: ${height}px;" title="${emotion.label}">
                        <div class="mood-bar-tooltip">
                            <div style="font-size: 20px; margin-bottom: 4px;">${emotion.emoji}</div>
                            <div>${emotion.label}</div>
                        </div>
                    </div>
                `;
            }
        });
        html += '</div>';
        
        if (recentRecords.filter(r => r.emotion).length === 0) {
            moodContainer.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">
                    这 7 次记录都没有选择心情哦~
                </div>
            `;
        } else {
            moodContainer.innerHTML = html;
        }
    }
    
    /**
     * 更新目标进度
     */
    function updateGoalProgress() {
        const weeklyGoal = parseInt(localStorage.getItem('whitecycle_weekly_goal') || '3');
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const weekCount = records.filter(r => {
            const st = r.startTime || r.start_time;
            if (!st) return false;
            const rt = typeof st === 'string' ? new Date(st.replace(/-/g, '/')).getTime() : new Date(st).getTime();
            return rt >= weekAgo;
        }).length;
        
        const progress = Math.min((weekCount / weeklyGoal) * 100, 100);
        
        document.getElementById('weekly-goal-target').textContent = weeklyGoal;
        document.getElementById('weekly-goal-current').textContent = weekCount;
        document.getElementById('weekly-goal-fill').style.width = `${progress}%`;
        
        if (weekCount >= weeklyGoal) {
            document.getElementById('weekly-goal-fill').style.background = 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
        } else {
            document.getElementById('weekly-goal-fill').style.background = 'var(--accent-gradient)';
        }
    }
    
    /**
     * 打开目标设置模态框
     */
    function openGoalModal() {
        const currentGoal = parseInt(localStorage.getItem('whitecycle_weekly_goal') || '3');
        document.getElementById('goal-value-display').textContent = currentGoal;
        document.getElementById('goal-range').value = currentGoal;
        document.getElementById('goal-range').max = 50;
        document.getElementById('goal-modal').classList.add('active');
        tempGoalValue = currentGoal;
        updateGoalWarning(currentGoal);
    }
    
    function closeGoalModal() {
        document.getElementById('goal-modal').classList.remove('active');
    }
    
    function updateGoalWarning(val) {
        const warning = document.getElementById('goal-warning');
        const warningText = document.getElementById('goal-warning-text');
        if (val > 10) {
            warningText.textContent = `每周 ${val} 次的目标较高，请注意劳逸结合，保持健康的生活习惯哦~ 💪`;
            warning.style.display = 'flex';
        } else if (val > 7) {
            warningText.textContent = `每周 ${val} 次的目标适中，继续保持，但也不要太累哦~ ️`;
            warning.style.display = 'flex';
        } else {
            warning.style.display = 'none';
        }
    }
    
    let tempGoalValue = 3;
    
    function adjustGoal(delta) {
        const display = document.getElementById('goal-value-display');
        const range = document.getElementById('goal-range');
        let current = parseInt(display.textContent);
        current = Math.max(1, Math.min(50, current + delta));
        display.textContent = current;
        range.value = current;
        tempGoalValue = current;
        updateGoalWarning(current);
    }
    
    function updateGoalFromRange(val) {
        const v = parseInt(val);
        document.getElementById('goal-value-display').textContent = v;
        tempGoalValue = v;
        updateGoalWarning(v);
    }
    
    function saveGoal() {
        localStorage.setItem('whitecycle_weekly_goal', tempGoalValue.toString());
        closeGoalModal();
        updateGoalProgress();
        if (tempGoalValue > 10) {
            showToast(`目标已设为每周 ${tempGoalValue} 次，注意劳逸结合哦~`, 'info');
        } else {
            showToast('目标已更新为每周 ' + tempGoalValue + ' 次', 'success');
        }
    }
    
    // ====================
    // 数据导入导出
    // ====================
    
    /**
     * 导出数据
     */
    function exportData() {
        const data = {
            profile: userProfile,
            records: records,
            exportTime: new Date().toISOString(),
            version: '6.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `白循数据_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast('数据已导出', 'success');
    }
    
    /**
     * 导入数据
     */
    function importData() {
        document.getElementById('import-file').click();
    }
    
    /**
     * 处理文件导入
     */
    function handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.profile && Array.isArray(data.records)) {
                    showConfirm({
                        icon: '📥',
                        title: '导入数据',
                        message: `将导入 ${data.records.length} 条记录，是否继续？`,
                        onConfirm: () => {
                            userProfile = data.profile;
                            records = data.records;
                            saveData();
                            location.reload();
                        }
                    });
                } else {
                    showToast('文件格式不正确', 'error');
                }
            } catch (err) {
                showToast('文件解析失败', 'error');
            }
        };
        reader.readAsText(file);
    }
    
    /**
     * 清除所有数据
     */
    function showClearDataDialog() {
        showConfirm({
            icon: '⚠️',
            title: '清除所有数据',
            message: '确定要清除所有数据吗？此操作不可恢复！',
            type: 'danger',
            onConfirm: () => {
                records = [];
                userProfile = null;
                saveData();
                location.reload();
            }
        });
    }
    
    // ====================
    // 密码保护
    // ====================
    
    /**
     * 显示密码设置界面
     */
    function showPasswordSettings() {
        const modal = document.getElementById('password-settings-modal');
        const usernameInput = document.getElementById('password-username');
        const passwordInput = document.getElementById('password-input');
        const confirmInput = document.getElementById('password-confirm');
        
        // 清空输入
        usernameInput.value = '';
        passwordInput.value = '';
        confirmInput.value = '';
        
        // 检查是否已启用密码
        const authData = localStorage.getItem('whitecycle_auth_v1');
        if (authData) {
            showPasswordEnabledView();
        } else {
            document.getElementById('password-not-enabled').style.display = 'block';
            document.getElementById('password-enabled').style.display = 'none';
            document.getElementById('password-change-form').style.display = 'none';
        }
        
        modal.classList.add('active');
    }
    
    /**
     * 关闭密码设置界面
     */
    function closePasswordSettingsModal() {
        const modal = document.getElementById('password-settings-modal');
        modal.classList.remove('active');
    }
    
    /**
     * 显示已启用密码视图
     */
    function showPasswordEnabledView() {
        const authData = localStorage.getItem('whitecycle_auth_v1');
        if (authData) {
            const auth = JSON.parse(authData);
            document.getElementById('password-username-display').textContent = auth.username;
            document.getElementById('password-not-enabled').style.display = 'none';
            document.getElementById('password-enabled').style.display = 'block';
            document.getElementById('password-change-form').style.display = 'none';
        }
    }
    
    /**
     * 显示修改密码表单
     */
    function showChangePasswordForm() {
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('new-password-confirm').value = '';
        document.getElementById('password-enabled').style.display = 'none';
        document.getElementById('password-change-form').style.display = 'block';
    }
    
    /**
     * 显示提示问题表单
     */
    function showSecurityQuestionForm() {
        document.getElementById('security-question-select').value = '';
        document.getElementById('security-question-answer').value = '';
        document.getElementById('password-enabled').style.display = 'none';
        document.getElementById('security-question-form').style.display = 'block';
    }
    
    /**
     * 设置密码提示问题
     */
    async function setSecurityQuestion() {
        const userId = sessionStorage.getItem('whitecycle_user_id');
        const question = document.getElementById('security-question-select').value;
        const answer = document.getElementById('security-question-answer').value;
        
        if (!userId) {
            showToast('请先登录', 'error');
            return;
        }
        
        if (!question || !answer) {
            showToast('请选择问题并填写答案', 'error');
            return;
        }
        
        if (answer.length < 3) {
            showToast('答案至少 3 个字符', 'error');
            return;
        }
        
        try {
            const response = await fetch('php/api/auth.php?action=setSecurityQuestion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    question: question,
                    answer: answer
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showToast('提示问题设置成功', 'success');
                showPasswordEnabledView();
            } else {
                showToast('设置失败：' + (result.error || '未知错误'), 'error');
            }
        } catch (error) {
            console.error('设置失败:', error);
            showToast('网络错误', 'error');
        }
    }
    
    /**
     * 显示已启用密码视图
     */
    function showPasswordEnabledView() {
        const authData = localStorage.getItem('whitecycle_auth_v1');
        if (authData) {
            const auth = JSON.parse(authData);
            document.getElementById('password-username-display').textContent = auth.username;
            document.getElementById('password-not-enabled').style.display = 'none';
            document.getElementById('password-enabled').style.display = 'block';
            document.getElementById('password-change-form').style.display = 'none';
            document.getElementById('security-question-form').style.display = 'none';
        }
    }
    
    /**
     * 启用密码保护
     */
    async function enablePassword() {
        console.log(' 点击了启用密码保护按钮');
        
        const usernameInput = document.getElementById('password-username');
        const passwordInput = document.getElementById('password-input');
        const confirmPasswordInput = document.getElementById('password-confirm');
        
        if (!usernameInput || !passwordInput || !confirmPasswordInput) {
            console.error(' 找不到输入元素');
            showToast('系统错误，请刷新页面', 'error');
            return;
        }
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        console.log(' 输入值:', { username: username, passwordLength: password.length });
        
        if (!username) {
            console.log(' 用户名为空');
            showToast('请输入账户名', 'error');
            return;
        }
        
        if (password.length < 6) {
            console.log(' 密码长度不足');
            showToast('密码至少需要 6 位', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            console.log(' 两次密码不一致');
            showToast('两次输入的密码不一致', 'error');
            return;
        }
        
        try {
            console.log(' 开始生成哈希密码...');
            // 生成盐值和哈希密码
            const salt = Utils.generateSalt();
            const hashedPassword = await Utils.hashPasswordWithSalt(password, salt);
            
            console.log(' 哈希密码生成成功');
            
            // 保存认证信息
            const authData = {
                username: username,
                hashedPassword: hashedPassword,
                salt: salt,
                enabled: true,
                createdAt: Date.now()
            };
            
            localStorage.setItem('whitecycle_auth_v1', JSON.stringify(authData));
            
            console.log(' 认证信息已保存到 localStorage');
            
            // 更新设置页面的状态
            const statusEl = document.getElementById('password-status');
            if (statusEl) {
                statusEl.textContent = '已启用';
            }
            
            showToast('密码保护已启用', 'success');
            closePasswordSettingsModal();
        } catch (error) {
            console.error(' 启用密码失败:', error);
            showToast('启用失败：' + error.message, 'error');
        }
    }
    
    /**
     * 关闭密码保护
     */
    function disablePassword() {
        showConfirm({
            icon: '⚠️',
            title: '关闭密码保护',
            message: '确定要关闭密码保护吗？关闭后任何人都可以访问您的数据。',
            type: 'danger',
            onConfirm: () => {
                localStorage.removeItem('whitecycle_auth_v1');
                document.getElementById('password-status').textContent = '未启用';
                showToast('密码保护已关闭', 'success');
                closePasswordSettingsModal();
            }
        });
    }
    
    /**
     * 检查密码强度
     */
    window.checkPasswordStrength = function() {
        const password = document.getElementById('password-input').value;
        const hint = document.getElementById('password-strength-hint');
        const text = document.getElementById('password-strength-text');
        
        if (!password) {
            hint.style.display = 'none';
            return;
        }
        
        hint.style.display = 'block';
        
        if (password.length < 6) {
            hint.style.color = '#ef4444';
            text.textContent = `❌ 密码长度不足（当前 ${password.length} 位，至少需要 6 位）`;
        } else if (password.length < 8) {
            hint.style.color = '#f59e0b';
            text.textContent = `⚠️ 密码较弱（${password.length} 位），建议使用 8 位以上`;
        } else {
            hint.style.color = '#10b981';
            text.textContent = `✅ 密码强度良好（${password.length} 位）`;
        }
    };
    
    /**
     * 立即锁定网站
     */
    function lockWebsite() {
        sessionStorage.removeItem('whitecycle_logged_in_v1');
        
        showToast('网站已锁定', 'success');
        
        setTimeout(() => {
            const lockModal = document.getElementById('lock-modal');
            if (lockModal) {
                const usernameInput = document.getElementById('lock-username');
                const passwordInput = document.getElementById('lock-password');
                const errorDiv = document.getElementById('lock-error');
                
                usernameInput.value = '';
                passwordInput.value = '';
                errorDiv.style.display = 'none';
                
                lockModal.classList.add('active');
                
                setTimeout(() => {
                    usernameInput.focus();
                }, 300);
            }
        }, 300);
    };
    
    /**
     * 解锁网站（登录）
     */
    async function unlockWebsite() {
        const usernameInput = document.getElementById('lock-username');
        const passwordInput = document.getElementById('lock-password');
        const errorDiv = document.getElementById('lock-error');
        const errorText = errorDiv.querySelector('.lock-error-text');
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        if (!username) {
            errorText.textContent = '请输入用户名';
            errorDiv.style.display = 'flex';
            usernameInput.focus();
            return;
        }
        
        if (!password) {
            errorText.textContent = '请输入密码';
            errorDiv.style.display = 'flex';
            passwordInput.focus();
            return;
        }
        
        const authData = localStorage.getItem('whitecycle_auth_v1');
        if (!authData) {
            errorText.textContent = '密码保护未启用';
            errorDiv.style.display = 'flex';
            return;
        }
        
        const auth = JSON.parse(authData);
        
        if (username !== auth.username) {
            errorText.textContent = '用户名或密码错误';
            errorDiv.style.display = 'flex';
            passwordInput.value = '';
            passwordInput.focus();
            return;
        }
        
        try {
            const hashedPassword = await Utils.hashPasswordWithSalt(password, auth.salt);
            if (hashedPassword !== auth.hashedPassword) {
                errorText.textContent = '用户名或密码错误';
                errorDiv.style.display = 'flex';
                passwordInput.value = '';
                passwordInput.focus();
                return;
            }
            
            sessionStorage.setItem('whitecycle_logged_in_v1', 'true');
            sessionStorage.setItem('whitecycle_username', username);
            
            const lockModal = document.getElementById('lock-modal');
            lockModal.classList.remove('active');
            lockModal.style.display = 'none';
            
            usernameInput.value = '';
            passwordInput.value = '';
            errorDiv.style.display = 'none';
            
            showToast('欢迎回来，' + username, 'success');
            
            await afterLoginInit();
        } catch (error) {
            console.error('解锁失败:', error);
            errorText.textContent = '验证失败，请重试';
            errorDiv.style.display = 'flex';
        }
    };
    
    async function afterLoginInit() {
        loadData();
        loadTheme();
        updateWelcome();
        loadDisplaySettings();
        
        checkLongTimeNoSee();
        
        if (userProfile) {
            document.documentElement.setAttribute('data-identity', userProfile.identity);
            updateIdentityDisplay();
            document.getElementById('user-avatar').textContent = CONFIG.IDENTITY_MAP[userProfile.identity].emoji;
        } else {
            document.getElementById('onboarding-modal').classList.add('active');
            const identityGrid = document.querySelector('#onboarding-modal .identity-grid');
            identityGrid.innerHTML = document.querySelector('#identity-modal .identity-grid').innerHTML;
        }
        
        renderRecordList();
        renderCalendar();
        updateStats();
    }
    
    /**
     * 忘记密码提示
     */
    function showForgotPasswordHint() {
        showToast('请联系开发者或清除数据后重新设置', 'info');
    }
    
    /**
     * 修改密码
     */
    async function changePassword() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const newPasswordConfirm = document.getElementById('new-password-confirm').value;
        
        const authData = localStorage.getItem('whitecycle_auth_v1');
        if (!authData) {
            showToast('密码保护未启用', 'error');
            return;
        }
        
        const auth = JSON.parse(authData);
        
        // 验证当前密码
        const hashedCurrentPassword = await Utils.hashPasswordWithSalt(currentPassword, auth.salt);
        if (hashedCurrentPassword !== auth.hashedPassword) {
            showToast('当前密码错误', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            showToast('新密码至少需要 6 位', 'error');
            return;
        }
        
        if (newPassword !== newPasswordConfirm) {
            showToast('两次输入的新密码不一致', 'error');
            return;
        }
        
        try {
            // 生成新的盐值和哈希密码
            const newSalt = Utils.generateSalt();
            const newHashedPassword = await Utils.hashPasswordWithSalt(newPassword, newSalt);
            
            // 更新认证信息
            auth.hashedPassword = newHashedPassword;
            auth.salt = newSalt;
            auth.updatedAt = Date.now();
            
            localStorage.setItem('whitecycle_auth_v1', JSON.stringify(auth));
            
            showToast('密码修改成功', 'success');
            closePasswordSettingsModal();
        } catch (error) {
            console.error('修改密码失败:', error);
            showToast('修改失败，请重试', 'error');
        }
    }
    
    /**
     * 检查是否需要登录
     */
    function checkAuthentication() {
        const authData = localStorage.getItem('whitecycle_auth_v1');
        if (!authData) {
            return true;
        }
        
        const isLoggedIn = sessionStorage.getItem('whitecycle_logged_in_v1');
        
        if (isLoggedIn === 'true') {
            return true;
        }
        
        showLockModal();
        return false;
    }
    
    /**
     * 显示锁屏登录界面
     */
    function showLockModal() {
        const lockModal = document.getElementById('lock-modal');
        if (!lockModal) return;
        
        const usernameInput = document.getElementById('lock-username');
        const passwordInput = document.getElementById('lock-password');
        const errorDiv = document.getElementById('lock-error');
        const avatarDiv = document.getElementById('lock-avatar');
        const subtitle = document.getElementById('lock-subtitle');
        
        usernameInput.value = '';
        passwordInput.value = '';
        errorDiv.style.display = 'none';
        
        const authData = localStorage.getItem('whitecycle_auth_v1');
        if (authData) {
            const auth = JSON.parse(authData);
            if (avatarDiv && CONFIG && CONFIG.IDENTITY_MAP && userProfile) {
                avatarDiv.textContent = CONFIG.IDENTITY_MAP[userProfile.identity]?.emoji || '';
            }
            if (subtitle) {
                subtitle.textContent = `欢迎回来，${auth.username || '用户'}`;
            }
        }
        
        lockModal.style.display = 'flex';
        lockModal.classList.add('active');
        
        setTimeout(() => {
            usernameInput.focus();
        }, 300);
    }
    
    /**
     * 显示登录界面
     */
    function showLoginModal() {
        const modal = document.getElementById('login-modal');
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        const errorDiv = document.getElementById('login-error');
        
        // 清空输入和错误信息
        usernameInput.value = '';
        passwordInput.value = '';
        errorDiv.style.display = 'none';
        
        modal.classList.add('active');
    }
    
    /**
     * 登录
     */
    async function login() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');
        
        const authData = localStorage.getItem('whitecycle_auth_v1');
        if (!authData) {
            errorDiv.textContent = '密码保护未启用';
            errorDiv.style.display = 'block';
            return;
        }
        
        const auth = JSON.parse(authData);
        
        let failedAttempts = parseInt(sessionStorage.getItem('whitecycle_login_failed_v1') || '0');
        
        if (username !== auth.username) {
            failedAttempts++;
            sessionStorage.setItem('whitecycle_login_failed_v1', failedAttempts.toString());
            
            if (failedAttempts >= 5) {
                errorDiv.innerHTML = '账户名或密码错误<br><strong style="color: #f59e0b; margin-top: 8px; display: block;">⚠️ 连续失败 5 次，请确认账户名和密码是否正确，或考虑清除数据</strong>';
            } else {
                errorDiv.textContent = `账户名或密码错误（剩余尝试次数：${5 - failedAttempts}）`;
            }
            errorDiv.style.display = 'block';
            return;
        }
        
        const hashedPassword = await Utils.hashPasswordWithSalt(password, auth.salt);
        if (hashedPassword !== auth.hashedPassword) {
            failedAttempts++;
            sessionStorage.setItem('whitecycle_login_failed_v1', failedAttempts.toString());
            
            if (failedAttempts >= 5) {
                errorDiv.innerHTML = '账户名或密码错误<br><strong style="color: #f59e0b; margin-top: 8px; display: block;">⚠️ 连续失败 5 次，请确认账户名和密码是否正确，或考虑清除数据</strong>';
            } else {
                errorDiv.textContent = `账户名或密码错误（剩余尝试次数：${5 - failedAttempts}）`;
            }
            errorDiv.style.display = 'block';
            return;
        }
        
        sessionStorage.removeItem('whitecycle_login_failed_v1');
        sessionStorage.setItem('whitecycle_logged_in_v1', 'true');
        sessionStorage.setItem('whitecycle_username', username);
        
        const modal = document.getElementById('login-modal');
        modal.classList.remove('active');
        
        showToast(`欢迎回来，${username}`, 'success');
    }
    
    /**
     * 清除数据继续（用户忘记密码时使用）
     */
    function clearDataAndContinue() {
        showConfirm({
            icon: '⚠️',
            title: '清除所有数据',
            message: '忘记密码时，您可以选择清除所有数据并重新开始。此操作不可恢复！',
            type: 'danger',
            onConfirm: () => {
                localStorage.clear();
                sessionStorage.clear();
                location.reload();
            }
        });
    }
    
    /**
     * 登出
     */
    function logout() {
        // 清除所有会话和 localStorage
        sessionStorage.clear();
        localStorage.clear();
        showToast('已退出登录', 'success');
        
        // 跳转到登录页面
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
    
    // ====================
    // 主题切换
    // ====================
    
    /**
     * 切换主题
     */
    function toggleTheme() {
        isLightTheme = !isLightTheme;
        
        if (isLightTheme) {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        
        // 修复所有白色字体的可见性
        fixWhiteTextColors();
        
        saveTheme();
        showToast(`已切换到${isLightTheme ? '浅色' : '深色'}模式`, 'success');
    }
    
    /**
     * 修复浅色主题下的白色字体问题
     */
    function fixWhiteTextColors() {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        
        // 查找所有可能使用白色的元素
        const elements = document.querySelectorAll('*');
        
        elements.forEach(el => {
            // 跳过脚本、样式等元素
            if (['SCRIPT', 'STYLE', 'META', 'LINK', 'HEAD', 'BODY'].includes(el.tagName)) {
                return;
            }
            
            const style = window.getComputedStyle(el);
            const color = style.color;
            
            // 检查是否是纯白色 (rgb(255, 255, 255) 或 #ffffff)
            if (color === 'rgb(255, 255, 255)' || color === '#ffffff') {
                // 检查是否在特殊容器中（这些容器应该保持白色）
                const isInSpecialContainer = 
                    el.closest('.detail-header') || 
                    el.closest('.btn-primary') || 
                    el.closest('.btn-secondary') ||
                    el.closest('.timer-display') ||
                    el.closest('.stat-value') ||
                    el.closest('.modal-header') ||
                    el.closest('.complete-stat-value') ||
                    el.closest('.complete-actions .btn-primary');
                
                // 如果不在特殊容器中，在浅色主题下强制改为深色
                if (!isInSpecialContainer && isLight) {
                    el.style.setProperty('color', 'var(--text-primary)', 'important');
                } else if (!isLight) {
                    // 深色主题下恢复（移除内联样式）
                    el.style.removeProperty('color');
                }
            }
        });
    }
    
    // ====================
    // 辅助方法
    // ====================
    
    /**
     * 切换到记录页面
     */
    function switchToRecord() {
        const recordNav = document.querySelector('[data-nav="record"]');
        switchPage('record', recordNav);
    }
    
    // ====================
    // 初始化
    // ====================
    
    /**
     * 初始化应用
     */
    async function init() {
        await StorageManager.init();
        
        loadData();
        loadTheme();
        updateWelcome();
        loadDisplaySettings();
        
        const authData = localStorage.getItem('whitecycle_auth_v1');
        
        if (authData) {
            const isLoggedIn = sessionStorage.getItem('whitecycle_logged_in_v1');
            if (isLoggedIn !== 'true') {
                showLockModal();
                return;
            }
        }
        
        console.log('📦 初始化应用...');
        console.log('👤 用户配置:', userProfile);
        console.log('💾 当前存储模式:', StorageManager.getMode());
        
        checkLongTimeNoSee();
        
        if (userProfile) {
            console.log('✅ 已有身份配置:', userProfile.identity);
            document.documentElement.setAttribute('data-identity', userProfile.identity);
            console.log('🎨 已设置 data-identity:', userProfile.identity);
            updateIdentityDisplay();
            document.getElementById('user-avatar').textContent = CONFIG.IDENTITY_MAP[userProfile.identity].emoji;
            console.log('🎭 头像已更新:', CONFIG.IDENTITY_MAP[userProfile.identity].emoji);
        } else {
            console.log('ℹ️ 首次使用，显示身份选择');
            document.getElementById('onboarding-modal').classList.add('active');
            const identityGrid = document.querySelector('#onboarding-modal .identity-grid');
            identityGrid.innerHTML = document.querySelector('#identity-modal .identity-grid').innerHTML;
        }
        
        renderRecordList();
        renderCalendar();
        updateStats();
        
        console.log('🎉 白循 WhiteCycle v6.0.0 已启动');
    }
    
    /**
     * 加载显示设置
     */
    function loadDisplaySettings() {
        // 设置仍可以使用 LocalStorage，因为这些不是敏感数据
        const showStats = localStorage.getItem('whitecycle_show_stats') !== 'false';
        const showCouple = localStorage.getItem('whitecycle_couple_reminder') !== 'false';
        
        const statsToggle = document.getElementById('show-stats-toggle');
        const coupleToggle = document.getElementById('couple-reminder-toggle');
        
        if (statsToggle) statsToggle.checked = showStats;
        if (coupleToggle) coupleToggle.checked = showCouple;
        
        // 加载密码保护状态
        const authData = localStorage.getItem('whitecycle_auth_v1');
        const passwordStatus = document.getElementById('password-status');
        if (passwordStatus) {
            passwordStatus.textContent = authData ? '已启用 · SHA-256 加密' : '未启用 · SHA-256 加密';
        }
    }
    
    /**
     * 获取记录对应的 Emoji
     */
    function getRecordEmoji(record) {
        const hour = new Date(record.startTime).getHours();
        if (hour >= 5 && hour < 12) return '🌅';
        if (hour >= 12 && hour < 18) return '☀️';
        if (hour >= 18 && hour < 23) return '🌙';
        return '🌟';
    }
    
    /**
     * 格式化日期时间
     */
    function formatDateTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        const days = ['日', '一', '二', '三', '四', '五', '六'];
        const dayOfWeek = days[date.getDay()];
        
        return `${year}/${month}/${day} ${hour}:${minute} 周${dayOfWeek}`;
    }
    
    /**
     * 生成关怀提示
     */
    function generateCareMessage(weekCount, monthCount) {
        let title, subtitle, care = null;
        
        // 计算连续天数
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let consecutiveDays = 0;
        let checkDate = new Date(today);
        
        // 检查过去 30 天内的连续记录天数
        for (let i = 0; i < 30; i++) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const hasRecord = records.some(r => {
                const st = r.startTime || r.start_time;
                if (!st) return false;
                const recordDate = typeof st === 'string' ? new Date(st.replace(/-/g, '/')).toISOString().split('T')[0] : new Date(st).toISOString().split('T')[0];
                return recordDate === dateStr;
            });
            
            if (hasRecord) {
                consecutiveDays++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        // 根据连续天数添加关怀提醒
        if (consecutiveDays >= 3) {
            care = {
                title: '💝 连续记录关怀提醒',
                content: `你已经连续记录了 ${consecutiveDays} 天，真的很自律！不过也要记得适当休息，保持身心健康。多喝水、多运动、规律作息哦～`
            };
        }
        
        if (weekCount <= 2) {
            title = '✨ 很棒！节奏控制得很好';
            subtitle = '继续保持健康的频率～';
            if (!care) {
                care = {
                    title: '💝 温馨提示',
                    content: '你的自律能力真的很棒！适度的频率有助于身心健康，记得多喝水、适当运动，保持良好的生活习惯哦～'
                };
            }
        } else if (weekCount <= 4) {
            title = '😊 不错！频率适中';
            subtitle = '注意适当休息哦～';
            if (!care) {
                care = {
                    title: '💝 关爱提醒',
                    content: '适度的频率有助于身心健康，记得多喝水、适当运动，保持良好的生活习惯～ 如果感到疲劳，可以适当休息一下哦！'
                };
            }
        } else {
            title = '🤗 稍微频繁了一些';
            subtitle = '要多注意休息和节制～';
            care = {
                title: '💝 健康建议',
                content: '最近频率有点高呢，建议适当分散注意力，多参加户外活动，保持规律的作息。记住，适度才是最好的！如果感到困扰，可以和导师聊聊哦～'
            };
        }
        
        return { title, subtitle, care };
    }
    
    /**
     * 获取当前主题色
     */
    function getThemeColors() {
        if (!userProfile) {
            return {
                primary: '#6366f1',
                gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                light: 'rgba(99, 102, 241, 0.1)'
            };
        }
        
        const identity = userProfile.identity;
        const themes = {
            'MALE': {
                primary: '#3b82f6',
                gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                light: 'rgba(59, 130, 246, 0.1)'
            },
            'FEMALE': {
                primary: '#ec4899',
                gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                light: 'rgba(236, 72, 153, 0.1)'
            },
            'GAY': {
                primary: '#a855f7',
                gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                light: 'rgba(168, 85, 247, 0.1)'
            },
            'LESBIAN': {
                primary: '#f472b6',
                gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
                light: 'rgba(244, 114, 182, 0.1)'
            },
            'OTHER': {
                primary: '#6366f1',
                gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                light: 'rgba(99, 102, 241, 0.1)'
            },
            'FRIEND': {
                primary: '#10b981',
                gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                light: 'rgba(16, 185, 129, 0.1)'
            }
        };
        
        return themes[identity] || themes['OTHER'];
    }
    
    // ====================
    // 情绪选择功能
    // ====================
    
    /**
     * 显示情绪选择弹窗
     */
    function showEmotionModal() {
        const modal = document.getElementById('emotion-modal');
        const wheel = document.getElementById('emotion-wheel');
        
        // 生成情绪轮盘
        renderEmotionWheel();
        
        // 默认选择第一个情绪
        if (!selectedEmotion) {
            selectedEmotion = CONFIG.EMOTIONS[0];
        }
        updateEmotionDisplay();
        
        modal.classList.add('active');
        
        // 添加滚轮事件监听
        wheel.addEventListener('wheel', handleEmotionWheelScroll);
        wheel.addEventListener('touchmove', handleEmotionWheelTouch, { passive: false });
        
        // 添加键盘事件监听
        document.addEventListener('keydown', handleEmotionKeydown);
        
        // 聚焦到弹窗
        modal.focus();
    }
    
    /**
     * 渲染情绪轮盘
     */
    function renderEmotionWheel() {
        const wheel = document.getElementById('emotion-wheel');
        const itemHeight = 80;
        const totalHeight = itemHeight * CONFIG.EMOTIONS.length;
        
        wheel.innerHTML = CONFIG.EMOTIONS.map((emotion, index) => `
            <div class="emotion-wheel-item" data-index="${index}" style="height: ${itemHeight}px;">
                <div class="emotion-wheel-emoji">${emotion.emoji}</div>
                <div class="emotion-wheel-label">${emotion.label}</div>
            </div>
        `).join('');
        
        wheel.style.height = `${totalHeight}px`;
    }
    
    /**
     * 处理滚轮滚动
     */
    function handleEmotionWheelScroll(e) {
        e.preventDefault();
        e.stopPropagation();
        const itemHeight = 80;
        emotionWheelScroll += e.deltaY;
        emotionWheelScroll = Math.max(0, Math.min(emotionWheelScroll, (CONFIG.EMOTIONS.length - 1) * itemHeight));
        
        updateEmotionWheelPosition();
    }
    
    /**
     * 处理触摸滚动
     */
    function handleEmotionWheelTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const itemHeight = 80;
        
        if (!this.lastTouchY) {
            this.lastTouchY = touch.clientY;
        }
        
        const delta = touch.clientY - this.lastTouchY;
        emotionWheelScroll -= delta;
        emotionWheelScroll = Math.max(0, Math.min(emotionWheelScroll, (CONFIG.EMOTIONS.length - 1) * itemHeight));
        
        updateEmotionWheelPosition();
        this.lastTouchY = touch.clientY;
    }
    
    /**
     * 处理键盘事件
     */
    function handleEmotionKeydown(e) {
        const itemHeight = 80;
        
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            emotionWheelScroll = Math.max(0, emotionWheelScroll - itemHeight);
            updateEmotionWheelPosition();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            emotionWheelScroll = Math.min((CONFIG.EMOTIONS.length - 1) * itemHeight, emotionWheelScroll + itemHeight);
            updateEmotionWheelPosition();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            confirmEmotion();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            closeEmotionModal();
        }
    }
    
    /**
     * 更新情绪轮盘位置
     */
    function updateEmotionWheelPosition() {
        const wheel = document.getElementById('emotion-wheel');
        const itemHeight = 80;
        wheel.style.transform = `translateY(-${emotionWheelScroll}px)`;
        
        // 计算当前选中的情绪
        const selectedIndex = Math.round(emotionWheelScroll / itemHeight);
        selectedEmotion = CONFIG.EMOTIONS[selectedIndex];
        updateEmotionDisplay();
        
        // 更新高亮状态
        const items = wheel.querySelectorAll('.emotion-wheel-item');
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    /**
     * 更新情绪显示
     */
    function updateEmotionDisplay() {
        const emoji = document.getElementById('emotion-selected-emoji');
        const label = document.getElementById('emotion-selected-label');
        
        emoji.textContent = selectedEmotion.emoji;
        label.textContent = selectedEmotion.label;
        label.style.color = selectedEmotion.color;
    }
    
    /**
     * 确认情绪选择
     */
    function confirmEmotion() {
        console.log('✅ 确认情绪选择');
        console.log('🔍 editingRecordId:', window.editingRecordId);
        console.log('🔍 currentRecording:', currentRecording);
        console.log('🔍 selectedEmotion:', selectedEmotion);
        
        let saved = false;
        
        // 如果是编辑已有记录
        if (window.editingRecordId) {
            const record = records.find(r => r.id === window.editingRecordId);
            console.log('🔍 找到的记录:', record);
            
            if (record) {
                record.emotion = selectedEmotion;
                saveData();
                console.log('✅ 情绪已保存到记录');
                saved = true;
            }
        }
        
        // 如果是新记录（刚结束的记录）
        if (!saved && currentRecording && selectedEmotion) {
            console.log('✅ 保存到新记录');
            currentRecording.emotion = selectedEmotion;
            saveData();
            saved = true;
        }
        
        if (!saved) {
            console.warn('⚠️ 没有可保存的记录');
        }
        
        closeEmotionModal();
        
        if (saved) {
            showToast('心情已保存', 'success');
        }
    }
    
    /**
     * 关闭情绪弹窗
     */
    function closeEmotionModal() {
        const modal = document.getElementById('emotion-modal');
        const wheel = document.getElementById('emotion-wheel');
        
        modal.classList.remove('active');
        
        // 移除事件监听
        if (wheel) {
            wheel.removeEventListener('wheel', handleEmotionWheelScroll);
            wheel.removeEventListener('touchmove', handleEmotionWheelTouch);
        }
        
        // 移除键盘事件监听
        document.removeEventListener('keydown', handleEmotionKeydown);
        
        // 重置滚动位置
        emotionWheelScroll = 0;
    }
    
    /**
     * 编辑记录情绪
     */
    function editRecordEmotion(id) {
        console.log('✏️ 编辑情绪，ID:', id);
        const record = records.find(r => r.id === id);
        if (!record) {
            console.error('❌ 未找到记录:', id);
            alert('未找到记录');
            return;
        }
        
        // 关闭详情窗口
        closeDetail();
        
        selectedEmotion = record.emotion || CONFIG.EMOTIONS[0];
        const emotionIndex = CONFIG.EMOTIONS.findIndex(e => e.id === (record.emotion?.id));
        emotionWheelScroll = (emotionIndex >= 0 ? emotionIndex : 0) * 80;
        
        // 保存当前记录 ID，用于更新
        window.editingRecordId = id;
        
        // 显示情绪选择弹窗
        setTimeout(() => {
            showEmotionModal();
        }, 300);
    }
    
    // ====================
    // 合并的完成弹窗功能
    // ====================
    
    let selectedCompleteEmotion = null;
    
    /**
     * 添加二人世界特效（提前声明）
     */
    function addCoupleEffects(modal) {
        console.log('💕 开始添加二人世界动画效果...');
        
        // 移除之前的效果
        const existingEffects = modal.querySelectorAll('.couple-heart, .couple-star');
        if (existingEffects.length > 0) {
            console.log('💕 移除旧效果:', existingEffects.length, '个元素');
            existingEffects.forEach(el => el.remove());
        }
        
        // 添加爱心
        const hearts = ['💕', '', '💗', '', '💞'];
        console.log('💕 添加爱心:', hearts);
        const heartContainer = document.createElement('div');
        heartContainer.style.cssText = 'position: absolute; inset: 0; overflow: hidden; pointer-events: none;';
        
        hearts.forEach((heart, i) => {
            const heartEl = document.createElement('div');
            heartEl.className = 'couple-heart';
            heartEl.textContent = heart;
            heartEl.style.top = `${20 + i * 15}%`;
            console.log('💕 添加爱心', i, heart, '位置:', heartEl.style.top);
            heartContainer.appendChild(heartEl);
        });
        
        modal.appendChild(heartContainer);
        console.log('💕 爱心容器已添加');
        
        // 添加星星
        console.log('✨ 添加星星');
        const starContainer = document.createElement('div');
        starContainer.style.cssText = 'position: absolute; inset: 0; overflow: hidden; pointer-events: none;';
        
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('div');
            star.className = 'couple-star';
            starContainer.appendChild(star);
        }
        
        modal.appendChild(starContainer);
        console.log('✨ 星星容器已添加');
        console.log('💕 二人世界动画效果添加完成');
    }
    
    /**
     * 显示完成弹窗
     */
    function showCompleteModal(record) {
        const modal = document.getElementById('complete-modal');
        // 修复：使用秒数显示，格式化为"几分几秒"
        const durationSeconds = record.actualDuration || record.duration_seconds || record.duration || 0;
        const timeDisplay = formatMinutesSeconds(durationSeconds);
        
        // 计算本周次数
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 今天零点
        const weekAgo = today.getTime() - 7 * 24 * 60 * 60 * 1000; // 7 天前的零点
        
        console.log('📊 完成弹窗 - 当前时间:', now.toISOString());
        console.log('📊 完成弹窗 - 7 天前:', new Date(weekAgo).toISOString());
        
        // 修复：正确处理 startTime 字段
        const recordsThisWeek = records.filter(r => {
            const startTime = r.startTime || r.start_time;
            if (!startTime) return false;
            const recordTime = typeof startTime === 'string' ? new Date(startTime.replace(/-/g, '/')).getTime() : new Date(startTime).getTime();
            const isInWeek = recordTime >= weekAgo;
            console.log('📊 完成弹窗 - 检查记录时间:', new Date(recordTime).toISOString(), '是否在本周:', isInWeek);
            return isInWeek;
        }).length;
        
        console.log('📊 完成弹窗统计 - 本周次数:', recordsThisWeek);
        
        // 更新统计数据 - 显示"几分几秒"
        document.getElementById('complete-duration').textContent = timeDisplay;
        document.getElementById('complete-week').textContent = recordsThisWeek;
        
        // 生成鼓励语并提取第一条消息
        const encouragement = generateEncouragement(durationSeconds, records);
        const mainMessage = encouragement[0]; // 获取第一条消息
        const messageText = mainMessage ? `${mainMessage.emoji} ${mainMessage.text}` : '记录完成！';
        document.getElementById('complete-message').textContent = messageText;
        
        // 在头部显示随机鼓励话术
        showHeaderEncouragement(encouragement);
        
        // 检查是否是二人世界模式
        const isCoupleMode = record.participationTypes && record.participationTypes.includes('together');
        
        console.log('💑 检查二人世界模式:', isCoupleMode, 'participationTypes:', record.participationTypes);
        
        if (isCoupleMode) {
            console.log('💑 启用二人世界动画效果');
            // 添加二人世界动画效果
            modal.classList.add('couple-mode');
            addCoupleEffects(modal);
        } else {
            console.log('💑 非二人世界模式，移除动画效果');
            modal.classList.remove('couple-mode');
            // 移除之前的动画效果
            const existingEffects = modal.querySelectorAll('.couple-heart, .couple-star');
            existingEffects.forEach(el => el.remove());
        }
        
        // 生成情绪网格
        renderCompleteEmotionGrid();
        
        // 默认选择第一个情绪
        selectedCompleteEmotion = CONFIG.EMOTIONS[0];
        updateCompleteEmotionDisplay();
        
        // 苹果风格动画打开
        modal.style.opacity = '0';
        modal.classList.add('active');
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                modal.style.opacity = '1';
            });
        });
    }
    
    /**
     * 在头部显示随机鼓励话术
     */
    function showHeaderEncouragement(encouragementMessages) {
        const header = document.querySelector('.complete-header');
        const existingBox = header.querySelector('.complete-encouragement-box');
        if (existingBox) {
            existingBox.remove();
        }
        
        // 从第 2 条消息开始随机选择（第 1 条已经显示在 subtitle）
        const extraMessages = encouragementMessages.slice(1);
        
        if (extraMessages.length === 0) {
            return;
        }
        
        // 随机选择一条消息
        const randomIndex = Math.floor(Math.random() * extraMessages.length);
        const message = extraMessages[randomIndex];
        
        const box = document.createElement('div');
        box.className = 'complete-encouragement-box';
        box.innerHTML = `
            <span class="complete-encouragement-emoji">${message.emoji}</span>
            <div class="complete-encouragement-message">${message.text}</div>
        `;
        
        header.appendChild(box);
    }
    
    /**
     * 渲染情绪网格
     */
    function renderCompleteEmotionGrid() {
        const grid = document.getElementById('complete-emotion-grid');
        grid.innerHTML = CONFIG.EMOTIONS.map((emotion, index) => `
            <div class="complete-emotion-item ${index === 0 ? 'active' : ''}" 
                 data-emotion="${emotion.id}" 
                 onclick="selectCompleteEmotion('${emotion.id}')">
                <div class="complete-emotion-item-emoji">${emotion.emoji}</div>
                <div class="complete-emotion-item-label">${emotion.label}</div>
            </div>
        `).join('');
    }
    
    /**
     * 选择情绪
     */
    window.selectCompleteEmotion = function(emotionId) {
        selectedCompleteEmotion = CONFIG.EMOTIONS.find(e => e.id === emotionId);
        
        // 更新选中状态
        const items = document.querySelectorAll('.complete-emotion-item');
        items.forEach(item => {
            if (item.dataset.emotion === emotionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        updateCompleteEmotionDisplay();
    };
    
    /**
     * 更新情绪显示
     */
    function updateCompleteEmotionDisplay() {
        const emoji = document.querySelector('.complete-emotion-emoji');
        const text = document.querySelector('.complete-emotion-text');
        
        emoji.textContent = selectedCompleteEmotion.emoji;
        text.textContent = selectedCompleteEmotion.label;
    }
    
    /**
     * 确认完成情绪
     */
    window.confirmCompleteEmotion = function() {
        console.log('✅ 确认完成情绪');
        console.log('🔍 records 数量:', records.length);
        console.log('🔍 selectedCompleteEmotion:', selectedCompleteEmotion);
        
        if (records && records.length > 0 && selectedCompleteEmotion) {
            // 修复：使用最新记录（数组最后一个），而不是 records[0]
            const latestRecord = records[records.length - 1];
            console.log('🔍 最新记录 ID:', latestRecord.id);
            
            latestRecord.emotion = selectedCompleteEmotion;
            console.log('💾 保存情绪到最新记录:', latestRecord.emotion);
            saveData();
            console.log('✅ 情绪已保存');
            
            // 刷新历史记录列表以显示情绪
            renderRecordList();
        }
        closeCompleteModal();
        showToast('记录已保存', 'success');
    };
    
    /**
     * 跳过情绪选择
     */
    window.skipEmotion = function() {
        closeCompleteModal();
        showToast('已跳过', 'success');
    };
    
    /**
     * 设置每周目标（全局暴露）
     */
    window.setWeeklyGoal = function() {
        app.setWeeklyGoal();
    };
    
    /**
     * 切换显示统计信息
     */
    window.toggleShowStats = function() {
        const showStats = document.getElementById('show-stats-toggle').checked;
        localStorage.setItem('whitecycle_show_stats', showStats);
        showToast(`已${showStats ? '开启' : '关闭'}统计信息显示`, 'success');
    };
    
    /**
     * 切换二人世界提醒
     */
    window.toggleCoupleReminder = function() {
        const showCouple = document.getElementById('couple-reminder-toggle').checked;
        localStorage.setItem('whitecycle_couple_reminder', showCouple);
        showToast(`已${showCouple ? '开启' : '关闭'}二人世界提醒`, 'success');
    };
    
    /**
     * 关闭完成弹窗
     */
    function closeCompleteModal() {
        const modal = document.getElementById('complete-modal');
        modal.classList.remove('active');
    }
    
    // 暴露公共 API
    return {
        init,
        switchPage,
        switchToRecord,
        toggleTheme,
        selectIdentity,
        showIdentitySelector,
        closeIdentityModal,
        showProfile,
        toggleParticipation,
        startRecording,
        stopRecording,
        openDetail,
        closeDetail,
        deleteRecord,
        changeMonth,
        exportData,
        importData,
        handleFileImport,
        showClearDataDialog,
        // 密码保护
        showPasswordSettings,
        closePasswordSettingsModal,
        showPasswordEnabledView,
        showChangePasswordForm,
        showSecurityQuestionForm,
        setSecurityQuestion,
        enablePassword,
        disablePassword,
        changePassword,
        checkAuthentication,
        showLoginModal,
        login,
        lockWebsite,
        unlockWebsite,
        showLockModal,
        showForgotPasswordHint,
        clearDataAndContinue,
        logout,
        showStatDetail,
        renderRecordList,
        updateStats,
        updateAchievements,
        updateSuggestions,
        renderCalendar,
        // 新功能
        generateWeeklyReport,
        openGoalModal,
        closeGoalModal,
        adjustGoal,
        updateGoalFromRange,
        saveGoal,
        setWeeklyGoal,
        // 情绪相关
        showEmotionModal,
        closeEmotionModal,
        confirmEmotion,
        editRecordEmotion,
        // 完成弹窗相关
        showCompleteModal,
        closeCompleteModal,
        skipEmotion,
        confirmCompleteEmotion,
        // 导出配置
        CONFIG
    };
    
})();

// 启动应用
document.addEventListener('DOMContentLoaded', app.init);
