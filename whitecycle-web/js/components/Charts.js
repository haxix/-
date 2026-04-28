/**
 * 图表组件
 */
const ChartComponent = {
    renderBarChart(elementId, data, options = {}) {
        const container = document.getElementById(elementId);
        if (!container) return;
        
        const maxValue = Math.max(...data.map(d => d.value), 1);
        const height = options.height || 200;
        
        let html = '<div class="chart">';
        
        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 40);
            html += `
                <div class="chart-bar-wrapper">
                    <div class="chart-bar" style="height: ${barHeight}px;"></div>
                    <div class="chart-bar-label">${item.label}</div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
};
