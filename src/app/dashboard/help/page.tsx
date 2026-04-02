'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { FiHelpCircle, FiMessageCircle, FiPhone, FiMail, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useState } from 'react';
import styles from './help.module.css';

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How do I deposit a check?",
      a: "Go to 'Move Money' and select 'Mobile Check Deposit'. Follow the prompts to take clear photos of the front and back of your endorsed check."
    },
    {
      q: "When will my funds be available?",
      a: "Standard transfers and check deposits typically take 1-3 business days. Premium members may enjoy instant availability on select transactions."
    },
    {
      q: "How do I dispute a transaction?",
      a: "Select the transaction from your 'Transaction History' and click the 'Dispute Transaction' button at the bottom of the details view."
    },
    {
      q: "Is my account secure?",
      a: "Yes, Swift Trust uses military-grade encryption and multi-factor authentication to ensure your assets and data are always protected."
    }
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2>Help & Support</h2>
            <p>How can we assist you today?</p>
          </div>

          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <FiPhone size={24} />
              <h4>Call Us</h4>
              <p>24/7 Premium Support</p>
              <strong>1-800-SWIFT-TRUST</strong>
            </div>
            <div className={styles.contactCard}>
              <FiMail size={24} />
              <h4>Email Us</h4>
              <p>Response within 2 hours</p>
              <strong>premium@swifttrust.com</strong>
            </div>
            <div className={styles.contactCard}>
              <FiMessageCircle size={24} />
              <h4>Live Chat</h4>
              <p>Chat with an advisor</p>
              <button className={styles.chatBtn}>Start Chat</button>
            </div>
          </div>

          <div className={styles.faqSection}>
            <h3>Frequently Asked Questions</h3>
            <div className={styles.faqList}>
              {faqs.map((faq, index) => (
                <div key={index} className={styles.faqItem}>
                  <button 
                    className={styles.faqQuestion}
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span>{faq.q}</span>
                    {openFaq === index ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  {openFaq === index && (
                    <div className={styles.faqAnswer}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
