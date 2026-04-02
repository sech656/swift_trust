'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import styles from './settings.module.css';

export default function SettingsPage() {
  const { user, token, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zipCode || '',
    country: user?.country || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Profile updated successfully');
        refreshUser();
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setError(data.error || 'Failed to update password');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2>Settings</h2>
            <p>Manage your account settings and preferences</p>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'profile' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Personal Info
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'password' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('password')}
            >
              Change Password
            </button>
          </div>

          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="card">
              <h3 className={styles.sectionTitle}>Personal Information</h3>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="input"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="input"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  className="input"
                  value={profileData.email}
                  disabled
                  readOnly
                  style={{ backgroundColor: 'var(--neutral-off-white)', cursor: 'not-allowed', opacity: 0.7 }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--neutral-slate)', marginTop: '4px' }}>
                  Email address cannot be changed for security reasons.
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="input"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <h4 className={styles.sectionSubTitle}>Mailing Address</h4>

              <div className={styles.formGroup}>
                <label>Street Address</label>
                <input
                  type="text"
                  name="address"
                  className="input"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    className="input"
                    value={profileData.city}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>State / Province</label>
                  <input
                    type="text"
                    name="state"
                    className="input"
                    value={profileData.state}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Zip / Postal Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    className="input"
                    value={profileData.zipCode}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    className="input"
                    value={profileData.country}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
              </div>

              {error && <div className={styles.error}>{error}</div>}
              {message && <div className={styles.success}>{message}</div>}

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="loading"></span> : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleUpdatePassword} className="card">
              <h3 className={styles.sectionTitle}>Change Password</h3>

              <div className={styles.formGroup}>
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  className="input"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  className="input"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="input"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}
              {message && <div className={styles.success}>{message}</div>}

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="loading"></span> : 'Update Password'}
              </button>
            </form>
          )}

          <div className="card">
            <h3 className={styles.sectionTitle}>Account Information</h3>
            <div className={styles.accountDetails}>
              <div className={styles.detailRow}>
                <span>Account Number:</span>
                <strong>{user?.accountNumber}</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Routing Number:</span>
                <strong>{user?.routingNumber}</strong>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
