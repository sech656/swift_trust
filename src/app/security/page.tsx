'use client';

import React from 'react';
import PublicLayout from '@/components/PublicLayout';
import { FiShield, FiLock, FiSmartphone, FiAlertCircle } from 'react-icons/fi';
import styles from '../info-pages.module.css';

export default function SecurityPage() {
  return (
    <PublicLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Security</h1>
          <p>Protecting your financial assets is our top priority.</p>
        </div>

        <section className={styles.section}>
          <h2>How We Protect You</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <h3><FiLock /> Encryption</h3>
              <p>We use 256-bit AES encryption to protect your personal and financial data at all times, both in transit and at rest.</p>
            </div>
            <div className={styles.card}>
              <h3><FiSmartphone /> Biometrics</h3>
              <p>Our mobile app supports FaceID and fingerprint recognition for secure, seamless access to your accounts.</p>
            </div>
            <div className={styles.card}>
              <h3><FiShield /> FDIC-Insured</h3>
              <p>Your deposits are federally insured up to $250,000 per depositor, per account ownership category.</p>
            </div>
            <div className={styles.card}>
              <h3><FiAlertCircle /> Fraud Detection</h3>
              <p>Our AI-powered fraud detection system monitors your accounts 24/7 for suspicious activity and sends you real-time alerts.</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Reporting Security Issues</h2>
          <p>If you notice any unauthorized activity on your account or encounter a potential security vulnerability, please report it immediately to our security team at security@swifttrust.com.</p>
        </section>
      </div>
    </PublicLayout>
  );
}
