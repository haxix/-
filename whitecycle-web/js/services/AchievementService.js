/**
 * 成就服务
 */
const AchievementService = {
    getAchievements() {
        return [
            { id: 'first', name: '第一次记录', desc: '完成你的第一次记录', icon: '🎯' },
            { id: 'five', name: '五次记录', desc: '完成 5 次记录', icon: '🌟' },
            { id: 'ten', name: '十次记录', desc: '完成 10 次记录', icon: '⭐' },
            { id: 'monthly', name: '月度达人', desc: '单月记录超过 10 次', icon: '🏆' },
            { id: 'weekly', name: '周冠军', desc: '单周记录超过 5 次', icon: '🥇' },
            { id: 'diverse', name: '多样化', desc: '尝试 3 种不同的参与方式', icon: '🎨' }
        ];
    },
    
    checkUnlockConditions(records) {
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
        
        return this.getAchievements().map(achievement => {
            let unlocked = false;
            
            switch(achievement.id) {
                case 'first': unlocked = records.length >= 1; break;
                case 'five': unlocked = records.length >= 5; break;
                case 'ten': unlocked = records.length >= 10; break;
                case 'monthly': unlocked = records.filter(r => r.startTime >= monthAgo).length >= 10; break;
                case 'weekly': unlocked = records.filter(r => r.startTime >= weekAgo).length >= 5; break;
                case 'diverse': 
                    const types = new Set(records.flatMap(r => r.participationTypes || ['solo']));
                    unlocked = types.size >= 3;
                    break;
            }
            
            return { ...achievement, unlocked };
        });
    }
};
