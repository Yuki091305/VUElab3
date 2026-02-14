Vue.component('note-card', {
    props: ['title', 'items', 'checkedItems', 'completedAt'],
    template: `
        <div class="card">
            <h3>{{ title }}</h3>
            <ul>
                <li v-for="(item, index) in items" :key="index">
                    <input type="checkbox" 
                           v-model="checkedItems" 
                           :value="index"
                           @change="$emit('item-checked', index)">
                    {{ item }}
                </li>
            </ul>
            <div class="progress">
                {{ progress }}% Complete
            </div>
            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
            <div v-if="completedAt" class="completion-time">
                Completed: {{ formattedDate }}
            </div>
        </div>
    `,
    computed: {
        progress() {
            return Math.round((this.checkedItems.length / this.items.length) * 100);
        },
        formattedDate() {
            if (!this.completedAt) return '';
            return new Date(this.completedAt).toLocaleString('ru-RU', {
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
        newCard: {
            title: '',
            items: ['', '', '']
        },
        columns: {
            first: [],
            second: [],
            third: []
        },
    },
    methods: {
        addItem() {
            if (this.newCard.items.length < 5) {
                this.newCard.items.push('');
            }
        },
        removeItem(index) {
            if (this.newCard.items.length > 3) {
                this.newCard.items.splice(index, 1);
            }
        },
        addNewCard() {
            if (this.isInvalidCard || this.isAddButtonDisabled) return;
    
            this.columns.first.push({
                id: Date.now(),
                title: this.newCard.title,
                items: this.newCard.items.filter(item => item.trim() !== ''),
                checkedItems: [],
                completedAt: null 
            });
    
            this.resetNewCard();
        },
        resetNewCard() {
            this.newCard = {
                title: '',
                items: ['', '', '']
            };
        },
        handleItemChecked(cardId, index) {
            const card = this.findCard(cardId);
            if (!card.checkedItems.includes(index)) {
                card.checkedItems.push(index);
                this.checkProgress(card);
            }
        },
        findCard(id) {
        return [
            ...this.columns.first,
            ...this.columns.second,
            ...this.columns.third
        ].find(card => card.id === id);
    },
    checkProgress(card) {
       const progress = card.checkedItems.length / card.items.length;
        
        if (this.isFirstColumnLocked && this.isInFirstColumn(card)) {
            return;
        }
        
        if (this.isInFirstColumn(card) && progress > 0.5) {
            this.moveCard(card, 'first', 'second');
        } 
        else if (this.isInSecondColumn(card) && progress === 1) {
            this.moveCard(card, 'second', 'third');
        }
        },
        moveCard(card, from, to) {
        if (to === 'third') {
            card.completedAt = new Date().toISOString();
        }
        
        this.columns[from] = this.columns[from].filter(c => c.id !== card.id);
        this.columns[to].push(card);
        },
        isInFirstColumn(card) {
            return this.columns.first.some(c => c.id === card.id);
        },
        isInSecondColumn(card) {
            return this.columns.second.some(c => c.id === card.id);
        },

        
    },
    computed: {
    isInvalidCard() {
        const validItems = this.newCard.items.filter(i => i.trim() !== '');
        return !this.newCard.title || 
               validItems.length < 3 || 
               validItems.length > 5;
    },
    isAddButtonDisabled() {
        return this.columns.first.length >= 3 || this.isFirstColumnLocked;
    },
    isFirstColumnLocked() {
        const isSecondColumnFull = this.columns.second.length >= 5;
        const hasCardOver50Percent = this.columns.first.some(card => {
            const progress = card.checkedItems.length / card.items.length;
            return progress > 0.5;
        });
        return isSecondColumnFull && hasCardOver50Percent;
    },
    },
    watch: {
        columns: {
            deep: true,
            handler(newVal) {
                localStorage.setItem('noteData', JSON.stringify(newVal));
            }
        }
    },
    mounted() {
        const savedData = localStorage.getItem('noteData');
        if (savedData) {
            this.columns = JSON.parse(savedData);
        }
    }
});