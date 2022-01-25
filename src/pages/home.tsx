import { TodoList } from '@components/todo/list';
import { TodoAdd } from '@components/todo/add';

const HomePage: React.FC = () => (
  <main>
    <h3>Your ToDo List</h3>
    <TodoAdd />
    <TodoList />
  </main>
);

export default HomePage;
