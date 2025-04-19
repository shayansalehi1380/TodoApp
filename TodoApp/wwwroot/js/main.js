// app.js - Complete Todo Application

const apiBaseUrl = '/api/todo';

class TodoService {
    static async getAllTodos(status = 'all') {
        try {
            const response = await fetch(`${apiBaseUrl}?status=${status}`);
            if (!response.ok) throw new Error('Failed to fetch todos');
            const todos = await response.json();
            return todos.map(todo => ({
                id: todo.id,
                title: todo.title,
                dueDate: todo.dueDate,
                isCompleted: todo.isCompleted,
                isDelete: todo.isDelete
            }));
        } catch (error) {
            console.error('Error fetching todos:', error);
            throw error;
        }
    }

    static async addTodo(todo) {
        try {
            const response = await fetch(apiBaseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Title: todo.title,
                    DueDate: todo.dueDate ? new Date(todo.dueDate).toISOString() : null,
                    IsCompleted: todo.isCompleted
                })
            });
            if (!response.ok) throw new Error('Failed to add todo');
            return await response.json();
        } catch (error) {
            console.error('Error adding todo:', error);
            throw error;
        }
    }

    static async updateTodo(id, todo) {
        try {
            const response = await fetch(`${apiBaseUrl}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Id: parseInt(id),
                    Title: todo.title,
                    DueDate: todo.dueDate ? new Date(todo.dueDate).toISOString() : null,
                    IsCompleted: todo.isCompleted
                })
            });
            if (!response.ok) throw new Error('Failed to update todo');
            return await response.json();
        } catch (error) {
            console.error('Error updating todo:', error);
            throw error;
        }
    }

    static async deleteTodo(id) {
        try {
            const response = await fetch(`${apiBaseUrl}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete todo');
        } catch (error) {
            console.error('Error deleting todo:', error);
            throw error;
        }
    }

    static async deleteAllTodos() {
        try {
            const response = await fetch(`${apiBaseUrl}/delete-all`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete all todos');
        } catch (error) {
            console.error('Error deleting all todos:', error);
            throw error;
        }
    }

    static async toggleTodoStatus(id) {
        try {
            const response = await fetch(`${apiBaseUrl}/${id}/toggle`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) throw new Error('Failed to toggle todo status');
            return await response.json();
        } catch (error) {
            console.error('Error toggling todo status:', error);
            throw error;
        }
    }
}

class TodoUI {
    constructor() {
        this.taskInput = document.querySelector('input[type="text"]');
        this.dateInput = document.querySelector('.schedule-date');
        this.addBtn = document.querySelector('.add-task-button');
        this.todosListBody = document.querySelector('.todos-list-body');
        this.alertMessage = document.querySelector('.alert-message');
        this.deleteAllBtn = document.querySelector('.delete-all-btn');
        this.filterDropdown = document.querySelector('.dropdown-content');

        this.setupEventListeners();
        this.loadTodos();
    }

    setupEventListeners() {
        this.addBtn.addEventListener('click', () => this.handleAddTodo());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAddTodo();
        });
        this.deleteAllBtn.addEventListener('click', () => this.handleDeleteAll());

        document.querySelectorAll('.dropdown-content li').forEach(item => {
            item.addEventListener('click', (e) => {
                const status = e.target.textContent.toLowerCase();
                this.loadTodos(status);
            });
        });
    }

    async loadTodos(status = 'all') {
        try {
            const todos = await TodoService.getAllTodos(status);
            this.renderTodos(todos);
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    renderTodos(todos) {
        this.todosListBody.innerHTML = '';

        if (todos.length === 0) {
            this.todosListBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">No tasks found</td>
                </tr>
            `;
            return;
        }

        todos.forEach(todo => {
            const row = document.createElement('tr');
            row.className = todo.isCompleted ? 'completed' : '';
            row.innerHTML = `
                <td>${this.formatTask(todo.title)}</td>
                <td>${this.formatDueDate(todo.dueDate)}</td>
                <td>${todo.isCompleted ? 'Completed' : 'Pending'}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-btn" data-id="${todo.id}">
                        <i class="bx bx-edit-alt bx-xs"></i>
                    </button>
                    <button class="btn btn-${todo.isCompleted ? 'secondary' : 'success'} btn-sm toggle-btn" data-id="${todo.id}">
                        <i class="bx bx-${todo.isCompleted ? 'x' : 'check'} bx-xs"></i>
                    </button>
                    <button class="btn btn-error btn-sm delete-btn" data-id="${todo.id}">
                        <i class="bx bx-trash bx-xs"></i>
                    </button>
                </td>
            `;

            this.todosListBody.appendChild(row);
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleEditTodo(e.target.closest('button').dataset.id));
        });

        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleToggleStatus(e.target.closest('button').dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDeleteTodo(e.target.closest('button').dataset.id));
        });
    }

    async handleAddTodo() {
        const title = this.taskInput.value.trim();
        const dueDate = this.dateInput.value;

        if (!title) {
            this.showAlert('Please enter a task', 'error');
            return;
        }

        try {
            const newTodo = {
                title: title,
                dueDate: dueDate,
                isCompleted: false
            };

            await TodoService.addTodo(newTodo);
            this.taskInput.value = '';
            this.dateInput.value = '';
            this.loadTodos();
            this.showAlert('Task added successfully', 'success');
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    async handleEditTodo(id) {
        const newTitle = prompt('Enter new task title:');
        if (newTitle && newTitle.trim()) {
            try {
                const todos = await TodoService.getAllTodos();
                const todo = todos.find(t => t.id.toString() === id);

                if (todo) {
                    const updatedTodo = {
                        ...todo,
                        title: newTitle.trim()
                    };

                    await TodoService.updateTodo(id, updatedTodo);
                    this.loadTodos();
                    this.showAlert('Task updated successfully', 'success');
                }
            } catch (error) {
                this.showAlert(error.message, 'error');
            }
        }
    }

    async handleToggleStatus(id) {
        try {
            const updatedTodo = await TodoService.toggleTodoStatus(id);
            const rows = this.todosListBody.querySelectorAll('tr');
            rows.forEach(row => {
                if (row.querySelector('.toggle-btn').dataset.id === id) {
                    row.className = updatedTodo.isCompleted ? 'completed' : '';
                    const statusCell = row.cells[2];
                    statusCell.textContent = updatedTodo.isCompleted ? 'Completed' : 'Pending';

                    const toggleBtn = row.querySelector('.toggle-btn');
                    toggleBtn.className = `btn btn-${updatedTodo.isCompleted ? 'secondary' : 'success'} btn-sm toggle-btn`;
                    toggleBtn.innerHTML = `<i class="bx bx-${updatedTodo.isCompleted ? 'x' : 'check'} bx-xs"></i>`;
                }
            });
        } catch (error) {
            this.showAlert(error.message, 'error');
        }
    }

    async handleDeleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await TodoService.deleteTodo(id);
                this.loadTodos();
                this.showAlert('Task deleted successfully', 'success');
            } catch (error) {
                this.showAlert(error.message, 'error');
            }
        }
    }

    async handleDeleteAll() {
        if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone.')) {
            try {
                await TodoService.deleteAllTodos();
                this.loadTodos();
                this.showAlert('All tasks deleted successfully', 'success');
            } catch (error) {
                this.showAlert(error.message, 'error');
            }
        }
    }

    formatTask(task) {
        if (!task) return '';
        return task.length > 14 ? task.slice(0, 14) + '...' : task;
    }

    formatDueDate(dueDate) {
        if (!dueDate) return 'No due date';
        try {
            const date = new Date(dueDate);
            return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
        } catch {
            return 'Invalid date';
        }
    }

    showAlert(message, type) {
        this.alertMessage.innerHTML = `
            <div class="alert alert-${type}">
                <div>
                    <span>${message}</span>
                </div>
            </div>
        `;
        setTimeout(() => {
            this.alertMessage.innerHTML = '';
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoUI();
});