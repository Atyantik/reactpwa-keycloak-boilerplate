import cn from 'classnames';
import Link from '@components/link';
import { getExtraClasses } from '@utils/common';

import styles from './styles.scss';

type ButtonClickEventType = React.MouseEvent<HTMLAnchorElement, MouseEvent> | React.MouseEvent<HTMLButtonElement, MouseEvent>;
type ButtonProps = {
  onClick?: (e: ButtonClickEventType) => any,
  className?: string,
  element?: 'a' | 'button',
  href?: string,
  type?: 'button' | 'submit' | 'reset',
  disabled?: boolean,
  btnId?:  string,
  targetSelf?: boolean,
};

const Button: React.FC<ButtonProps> = (props) => {
  const {
    children,
    onClick,
    className,
    element,
    href,
    type = 'button',
    disabled = false,
    btnId = '',
    targetSelf = true,
  } = props;
  const extraClasses = getExtraClasses(styles, className);

  const handleOnClick = (e: ButtonClickEventType) => {
    if (typeof onClick === 'function') {
      return onClick(e);
    }
  };

  if (element === 'a') {
    return (
      <Link
        className={cn(styles.btn, extraClasses)}
        type={type}
        to={href ?? ''}
        onClick={handleOnClick}
        target={!targetSelf ? '_blank' : '_self'}
      >
        {children}
      </Link>
    );
  }
  const btnProps: any = {
    disabled,
    type,
    onClick,
    className: cn(styles.btn, extraClasses),
  };
  if (btnId) {
    btnProps.id = btnId;
  }

  return (
    <button
      disabled={disabled}
      type={type}
      onClick={handleOnClick}
      className={cn(styles.btn, extraClasses)}
      id={btnId}
    >
      {children}
    </button>
  );
};

export { Button };
