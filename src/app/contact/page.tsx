'use client';

import React from 'react';
import PublicLayout from '@/components/PublicLayout';
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import styles from '../info-pages.module.css';

export default function ContactUsPage() {
  return (
    <PublicLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Contact Us</h1>
          <p>We're here to help you 24/7.</p>
        </div>

        <section className={styles.section}>
          <h2>Get in Touch</h2>
          <div className={styles.contactGrid}>
            <div className={styles.contactItem}>
              <FiPhone />
              <h4>Phone</h4>
              <p>1-800-SWIFT-TRUST</p>
            </div>
            <div className={styles.contactItem}>
              <FiMail />
              <h4>Email</h4>
              <p>support@swifttrust.com</p>
            </div>
            <div className={styles.contactItem}>
              <FiMapPin />
              <h4>Headquarters</h4>
              <p>527 Madison Ave #4, New York, NY 10022</p>
            </div>
            <div className={styles.contactItem}>
              <FiClock />
              <h4>Business Hours</h4>
              <p>Mon-Fri: 9AM - 6PM EST</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Customer Support</h2>
          <p>Our dedicated support team is available around the clock to assist you with any inquiries or issues you may encounter. Whether you have questions about account opening, transaction details, or security measures, we're just a message or call away.</p>
        </section>
      </div>
    </PublicLayout>
  );
}
