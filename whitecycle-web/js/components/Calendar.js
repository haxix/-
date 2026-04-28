/**
 * 日历组件
 */
const CalendarComponent = {
    render(elementId, year, month, records = []) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        
        let html = '';
        const days = ['日', '一', '二', '三', '四', '五', '六'];
        
        days.forEach(day => {
            html += `<div class="calendar-day-header">${day}</div>`;
        });
        
        for (let i = startingDay; i > 0; i--) {
            html += `<div class="calendar-day prev-month"></div>`;
        }
        
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const hasRecord = records.some(r => {
                const rDate = new Date(r.startTime);
                return rDate.getDate() === day;
            });
            
            html += `<div class="calendar-day ${hasRecord ? 'has-record' : ''}">${day}</div>`;
        }
        
        document.getElementById(elementId).innerHTML = html;
    }
};
