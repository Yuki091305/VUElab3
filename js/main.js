Vue.component('task-card', {
    props: ['title', 'description', 'deadline', 'createdAt', 'canMoveForward', 'canMoveBack', 'canEdit', 'canDelete', 'column'],
    template: `
        <div class="card" :class="{ overdue: isOverdue, editing: isEditing }">
            <div v-if="isEditing" class="edit-mode">
                <div class="form-group">
                    <input v-model="editedTitle" placeholder="Название задачи" required>
                </div>
                <div class="form-group">
                    <textarea v-model="editedDescription" placeholder="Описание"></textarea>
                </div>
                <div class="form-group">
                    <input v-model="editedDeadline" type="date" required>
                </div>
                <div class="edit-actions">
                    <button @click="saveEdit" class="btn-save">Сохранить</button>
                    <button @click="cancelEdit" class="btn-cancel">Отмена</button>
                </div>
            </div>
            <div v-else>
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
                        v-if="canEdit" 
                        @click="startEdit"
                        class="btn-edit">
                        Редактировать
                    </button>
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
                    <button 
                        v-if="canDelete"
                        @click="$emit('delete-task')"
                        class="btn-delete">
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            isEditing: false,
            editedTitle: this.title,
            editedDescription: this.description,
            editedDeadline: this.deadline
        };
    },
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
        },
        startEdit() {
            this.isEditing = true;
            this.editedTitle = this.title;
            this.editedDescription = this.description;
            this.editedDeadline = this.deadline;
        },
        saveEdit() {
            this.$emit('update-task', {
                title: this.editedTitle,
                description: this.editedDescription,
                deadline: this.editedDeadline
            });
            this.isEditing = false;
        },
        cancelEdit() {
            this.isEditing = false;
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
            ].find(task => task.id === id);
        },
        updateTask(taskId, updatedData) {
            const task = this.findTask(taskId);
            if (task) {
                Object.assign(task, updatedData);
            }
        },
        deleteTask(taskId) {
            this.columns.planned = this.columns.planned.filter(t => t.id !== taskId);
            this.columns.inProgress = this.columns.inProgress.filter(t => t.id !== taskId);
            this.columns.testing = this.columns.testing.filter(t => t.id !== taskId);
            this.columns.completed = this.columns.completed.filter(t => t.id !== taskId);
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
    },
    watch: {
        columns: {
            deep: true,
            handler(newVal) {
                localStorage.setItem('taskData', JSON.stringify({
                    columns: newVal,
                    timestamp: new Date().toISOString()
                }));
            }
        }
    },
    mounted() {
        const savedData = localStorage.getItem('taskData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.columns = data.columns;
            } catch (e) {
                console.error('Ошибка при загрузке данных:', e);
            }
        }
    }
});