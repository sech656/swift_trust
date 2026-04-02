'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import AdminRoute from '@/components/AdminRoute';
import { 
  FiUsers, FiDollarSign, FiSettings, FiLogOut, FiShield, 
  FiAlertCircle, FiCheckCircle, FiLock, FiUnlock, FiCreditCard, 
  FiEdit, FiPlus, FiSave, FiX, FiPackage, FiTruck, FiActivity, FiMenu,
  FiMoon, FiSun
} from 'react-icons/fi';
import styles from './admin.module.css';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  balance: number;
  availableBalance: number;
  isRestricted: boolean;
  restrictionMessage?: string;
  createdAt: string;
}

interface Transaction {
  id: number;
  transactionId: string;
  userId: number;
  type: string;
  status: string;
  amount: string;
  createdAt: string;
  errorMessage?: string;
  memo?: string;
  frontImage?: string;
  backImage?: string;
}

interface Card {
  id: number;
  userId: number;
  type: string;
  cardHolderName: string;
  cardNumber: string;
  status: string;
  deliveryStatus: string;
  trackingNumber?: string;
  deliveryMessage?: string;
  activationFeePaid: boolean;
  proofOfPayment?: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useUI();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'cards' | 'settings'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [restrictingUser, setRestrictingUser] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [restrictionMessage, setRestrictionMessage] = useState('');
  const [transferErrorMessage, setTransferErrorMessage] = useState('');
  const [btcWallet, setBtcWallet] = useState('');
  const [ethWallet, setEthWallet] = useState('');
  const [usdtWallet, setUsdtWallet] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form states for new user
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    balance: '0',
    availableBalance: '0',
    isAdmin: false
  });

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const response = await fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        }
      } else if (activeTab === 'transactions') {
        const response = await fetch('/api/admin/transactions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setTransactions(data.transactions);
        }
      } else if (activeTab === 'cards') {
        const response = await fetch('/api/admin/cards', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setCards(data.cards);
        }
      } else if (activeTab === 'settings') {
        const response = await fetch('/api/admin/settings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          const getVal = (key: string) => data.settings.find((s: any) => s.key === key)?.value || '';
          setTransferErrorMessage(getVal('transfer_error_message'));
          setBtcWallet(getVal('btc_wallet'));
          setEthWallet(getVal('eth_wallet'));
          setUsdtWallet(getVal('usdt_wallet'));
          setPaypalEmail(getVal('paypal_email'));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'users' | 'transactions' | 'cards' | 'settings') => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/admin/users/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        setCreatingUser(false);
        setNewUser({ email: '', password: '', firstName: '', lastName: '', phone: '', address: '', city: '', state: '', zipCode: '', country: 'United States', balance: '0', availableBalance: '0', isAdmin: false });
        fetchData();
        setSuccessMessage('User created successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const response = await fetch('/api/admin/users/manage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: editingUser.id,
          balance: editingUser.balance,
          availableBalance: editingUser.availableBalance,
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          phone: editingUser.phone,
          address: editingUser.address,
          city: editingUser.city,
          state: editingUser.state,
          zipCode: editingUser.zipCode,
          country: editingUser.country,
          isRestricted: editingUser.isRestricted,
          restrictionMessage: editingUser.restrictionMessage
        }),
      });

      if (response.ok) {
        setEditingUser(null);
        fetchData();
        setSuccessMessage('User updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleUpdateCard = async () => {
    if (!editingCard) return;
    try {
      const response = await fetch('/api/admin/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cardId: editingCard.id,
          status: editingCard.status,
          deliveryStatus: editingCard.deliveryStatus,
          trackingNumber: editingCard.trackingNumber,
          deliveryMessage: editingCard.deliveryMessage,
          activationFeePaid: editingCard.activationFeePaid,
        }),
      });

      if (response.ok) {
        setEditingCard(null);
        await fetchData(); // Ensure data is re-fetched
        setSuccessMessage('Card updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update card');
      }
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  const handleUpdateTransaction = async () => {
    if (!editingTransaction) return;
    try {
      const response = await fetch('/api/admin/transactions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionId: editingTransaction.id,
          status: editingTransaction.status,
          errorMessage: editingTransaction.errorMessage,
          memo: editingTransaction.memo
        }),
      });

      if (response.ok) {
        setEditingTransaction(null);
        fetchData();
        setSuccessMessage('Transaction updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update transaction');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      const settings = [
        { key: 'transfer_error_message', value: transferErrorMessage },
        { key: 'btc_wallet', value: btcWallet },
        { key: 'eth_wallet', value: ethWallet },
        { key: 'usdt_wallet', value: usdtWallet },
        { key: 'paypal_email', value: paypalEmail },
      ];

      for (const s of settings) {
        await fetch('/api/admin/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(s),
        });
      }

      setSuccessMessage('Settings saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <AdminRoute>
      <div className={styles.adminLayout}>
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiShield size={24} />
              <h2>Swift Admin</h2>
            </div>
            <button className={styles.closeSidebar} onClick={() => setSidebarOpen(false)}>
              <FiX size={24} />
            </button>
          </div>
          <nav className={styles.sidebarNav}>
            <button className={activeTab === 'users' ? styles.active : ''} onClick={() => handleTabChange('users')}>
              <FiUsers /> <span>Users</span>
            </button>
            <button className={activeTab === 'transactions' ? styles.active : ''} onClick={() => handleTabChange('transactions')}>
              <FiDollarSign /> <span>Transactions</span>
            </button>
            <button className={activeTab === 'cards' ? styles.active : ''} onClick={() => handleTabChange('cards')}>
              <FiCreditCard /> <span>Card Requests</span>
            </button>
            <button className={activeTab === 'settings' ? styles.active : ''} onClick={() => handleTabChange('settings')}>
              <FiSettings /> <span>Settings</span>
            </button>
          </nav>
          <button className={styles.logoutBtn} onClick={logout}>
            <FiLogOut /> <span>Logout</span>
          </button>
        </aside>

        {sidebarOpen && <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />}

        <main className={styles.mainContent}>
          <header className={styles.topHeader}>
            <div className={styles.headerLeft}>
              <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
                <FiMenu size={24} />
              </button>
              <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            </div>
            <div className={styles.headerRight}>
              <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Toggle theme">
                {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
              </button>
              <div className={styles.userBadge} onClick={() => setActiveTab('settings')}>
                {user?.firstName?.charAt(0)}
              </div>
              <div className={styles.tabActions}>
                {activeTab === 'users' && (
                  <button className="btn btn-primary" onClick={() => setCreatingUser(true)}>
                    <FiPlus /> New User
                  </button>
                )}
                {successMessage && <div className={styles.successBanner}><FiCheckCircle /> {successMessage}</div>}
              </div>
            </div>
          </header>

          <div className={styles.contentArea}>
            {activeTab === 'users' && (
              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Name</th>
                      <th className={styles.th}>Email</th>
                      <th className={styles.th}>Balance</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className={styles.td}>{user.firstName} {user.lastName}</td>
                        <td className={styles.td}>{user.email}</td>
                        <td className={styles.td}>${Number(user.balance).toLocaleString()}</td>
                        <td className={styles.td}>
                          <span className={`${styles.statusBadge} ${user.isRestricted ? styles.restricted : styles.active}`}>
                            {user.isRestricted ? 'Restricted' : 'Active'}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <button className={styles.editBtn} onClick={() => setEditingUser(user)}>
                            <FiEdit /> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'cards' && (
              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Holder</th>
                      <th className={styles.th}>Type</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th}>Fee</th>
                      <th className={styles.th}>Tracking</th>
                      <th className={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards.map((card) => (
                      <tr key={card.id}>
                        <td className={styles.td}>{card.cardHolderName}</td>
                        <td className={styles.td}>{card.type}</td>
                        <td className={styles.td}>
                          <span className={`${styles.statusBadge} ${card.status.toLowerCase()}`}>
                            {card.status}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <span className={`${styles.statusBadge} ${card.activationFeePaid ? styles.active : styles.pending}`}>
                            {card.activationFeePaid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td className={styles.td}>{card.trackingNumber || 'N/A'}</td>
                        <td className={styles.td}>
                          <button className={styles.editBtn} onClick={() => setEditingCard(card)}>
                            <FiEdit /> Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>ID</th>
                      <th className={styles.th}>Type</th>
                      <th className={styles.th}>Amount</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th}>Check</th>
                      <th className={styles.th}>Date</th>
                      <th className={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id}>
                        <td className={styles.td}>{t.transactionId}</td>
                        <td className={styles.td}>{t.type}</td>
                        <td className={styles.td}>${Number(t.amount).toLocaleString()}</td>
                        <td className={styles.td}>
                          <span className={`${styles.statusBadge} ${t.status.toLowerCase()}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className={styles.td}>
                          {t.type === 'check_deposit' && (t.frontImage || t.backImage) ? (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {t.frontImage && (
                                <button 
                                  className={styles.viewBtn} 
                                  onClick={() => window.open(t.frontImage, '_blank')}
                                  title="View Front"
                                >
                                  F
                                </button>
                              )}
                              {t.backImage && (
                                <button 
                                  className={styles.viewBtn} 
                                  onClick={() => window.open(t.backImage, '_blank')}
                                  title="View Back"
                                >
                                  B
                                </button>
                              )}
                            </div>
                          ) : 'N/A'}
                        </td>
                        <td className={styles.td}>{new Date(t.createdAt).toLocaleDateString()}</td>
                        <td className={styles.td}>
                          <button className={styles.editBtn} onClick={() => setEditingTransaction(t)}>
                            <FiEdit /> Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className={styles.settingsCard}>
                <div className={styles.settingsGroup}>
                  <h3>Global Transfer Controls</h3>
                  <div className={styles.formGroup}>
                    <label>Transfer Error Message</label>
                    <textarea
                      value={transferErrorMessage}
                      onChange={(e) => setTransferErrorMessage(e.target.value)}
                      placeholder="Maintenance in progress..."
                    />
                  </div>
                  
                  <h3>Payment Wallets (Card Activation)</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Bitcoin (BTC) Wallet</label>
                      <input value={btcWallet} onChange={(e) => setBtcWallet(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Ethereum (ETH) Wallet</label>
                      <input value={ethWallet} onChange={(e) => setEthWallet(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Tether (USDT) Wallet</label>
                      <input value={usdtWallet} onChange={(e) => setUsdtWallet(e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>PayPal Email</label>
                    <input value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} />
                  </div>
                  
                  <button className="btn btn-primary" onClick={handleSaveSettings} disabled={settingsLoading}>
                    {settingsLoading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {creatingUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Register New User</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}><label>First Name</label><input onChange={e => setNewUser({...newUser, firstName: e.target.value})} /></div>
              <div className={styles.formGroup}><label>Last Name</label><input onChange={e => setNewUser({...newUser, lastName: e.target.value})} /></div>
            </div>
            <div className={styles.formGroup}><label>Email</label><input onChange={e => setNewUser({...newUser, email: e.target.value})} /></div>
            <div className={styles.formGroup}><label>Phone</label><input onChange={e => setNewUser({...newUser, phone: e.target.value})} /></div>
            
            <h4 style={{ margin: '10px 0', fontSize: '0.9rem', color: 'var(--primary-deep-blue)' }}>Address Information</h4>
            <div className={styles.formGroup}><label>Street Address</label><input onChange={e => setNewUser({...newUser, address: e.target.value})} /></div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}><label>City</label><input onChange={e => setNewUser({...newUser, city: e.target.value})} /></div>
              <div className={styles.formGroup}><label>State</label><input onChange={e => setNewUser({...newUser, state: e.target.value})} /></div>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}><label>Zip Code</label><input onChange={e => setNewUser({...newUser, zipCode: e.target.value})} /></div>
              <div className={styles.formGroup}><label>Country</label><input value={newUser.country} onChange={e => setNewUser({...newUser, country: e.target.value})} /></div>
            </div>

            <div className={styles.formGroup}><label>Password</label><input type="password" onChange={e => setNewUser({...newUser, password: e.target.value})} /></div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}><label>Initial Main Balance</label><input type="number" onChange={e => setNewUser({...newUser, balance: e.target.value})} /></div>
              <div className={styles.formGroup}><label>Initial Available Balance</label><input type="number" onChange={e => setNewUser({...newUser, availableBalance: e.target.value})} /></div>
            </div>
            <div className={styles.modalActions}>
              <button className="btn btn-secondary" onClick={() => setCreatingUser(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateUser}>Create User</button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Edit User: {editingUser.email}</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Main Balance ($)</label>
                <input type="number" value={editingUser.balance || 0} onChange={e => setEditingUser({...editingUser, balance: parseFloat(e.target.value)})} />
              </div>
              <div className={styles.formGroup}>
                <label>Available Balance ($)</label>
                <input type="number" value={editingUser.availableBalance || 0} onChange={e => setEditingUser({...editingUser, availableBalance: parseFloat(e.target.value)})} />
              </div>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}><label>First Name</label><input value={editingUser.firstName || ''} onChange={e => setEditingUser({...editingUser, firstName: e.target.value})} /></div>
              <div className={styles.formGroup}><label>Last Name</label><input value={editingUser.lastName || ''} onChange={e => setEditingUser({...editingUser, lastName: e.target.value})} /></div>
            </div>
            <div className={styles.formGroup}><label>Phone</label><input value={editingUser.phone || ''} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} /></div>
            
            <h4 style={{ margin: '10px 0', fontSize: '0.9rem', color: 'var(--primary-deep-blue)' }}>Address Information</h4>
            <div className={styles.formGroup}><label>Street Address</label><input value={editingUser.address || ''} onChange={e => setEditingUser({...editingUser, address: e.target.value})} /></div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}><label>City</label><input value={editingUser.city || ''} onChange={e => setEditingUser({...editingUser, city: e.target.value})} /></div>
              <div className={styles.formGroup}><label>State</label><input value={editingUser.state || ''} onChange={e => setEditingUser({...editingUser, state: e.target.value})} /></div>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}><label>Zip Code</label><input value={editingUser.zipCode || ''} onChange={e => setEditingUser({...editingUser, zipCode: e.target.value})} /></div>
              <div className={styles.formGroup}><label>Country</label><input value={editingUser.country || ''} onChange={e => setEditingUser({...editingUser, country: e.target.value})} /></div>
            </div>

            <div className={styles.formGroup}>
              <label>Restriction Status</label>
              <select value={editingUser.isRestricted ? 'true' : 'false'} onChange={e => setEditingUser({...editingUser, isRestricted: e.target.value === 'true'})}>
                <option value="false">Active</option>
                <option value="true">Restricted</option>
              </select>
            </div>
            {editingUser.isRestricted && (
              <div className={styles.formGroup}>
                <label>Restriction Message</label>
                <textarea value={editingUser.restrictionMessage || ''} onChange={e => setEditingUser({...editingUser, restrictionMessage: e.target.value})} />
              </div>
            )}
            <div className={styles.modalActions}>
              <button className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdateUser}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {editingCard && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Manage Card Request</h3>
            <div className={styles.formGroup}>
              <label>Card Status</label>
              <select value={editingCard.status} onChange={e => setEditingCard({...editingCard, status: e.target.value})}>
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Delivery Status Text</label>
              <input value={editingCard.deliveryStatus || ''} onChange={e => setEditingCard({...editingCard, deliveryStatus: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label>Tracking Number</label>
              <input value={editingCard.trackingNumber || ''} onChange={e => setEditingCard({...editingCard, trackingNumber: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label>Activation Fee</label>
              <select value={editingCard.activationFeePaid ? 'true' : 'false'} onChange={e => setEditingCard({...editingCard, activationFeePaid: e.target.value === 'true'})}>
                <option value="false">Unpaid</option>
                <option value="true">Paid</option>
              </select>
            </div>
            {editingCard.proofOfPayment && (
              <div className={styles.formGroup}>
                <label>Proof of Payment</label>
                <div style={{ 
                  padding: 'var(--spacing-md)', 
                  background: 'var(--bg-color)', 
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  wordBreak: 'break-all',
                  fontSize: '0.9rem'
                }}>
                  {editingCard.proofOfPayment}
                </div>
              </div>
            )}
            <div className={styles.modalActions}>
              <button className="btn btn-secondary" onClick={() => setEditingCard(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdateCard}>Update Card</button>
            </div>
          </div>
        </div>
      )}

      {editingTransaction && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Manage Transaction</h3>
            <div className={styles.formGroup}>
              <label>Status</label>
              <select 
                value={editingTransaction.status} 
                onChange={e => setEditingTransaction({...editingTransaction, status: e.target.value})}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="disputed">Disputed</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Message / Memo</label>
              <input 
                value={editingTransaction.memo || ''} 
                onChange={e => setEditingTransaction({...editingTransaction, memo: e.target.value})}
                placeholder="Transaction memo..."
              />
            </div>
            <div className={styles.formGroup}>
              <label>Error Message (if failed)</label>
              <textarea 
                value={editingTransaction.errorMessage || ''} 
                onChange={e => setEditingTransaction({...editingTransaction, errorMessage: e.target.value})}
                placeholder="Error message shown to user..."
              />
            </div>
            
            {editingTransaction.type === 'check_deposit' && (editingTransaction.frontImage || editingTransaction.backImage) && (
              <div className={styles.formGroup}>
                <label>Check Images</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                  {editingTransaction.frontImage && (
                    <div>
                      <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '4px' }}>FRONT</span>
                      <img 
                        src={editingTransaction.frontImage} 
                        alt="Front" 
                        style={{ width: '100%', borderRadius: '4px', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                        onClick={() => window.open(editingTransaction.frontImage, '_blank')}
                      />
                    </div>
                  )}
                  {editingTransaction.backImage && (
                    <div>
                      <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '4px' }}>BACK</span>
                      <img 
                        src={editingTransaction.backImage} 
                        alt="Back" 
                        style={{ width: '100%', borderRadius: '4px', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                        onClick={() => window.open(editingTransaction.backImage, '_blank')}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className={styles.modalActions}>
              <button className="btn btn-secondary" onClick={() => setEditingTransaction(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdateTransaction}>Update Transaction</button>
            </div>
          </div>
        </div>
      )}
    </AdminRoute>
  );
}
