'use client';

import React from 'react';
import styles from './LoadingScreen.module.css';

export default function LoadingScreen() {
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.spinner}></div>
        <div className={styles.logo}>Swift Trust</div>
        <div className={styles.bar}>
          <div className={styles.progress}></div>
        </div>
      </div>
    </div>
  );
}
