'use client';

import React from 'react';
import PublicLayout from '@/components/PublicLayout';
import styles from '../info-pages.module.css';

export default function TermsOfServicePage() {
  return (
    <PublicLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Terms of Service</h1>
          <p>Last Updated: April 2, 2026</p>
        </div>

        <section className={styles.section}>
          <h2>Agreement to Terms</h2>
          <p>By accessing or using the Swift Trust website or mobile application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
        </section>

        <section className={styles.section}>
          <h2>Use of Services</h2>
          <p>You must be at least 18 years old to open an account with Swift Trust. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          <p>You agree to use our services only for lawful purposes and in accordance with these Terms of Service.</p>
        </section>

        <section className={styles.section}>
          <h2>Account Security</h2>
          <p>You are responsible for safeguarding the password that you use to access the services and for any activities or actions under your password. We encourage you to use "strong" passwords with your account.</p>
        </section>

        <section className={styles.section}>
          <h2>Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, Swift Trust Bank shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.</p>
        </section>

        <section className={styles.section}>
          <h2>Changes to Terms</h2>
          <p>We reserve the right to modify these Terms of Service at any time. We will notify you of any changes by posting the new terms on our website. Your continued use of the services after such changes constitutes your acceptance of the new terms.</p>
        </section>
      </div>
    </PublicLayout>
  );
}
