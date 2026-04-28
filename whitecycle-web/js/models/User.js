/**
 * 用户模型
 */
class User {
    constructor(data) {
        this.identity = data.identity || null;
        this.createdAt = data.createdAt || Date.now();
        this.settings = data.settings || {
            reminders: false,
            theme: 'dark',
            notifications: true
        };
    }
    
    getIdentityName() {
        const identityMap = {
            'MALE': '男生',
            'FEMALE': '女生',
            'GAY': 'Gay',
            'LESBIAN': '拉拉',
            'OTHER': 'Other',
            'FRIEND': '友谊助手'
        };
        return identityMap[this.identity] || '未设置';
    }
    
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.save();
    }
    
    save() {
        localStorage.setItem('whitecycle_profile_v6', JSON.stringify(this));
    }
}
