import React from 'react';
import { Button } from '@components/button';
import styles from '../404-error/styles.scss';
import { login } from '@utils/auth';

export const ErrorPage401: React.FC<any> = () => {
  return (
    <section className={styles['error-page-section']}>
      <div className={styles['error-page-wrapper']}>
        <h2 className="text-white mb-0">401</h2>
        <h5 className="h2-font-2 text-white mb-0">Authentication Required</h5>
        <p className="text-white-6 sub-title mb-40">
          Authentication is required to view content of this page.
        </p>
        <Button
          className="btn-block btn-inverse"
          onClick={login}
        >
          Login
        </Button>
      </div>
    </section>
  );
};
