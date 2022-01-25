import { Link as RouterLink, LinkProps } from 'react-router-dom';
import { getEnv } from '@utils/env';

const appUrl = getEnv('APP_URL', (process.env.APP_URL ?? '') || 'https://example.com');

const Link: React.FC<LinkProps> = function (props) {
  const {
    to,
    lang,
    children,
    ...others
  } = props;

  let pathname = to;
  let search = '';
  let hash = '';

  if (typeof to !== 'string') {
    pathname = to.pathname ?? '/';
    search = to.search ?? '';
    hash = to.hash ?? '';
  } else {
    if (to.startsWith('http')) {
      return (
        <a
          href={to}
          target="_blank"
          rel="nofollow noopener noreferrer"
          {...others}
        >
          {children}
        </a>
      );
    }
    const url = new URL(to, appUrl);
    pathname = url.pathname;
    search = url.search;
    hash = url.hash;
  }
  if (!pathname.endsWith('/')) {
    pathname += '/';
  }

  return (
    <RouterLink
      to={{
        pathname,
        search,
        hash,
      }}
      {...others}
    >
      {children}
    </RouterLink>
  );
};

export default Link;
