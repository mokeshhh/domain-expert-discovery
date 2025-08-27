import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import FadeInSection from '../animations/FadeInSection';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL;

function TopRightAuthBar() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 30,
        zIndex: 1000,
        display: 'flex',
        gap: '12px',
      }}
    >
      {/* Add login/logout/profile links here */}
    </div>
  );
}

function capitalizeWords(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

export default function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [recommendedExperts, setRecommendedExperts] = useState([]);
  const [trendingExperts, setTrendingExperts] = useState([]);
  const [trendingDomains, setTrendingDomains] = useState([]);
  const [featuredExpert, setFeaturedExpert] = useState(null);
  const [filterDomain, setFilterDomain] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Static testimonials data always present for UI
  const testimonials = [
    { id: 1, name: 'Ashwini Patil', comment: 'Great platform, found my dream expert!' },
    { id: 2, name: 'Rahul Singh', comment: 'Experts here are top-notch and responsive.' }
  ];

  useEffect(() => {
    async function fetchRecommendationsAndRandoms() {
      if (!user?.email) {
        setRecommendedExperts([]);
        return;
      }
      try {
        // Fetch recent searches and get recommendations based on them
        const recentRes = await fetch(`${API_URL}/api/auth/recent-searches?email=${encodeURIComponent(user.email)}`);
        const recentData = await recentRes.json();
        const searches = Array.isArray(recentData?.recentSearches) ? recentData.recentSearches : [];
        const latestSearchArr = searches.length > 0 ? [searches[0]] : [];

        const recommendRes = await fetch(`${API_URL}/api/experts/recommendations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recentSearches: latestSearchArr }),
        });
        const recommendData = await recommendRes.json();
        const recommended = Array.isArray(recommendData?.experts) ? recommendData.experts.slice(0, 3) : [];

        // Fetch random experts excluding recommended ones
        const randomRes = await fetch(`${API_URL}/api/experts`);
        const allExperts = await randomRes.json();
        const shownIds = new Set(recommended.map(e => e._id ?? e.id));
        const randoms = allExperts
          .filter(e => !shownIds.has(e._id ?? e.id))
          .sort(() => Math.random() - 0.5)
          .slice(0, 2);

        setRecommendedExperts([...recommended, ...randoms]);
      } catch (e) {
        setRecommendedExperts([]);
      }
    }
    fetchRecommendationsAndRandoms();
  }, [user]);

  useEffect(() => {
    fetch(`${API_URL}/api/experts`)
      .then(res => res.json())
      .then(data => {
        const experts = Array.isArray(data) ? [...data] : [];
        for (let i = experts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [experts[i], experts[j]] = [experts[j], experts[i]];
        }
        setTrendingExperts(experts.slice(0, 10));
      })
      .catch(() => setTrendingExperts([]));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/domains/trending`)
      .then(res => res.json())
      .then(data => setTrendingDomains(Array.isArray(data) ? data : []))
      .catch(() => setTrendingDomains([]));
  }, []);

  useEffect(() => {
    if (recommendedExperts.length > 0) {
      setFeaturedExpert(recommendedExperts[0]);
    } else {
      setFeaturedExpert(null);
    }
  }, [recommendedExperts]);

  useEffect(() => {
    if (trendingExperts.length < 3) return;
    const interval = setInterval(() => {
      setCarouselIndex(i => (i + 1) % trendingExperts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [trendingExperts]);

  const handleSearchSubmit = e => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/experts?query=${encodeURIComponent(search.trim())}`);
  };

  const onFilterChipClick = domain => {
    setFilterDomain(domain);
    setSearch(domain);
    navigate(`/experts?query=${encodeURIComponent(domain)}`);
  };

  return (
    <>
      <TopRightAuthBar />
      <div className={styles.page}>
        {/* Hero Section */}
        <FadeInSection>
          <section className={styles.hero}>
            <div className={styles.heroLeft}>
              {/* Animated Headline with Sequential Lines */}
              <motion.div>
                {["Find Expert Talent", "Across Domains"].map((line, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.8, type: "spring", stiffness: 80, damping: 15 }}
                    style={{ overflow: "hidden", marginBottom: "0em" }}
                  >
                    <motion.span
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.8 + 0.4, type: "spring", stiffness: 100, damping: 18 }}
                      className={idx === 0 ? styles.titleMain : styles.titleAccent}
                      style={{ display: "inline-block", fontSize: "3rem", fontWeight: "900", letterSpacing: "0.01em" }}
                    >
                      {line}
                    </motion.span>
                  </motion.div>
                ))}
                <motion.div
                  className={styles.gradientUnderline}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.8, duration: 0.95, ease: "easeOut" }}
                />
                <div className={styles.underlineBase} />
              </motion.div>

              <motion.p
                className={styles.heroSubtitle}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 0.6, ease: "easeOut" }}
                style={{ maxWidth: 640, marginTop: 10, fontSize: '1.1rem' }}
              >
                Search, filter, and connect with top verified experts in minutes, not weeks.
              </motion.p>

              <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                <input className={styles.searchInput} type="text" placeholder="Search for experts, domains..." value={search} onChange={e => setSearch(e.target.value)} />
                <button type="submit" className={styles.searchButton}>🔍</button>
              </form>
              <div className={styles.quickFilters}>
                {['AI', 'Frontend', 'Data Scientist', 'DevOps', 'UI/UX'].map(domain => (
                  <button
                    key={domain}
                    className={`${styles.filterChip} ${filterDomain === domain ? styles.activeChip : ''}`}
                    onClick={() => onFilterChipClick(domain)}
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>
            {/* image */}
            <motion.div
              className={styles.heroRight}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className={styles.heroImageContainer}>
                <motion.img
                  src="/illustrations/hero-illustration.svg"
                  alt="Hero Illustration"
                  className={styles.heroImg}
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 1, 0]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <div className={styles.floatingElements}>
                  <motion.div
                    className={styles.floatingElement}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: 0
                    }}
                  >
                    💼
                  </motion.div>
                  <motion.div
                    className={styles.floatingElement}
                    animate={{
                      y: [0, -15, 0],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: 1
                    }}
                  >
                    🚀
                  </motion.div>
                  <motion.div
                    className={styles.floatingElement}
                    animate={{
                      y: [0, -25, 0],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      delay: 2
                    }}
                  >
                    ⭐
                  </motion.div>
                </div>
              </div>
            </motion.div>

          </section>
        </FadeInSection>

        {/* Show 3D video when logged out */}
        {!user && (
          <FadeInSection>
            <section className={styles.videoSection}>
              <h2 className={styles.sectionTitle}>"Finding the Right Expert: Watch the Conversation"</h2>
              <div className={styles.videoWrapper}>
                <video width="100%" controls style={{ borderRadius: 10, background: '#000' }}>
                  <source src="/videos/MyPlotagonMovie.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </section>
          </FadeInSection>
        )}

        {/* Featured Expert + Video when logged in */}
        {user && featuredExpert && (
          <FadeInSection>
            <section className={styles.featuredExpertSection}>
              <div className={styles.columns}>
                <div>
                  <h2 className={styles.sectionTitle}>Featured Expert</h2>
                  <div className={styles.featuredCard}>
                    <img src={featuredExpert.avatar} alt={featuredExpert.name} className={styles.avatarLarge} />
                    <div>
                      <h3>{featuredExpert.name}</h3>
                      <p><strong>Domain:</strong> {featuredExpert.domain}</p>
                      <p><strong>Location:</strong> {featuredExpert.location}</p>
                      <p>{featuredExpert.bio || 'Expert in their domain.'}</p>
                      <button className={styles.viewProfileButton} onClick={() => navigate(`/experts/${featuredExpert._id ?? featuredExpert.id}`)} style={{ cursor: 'pointer' }} title={`View ${featuredExpert.name}`}>
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
                <div className={styles.videoColumn}>
                  <h2 className={styles.sectionLogin}>"Finding the Right Expert: Watch the Conversation"</h2>
                  <div className={styles.videoLogin}>
                    <video width="100%" controls style={{ borderRadius: 10, background: '#000' }}>
                      <source src="/videos/MyPlotagonMovie.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </div>
            </section>
          </FadeInSection>
        )}

        {/* Recommended Experts */}
        {user && (
          <FadeInSection>
            <section className={styles.recommended}>
              <div style={{ fontSize: '1.3rem' }}>
                <b>Recommended Experts</b>
              </div>

              {/* Animated center-expand gradient line */}
              <motion.div
                className={styles.recommendLine}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ transformOrigin: 'center' }}
              />

              <div className={styles.expertsGrid}>
                {recommendedExperts.map(exp => (
                  <div
                    key={exp._id ?? exp.id}
                    className={styles.expertCard}
                    onClick={() => navigate(`/experts/${exp._id ?? exp.id}`)}
                    style={{ cursor: 'pointer' }}
                    title={`View ${exp.name}`}
                  >
                    {exp.avatar ? (
                      <img src={exp.avatar} alt={exp.name} className={styles.avatarMedium} />
                    ) : (
                      <div className={`${styles.avatarMedium} ${styles.initialsCircle}`}>
                        {exp.name?.[0] || '?'}
                      </div>
                    )}
                    <div className={styles.expertInfo}>
                      <div className={styles.nameRow}>
                        <span className={styles.expertName}>{exp.name}</span>
                        <span className={styles.domainBadge}>{capitalizeWords(exp.domain)}</span>
                      </div>
                      <div className={styles.locationRow}>{exp.location}</div>
                    </div>

                    {exp.linkedin_url && (
                      <a
                        href={exp.linkedin_url}
                        className={styles.linkedinLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="LinkedIn"
                        onClick={e => e.stopPropagation()}
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </FadeInSection>
        )}

        {/* Trending Domains */}
        <FadeInSection>
          <motion.section className={styles.trendingSection}>
            <motion.h2
              className={styles.sectionTitle}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className={styles.titleIcon}>🔥</span>
              Trending Domains
            </motion.h2>
            <motion.div
              className={styles.domainsContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className={styles.slider}
                drag="x"
                dragConstraints={{ left: -200, right: 0 }}
              >
                {trendingDomains.map((domain, index) => (
                  <motion.div
                    key={domain.id ?? domain.name}
                    className={styles.domainCard}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span
                      className={styles.domainIcon}
                      animate={{ rotate: [0, 100, -100, 0] }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                    >
                      {domain.icon}
                    </motion.span>
                    <span className={styles.domainName}>{domain.name}</span>

                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.section>
        </FadeInSection>

        {/* Trending Experts */}
        <FadeInSection>
          <section className={styles.trendingExpertsSection}>
            <h2><b>Trending Experts</b></h2>
            <div className={styles.trendingGrid}>
              {[0, 1, 2].map((offset, idx) => {
                const expert = trendingExperts[(carouselIndex + offset) % trendingExperts.length];
                return expert ? (
                  <div
                    key={expert._id ?? expert.id}
                    className={`${styles.trendingExpertCard} ${idx === 1 ? styles.highlightedCard : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/experts/${expert._id ?? expert.id}`)}
                    title={`View ${expert.name}`}
                  >
                    {expert.avatar ? <img src={expert.avatar} alt={expert.name} className={styles.avatarMedium} /> : <div className={`${styles.avatarMedium} ${styles.initialsCircle}`}>{expert.name?.[0] || '?'}</div>}
                    <div>
                      <div className={styles.expertName}>{expert.name}</div>
                      <div className={styles.expertDomain}>{expert.domain}</div>
                      {idx === 1 && (
                        <div className={styles.trendingBadge}>
                          <span className={styles.trendingIcon}>🔥</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </section>
        </FadeInSection>

        {/* What Our Users Say - Testimonials */}
        <FadeInSection>
          <section className={styles.testimonials}>
            <div style={{ fontSize: '1.3rem' }}><b>What Our Users Say</b></div>
            <div className={styles.testimonialGrid}>
              {testimonials.map(t => (
                <div key={t.id} className={styles.testimonialCard}>
                  <p>"{t.comment}"</p>
                  <footer className={styles.testimonialAuthor}>- {t.name}</footer>
                </div>
              ))}
            </div>
          </section>
        </FadeInSection>

        {/* Request Help Button */}
        <FadeInSection>
          <section className={styles.requestSection}>
            <button className={styles.requestButton} onClick={() => alert('Request feature coming soon!')}>
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ display: 'inline-block', marginRight: '8px' }}
              >
                🚀
              </motion.span>
              Can’t find your expert? Request help
            </button>
          </section>
        </FadeInSection>
      </div>
    </>
  );
}
