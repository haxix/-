/**
 * 数据服务
 */
const DataService = {
    getAllRecords() {
        const data = localStorage.getItem('whitecycle_records_v6');
        return data ? JSON.parse(data) : [];
    },
    
    getRecordById(id) {
        const records = this.getAllRecords();
        return records.find(r => r.id === id);
    },
    
    addRecord(record) {
        const records = this.getAllRecords();
        records.unshift(record);
        localStorage.setItem('whitecycle_records_v6', JSON.stringify(records));
    },
    
    deleteRecord(id) {
        const records = this.getAllRecords();
        const filtered = records.filter(r => r.id !== id);
        localStorage.setItem('whitecycle_records_v6', JSON.stringify(filtered));
    },
    
    getRecordsByDateRange(start, end) {
        const records = this.getAllRecords();
        return records.filter(r => r.startTime >= start && r.startTime <= end);
    }
};
