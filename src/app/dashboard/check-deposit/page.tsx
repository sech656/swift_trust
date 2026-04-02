'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { FiCamera, FiCheckCircle, FiAlertCircle, FiUpload, FiArrowRight } from 'react-icons/fi';
import styles from './check-deposit.module.css';

export default function CheckDepositPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [step, setStep] = useState<'upload' | 'review' | 'success' | 'error'>('upload');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transaction, setTransaction] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') setFrontImage(reader.result as string);
        else setBackImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontImage || !backImage) {
      setError('Please capture both front and back of the check');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setError('');
    setStep('review');
  };

  const handleDeposit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/transactions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'check_deposit',
          amount: parseFloat(amount),
          memo: 'Mobile Check Deposit',
          frontImage,
          backImage,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setTransaction(data.transaction);
        setError(data.error || 'Check deposit failed');
        setStep('error');
      } else {
        setTransaction(data.transaction);
        setStep('success');
      }
    } catch (err: any) {
      setError(err.message || 'Check deposit failed');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className={styles.container}>
            <div className={styles.resultCard}>
              <div className={styles.successIcon}>
                <FiCheckCircle size={80} />
              </div>
              <h2>Your check is being processed</h2>
              <p>Estimated availability: 1-2 business days</p>
              <div className={styles.details}>
                <div className={styles.detailRow}>
                  <span>Amount</span>
                  <strong>${Number(amount).toFixed(2)}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Transaction ID</span>
                  <strong>{transaction?.transactionId}</strong>
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>
                Done
              </button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (step === 'error') {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className={styles.container}>
            <div className={styles.resultCard}>
              <div className={styles.errorIcon}>
                <FiAlertCircle size={80} />
              </div>
              <h2>Deposit Failed</h2>
              <p className={styles.errorMessage}>{error}</p>
              {transaction?.transactionId && (
                <div className={styles.details}>
                  <div className={styles.detailRow}>
                    <span>Transaction ID</span>
                    <strong>{transaction.transactionId}</strong>
                  </div>
                </div>
              )}
              <button className="btn btn-primary" onClick={() => setStep('upload')}>
                Try Again
              </button>
              <button className="btn btn-secondary" onClick={() => router.push('/dashboard')}>
                Back to Home
              </button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2>Mobile Check Deposit</h2>
            <p>{step === 'upload' ? 'Capture check images and enter amount' : 'Review deposit details'}</p>
          </div>

          {step === 'upload' ? (
            <form onSubmit={handleNext} className={styles.form}>
              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.uploadGrid}>
                <div className={styles.uploadContainer}>
                  <h4 className={styles.uploadTitle}>Front of Check</h4>
                  <div className={styles.uploadOptions}>
                    <label className={styles.uploadOption}>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleFileChange(e, 'front')}
                        hidden
                      />
                      <FiCamera size={20} />
                      <span>Take Photo</span>
                    </label>
                    <label className={styles.uploadOption}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'front')}
                        hidden
                      />
                      <FiUpload size={20} />
                      <span>Upload</span>
                    </label>
                  </div>
                  <div className={styles.uploadPlaceholder}>
                    {frontImage ? (
                      <img src={frontImage} alt="Front" className={styles.preview} />
                    ) : (
                      <div className={styles.emptyPreview}>
                        <FiCamera size={40} opacity={0.2} />
                        <span>No image captured</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.uploadContainer}>
                  <h4 className={styles.uploadTitle}>Back of Check</h4>
                  <div className={styles.uploadOptions}>
                    <label className={styles.uploadOption}>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleFileChange(e, 'back')}
                        hidden
                      />
                      <FiCamera size={20} />
                      <span>Take Photo</span>
                    </label>
                    <label className={styles.uploadOption}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'back')}
                        hidden
                      />
                      <FiUpload size={20} />
                      <span>Upload</span>
                    </label>
                  </div>
                  <div className={styles.uploadPlaceholder}>
                    {backImage ? (
                      <img src={backImage} alt="Back" className={styles.preview} />
                    ) : (
                      <div className={styles.emptyPreview}>
                        <FiCamera size={40} opacity={0.2} />
                        <span>No image captured</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Deposit Amount</label>
                <div className={styles.amountInput}>
                  <span>$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Daily deposit limit: $50,000.00</p>
              </div>

              <button type="submit" className="btn btn-primary flex items-center justify-center gap-2">
                Continue to Review <FiArrowRight />
              </button>
            </form>
          ) : (
            <div className={styles.reviewCard}>
              <h3>Review Your Deposit</h3>
              <div className={styles.reviewDetails}>
                <div className={styles.detailRow}>
                  <span>Amount</span>
                  <strong className={styles.reviewAmount}>${Number(amount).toFixed(2)}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Account</span>
                  <strong>Swift Trust Checkings</strong>
                </div>
                <div className={styles.imageGrid}>
                  <div className={styles.imageBox}>
                    <span>Front</span>
                    <img src={frontImage!} alt="Front" />
                  </div>
                  <div className={styles.imageBox}>
                    <span>Back</span>
                    <img src={backImage!} alt="Back" />
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className="btn btn-primary"
                  onClick={handleDeposit}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Confirm Deposit'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setStep('upload')}
                  disabled={loading}
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
