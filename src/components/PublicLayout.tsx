'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiShield, FiMoon, FiSun } from 'react-icons/fi';
import { useUI } from '@/contexts/UIContext';
import { useAuth } from '@/contexts/AuthContext';
import styles from './PublicLayout.module.css';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { theme, toggleTheme } = useUI();
  const { user, isAuthenticated } = useAuth();

  return (
    <div className={styles.publicLayout}>
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => router.push('/')}>
          <div className={styles.logoIcon}><FiShield size={24} /></div>
          <h1>Swift Trust</h1>
        </div>
        <nav className={styles.nav}>
          <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          </button>
          {isAuthenticated ? (
            <div className={styles.navActions}>
              <div className={styles.userBadge} onClick={() => router.push(user?.isAdmin ? '/admin' : '/dashboard/settings')}>
                {user?.firstName?.charAt(0)}
              </div>
              <button className={styles.navBtn} onClick={() => router.push(user?.isAdmin ? '/admin' : '/dashboard')}>Dashboard</button>
            </div>
          ) : (
            <>
              <button className={styles.navBtn} onClick={() => router.push('/login')}>Log In</button>
              <button className={`${styles.navBtn} ${styles.navBtnPrimary}`} onClick={() => router.push('/signup')}>Open Account</button>
            </>
          )}
        </nav>
      </header>

      <main style={{ paddingTop: '80px' }}>
        {children}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <div className={styles.logo} onClick={() => router.push('/')}>
              <FiShield size={24} style={{ color: 'var(--primary-deep-blue)' }} />
              <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary-deep-blue)' }}>Swift Trust</span>
            </div>
            <p>527 Madison Ave #4, New York, NY 10022</p>
          </div>
          <div className={styles.footerLinks}>
            <div>
              <h5>Personal</h5>
              <ul>
                <li onClick={() => router.push('/signup')}>Checking</li>
                <li onClick={() => router.push('/signup')}>Savings</li>
                <li onClick={() => router.push('/signup')}>Cards</li>
              </ul>
            </div>
            <div>
              <h5>Business</h5>
              <ul>
                <li onClick={() => router.push('/signup')}>Corporate</li>
                <li onClick={() => router.push('/signup')}>Small Business</li>
                <li onClick={() => router.push('/signup')}>Loans</li>
              </ul>
            </div>
            <div>
              <h5>Support</h5>
              <ul>
                <li onClick={() => router.push('/help')}>Help Center</li>
                <li onClick={() => router.push('/contact')}>Contact Us</li>
                <li onClick={() => router.push('/security')}>Security</li>
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2026 Swift Trust Bank. All rights reserved.</p>
          <div className={styles.legalLinks}>
            <span onClick={() => router.push('/privacy')}>Privacy Policy</span>
            <span onClick={() => router.push('/terms')}>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
