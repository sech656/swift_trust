'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { FiShield, FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [restrictionMessage, setRestrictionMessage] = useState('');
  const router = useRouter();
  const { login } = useAuth();
  const { showToast, setLoading: setGlobalLoading } = useUI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRestrictionMessage('');
    setLoading(true);
    setGlobalLoading(true);

    try {
      await login(email, password);
      showToast('Login successful', 'success');
    } catch (err: any) {
      if (err.message === 'Account restricted') {
        setRestrictionMessage('Your account has been restricted. Please contact support for more information.');
        showToast('Account restricted', 'warning');
      } else {
        setError(err.message || 'Invalid email or password. Please try again.');
        showToast(err.message || 'Login failed', 'error');
      }
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo} onClick={() => router.push('/')}>
            <FiShield size={32} />
            <h1>Swift Trust</h1>
          </div>
          <p>Sign in to your premium banking portal</p>
        </div>

        {restrictionMessage && (
          <div className={styles.restrictionBox}>
            <FiAlertCircle size={24} />
            <div>
              <h3>Account Restricted</h3>
              <p>{restrictionMessage}</p>
            </div>
          </div>
        )}

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <div className={styles.inputWrapper}>
              <FiMail className={styles.inputIcon} />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className={styles.forgotBtn}
                onClick={() => router.push('/forgot-password')}
              >
                Forgot Password?
              </button>
            </div>
            <div className={styles.inputWrapper}>
              <FiLock className={styles.inputIcon} />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            New to Swift Trust?{' '}
            <button className={styles.linkBtn} onClick={() => router.push('/signup')}>
              Open an Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
