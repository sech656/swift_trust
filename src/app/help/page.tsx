'use client';

import React from 'react';
import PublicLayout from '@/components/PublicLayout';
import { FiSearch, FiMessageSquare, FiFileText, FiHelpCircle } from 'react-icons/fi';
import styles from '../info-pages.module.css';

export default function HelpCenterPage() {
  const faqs = [
    {
      question: "How do I open a checking account?",
      answer: "You can open a checking account in minutes by clicking 'Open Account' on our homepage and following the simple registration process."
    },
    {
      question: "What is your interest rate for savings?",
      answer: "Our current annual percentage yield (APY) for savings accounts is 4.5%, which is well above the national average."
    },
    {
      question: "Are my funds insured?",
      answer: "Yes, Swift Trust is FDIC-insured up to $250,000 per depositor, per ownership category."
    },
    {
      question: "How do I report a lost card?",
      answer: "You can lock your card immediately in the app settings, or call our 24/7 support line at 1-800-SWIFT-TRUST."
    }
  ];

  return (
    <PublicLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Help Center</h1>
          <p>Find answers and get the support you need.</p>
        </div>

        <section className={styles.section}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.grid}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.card}>
                <h3><FiHelpCircle /> {faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Support Categories</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <h3><FiMessageSquare /> Chat Support</h3>
              <p>Connect with our support team in real-time through the app or website.</p>
            </div>
            <div className={styles.card}>
              <h3><FiFileText /> Documentation</h3>
              <p>Explore our detailed guides and tutorials on how to use Swift Trust.</p>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
