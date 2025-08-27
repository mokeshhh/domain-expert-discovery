import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './About.css';

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: i => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.4, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function About() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="about-container">
      
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        custom={0}
        className="hero-section"
      >
        <h1 className="hero-title">🚀 Revolutionizing Expert Discovery</h1>
        <p className="hero-subtext">
          Connect with domain experts scraped from trusted sources instantly. Built by passionate students for a smarter future.
        </p>
        <button 
          className="hero-btn"
          onClick={() => (window.location.href = '/experts')}
        >
          🔍 Discover Experts Now
        </button>
      </motion.section>

      {/* Problem Statement & Solution */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        custom={1}
        className="problem-section"
      >
        <h2 className="problem-heading">🎯 The Challenge We're Solving</h2>
        <div className="problem-grid">
          <div>
            <h3 className="problem-title">❌ The Problem</h3>
            <ul>
              <li>Finding credible experts takes weeks</li>
              <li>No verified professional profiles</li>
              <li>Limited networking opportunities</li>
              <li>Complex hiring processes</li>
            </ul>
          </div>
          <div>
            <h3 className="solution-title">✅ Our Solution</h3>
            <ul>
              <li>Find experts in under 2 minutes</li>
              <li>Experts scraped from trusted sources</li>
              <li>Direct communication channels</li>
              <li>Smart matching algorithms</li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* Our Journey as Students */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        custom={2}
        className="journey-section"
      >
        <div className="timeline">
          <div className="timeline-box purple">
            <div className="timeline-dot purple"></div>
            <p><strong>💡 June 2025 - Ideation:</strong> Born from our struggle to find mentors and project guides during college.</p>
          </div>
          <div className="timeline-box violet">
            <div className="timeline-dot violet"></div>
            <p><strong>⚡ July 2025 - Development:</strong> Late nights, endless code reviews, and turning caffeine into features.</p>
          </div>
          <div className="timeline-box purple">
            <div className="timeline-dot purple"></div>
            <p><strong>🎉 August 2025 - Launch:</strong> Successfully deployed our vision as a working platform!</p>
          </div>
        </div>
        <div className="journey-story">
          <h2 className="journey-title">Our Student Journey</h2>
          <p>
            As Engineering students, we experienced firsthand the difficulty of finding the right experts for guidance, projects, and career advice. This inspired us to create a platform that eliminates these barriers.
          </p>
          <p>
            Our vision: <em>"Making expertise accessible to everyone, everywhere, at any time."</em>
          </p>
        </div>
      </motion.section>

      {/* Team Spotlight */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        custom={3}
        className="team-section"
      >
        <h2 className="team-title">👨‍💻 Meet the Dream Team</h2>
        <p className="team-subtext">Four passionate students who turned their frustration into innovation</p>
        <div className="team-grid">
          {[
            { name: 'Mokesh G R', role: 'Founder & Full Stack Developer', img: '/assets/3d-glasses_4845146.png', specialty: 'React & Node.js Expert' },
            { name: 'Nagarjun K S', role: 'Lead Backend Engineer', img: '/assets/astronaut_2193406.png', specialty: 'Database & API Architect' },
            { name: 'Sachin S K', role: 'Frontend Developer', img: '/assets/disc-jockey_432509.png', specialty: 'UI/UX & Animations' },
            { name: 'P C Tejas', role: 'Product Manager', img: '/assets/astronaut_2193406.png', specialty: 'Strategy & User Research' },
          ].map(({ name, role, img, specialty }) => (
            <div key={name} className="team-card" title={`${name}, ${role}`}>
              <img src={img} alt={name} className="team-img" loading="lazy" />
              <h3>{name}</h3>
              <p className="team-role"> <em> {role}</em></p>
              <p className="team-specialty">{specialty}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Why Choose Us */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        custom={3}
        className="features-section"
      >
        <h2 className="features-title">🌟 Why Choose Domain Expert Discovery?</h2>
        <div className="features-grid">
          {[
            { icon: '⚡', title: 'Lightning Fast', desc: 'Find experts in under 2 minutes with our smart search.' },
            { icon: '🛡', title: 'Scraped Data', desc: 'Experts collected from trusted sources — no manual verification.' },
            { icon: '🎯', title: 'Perfect Matches', desc: 'AI-powered recommendations for your exact needs.' },
            { icon: '📱', title: 'Mobile First', desc: 'Seamless experience across all devices.' },
          ].map(({ icon, title, desc }) => (
            <div 
              key={title} 
              className="feature-card"
            >
              <div className="feature-icon">{icon}</div>
              <h3 className="feature-title-card">{title}</h3>
              <p className="feature-desc">{desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Success Metrics */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        custom={4}
        className="metrics-section"
      >
        <h2 className="metrics-title">🚀 Growing Fast, Growing Strong</h2>
        <div className="metrics-grid">
          {[
            { label: 'Active Users', value: '1,000+', growth: '+150% this month' },
            { label: 'Scraped Experts', value: '500+', growth: '+200% this month' },
            { label: 'Successful Matches', value: '250+', growth: '+180% this month' },
          ].map(({ label, value, growth }) => (
            <div key={label} className="metrics-card">
              <div className="metrics-value">{value}</div>
              <div className="metrics-label">{label}</div>
              <div className="metrics-growth">{growth}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Future Vision */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        custom={5}
        className="roadmap-section"
      >
        <h2 className="roadmap-title">🔮 What's Next?</h2>
        <div className="roadmap-grid">
          {[
            { quarter: 'Q3 2025', milestone: '📱 Mobile App Launch', desc: 'Native iOS & Android apps' },
            { quarter: 'Q4 2025', milestone: '🤖 AI Recommendations', desc: 'Smart expert matching' },
            { quarter: 'Q1 2026', milestone: '🌐 Global Expansion', desc: 'International partnerships' },
            { quarter: 'Q2 2026', milestone: '💼 Enterprise Suite', desc: 'Corporate solutions' },
          ].map(({ quarter, milestone, desc }) => (
            <div key={quarter} className="roadmap-card">
              <h3 className="roadmap-quarter">{quarter}</h3>
              <h4 className="roadmap-milestone">{milestone}</h4>
              <p className="roadmap-desc">{desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        custom={7}
        className="cta"
      >
        <h2 className="cta-title">🚀 Join the Revolution</h2>
        <p className="cta-subtext">
          Be part of something bigger. Connect, collaborate, and create the future together.
        </p>
        <div className="cta-buttons">
          <button 
            className="cta-btn"
            onClick={() => (window.location.href = '/experts')}
          >
            🎯 Find Your Expert
          </button>
          <button
            className={`cta-btn-outline ${isHovered ? 'hovered' : ''}`}
            onClick={isHovered ? undefined : () => (window.location.href = '/experts')}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={isHovered}
          >
            {isHovered ? 'Contact Us' : '💼 Become an Expert'}
          </button>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="footer"
      >
        <p>
          <strong>© {new Date().getFullYear()} Domain Expert Discovery</strong> - Built with ❤️ by passionate students
        </p>
        <p>
          📧 <a href="mailto:email@gmail.com">email@gmail.com</a> | 📞 <a href="tel:+91996476xxxx">+91 996476xxxx</a>
        </p>
        <p className="footer-quote">
          "Connecting minds, creating futures - one expert at a time"
        </p>
      </motion.footer>
    </div>
  );
}
