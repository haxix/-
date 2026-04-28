/**
 * 智能建议服务
 */
const SuggestionService = {
    generateSuggestions(records) {
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
        
        const weekCount = records.filter(r => r.startTime >= weekAgo).length;
        const monthCount = records.filter(r => r.startTime >= monthAgo).length;
        const avgDuration = records.length > 0 
            ? Math.floor(records.reduce((sum, r) => sum + r.actualDuration, 0) / records.length / 60) 
            : 0;
        
        const suggestions = [];
        
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
        
        return suggestions;
    }
};
