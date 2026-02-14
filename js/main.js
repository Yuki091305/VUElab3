Vue.component('task-card', {
    props: ['title', 'description', 'deadline', 'createdAt'],
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
        </div>
    `,
    methods: {
        formattedDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }
    },
    computed: {
        isOverdue() {
            if (!this.deadline) return false;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return new Date(this.deadline) < today;
        }
    },
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
            if (this.isInvalidTask) return;
            
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
        }
    },
    computed: {
        isInvalidTask() {
            return !this.newTask.title || 
                   !this.newTask.description || 
                   !this.newTask.deadline;
        }
    }
});