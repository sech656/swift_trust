'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { FiShield, FiUser, FiMail, FiPhone, FiLock, FiMapPin, FiGlobe } from 'react-icons/fi';
import styles from './signup.module.css';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();
  const { showToast, setLoading: setGlobalLoading } = useUI();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      showToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      showToast('Password too short', 'error');
      return;
    }

    setLoading(true);
    setGlobalLoading(true);

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      });
      showToast('Account created successfully', 'success');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
      showToast(err.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.signupCard}>
        <div className={styles.header}>
          <div className={styles.logo} onClick={() => router.push('/')}>
            <FiShield size={32} />
            <h1>Swift Trust</h1>
          </div>
          <p>Open your premium account in minutes</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">First Name</label>
              <div className={styles.inputWrapper}>
                <FiUser className={styles.inputIcon} />
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="John"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName">Last Name</label>
              <div className={styles.inputWrapper}>
                <FiUser className={styles.inputIcon} />
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                />
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <div className={styles.inputWrapper}>
              <FiMail className={styles.inputIcon} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">Phone Number</label>
            <div className={styles.inputWrapper}>
              <FiPhone className={styles.inputIcon} />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="(555) 000-0000"
              />
            </div>
          </div>

          <div className={styles.sectionHeader}>
            <h3>Mailing Address</h3>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address">Street Address</label>
            <div className={styles.inputWrapper}>
              <FiMapPin className={styles.inputIcon} />
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="123 Madison Ave"
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="city">City</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="New York"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="state">State / Province</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder="NY"
                />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="zipCode">Zip / Postal Code</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                  placeholder="10022"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="country">Country</label>
              <div className={styles.inputWrapper}>
                <FiGlobe className={styles.inputIcon} />
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  placeholder="United States"
                />
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Create Password</label>
            <div className={styles.inputWrapper}>
              <FiLock className={styles.inputIcon} />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className={styles.inputWrapper}>
              <FiLock className={styles.inputIcon} />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating Account...' : 'Open Account'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Already have an account?{' '}
            <button className={styles.linkBtn} onClick={() => router.push('/login')}>
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
