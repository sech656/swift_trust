'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import Skeleton from '@/components/Skeleton';
import { FiCreditCard, FiPlus, FiTruck, FiAlertCircle, FiCheckCircle, FiX, FiShield } from 'react-icons/fi';
import styles from '../cards.module.css';

interface Card {
  id: number;
  userId: number;
  type: 'VISA' | 'MASTERCARD';
  cardHolderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  status: 'PENDING' | 'ACTIVE' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  deliveryStatus: string;
  trackingNumber?: string;
  deliveryMessage?: string;
  activationFeePaid: boolean;
  proofOfPayment?: string;
  createdAt: string;
}

export default function CardsPage() {
  const { user, token } = useAuth();
  const { showToast } = useUI();
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (token) {
      fetchCards();
    }
  }, [token]);

  const fetchCards = async () => {
    try {
      const res = await fetch('/api/cards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards);
        setPaymentMethods(data.paymentMethods);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (cardId: number) => {
    if (!confirm('Are you sure you want to cancel this card request?')) return;
    
    setCancellingId(cardId);
    try {
      const res = await fetch(`/api/cards?id=${cardId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Card request cancelled successfully', 'success');
        fetchCards();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to cancel request', 'error');
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className={styles.container}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-blue-900 dark:text-white">Your Cards</h2>
            {loading ? (
              <Skeleton variant="button" />
            ) : cards.length === 0 && (
              <button 
                className="btn btn-primary flex items-center gap-2"
                onClick={() => router.push('/dashboard/cards/request')}
              >
                <FiPlus /> Request New Card
              </button>
            )}
          </div>

          {loading ? (
            <div className={styles.cardGrid}>
              {Array(2).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton variant="rect" height="200px" style={{ borderRadius: '16px' }} />
                  <Skeleton variant="rect" height="150px" style={{ borderRadius: '16px' }} />
                </div>
              ))}
            </div>
          ) : cards.length === 0 ? (
            <div className={styles.registerCard} onClick={() => router.push('/dashboard/cards/request')}>
              <FiCreditCard size={48} />
              <div className="text-center">
                <h3 className="font-bold text-lg mb-1">No Cards Found</h3>
                <p className="text-sm">Click here to request your Swift Premium Card</p>
              </div>
            </div>
          ) : (
            <div className={styles.cardGrid}>
              {cards.map((card) => (
                <div key={card.id} className="space-y-4">
                  <div className={`${styles.card} ${card.type === 'VISA' ? styles.visaCard : styles.masterCard}`}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardType}>{card.type}</span>
                      <div className={styles.chip}></div>
                    </div>
                    <div className={styles.cardNumber}>
                      {card.status === 'ACTIVE' || card.status === 'SHIPPED' || card.status === 'DELIVERED' 
                        ? card.cardNumber.replace(/(.{4})/g, '$1 ') 
                        : '•••• •••• •••• ••••'}
                    </div>
                    <div className={styles.cardFooter}>
                      <div className={styles.cardInfo}>
                        <span>Card Holder</span>
                        <strong>{card.cardHolderName}</strong>
                      </div>
                      <div className={styles.cardInfo}>
                        <span>Expires</span>
                        <strong>{card.expiryDate}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="space-y-6">
                      {/* Status Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-50 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${card.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                            {card.status === 'PENDING' ? <FiAlertCircle size={24} /> : <FiTruck size={24} />}
                          </div>
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Request Status</span>
                            <h4 className="text-lg font-bold text-blue-900 dark:text-white leading-tight">{card.deliveryStatus}</h4>
                          </div>
                        </div>
                        <span className={`self-start sm:self-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                          card.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                          card.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {card.status}
                        </span>
                      </div>

                      {/* Action Required Box */}
                      {card.status === 'PENDING' && !card.activationFeePaid && (
                        <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 space-y-4">
                          <div className="flex items-center gap-3 text-blue-700 dark:text-blue-400 font-bold">
                            <FiShield size={22} />
                            <span className="text-base">Action Required: Payment Pending</span>
                          </div>
                          <p className="text-sm text-blue-600 dark:text-blue-500 leading-relaxed">
                            To proceed with your card production and express delivery, please complete the one-time $200 activation fee payment.
                          </p>
                          <div className={styles.cardActions}>
                            <button 
                              className={styles.payBtn}
                              onClick={() => router.push('/dashboard/cards/request')}
                            >
                              <FiShield size={18} /> Pay Activation Fee
                            </button>
                            <button 
                              className={styles.cancelBtn}
                              onClick={() => handleCancelRequest(card.id)}
                              disabled={cancellingId === card.id}
                            >
                              <FiX size={18} /> {cancellingId === card.id ? '...' : 'Cancel Request'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Tracking Information */}
                      {card.trackingNumber && (
                        <div className="p-5 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
                          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-bold">
                            <FiTruck size={20} />
                            <span className="text-base tracking-tight">Tracking Information</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {card.deliveryMessage || 'Your premium card has been dispatched and is currently in transit to your registered address.'}
                          </p>
                          <div className="inline-block px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-mono text-sm text-blue-600 dark:text-blue-400 font-bold">
                            {card.trackingNumber}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}