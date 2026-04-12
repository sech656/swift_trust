'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import AdminRoute from '@/components/AdminRoute';
import Skeleton from '@/components/Skeleton';
import { 
  FiUsers, FiDollarSign, FiSettings, FiLogOut, FiShield, 
  FiAlertCircle, FiCheckCircle, FiLock, FiUnlock, FiCreditCard, 
  FiEdit, FiPlus, FiSave, FiX, FiPackage, FiTruck, FiActivity, FiMenu,
  FiMoon, FiSun, FiTrash2, FiUser
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
  isAdmin: boolean;
  isSuperAdmin: boolean;
  allowCustomSettings: boolean;
  referralCode?: string;
  restrictionMessage?: string;
  referredById?: number;
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
  const { user, token, logout, refreshUser } = useAuth();
  const { theme, toggleTheme, showToast } = useUI();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'cards' | 'settings' | 'profile'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transferErrorMessage, setTransferErrorMessage] = useState('');
  const [btcWallet, setBtcWallet] = useState('');
  const [ethWallet, setEthWallet] = useState('');
  const [usdtWallet, setUsdtWallet] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [canCustomize, setCanCustomize] = useState(false);
  const [allAdmins, setAllAdmins] = useState<User[]>([]);

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
          
          // If super admin, extract all admins for the dropdown
          if (user?.isSuperAdmin) {
            setAllAdmins(data.users.filter((u: User) => u.isAdmin || u.isSuperAdmin));
          }
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
          setCanCustomize(data.allowCustomSettings ?? true); // Default true for Super Admin
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Profile Management states
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zipCode || '',
    country: user?.country || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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
    isAdmin: false,
    isSuperAdmin: false
  });

  useEffect(() => {
    if (token) {
      fetchData();
    }
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || '',
        country: user.country || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [token, activeTab, user]);

  const copyReferralCode = () => {
    if (!user?.referralCode) return;
    navigator.clipboard.writeText(user.referralCode);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setProfileLoading(true);
    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        showToast('Profile updated successfully', 'success');
        setProfileData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        await refreshUser(); // Refresh the user context to reflect changes
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('An unexpected error occurred', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleTabChange = (tab: 'users' | 'transactions' | 'cards' | 'settings' | 'profile') => {
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
        setNewUser({ email: '', password: '', firstName: '', lastName: '', phone: '', address: '', city: '', state: '', zipCode: '', country: 'United States', balance: '0', availableBalance: '0', isAdmin: false, isSuperAdmin: false });
        fetchData();
        showToast('User created successfully', 'success');
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to create user', 'error');
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
          restrictionMessage: editingUser.restrictionMessage,
          allowCustomSettings: editingUser.allowCustomSettings,
          isAdmin: editingUser.isAdmin,
          isSuperAdmin: editingUser.isSuperAdmin,
          referredById: editingUser.referredById
        }),
      });

      if (response.ok) {
        setEditingUser(null);
        fetchData();
        showToast('User updated successfully', 'success');
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to update user', 'error');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId: number, email: string) => {
    if (!window.confirm(`Are you sure you want to delete user ${email} and all their records? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/manage?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchData();
        showToast('User deleted successfully', 'success');
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to delete user', 'error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
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
        showToast('Card updated successfully', 'success');
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to update card', 'error');
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
        showToast('Transaction updated successfully', 'success');
      } else {
        const data = await response.json();
        showToast(data.error || 'Failed to update transaction', 'error');
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

      showToast('Settings saved successfully', 'success');
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
            <button className={activeTab === 'profile' ? styles.active : ''} onClick={() => handleTabChange('profile')}>
              <FiUser /> <span>My Profile</span>
            </button>
          </nav>

          {user?.isAdmin && user?.referralCode && (
            <div 
              style={{ 
                padding: '16px', 
                margin: '16px', 
                backgroundColor: 'rgba(255,255,255,0.05)', 
                borderRadius: '8px',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={copyReferralCode}
              title="Click to copy"
            >
              <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '4px' }}>YOUR REFERRAL CODE</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '2px', color: '#3B82F6' }}>
                {user.referralCode}
              </p>
              {copying && (
                <span style={{ 
                  position: 'absolute', 
                  top: '8px', 
                  right: '8px', 
                  fontSize: '0.65rem', 
                  backgroundColor: '#059669', 
                  padding: '2px 6px', 
                  borderRadius: '4px' 
                }}>
                  Copied!
                </span>
              )}
            </div>
          )}

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
                      <th className={styles.th}>Role</th>
                      <th className={styles.th}>Balance</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i}>
                          <td className={styles.td}><Skeleton variant="text" width="120px" /></td>
                          <td className={styles.td}><Skeleton variant="text" width="180px" /></td>
                          <td className={styles.td}><Skeleton variant="text" width="100px" /></td>
                          <td className={styles.td}><Skeleton variant="text" width="80px" /></td>
                          <td className={styles.td}><Skeleton variant="text" width="60px" /></td>
                          <td className={styles.td}><Skeleton variant="text" width="100px" /></td>
                        </tr>
                      ))
                    ) : users.map((user) => (
                      <tr key={user.id}>
                        <td className={styles.td}>{user.firstName} {user.lastName}</td>
                        <td className={styles.td}>{user.email}</td>
                        <td className={styles.td}>
                          {user.isSuperAdmin ? (
                            <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>Super Admin</span>
                          ) : user.isAdmin ? (
                            <span style={{ color: '#3B82F6', fontWeight: 'bold' }}>Admin ({user.referralCode})</span>
                          ) : (
                            'User'
                          )}
                        </td>
                        <td className={styles.td}>${Number(user.balance).toLocaleString()}</td>
                        <td className={styles.td}>
                          <span className={`${styles.statusBadge} ${user.isRestricted ? styles.restricted : styles.active}`}>
                            {user.isRestricted ? 'Restricted' : 'Active'}
                          </span>
                        </td>
                        <td className={styles.td}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className={styles.editBtn} onClick={() => setEditingUser(user)}>
                              <FiEdit /> Edit
                            </button>
                            <button 
                              className={styles.editBtn} 
                              style={{ color: 'var(--error-color)', borderColor: 'var(--error-color)' }}
                              onClick={() => handleDeleteUser(user.id, user.email)}
                            >
                              <FiTrash2 /> Delete
                            </button>
                          </div>
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
                    {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i}>
                          <td className={styles.td}><Skeleton variant="text" width="120px" /></td>
                          <td className={styles.td}><Skeleton variant="text" width="80px" /></td>
                          <td className={styles.td}><Skeleton variant="text" width="100px" /></td>
                          <td className={styles.td}><Skeleton variant="text" width="60px" /></td>
                          <td className={styles.td}><Skeleton variant="text" width="100px" /></td>
                          <td className={styles.td}><Skeleton variant="text" width="100px" /></td>
                        </tr>
                      ))
                    ) : cards.map((card) => (
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
                    {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i}>
                          <td className={styles.td}><Skeleton variant="text" width="100px" /></td>
                          <td className={styles.td}><Skeleton variant="text" width="80px" /></td>
                          <td className={styles.td}><Skeleton variant="text" width="80px" /></td>
                          <td className={styles.td}><Skeleton variant="text" width="80px" /></td>
                          <td className={styles.td}><Skeleton variant="text" width="60px" /></td>
                          <td className={styles.td}><Skeleton variant="text" width="100px" /></td>
                          <td className={styles.td}><Skeleton variant="text" width="100px" /></td>
                        </tr>
                      ))
                    ) : transactions.map((t) => (
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

            {activeTab === 'profile' && (
              <div className={styles.settingsContainer}>
                <div className={styles.settingsHeader}>
                  <h3>Admin Profile Management</h3>
                  <p>Update your personal information and account security</p>
                </div>
                
                <form onSubmit={handleUpdateProfile} className={styles.settingsGrid}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>First Name</label>
                      <input 
                        type="text" 
                        value={profileData.firstName} 
                        onChange={e => setProfileData({...profileData, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Last Name</label>
                      <input 
                        type="text" 
                        value={profileData.lastName} 
                        onChange={e => setProfileData({...profileData, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Phone Number</label>
                    <input 
                      type="text" 
                      value={profileData.phone} 
                      onChange={e => setProfileData({...profileData, phone: e.target.value})}
                      required
                    />
                  </div>

                  <h4 style={{ margin: '10px 0', fontSize: '0.9rem', color: 'var(--primary-sky-blue)' }}>Address Details</h4>
                  <div className={styles.formGroup}>
                    <label>Street Address</label>
                    <input 
                      type="text" 
                      value={profileData.address} 
                      onChange={e => setProfileData({...profileData, address: e.target.value})}
                    />
                  </div>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>City</label>
                      <input 
                        type="text" 
                        value={profileData.city} 
                        onChange={e => setProfileData({...profileData, city: e.target.value})}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>State</label>
                      <input 
                        type="text" 
                        value={profileData.state} 
                        onChange={e => setProfileData({...profileData, state: e.target.value})}
                      />
                    </div>
                  </div>

                  <h4 style={{ margin: '20px 0 10px 0', fontSize: '0.9rem', color: 'var(--primary-sky-blue)' }}>Security & Password</h4>
                  <div className={styles.formGroup}>
                    <label>Current Password (Required for changes)</label>
                    <input 
                      type="password" 
                      value={profileData.currentPassword} 
                      onChange={e => setProfileData({...profileData, currentPassword: e.target.value})}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>New Password (Optional)</label>
                      <input 
                        type="password" 
                        value={profileData.newPassword} 
                        onChange={e => setProfileData({...profileData, newPassword: e.target.value})}
                        placeholder="Leave blank to keep current"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Confirm New Password</label>
                      <input 
                        type="password" 
                        value={profileData.confirmPassword} 
                        onChange={e => setProfileData({...profileData, confirmPassword: e.target.value})}
                        placeholder="Repeat new password"
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    className="btn btn-primary" 
                    style={{ marginTop: '20px' }}
                    disabled={profileLoading}
                  >
                    {profileLoading ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className={styles.settingsContainer}>
                <div className={styles.settingsHeader}>
                  <h3>Global Platform Settings</h3>
                  <p>Configure default wallet addresses and system messages</p>
                  {!canCustomize && !user?.isSuperAdmin && (
                    <div className={styles.permissionNotice}>
                      <FiLock /> <span>Customizing wallet settings is currently disabled for your account. You are using the default platform settings.</span>
                    </div>
                  )}
                </div>
                
                <div className={styles.settingsGrid}>
                  <div className={styles.formGroup}>
                    <label>Transfer Error Message</label>
                    <textarea 
                      value={transferErrorMessage} 
                      onChange={e => setTransferErrorMessage(e.target.value)}
                      placeholder="Message shown when users attempt a transfer"
                      disabled={!canCustomize && !user?.isSuperAdmin}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>BTC Wallet Address</label>
                    <input 
                      type="text" 
                      value={btcWallet} 
                      onChange={e => setBtcWallet(e.target.value)}
                      disabled={!canCustomize && !user?.isSuperAdmin}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>ETH Wallet Address</label>
                    <input 
                      type="text" 
                      value={ethWallet} 
                      onChange={e => setEthWallet(e.target.value)}
                      disabled={!canCustomize && !user?.isSuperAdmin}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>USDT (TRC20) Wallet Address</label>
                    <input 
                      type="text" 
                      value={usdtWallet} 
                      onChange={e => setUsdtWallet(e.target.value)}
                      disabled={!canCustomize && !user?.isSuperAdmin}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>PayPal Email</label>
                    <input 
                      type="email" 
                      value={paypalEmail} 
                      onChange={e => setPaypalEmail(e.target.value)}
                      disabled={!canCustomize && !user?.isSuperAdmin}
                    />
                  </div>
                  
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSaveSettings} 
                    disabled={settingsLoading || (!canCustomize && !user?.isSuperAdmin)}
                  >
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

            {user?.isSuperAdmin && (
              <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <input 
                  type="checkbox" 
                  id="isAdmin" 
                  checked={newUser.isAdmin} 
                  onChange={e => setNewUser({...newUser, isAdmin: e.target.checked, isSuperAdmin: e.target.checked ? newUser.isSuperAdmin : false})} 
                />
                <label htmlFor="isAdmin" style={{ margin: 0 }}>Register as Admin</label>
              </div>
            )}
            
            {user?.isSuperAdmin && newUser.isAdmin && (
              <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <input 
                  type="checkbox" 
                  id="isSuperAdminNew" 
                  checked={newUser.isSuperAdmin} 
                  onChange={e => setNewUser({...newUser, isSuperAdmin: e.target.checked})} 
                />
                <label htmlFor="isSuperAdminNew" style={{ margin: 0 }}>Register as Super Admin</label>
              </div>
            )}

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
            {user?.isSuperAdmin && editingUser.isAdmin && !editingUser.isSuperAdmin && (
              <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <input 
                  type="checkbox" 
                  id="allowCustomSettings" 
                  checked={editingUser.allowCustomSettings} 
                  onChange={e => setEditingUser({...editingUser, allowCustomSettings: e.target.checked})} 
                />
                <label htmlFor="allowCustomSettings" style={{ margin: 0 }}>Allow Custom Wallet Settings</label>
              </div>
            )}
            {user?.isSuperAdmin && (
              <div className={styles.formGroup} style={{ marginTop: '10px' }}>
                <label>User Role</label>
                <select 
                  value={editingUser.isSuperAdmin ? 'super' : editingUser.isAdmin ? 'admin' : 'user'} 
                  onChange={e => {
                    const role = e.target.value;
                    setEditingUser({
                      ...editingUser,
                      isAdmin: role === 'admin' || role === 'super',
                      isSuperAdmin: role === 'super'
                    });
                  }}
                >
                  <option value="user">Standard User</option>
                  <option value="admin">Admin</option>
                  <option value="super">Super Admin</option>
                </select>
              </div>
            )}
            {user?.isSuperAdmin && !editingUser.isSuperAdmin && (
              <div className={styles.formGroup} style={{ marginTop: '10px' }}>
                <label>Referred By (Admin)</label>
                <select 
                  value={editingUser.referredById || ''} 
                  onChange={e => {
                    const val = e.target.value;
                    setEditingUser({
                      ...editingUser,
                      referredById: val ? parseInt(val) : undefined
                    });
                  }}
                >
                  <option value="">No Referrer</option>
                  {allAdmins.map(admin => (
                    <option key={admin.id} value={admin.id}>
                      {admin.firstName} {admin.lastName} ({admin.email})
                    </option>
                  ))}
                </select>
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
