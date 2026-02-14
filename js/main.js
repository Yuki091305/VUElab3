Vue.component('task-card', {
    props: ['title', 'description', 'deadline', 'createdAt', 'canMoveForward', 'canMoveBack', 'column'],
    template: `
        <div class="card" :class="{ overdue: isOverdue }">
            <h3>{{ title }}</h3>
            <p class="description">{{ description }}</p>
            <div class="card-meta">
                <div class="meta-item">
                    <span>Создано:</span>
                    <span>{{ formattedDate(createdAt) }}</span>
                </div>
                <div class="meta-item">
                    <span>Дедлайн:</span>
                    <span :class="{ 'overdue-text': isOverdue }">{{ formattedDate(deadline) }}</span>
                </div>
            </div>
            <div class="card-actions">
                <button 
                    v-if="canMoveBack" 
                    @click="$emit('move-back')"
                    class="btn-back">
                    Назад
                </button>
                <button 
                    v-if="canMoveForward" 
                    @click="$emit('move-forward')"
                    class="btn-forward">
                    Вперёд
                </button>
            </div>
        </div>
    `,
    computed: {
        isOverdue() {
            if (!this.deadline) return false;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return new Date(this.deadline) < today;
        }
    },
    methods: {
        formattedDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }
    }
});

let app = new Vue({
    el: '#app',
    data: {
        newTask: {
            title: '',
            description: '',
            deadline: ''
        },
        columns: {
            planned: [],
            inProgress: [],
            testing: [],
            completed: []
        }
    },
    methods: {
        addNewTask() {
            if (this.isInvalidTask || this.isPlannedColumnLocked) return;
            
            this.columns.planned.push({
                id: Date.now(),
                title: this.newTask.title,
                description: this.newTask.description,
                deadline: this.newTask.deadline,
                createdAt: new Date().toISOString()
            });
            
            this.resetNewTask();
        },
        resetNewTask() {
            this.newTask = {
                title: '',
                description: '',
                deadline: ''
            };
        },
        findTask(id) {
            return [
                ...this.columns.planned,
                ...this.columns.inProgress,
                ...this.columns.testing,
                ...this.columns.completed
            ].find(task => task.id === task.id);
        },
        moveTaskForward(taskId) {
            const task = this.findTask(taskId);
            if (!task) return;
            
            if (this.isInPlanned(task)) {
                if (this.isPlannedColumnLocked) return;
                this.moveTask(task, 'planned', 'inProgress');
            } else if (this.isInInProgress(task)) {
                this.moveTask(task, 'inProgress', 'testing');
            } else if (this.isInTesting(task)) {
                this.moveTask(task, 'testing', 'completed');
            }
        },
        moveTaskBack(taskId) {
            const task = this.findTask(taskId);
            if (!task) return;
            
            if (this.isInInProgress(task)) {
                this.moveTask(task, 'inProgress', 'planned');
            } else if (this.isInTesting(task)) {
                this.moveTask(task, 'testing', 'inProgress');
            } else if (this.isInCompleted(task)) {
                this.moveTask(task, 'completed', 'testing');
            }
        },
        moveTask(task, from, to) {
            this.columns[from] = this.columns[from].filter(t => t.id !== task.id);
            this.columns[to].push(task);
        },
        isInPlanned(task) {
            return this.columns.planned.some(t => t.id === task.id);
        },
        isInInProgress(task) {
            return this.columns.inProgress.some(t => t.id === task.id);
        },
        isInTesting(task) {
            return this.columns.testing.some(t => t.id === task.id);
        },
        isInCompleted(task) {
            return this.columns.completed.some(t => t.id === task.id);
        }
    },
    computed: {
        isInvalidTask() {
            return !this.newTask.title || 
                   !this.newTask.description || 
                   !this.newTask.deadline;
        },
        isPlannedColumnLocked() {
            
            return this.columns.inProgress.length >= 5;
        }
    }
});