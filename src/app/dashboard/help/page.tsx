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
      q: "How do I deposit a check using my mobile device?",
      a: "Navigate to 'Fund Account' and select 'Mobile Check Deposit'. You will need to capture clear, well-lit photos of both the front and back of your check. Once submitted, the deposit will appear as 'Pending' in your transactions while our team verifies the details."
    },
    {
      q: "What is the difference between Main Balance and Available Balance?",
      a: "Your 'Main Balance' includes all funds in your account, including pending deposits that are still under review. Your 'Available Balance' represents the funds currently cleared and ready for immediate withdrawal or transfer."
    },
    {
      q: "How long does it take for a check deposit to clear?",
      a: "Most mobile check deposits are reviewed and cleared within 1-2 business days. You will see your Available Balance update automatically once the verification process is complete."
    },
    {
      q: "How do I request a Swift Trust physical card?",
      a: "Go to the 'Cards' section in your dashboard and click 'Request New Card'. Follow the 5-step process to select your card type, provide delivery details, and complete the one-time $200 activation fee payment."
    },
    {
      q: "What payment methods are accepted for card activation?",
      a: "We currently accept Bitcoin (BTC), Ethereum (ETH), Tether (USDT), and PayPal. You can find the specific deposit addresses and instructions during the card request process."
    },
    {
      q: "Why is my card request still pending?",
      a: "Card requests remain pending until the activation fee payment is verified. Once you provide proof of payment (transaction hash or reference), our team typically verifies and approves the request within 1-2 hours."
    },
    {
      q: "How can I fund my account via cryptocurrency?",
      a: "Select 'Fund Account' from your dashboard. Under the 'Crypto & Digital Deposits' section, you will find your unique deposit addresses for BTC, ETH, and USDT. Funds are credited after 3 network confirmations."
    },
    {
      q: "What should I do if my account is restricted?",
      a: "If you see a restriction notice, please check the 'Restriction Message' provided on your dashboard. This usually occurs during routine security audits or if further documentation is required. You can contact our support team via email for expedited resolution."
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
