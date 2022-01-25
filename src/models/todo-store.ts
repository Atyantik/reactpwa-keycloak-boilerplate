import { getParent, types } from 'mobx-state-tree';
import shortid from 'shortid';
import { Todo } from './models-defs';

const TodoStore = types
  .model('TodosStore', {
    todos: types.map(Todo),
  })
  .views(self => ({
    get rootStore(): any {
      return getParent(self);
    },
    get allTodos() {
      return Array.from(self.todos.values()).sort((t1) => t1.completed === true ? 1 : -1);
    },
  }))
  .actions(self => ({
    addTodo(title: string) {
      const todo = {
        title,
        id: shortid(),
        completed: false,
      };
      self.todos.put(todo);
    },
    completeTodo(id: string) {
      const todo = self.todos.get(id);
      if (todo) {
        todo.completed = true;
      }
    },
    removeTodo(id: string) {
      self.todos.delete(id);
    },
    getTodo(id: string) {
      return self.todos.get(id);
    },
  }));

export { TodoStore };
