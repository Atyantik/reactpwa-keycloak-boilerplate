import { useMst } from '@models/root-store';
import { NotFoundError } from '@pawjs/pawjs';
import { observer } from 'mobx-react-lite';
import { ErrorPage401 } from './error-401';
import { ErrorPage403 } from './error-403';
import { ErrorPage404 } from './error-404';
import { ErrorPage500 } from './error-500';

const ErrorPage: React.FC<any> = observer((props) => {
  const { error } = props;
  const { fetcher } = useMst();
  const errorCode = parseInt(props?.error?.status || props?.error?.statusCode || props?.error?.code || 500, 10);
  const maybeHad401Error = Object.values(fetcher.retry401).includes(-1);
  if (maybeHad401Error || errorCode === 401) {
    return (
      <ErrorPage401 {...props} />
    );
  }
  if (errorCode === 403) {
    return (
      <ErrorPage403 {...props} />
    );
  }
  if (error instanceof NotFoundError || errorCode === 404) {
    return <ErrorPage404 {...props} />;
  }
  return <ErrorPage500 {...props} />;
});

export default ErrorPage;
