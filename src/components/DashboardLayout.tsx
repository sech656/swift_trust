'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { FiHome, FiSend, FiClock, FiSettings, FiLogOut, FiMenu, FiX, FiHelpCircle, FiSun, FiMoon, FiCreditCard } from 'react-icons/fi';
import { useState } from 'react';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useUI();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigation = [
    { name: 'Home', href: '/dashboard', icon: FiHome },
    { name: 'Move Money', href: '/dashboard/move-money', icon: FiSend },
    { name: 'Cards', href: '/dashboard/cards', icon: FiCreditCard },
    { name: 'Transactions', href: '/dashboard/transactions', icon: FiClock },
    { name: 'Settings', href: '/dashboard/settings', icon: FiSettings },
  ];

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className={styles.layout}>
      {showLogoutConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Log Out?</h3>
            <p>Are you sure you want to end your session?</p>
            <div className={styles.modalActions}>
              <button className="btn btn-secondary" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmLogout}>Log Out</button>
            </div>
          </div>
        </div>
      )}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo} onClick={() => router.push('/dashboard')}>Swift Trust</h1>
          <div className={styles.headerActions}>
            <button className={styles.themeToggle} onClick={toggleTheme}>
              {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>
            <div className={styles.userBadge} onClick={() => router.push('/dashboard/settings')}>
              {user?.firstName?.charAt(0)}
            </div>
            <button className={styles.logoutBtnHeader} onClick={handleLogout} title="Logout">
              <FiLogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/dashboard' 
                ? pathname === '/dashboard' 
                : pathname.startsWith(item.href);
              return (
                <button
                  key={item.name}
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                  onClick={() => router.push(item.href)}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </button>
              );
            })}
            <button className={styles.navItem} onClick={handleLogout}>
              <FiLogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        <main className={styles.main}>{children}</main>

        <nav className={styles.mobileNav}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard' 
              : pathname.startsWith(item.href);
            return (
              <button
                key={item.name}
                className={`${styles.mobileNavItem} ${isActive ? styles.mobileNavItemActive : ''}`}
                onClick={() => router.push(item.href)}
              >
                <Icon size={24} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
