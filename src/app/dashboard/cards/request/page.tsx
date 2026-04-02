'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { FiCreditCard, FiCheckCircle, FiShield, FiAlertCircle, FiArrowRight, FiArrowLeft, FiTruck, FiCamera, FiUpload } from 'react-icons/fi';
import { SiBitcoin, SiEthereum, SiTether, SiPaypal } from 'react-icons/si';
import styles from './request.module.css';

export default function CardRequestPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any>(null);
  const [cardType, setCardType] = useState<'VISA' | 'MASTERCARD'>('VISA');
  const [cardHolderName, setCardHolderName] = useState(`${user?.firstName || ''} ${user?.lastName || ''}`);
  const [proofOfPayment, setProofOfPayment] = useState('');

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
        
        // If user already has a card, redirect them
        if (data.cards && data.cards.length > 0) {
          router.push('/dashboard/cards');
        }
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const handleInitiateRequest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: cardType, cardHolderName, proofOfPayment })
      });
      if (res.ok) {
        setStep(5);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to initiate card request');
      }
    } catch (error) {
      console.error('Error initiating card request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.header}>
            <button className={styles.backBtn} onClick={() => step > 1 ? setStep(step - 1) : router.push('/dashboard')}>
              <FiArrowLeft /> Back
            </button>
            <h2>Request New Card</h2>
            <div className={styles.stepper}>
              <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ''}`}>1</div>
              <div className={styles.stepLine}></div>
              <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ''}`}>2</div>
              <div className={styles.stepLine}></div>
              <div className={`${styles.step} ${step >= 3 ? styles.stepActive : ''}`}>3</div>
              <div className={styles.stepLine}></div>
              <div className={`${styles.step} ${step >= 4 ? styles.stepActive : ''}`}>4</div>
            </div>
          </div>

          <div className={styles.content}>
            {step === 1 && (
              <div className={styles.stepContent}>
                <h3>Select Card Type</h3>
                <p>Choose the card network that best fits your needs.</p>
                
                <div className={styles.cardSelector}>
                  <div 
                    className={`${styles.cardOption} ${cardType === 'VISA' ? styles.cardOptionActive : ''}`}
                    onClick={() => setCardType('VISA')}
                  >
                    <div className={styles.cardPreview} style={{ background: 'linear-gradient(135deg, #1a365d 0%, #0f172a 100%)' }}>
                      <span className={styles.previewNetwork}>VISA</span>
                      <div className={styles.previewChip}></div>
                      <span className={styles.previewNumber}>•••• •••• •••• 4242</span>
                    </div>
                    <div className={styles.optionInfo}>
                      <h4>Swift Visa Premium</h4>
                      <p>Global acceptance, priority rewards, and travel insurance.</p>
                    </div>
                  </div>

                  <div 
                    className={`${styles.cardOption} ${cardType === 'MASTERCARD' ? styles.cardOptionActive : ''}`}
                    onClick={() => setCardType('MASTERCARD')}
                  >
                    <div className={styles.cardPreview} style={{ background: 'linear-gradient(135deg, #431407 0%, #0f172a 100%)' }}>
                      <span className={styles.previewNetwork}>MASTERCARD</span>
                      <div className={styles.previewChip}></div>
                      <span className={styles.previewNumber}>•••• •••• •••• 5555</span>
                    </div>
                    <div className={styles.optionInfo}>
                      <h4>Swift Mastercard Elite</h4>
                      <p>Enhanced security, lifestyle concierge, and airport lounge access.</p>
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Card Holder Name</label>
                  <input 
                    type="text" 
                    value={cardHolderName} 
                    onChange={(e) => setCardHolderName(e.target.value)}
                    placeholder="Enter name as it should appear on card"
                  />
                </div>

                <button className={styles.nextBtn} onClick={() => setStep(2)}>
                  Continue to Delivery <FiArrowRight />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className={styles.stepContent}>
                <h3>Delivery & Activation</h3>
                <p>Confirm your delivery details and review the activation fee.</p>

                <div className={styles.infoBox}>
                  <div className={styles.infoItem}>
                    <FiTruck size={24} />
                    <div>
                      <h4>Next Business Day Delivery</h4>
                      <p>Your physical card will be dispatched via express courier to your registered address.</p>
                    </div>
                  </div>
                </div>

                <div className={styles.feeNotice}>
                  <div className={styles.feeHeader}>
                    <FiCreditCard />
                    <span>One-time Activation Fee</span>
                  </div>
                  <div className={styles.feeAmount}>$200.00</div>
                  <p>Includes card production, secure delivery, and premium account activation.</p>
                </div>

                <button className={styles.nextBtn} onClick={() => setStep(3)}>
                  Confirm Request & Proceed to Payment <FiArrowRight />
                </button>
              </div>
            )}

            {step === 3 && (
              <div className={styles.stepContent}>
                <h3>Secure Payment</h3>
                <p>Please transfer the activation fee to one of the following wallets to proceed.</p>

                <div className={styles.paymentSection} style={{ borderTop: 'none', marginTop: 0, paddingTop: 0 }}>
                  <h4>Payment Methods</h4>
                  <div className={styles.paymentMethods}>
                      {paymentMethods?.btc && (
                        <div className={styles.paymentMethod}>
                          <div className={styles.paymentHeader}>
                            <SiBitcoin color="#F7931A" size={24} />
                            <span>Pay with Bitcoin (BTC)</span>
                          </div>
                          <div className={styles.walletAddress}>{paymentMethods.btc}</div>
                        </div>
                      )}
                      {paymentMethods?.eth && (
                        <div className={styles.paymentMethod}>
                          <div className={styles.paymentHeader}>
                            <SiEthereum color="#627EEA" size={24} />
                            <span>Pay with Ethereum (ETH)</span>
                          </div>
                          <div className={styles.walletAddress}>{paymentMethods.eth}</div>
                        </div>
                      )}
                      {paymentMethods?.usdt && (
                        <div className={styles.paymentMethod}>
                          <div className={styles.paymentHeader}>
                            <SiTether color="#26A17B" size={24} />
                            <span>Pay with Tether (USDT)</span>
                          </div>
                          <div className={styles.walletAddress}>{paymentMethods.usdt}</div>
                        </div>
                      )}
                      {paymentMethods?.paypal && (
                        <div className={styles.paymentMethod}>
                          <div className={styles.paymentHeader}>
                            <SiPaypal color="#003087" size={24} />
                            <span>Pay with PayPal</span>
                          </div>
                          <div className={styles.walletAddress}>{paymentMethods.paypal}</div>
                        </div>
                      )}
                    </div>
                </div>

                <div className={styles.secureBadge}>
                  <FiShield /> <span>Secure SSL Encrypted Payment</span>
                </div>

                <button className={styles.nextBtn} onClick={() => setStep(4)}>
                  I have made the payment <FiArrowRight />
                </button>
              </div>
            )}

            {step === 4 && (
              <div className={styles.stepContent}>
                <h3>Proof of Payment</h3>
                <p>To expedite your card delivery, please provide the transaction hash or a screenshot of your payment confirmation.</p>

                <div className={styles.formGroup}>
                  <label>Transaction ID / Hash or Payment Details</label>
                  <textarea 
                    value={proofOfPayment}
                    onChange={(e) => setProofOfPayment(e.target.value)}
                    placeholder="Enter transaction hash, reference number, or PayPal email used"
                    style={{ 
                      width: '100%', 
                      padding: 'var(--spacing-md)', 
                      border: '1px solid var(--neutral-light-gray)', 
                      borderRadius: 'var(--radius-md)',
                      minHeight: '120px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div className={styles.infoBox} style={{ background: '#f0f9ff', border: '1px solid #e0f2fe' }}>
                  <div className={styles.infoItem} style={{ color: '#0369a1' }}>
                    <FiAlertCircle size={24} />
                    <div>
                      <h4>Verification Process</h4>
                      <p>Our team will verify your payment within 1-2 hours. Once verified, your card will be dispatched immediately.</p>
                    </div>
                  </div>
                </div>

                <button className={styles.nextBtn} onClick={handleInitiateRequest} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request for Verification'}
                </button>
              </div>
            )}

            {step === 5 && (
              <div className={styles.stepContent}>
                <div className={styles.successIcon}>
                  <FiCheckCircle size={64} />
                </div>
                <h3>Request Submitted!</h3>
                <p>Your card request and proof of payment have been received. We are currently verifying your payment.</p>
                <p>You will receive an update on your dashboard once the card is active and shipped.</p>

                <button className={styles.finishBtn} onClick={() => router.push('/dashboard')}>
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
