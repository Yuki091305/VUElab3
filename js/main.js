Vue.component('task-card', {
    props: ['title', 'description', 'deadline', 'createdAt'],
    template: `
        <div class="card">
            <h3>{{ title }}</h3>
            <p class="description">{{ description }}</p>
            <div class="card-meta">
                <div class="meta-item">
                    <span>Создано:</span>
                    <span>{{ formattedDate(createdAt) }}</span>
                </div>
                <div class="meta-item">
                    <span>Дедлайн:</span>
                    <span>{{ formattedDate(deadline) }}</span>
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
    }
});

let app = new Vue({
    el: '#app',
    data: {
        columns: {
            planned: [],
            inProgress: [],
            testing: [],
            completed: []
        }
    }
});