'use client';

import React from 'react';
import PublicLayout from '@/components/PublicLayout';
import styles from '../info-pages.module.css';

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Privacy Policy</h1>
          <p>Effective Date: April 2, 2026</p>
        </div>

        <section className={styles.section}>
          <h2>Introduction</h2>
          <p>Swift Trust Bank is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and mobile application.</p>
        </section>

        <section className={styles.section}>
          <h2>Information We Collect</h2>
          <p>We collect personal information that you provide to us, such as your name, email address, phone number, and financial details when you open an account or use our services.</p>
          <p>We also automatically collect certain information when you visit our website, including your IP address, browser type, and operating system.</p>
        </section>

        <section className={styles.section}>
          <h2>How We Use Your Information</h2>
          <p>We use your information to provide and improve our services, process transactions, communicate with you, and ensure the security of your accounts.</p>
          <p>We do not sell your personal information to third parties. We may share your information with service providers who assist us in operating our business and providing services to you.</p>
        </section>

        <section className={styles.section}>
          <h2>Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information. You can manage your privacy settings within the app or contact us for assistance.</p>
        </section>
      </div>
    </PublicLayout>
  );
}
