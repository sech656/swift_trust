'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  FiSend, FiDollarSign, FiMapPin, FiArrowUpRight, FiArrowDownLeft, 
  FiMoreHorizontal, FiCreditCard, FiPlus, FiTruck, FiCheckCircle, 
  FiAlertCircle, FiShield, FiX, FiActivity, FiSettings, FiLogOut, FiDownloadCloud
} from 'react-icons/fi';
import { SiBitcoin, SiEthereum, SiTether } from 'react-icons/si';
import { format } from 'date-fns';
import styles from './dashboard.module.css';
import cardStyles from './cards.module.css';

interface Transaction {
  id: number;
  transactionId: string;
  type: string;
  status: string;
  amount: string;
  recipientName?: string;
  recipientEmail?: string;
  createdAt: string;
}

interface Card {
  id: number;
  type: 'VISA' | 'MASTERCARD';
  cardHolderName: string;
  cardNumber: string;
  expiryDate: string;
  status: string;
  deliveryStatus: string;
  trackingNumber?: string;
  deliveryMessage?: string;
  activationFeePaid: boolean;
}

export default function DashboardPage() {
  const { user, token, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [registeringCard, setRegisteringCard] = useState({ type: 'VISA', cardHolderName: `${user?.firstName || ''} ${user?.lastName || ''}` });

  useEffect(() => {
    if (token) {
      fetchData();
      refreshUser();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const [tRes, cRes] = await Promise.all([
        fetch('/api/transactions/list', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/cards', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (tRes.ok) {
        const data = await tRes.json();
        setTransactions(data.transactions.slice(0, 5));
      }
      if (cRes.ok) {
        const data = await cRes.json();
        setCards(data.cards);
        setPaymentMethods(data.paymentMethods);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCard = async () => {
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(registeringCard)
      });
      if (res.ok) {
        setShowCardModal(false);
        fetchData();
        alert('Card registration initiated. Please complete the activation fee payment.');
      }
    } catch (error) {
      console.error('Error registering card:', error);
    }
  };

  const quickActions = [
    { name: 'Fund Account', icon: FiDownloadCloud, onClick: () => router.push('/dashboard/move-money'), color: '#059669' },
    { name: 'Pay Anyone', icon: FiDollarSign, onClick: () => router.push('/dashboard/transfer'), color: '#1E3A8A' },
    { name: 'Mobile Deposit', icon: FiActivity, onClick: () => router.push('/dashboard/check-deposit'), color: '#3B82F6' },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.welcomeSection}>
            <div className={styles.welcomeText}>
              <h1>Hello, {user?.firstName}</h1>
              <p>Welcome back to Swift Trust Premium</p>
            </div>
            <div style={{ position: 'relative' }}>
              <button className={styles.moreBtn} onClick={() => setShowMoreMenu(!showMoreMenu)}>
                <FiMoreHorizontal size={24} />
              </button>
              {showMoreMenu && (
                <div className={styles.moreMenu}>
                  <button className={styles.menuItem} onClick={() => router.push('/dashboard/settings')}>
                    <FiSettings size={18} /> Settings
                  </button>
                  <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={logout}>
                    <FiLogOut size={18} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.accountOverview}>
            <div className={styles.mainCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardType}>
                  <FiCreditCard size={20} />
                  <span>Checking Account</span>
                </div>
                <div className={styles.accountNumbers}>
                  <span>Acc: •••• {user?.accountNumber.slice(-4)}</span>
                </div>
              </div>
              <div className={styles.balanceInfo}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className={styles.balanceLabel}>Available Balance</span>
                    <h2 className={styles.balanceAmount}>
                      ${Number(user?.availableBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={styles.balanceLabel}>Main Balance</span>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '4px' }}>
                      ${Number(user?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h4>
                  </div>
                </div>
              </div>
              <div className={styles.cardFooter}>
                <div className={styles.routingInfo}>
                  <span>Routing</span>
                  <p>{user?.routingNumber}</p>
                </div>
                <div className={styles.statusBadge}>Active</div>
              </div>
            </div>

            <div className={styles.quickActions}>
              {quickActions.map((action) => (
                <button key={action.name} className={styles.actionBtn} onClick={action.onClick}>
                  <div className={styles.actionIcon} style={{ backgroundColor: action.color }}>
                    <action.icon size={20} />
                  </div>
                  <span>{action.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Card Registration & Tracking Section */}
          <div className={cardStyles.cardSection}>
            <div className={styles.sectionHeader}>
              <h3>Your Cards</h3>
              <p>Manage your physical and virtual cards</p>
            </div>
            
            <div className={cardStyles.cardGrid}>
              {cards.map((card) => (
                <div key={card.id} className={`${cardStyles.card} ${card.type === 'VISA' ? cardStyles.visaCard : cardStyles.masterCard}`}>
                  <div className={cardStyles.cardHeader}>
                    <div className={cardStyles.chip}></div>
                    <div className={cardStyles.cardType}>{card.type}</div>
                  </div>
                  <div className={cardStyles.cardNumber}>
                    •••• •••• •••• {card.cardNumber.slice(-4)}
                  </div>
                  <div className={cardStyles.cardFooter}>
                    <div className={cardStyles.cardInfo}>
                      <span>Card Holder</span>
                      <strong>{card.cardHolderName}</strong>
                    </div>
                    <div className={cardStyles.cardInfo}>
                      <span>Expires</span>
                      <strong>{card.expiryDate}</strong>
                    </div>
                  </div>
                  
                  {/* Delivery Tracking */}
                  <div className={cardStyles.trackingInfo}>
                    <div className={cardStyles.trackingHeader}>
                      <FiTruck /> <span>{card.deliveryStatus}</span>
                    </div>
                    {card.deliveryMessage && <p>{card.deliveryMessage}</p>}
                    {card.trackingNumber && <span className={cardStyles.trackingNumber}>Tracking: {card.trackingNumber}</span>}
                    {!card.activationFeePaid && (
                      <div className={cardStyles.feeNotice} style={{ marginTop: '10px', fontSize: '0.8rem', padding: '8px' }}>
                        <FiAlertCircle /> Activation Fee Pending ($200)
                        <button 
                          className={cardStyles.payBtnSmall} 
                          onClick={() => router.push('/dashboard/cards/request')}
                          style={{ marginLeft: 'auto', background: '#92400e', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Pay Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <div className={cardStyles.registerCard} onClick={() => router.push('/dashboard/cards/request')}>
                <FiPlus size={32} />
                <span>Request New Card</span>
              </div>
            </div>
          </div>

          <div className={styles.recentActivity}>
            <div className={styles.sectionHeader}>
              <h3>Recent Transactions</h3>
              <button className={styles.viewAllBtn} onClick={() => router.push('/dashboard/transactions')}>View All</button>
            </div>

            <div className={styles.transactionList}>
              {loading ? (
                <div className={styles.loading}>Loading activity...</div>
              ) : transactions.length > 0 ? (
                transactions.map((t) => (
                  <div key={t.id} className={styles.transactionItem} onClick={() => router.push(`/dashboard/transactions?id=${t.id}`)}>
                    <div className={styles.tIconWrapper}>
                      {parseFloat(t.amount) < 0 || t.type === 'transfer' || t.type === 'external_transfer' ? (
                        <FiArrowUpRight className={styles.debitIcon} />
                      ) : (
                        <FiArrowDownLeft className={styles.creditIcon} />
                      )}
                    </div>
                    <div className={styles.tDetails}>
                      <span className={styles.tTitle}>
                        {t.type === 'check_deposit' ? 'Check Deposit' : t.recipientName || t.recipientEmail || 'Swift Trust Transfer'}
                      </span>
                      <span className={styles.tDate}>{format(new Date(t.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className={styles.tAmountSection}>
                      <span className={`${styles.tAmount} ${parseFloat(t.amount) < 0 || t.type === 'transfer' || t.type === 'external_transfer' ? styles.negative : styles.positive}`}>
                        {parseFloat(t.amount) < 0 || t.type === 'transfer' || t.type === 'external_transfer' ? '-' : '+'}
                        ${Math.abs(parseFloat(t.amount)).toFixed(2)}
                      </span>
                      <span className={styles.tStatus}>{t.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>No recent transactions</div>
              )}
            </div>
          </div>
        </div>

        {/* Card Request Modal */}
        {showCardModal && (
          <div className={styles.modalOverlay}>
            <div className={`${styles.modal} ${cardStyles.paymentModal}`}>
              <div className={styles.modalHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Request Physical Card</h3>
                <button onClick={() => setShowCardModal(false)} style={{ background: 'none', border: 'none' }}><FiX size={24} /></button>
              </div>
              
              <div className={cardStyles.feeNotice}>
                <FiAlertCircle size={24} />
                <p>Card activation fee is <strong>$200.00</strong>. This includes premium Visa/Mastercard registration and next business day delivery.</p>
              </div>

              <div className={styles.formGroup} style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Card Type</label>
                <select 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                  value={registeringCard.type}
                  onChange={e => setRegisteringCard({...registeringCard, type: e.target.value})}
                >
                  <option value="VISA">Visa Premium</option>
                  <option value="MASTERCARD">Mastercard Elite</option>
                </select>
              </div>

              <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Card Holder Name</label>
                <input 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                  value={registeringCard.cardHolderName}
                  onChange={e => setRegisteringCard({...registeringCard, cardHolderName: e.target.value})}
                />
              </div>

              <h4>Select Payment Method</h4>
              <div className={cardStyles.paymentMethods}>
                <div className={cardStyles.paymentMethod}>
                  <div className={cardStyles.paymentHeader}>
                    <FiActivity /> Bitcoin (BTC)
                  </div>
                  <p style={{ fontSize: '0.85rem' }}>Transfer exactly $200 worth of BTC to:</p>
                  <div className={cardStyles.walletAddress}>{paymentMethods?.btc}</div>
                </div>
                <div className={cardStyles.paymentMethod}>
                  <div className={cardStyles.paymentHeader}>
                    <FiActivity /> Ethereum (ETH)
                  </div>
                  <p style={{ fontSize: '0.85rem' }}>Transfer exactly $200 worth of ETH to:</p>
                  <div className={cardStyles.walletAddress}>{paymentMethods?.eth}</div>
                </div>
                <div className={cardStyles.paymentMethod}>
                  <div className={cardStyles.paymentHeader}>
                    <FiActivity /> Tether (USDT)
                  </div>
                  <p style={{ fontSize: '0.85rem' }}>Transfer exactly $200 worth of USDT to:</p>
                  <div className={cardStyles.walletAddress}>{paymentMethods?.usdt}</div>
                </div>
                <div className={cardStyles.paymentMethod}>
                  <div className={cardStyles.paymentHeader}>
                    <FiActivity /> PayPal
                  </div>
                  <p style={{ fontSize: '0.85rem' }}>Send $200 via PayPal to:</p>
                  <div className={cardStyles.walletAddress}>{paymentMethods?.paypal}</div>
                </div>
              </div>

              <div className={cardStyles.secureBadge}>
                <FiShield /> <span>Bank-Grade Secure Transaction</span>
              </div>

              <div className={styles.modalActions} style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCardModal(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleRegisterCard}>Confirm & Pay</button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
