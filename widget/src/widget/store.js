export const widgetStore = {
  tasks: [],
  listeners: [],

  addTask(task) {
    this.tasks.unshift(task);
    this.emit();
  },

  updateTask(id, updates) {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
      // IMPORTANT: Create a new object instead of mutating
      // This ensures React detects the change
      this.tasks[taskIndex] = {
        ...this.tasks[taskIndex],
        ...updates
      };
      this.emit();
    }
  },

  emit() {
    // IMPORTANT: Pass a new array reference each time
    this.listeners.forEach(fn => fn([...this.tasks]));
  },

  subscribe(fn) {
    this.listeners.push(fn);

    // Call immediately with current state
    fn([...this.tasks]);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(fn);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
};