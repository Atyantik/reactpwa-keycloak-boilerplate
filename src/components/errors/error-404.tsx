import React from 'react';
import { Button } from '@components/button';
import styles from './styles.scss';

export const ErrorPage404: React.FC<any> = () => {
  return (
    <section className={styles['error-page-section']}>
      <div className={styles['error-page-wrapper']}>
        <h2 className="text-white mb-0">404</h2>
        <h5 className="h2-font-2 text-white mb-0">Page not found</h5>
        <p className="text-white-6 sub-title mb-40">
          The page you are looking for, might been removed had its name changed or it is temporarily
          unavailable
        </p>
        <Button
          element="a"
          href="/"
          className="btn-block btn-inverse"
        >
          Go to home page
        </Button>
      </div>
    </section>
  );
};
