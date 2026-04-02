'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { FiCheckCircle, FiAlertCircle, FiArrowLeft, FiUser, FiGlobe, FiCpu } from 'react-icons/fi';
import styles from './transfer.module.css';

type Step = 'type' | 'recipient' | 'amount' | 'review' | 'confirm' | 'success' | 'error';

export default function TransferPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user } = useAuth();
  const { showToast, setLoading: setGlobalLoading } = useUI();
  const initialType = (searchParams.get('type') as 'pay' | 'external' | 'crypto') || 'pay';

  const [step, setStep] = useState<Step>('type');
  const [transferType, setTransferType] = useState<'pay' | 'external' | 'crypto'>(initialType);
  const [formData, setFormData] = useState({
    recipientEmail: '',
    recipientPhone: '',
    recipientName: '',
    externalBankName: '',
    accountNumber: '',
    routingNumber: '',
    cryptoAddress: '',
    amount: '',
    memo: '',
    pin: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transaction, setTransaction] = useState<any>(null);

  useEffect(() => {
    if (searchParams.get('type')) {
      setStep('recipient');
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNextStep = () => {
    setError('');
    if (step === 'type') {
      setStep('recipient');
    } else if (step === 'recipient') {
      if (transferType === 'pay' && !formData.recipientEmail && !formData.recipientPhone) {
        setError('Please enter recipient email or phone');
        showToast('Recipient info required', 'warning');
        return;
      }
      if (transferType === 'external' && (!formData.externalBankName || !formData.accountNumber)) {
        setError('Please enter bank details');
        showToast('Bank details required', 'warning');
        return;
      }
      if (transferType === 'crypto' && !formData.cryptoAddress) {
        setError('Please enter crypto address');
        showToast('Wallet address required', 'warning');
        return;
      }
      setStep('amount');
    } else if (step === 'amount') {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        setError('Please enter a valid amount');
        showToast('Invalid amount', 'warning');
        return;
      }
      if (parseFloat(formData.amount) > (user?.balance || 0)) {
        setError('Insufficient funds');
        showToast('Insufficient funds', 'error');
        return;
      }
      setStep('review');
    } else if (step === 'review') {
      setStep('confirm');
    }
  };

  const handleBackStep = () => {
    if (step === 'recipient') setStep('type');
    else if (step === 'amount') setStep('recipient');
    else if (step === 'review') setStep('amount');
    else if (step === 'confirm') setStep('review');
  };

  const handleConfirm = async () => {
    if (!formData.pin) {
      setError('Please enter your PIN');
      showToast('PIN required', 'warning');
      return;
    }

    setLoading(true);
    setGlobalLoading(true);
    setError('');

    try {
      const response = await fetch('/api/transactions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: transferType === 'pay' ? 'transfer' : transferType === 'external' ? 'external_transfer' : 'crypto',
          amount: parseFloat(formData.amount),
          recipientEmail: formData.recipientEmail,
          recipientPhone: formData.recipientPhone,
          recipientName: formData.recipientName,
          externalBankName: formData.externalBankName,
          memo: formData.memo,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setTransaction(data.transaction);
        setError(data.error || 'Transfer failed');
        setStep('error');
        showToast(data.error || 'Transfer failed', 'error');
      } else {
        setTransaction(data.transaction);
        setStep('success');
        showToast('Transfer successful', 'success');
      }
    } catch (err: any) {
      setError(err.message || 'Transfer failed');
      setStep('error');
      showToast(err.message || 'Transfer failed', 'error');
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'type':
        return (
          <div className={styles.stepContainer}>
            <div className={styles.optionsGrid}>
              <button
                className={`${styles.typeOption} ${transferType === 'pay' ? styles.active : ''}`}
                onClick={() => {
                  setTransferType('pay');
                  setStep('recipient');
                }}
              >
                <FiUser size={24} />
                <span>Pay Anyone</span>
                <p>Send via email or phone</p>
              </button>
              <button
                className={`${styles.typeOption} ${transferType === 'external' ? styles.active : ''}`}
                onClick={() => {
                  setTransferType('external');
                  setStep('recipient');
                }}
              >
                <FiGlobe size={24} />
                <span>External Bank</span>
                <p>Transfer to another bank</p>
              </button>
              <button
                className={`${styles.typeOption} ${transferType === 'crypto' ? styles.active : ''}`}
                onClick={() => {
                  setTransferType('crypto');
                  setStep('recipient');
                }}
              >
                <FiCpu size={24} />
                <span>Crypto</span>
                <p>Transfer to wallet</p>
              </button>
            </div>
          </div>
        );

      case 'recipient':
        return (
          <div className={styles.stepContainer}>
            <button className={styles.backBtn} onClick={handleBackStep}><FiArrowLeft /> Back</button>
            <h3>Who are you sending to?</h3>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.form}>
              {transferType === 'pay' && (
                <>
                  <div className={styles.formGroup}>
                    <label>Recipient Name (Optional)</label>
                    <input name="recipientName" value={formData.recipientName} onChange={handleChange} placeholder="John Doe" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email or Phone</label>
                    <input name="recipientEmail" value={formData.recipientEmail} onChange={handleChange} placeholder="email@example.com or 555-0123" />
                  </div>
                </>
              )}
              {transferType === 'external' && (
                <>
                  <div className={styles.formGroup}>
                    <label>Bank Name</label>
                    <input name="externalBankName" value={formData.externalBankName} onChange={handleChange} placeholder="Chase, Wells Fargo, etc." />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Account Number</label>
                    <input name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="123456789" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Routing Number</label>
                    <input name="routingNumber" value={formData.routingNumber} onChange={handleChange} placeholder="987654321" />
                  </div>
                </>
              )}
              {transferType === 'crypto' && (
                <div className={styles.formGroup}>
                  <label>Wallet Address</label>
                  <input name="cryptoAddress" value={formData.cryptoAddress} onChange={handleChange} placeholder="0x..." />
                </div>
              )}
              <button className="btn btn-primary" onClick={handleNextStep}>Next</button>
            </div>
          </div>
        );

      case 'amount':
        return (
          <div className={styles.stepContainer}>
            <button className={styles.backBtn} onClick={handleBackStep}><FiArrowLeft /> Back</button>
            <h3>How much?</h3>
            <p className={styles.availableBalance}>Available: ${Number(user?.balance || 0).toFixed(2)}</p>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.form}>
              <div className={styles.amountInputLarge}>
                <span>$</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <div className={styles.formGroup}>
                <label>Add a note (Optional)</label>
                <textarea name="memo" value={formData.memo} onChange={handleChange} placeholder="What's this for?" />
              </div>
              <button className="btn btn-primary" onClick={handleNextStep}>Review</button>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className={styles.stepContainer}>
            <button className={styles.backBtn} onClick={handleBackStep}><FiArrowLeft /> Back</button>
            <h3>Review Transfer</h3>
            <div className={styles.reviewCard}>
              <div className={styles.reviewAmount}>${Number(formData.amount).toFixed(2)}</div>
              <div className={styles.reviewDetails}>
                <div className={styles.detailRow}>
                  <span>To</span>
                  <strong>{formData.recipientName || formData.recipientEmail || formData.externalBankName || formData.cryptoAddress}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Method</span>
                  <strong>{transferType === 'pay' ? 'Pay Anyone' : transferType === 'external' ? 'External Bank' : 'Crypto'}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>From</span>
                  <strong>Swift Trust Checking</strong>
                </div>
                {formData.memo && (
                  <div className={styles.detailRow}>
                    <span>Note</span>
                    <strong>{formData.memo}</strong>
                  </div>
                )}
                <div className={styles.detailRow}>
                  <span>Estimated Arrival</span>
                  <strong>Instant</strong>
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleNextStep}>Confirm & Send</button>
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className={styles.stepContainer}>
            <button className={styles.backBtn} onClick={handleBackStep}><FiArrowLeft /> Back</button>
            <h3>Security Verification</h3>
            <p>Enter your 4-digit PIN to confirm this transfer</p>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.form}>
              <input
                type="password"
                name="pin"
                value={formData.pin}
                onChange={handleChange}
                maxLength={4}
                className={styles.pinInput}
                placeholder="• • • •"
                autoFocus
              />
              <button
                className="btn btn-primary"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Verify & Send'}
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className={styles.resultCard}>
            <div className={styles.successIcon}><FiCheckCircle size={64} /></div>
            <h2>Transfer Successful!</h2>
            <div className={styles.successAmount}>${Number(formData.amount).toFixed(2)}</div>
            <p>Sent to {formData.recipientName || formData.recipientEmail || formData.externalBankName || formData.cryptoAddress}</p>

            <div className={styles.detailsBox}>
              <div className={styles.detailRow}>
                <span>Transaction ID</span>
                <strong>{transaction?.transactionId}</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Date</span>
                <strong>{new Date().toLocaleDateString()}</strong>
              </div>
            </div>

            <div className={styles.actionsVertical}>
              <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>Done</button>
              <button className="btn btn-secondary" onClick={() => alert('Receipt feature coming soon!')}>View Receipt</button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className={styles.resultCard}>
            <div className={styles.errorIcon}><FiAlertCircle size={64} /></div>
            <h2>Transfer Failed</h2>
            <p className={styles.errorMessage}>{error}</p>

            {transaction?.transactionId && (
              <div className={styles.detailsBox}>
                <div className={styles.detailRow}>
                  <span>Transaction ID</span>
                  <strong>{transaction.transactionId}</strong>
                </div>
              </div>
            )}

            <div className={styles.actionsVertical}>
              <button className="btn btn-primary" onClick={() => setStep('review')}>Try Again</button>
              <button className="btn btn-secondary" onClick={() => router.push('/dashboard')}>Back to Home</button>
            </div>
          </div>
        );
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2>{step === 'type' ? 'Transfer Money' : transferType === 'pay' ? 'Pay Anyone' : transferType === 'external' ? 'External Transfer' : 'Crypto Transfer'}</h2>
          </div>
          {renderStep()}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
