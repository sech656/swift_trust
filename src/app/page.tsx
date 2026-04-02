'use client';

import { useRouter } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import { 
  FiShield, FiZap, FiSmartphone, FiArrowRight, 
  FiCreditCard, FiLock, FiStar, FiActivity, FiLayers, 
  FiSmartphone as FiPhone, FiCheckCircle, FiGlobe
} from 'react-icons/fi';
import styles from './page.module.css';

export default function LandingPage() {
  const router = useRouter();

  return (
    <PublicLayout>
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={`${styles.hero} py-3xl`}>
          <div className={styles.heroContent}>
          
            <h2 className={styles.heroTitle}>The Future of Premium Banking</h2>
            <p className={styles.heroSubtitle}>
              Experience a new standard in financial services. Swift Trust provides secure, fast, and sophisticated banking solutions for the modern world.
            </p>
            <div className={styles.cta}>
              <button className={styles.heroBtn} onClick={() => router.push('/signup')}>
                Get Started <FiArrowRight />
              </button>
              <button className={styles.heroBtnSecondary} onClick={() => router.push('/login')}>
                Welcome Back
              </button>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <strong>2M+</strong>
                <span>Active Users</span>
              </div>
              <div className={styles.stat}>
                <strong>$40B+</strong>
                <span>Assets Managed</span>
              </div>
              <div className={styles.stat}>
                <strong>150+</strong>
                <span>Countries</span>
              </div>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.cardPreview}>
              <div className={styles.cardHeader}>
                <FiShield size={32} />
                <span>Swift Trust Premium</span>
              </div>
              <div className={styles.cardNumber}>•••• •••• •••• 8888</div>
              <div className={styles.cardFooter}>
                <div className={styles.cardHolder}>
                  <span>CARD HOLDER</span>
                  <p>VALUED MEMBER</p>
                </div>
                <div className={styles.cardExpiry}>
                  <span>EXPIRES</span>
                  <p>12/30</p>
                </div>
              </div>
            </div>
       
          </div>
        </section>

        {/* Features Grid */}
        <section className={`${styles.features} py-2xl px-xl`}>
          <div className={styles.sectionHeader}>
            <h3>Why Swift Trust?</h3>
            <p>Elevating your banking experience with cutting-edge technology</p>
          </div>
          <div className={styles.featuresGrid}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}><FiZap size={24} /></div>
              <h4>Instant Transfers</h4>
              <p>Send and receive funds globally in seconds with our optimized network.</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}><FiSmartphone size={24} /></div>
              <h4>Mobile First</h4>
              <p>Full-featured banking in the palm of your hand, anytime, anywhere.</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}><FiShield size={24} /></div>
              <h4>Military-Grade Security</h4>
              <p>Your assets are protected by industry-leading encryption and protocols.</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}><FiGlobe size={24} /></div>
              <h4>Global Access</h4>
              <p>Manage multiple currencies and international accounts with ease.</p>
            </div>
          </div>
        </section>

        {/* Visual Section - Sophisticated Tools */}
        <section className={`${styles.imageSection} py-2xl`}>
          <div className={styles.splitContent}>
            <div className={styles.textContent}>
              <div className={styles.iconBox}><FiCreditCard size={32} /></div>
              <h3>Sophisticated Financial Tools</h3>
              <p>From advanced budgeting to seamless international wire transfers, Swift Trust puts the power of a global bank in your pocket.</p>
              <ul className={styles.checkList}>
                <li><FiCheckCircle /> Virtual card generation</li>
                <li><FiCheckCircle /> Real-time transaction alerts</li>
                <li><FiCheckCircle /> Multi-currency support</li>
                <li><FiCheckCircle /> Crypto asset management</li>
              </ul>
            </div>
            <div className={styles.visualContent}>
              <div className={styles.appMockup}>
                <div className={styles.mockupHeader}>
                  <span>Balance</span>
                  <strong>$124,500.00</strong>
                </div>
                <div className={styles.mockupChart}>
                  <div className={styles.bar} style={{height: '40%'}}></div>
                  <div className={styles.bar} style={{height: '60%'}}></div>
                  <div className={styles.bar} style={{height: '80%'}}></div>
                  <div className={styles.bar} style={{height: '50%'}}></div>
                  <div className={styles.bar} style={{height: '90%'}}></div>
                </div>
                <div className={styles.mockupList}>
                  <div className={styles.mockupItem}></div>
                  <div className={styles.mockupItem}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className={`${styles.securitySection} py-2xl px-xl`}>
          <div className={styles.securityGrid}>
            <div className={styles.securityVisual}>
              <div className={styles.shieldLg}>
                <FiLock size={120} />
              </div>
              <div className={styles.securityPulse}></div>
            </div>
            <div className={styles.securityContent}>
              <h3>Your Security is Our Priority</h3>
              <p>We use the same encryption standards as the military and major global institutions. Your data and assets are safe with us.</p>
              <div className={styles.securityFeatures}>
                <div className={styles.sItem}>
                  <FiLayers />
                  <div>
                    <h5>Multi-Layer Auth</h5>
                    <p>Biometrics and hardware key support.</p>
                  </div>
                </div>
                <div className={styles.sItem}>
                  <FiActivity />
                  <div>
                    <h5>AI Fraud Detection</h5>
                    <p>24/7 automated monitoring of transactions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile App CTA */}
        <section className={`${styles.mobileCta} py-2xl`}>
          <div className={styles.ctaBox}>
            <div className={styles.ctaText}>
              <h3>Banking anywhere, anytime.</h3>
              <p>Download our mobile app for the best Swift Trust experience.</p>
              <div className={styles.appBtns}>
                <button className={styles.appBtn}>App Store</button>
                <button className={styles.appBtn}>Play Store</button>
              </div>
            </div>
            <div className={styles.ctaVisual}>
              <FiPhone size={200} className={styles.phoneIcon} />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className={`${styles.finalCta} py-2xl text-center`}>
          <h2>Ready to experience the future?</h2>
          <p>Join millions of satisfied customers today.</p>
          <button className={styles.heroBtn} onClick={() => router.push('/signup')}>
            Open Account Now <FiArrowRight />
          </button>
        </section>
      </main>
    </PublicLayout>
  );
}
