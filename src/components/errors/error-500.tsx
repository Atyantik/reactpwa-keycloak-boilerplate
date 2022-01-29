import React from 'react';
import { Button } from '@components/button';
import styles from './styles.scss';
import { getEnv } from '@utils/env';
import { HttpStatus } from '@pawjs/pawjs';

const isProduction = getEnv('APP_ENV', process?.env?.APP_ENV || 'development') === 'production'
|| getEnv('NODE_ENV', process?.env?.NODE_ENV || 'development') === 'production';

export const ErrorPage500: React.FC<any> = (props) => {
  const displayError = !!(!isProduction && (props?.error || props?.info));
  const stack = props?.info?.componentStack ?? props?.error?.stack ?? '';
  const errorCode = props?.error?.status || props?.error?.statusCode || props?.error?.code || 500;
  return (
    <HttpStatus statusCode={errorCode}>
      <section className={styles['error-page-section']}>
        <div className={styles['error-page-wrapper']}>
          <h2 className="text-white mb-0">An error occurred...</h2>
          {displayError && (
            <div>
              {!!props?.error?.message && (
                <h2>{props?.error?.message ?? ''}</h2>
              )}
              {!!stack && (
                <code>
                  <pre className={styles.errorStack}>
                    {stack}
                  </pre>
                </code>
              )}
            </div>
          )}
          <Button
            element="a"
            href="/"
            className="btn-block btn-inverse"
          >
            Back to home page
          </Button>
        </div>
      </section>
    </HttpStatus>
  );
};
