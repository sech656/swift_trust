'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { FiCamera, FiDollarSign, FiExternalLink, FiDownloadCloud, FiShield } from 'react-icons/fi';
import { SiBitcoin, SiEthereum, SiTether, SiPaypal } from 'react-icons/si';
import styles from './move-money.module.css';

export default function MoveMoneyPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<any>(null);

  useEffect(() => {
    if (token) {
      fetchPaymentMethods();
    }
  }, [token]);

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch('/api/cards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPaymentMethods(data.paymentMethods);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Wallet address copied to clipboard!');
  };

  const options = [
    {
      title: 'Mobile Check Deposit',
      description: 'Deposit checks using your camera',
      icon: FiCamera,
      onClick: () => router.push('/dashboard/check-deposit'),
    },
    {
      title: 'Direct Deposit Setup',
      description: 'Get paid up to 2 days early',
      icon: FiDownloadCloud,
      onClick: () => alert('Direct Deposit setup coming soon!'),
    },
    {
      title: 'External Bank Transfer',
      description: 'Move money from another bank',
      icon: FiExternalLink,
      onClick: () => router.push('/dashboard/transfer?type=external'),
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2>Fund Your Account</h2>
            <p>Choose your preferred method to add funds</p>
          </div>

          <div className={styles.optionsGrid}>
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.title}
                  className={styles.optionCard}
                  onClick={option.onClick}
                >
                  <div className={styles.iconWrapper}>
                    <Icon size={32} />
                  </div>
                  <h3>{option.title}</h3>
                  <p>{option.description}</p>
                </button>
              );
            })}
          </div>

          <div className={styles.cryptoSection}>
            <h2>Crypto & Digital Deposits</h2>
            <p className="text-gray-500 mb-6">Deposit funds instantly via your personal crypto wallets.</p>
            
            <div className={styles.cryptoGrid}>
              {paymentMethods?.btc && (
                <div className={styles.cryptoCard}>
                  <div className={styles.cryptoHeader}>
                    <SiBitcoin color="#F7931A" size={32} />
                    <h3>Bitcoin (BTC)</h3>
                  </div>
                  <div className={styles.walletInfo}>
                    <span className={styles.walletLabel}>Your BTC Deposit Address</span>
                    <div className={styles.walletAddress}>{paymentMethods.btc}</div>
                  </div>
                  <button className={styles.copyBtn} onClick={() => copyToClipboard(paymentMethods.btc)}>
                    Copy BTC Address
                  </button>
                </div>
              )}

              {paymentMethods?.eth && (
                <div className={styles.cryptoCard}>
                  <div className={styles.cryptoHeader}>
                    <SiEthereum color="#627EEA" size={32} />
                    <h3>Ethereum (ETH)</h3>
                  </div>
                  <div className={styles.walletInfo}>
                    <span className={styles.walletLabel}>Your ETH Deposit Address</span>
                    <div className={styles.walletAddress}>{paymentMethods.eth}</div>
                  </div>
                  <button className={styles.copyBtn} onClick={() => copyToClipboard(paymentMethods.eth)}>
                    Copy ETH Address
                  </button>
                </div>
              )}

              {paymentMethods?.usdt && (
                <div className={styles.cryptoCard}>
                  <div className={styles.cryptoHeader}>
                    <SiTether color="#26A17B" size={32} />
                    <h3>Tether (USDT)</h3>
                  </div>
                  <div className={styles.walletInfo}>
                    <span className={styles.walletLabel}>Your USDT Deposit Address</span>
                    <div className={styles.walletAddress}>{paymentMethods.usdt}</div>
                  </div>
                  <button className={styles.copyBtn} onClick={() => copyToClipboard(paymentMethods.usdt)}>
                    Copy USDT Address
                  </button>
                </div>
              )}

              {paymentMethods?.paypal && (
                <div className={styles.cryptoCard}>
                  <div className={styles.cryptoHeader}>
                    <SiPaypal color="#003087" size={32} />
                    <h3>PayPal</h3>
                  </div>
                  <div className={styles.walletInfo}>
                    <span className={styles.walletLabel}>PayPal Email for Funding</span>
                    <div className={styles.walletAddress}>{paymentMethods.paypal}</div>
                  </div>
                  <button className={styles.copyBtn} onClick={() => copyToClipboard(paymentMethods.paypal)}>
                    Copy PayPal Email
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 flex items-start gap-4">
              <FiShield className="text-blue-600 dark:text-blue-400 mt-1" size={24} />
              <div>
                <h4 className="font-bold text-blue-900 dark:text-white">Secure Deposits</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Funds deposited via crypto are credited after 3 network confirmations. 
                  Always verify the address before sending.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
