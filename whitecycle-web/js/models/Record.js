/**
 * 记录模型
 */
class Record {
    constructor(data) {
        this.id = data.id || Date.now();
        this.startTime = data.startTime || Date.now();
        this.endTime = data.endTime || null;
        this.actualDuration = data.actualDuration || 0;
        this.tool = data.tool || null;
        this.participations = data.participations || [];
        this.participationTypes = data.participationTypes || [];
        this.teacherData = data.teacherData || null;
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();
    }
    
    getDuration() {
        return this.actualDuration;
    }
    
    getDurationMinutes() {
        return Math.floor(this.actualDuration / 60);
    }
    
    hasTeacherNotes() {
        return this.teacherData && this.teacherData.notes && this.teacherData.notes.trim().length > 0;
    }
}
