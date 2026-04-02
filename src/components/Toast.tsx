'use client';

import React from 'react';
import { useUI } from '@/contexts/UIContext';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';
import styles from './Toast.module.css';

export default function ToastContainer() {
  const { toasts, hideToast } = useUI();

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          <div className={styles.icon}>
            {toast.type === 'success' && <FiCheckCircle />}
            {toast.type === 'error' && <FiAlertCircle />}
            {toast.type === 'info' && <FiInfo />}
            {toast.type === 'warning' && <FiAlertTriangle />}
          </div>
          <div className={styles.message}>{toast.message}</div>
          <button className={styles.close} onClick={() => hideToast(toast.id)}>
            <FiX />
          </button>
        </div>
      ))}
    </div>
  );
}
