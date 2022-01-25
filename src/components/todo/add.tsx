import { useMst } from '@models/root-store';
import { observer } from 'mobx-react-lite';

const TodoAdd: React.FC<{}> = observer(() => {
  const { todoStore } = useMst();
  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    if (target) {
      const data = new FormData(target);
      const title = data.get('title');
      if (typeof title === 'string') {
        todoStore.addTodo(title);
      }
      target.reset();
    }
  };
  return (
    <fieldset>
      <legend>Add new todo</legend>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" />
        <button type="submit">Add</button>
      </form>
    </fieldset>
  );
});

export { TodoAdd };
