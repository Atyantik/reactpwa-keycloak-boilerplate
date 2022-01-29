import React from 'react';
import { Button } from '@components/button';
import styles from '../404-error/styles.scss';

export const ErrorPage403: React.FC<any> = () => {
  return (
    <section className={styles['error-page-section']}>
      <div className={styles['error-page-wrapper']}>
        <h2 className="text-white mb-0">403</h2>
        <h5 className="h2-font-2 text-white mb-0">Access forbidden</h5>
        <p className="text-white-6 sub-title mb-40">
          You are not authorized to view the content on this page.
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
