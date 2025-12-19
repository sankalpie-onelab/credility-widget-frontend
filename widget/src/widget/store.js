// Replace current store.js with this

export function createWidgetStore() {
  return {
    tasks: [],
    listeners: [],

    addTask(task) {
      this.tasks.unshift(task);
      this.emit();
    },

    updateTask(id, updates) {
      const taskIndex = this.tasks.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = {
          ...this.tasks[taskIndex],
          ...updates
        };
        this.emit();
      }
    },

    emit() {
      this.listeners.forEach(fn => fn([...this.tasks]));
    },

    subscribe(fn) {
      this.listeners.push(fn);
      fn([...this.tasks]);
      
      return () => {
        const index = this.listeners.indexOf(fn);
        if (index > -1) {
          this.listeners.splice(index, 1);
        }
      };
    }
  };
}

// Keep a default store for backward compatibility
export const widgetStore = createWidgetStore();