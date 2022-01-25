import { useMst } from '@models/root-store';
import { observer } from 'mobx-react-lite';
import cn from 'classnames';
import { Button } from '@components/button';

const TodoList: React.FC<{}> = observer(() => {
  const { todoStore } = useMst();
  const removeTodo = (todo: any) => {
    return () => {
      todoStore.removeTodo(todo.id);
    };
  };
  const completeTodo = (todo: any) => {
    return () => {
      todoStore.completeTodo(todo.id);
    };
  };
  return (
    <>
      {
        todoStore.allTodos.map(todo => (
          <p
            key={todo.id}
            className={cn({ 'strike': todo.completed })}
          >
            {todo.completed && (
              <del>{todo.title}</del>
            )}
            {!todo.completed && (
              <span>{todo.title}</span>
            )}
            <Button onClick={removeTodo(todo)}>
              Remove
            </Button>
            {!todo.completed && (
              <Button onClick={completeTodo(todo)}>
                Mark as done
              </Button>
            )}
          </p>
        ))
      }
    </>
  );
});

export { TodoList };
