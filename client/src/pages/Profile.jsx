import React, { useEffect, useState } from 'react';
import AvatarSelector from "../components/AvatarSelector";
import { FaPen } from 'react-icons/fa';

// Helper component for displaying info
const ProfileDisplay = ({ label, value }) => (
  <div style={{ marginBottom: 10, fontWeight: '600', color: '#374151', fontSize: '1.3rem' }}>
    <span style={{ color: '#6b7280' }}>{label}: </span>
    <span>{value || '—'}</span>
  </div>
);

// Editable input line
function EditableInput({ name, value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const save = () => {
    let val = tempValue.trim();
    // Add https:// if missing for social links except phone
    if (name !== 'phone' && val && !/^https?:\/\//i.test(val)) {
      val = 'https://' + val;
    }
    onChange(val);
    setEditing(false);
  };

  return (
    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <strong style={{ textTransform: 'capitalize', color: '#4b5563', flexBasis: '30%' }}>{name}</strong>
      {editing ? (
        <input
          type={name === 'phone' ? 'tel' : 'url'}
          value={tempValue}
          onChange={e => setTempValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); save(); }}}
          onBlur={save}
          autoFocus
          style={{
            flexGrow: 1,
            padding: 6,
            fontSize: '1rem',
            borderRadius: 4,
            border: '1px solid #6366f1',
            outline: 'none',
          }}
        />
      ) : (
        <>
          <a
            href={name === 'phone' ? undefined : value}
            target={name === 'phone' ? undefined : '_blank'}
            rel={name === 'phone' ? undefined : 'noopener noreferrer'}
            style={{
              flexGrow: 1,
              marginRight: 10,
              wordBreak: 'break-word',
              color: value ? '#2563eb' : '#9caaf4',
              fontWeight: value ? '500' : 'normal',
              textDecoration: value ? 'underline' : 'none',
            }}
          >
            {value || `Add your ${name}`}
          </a>
          <FaPen
            onClick={() => setEditing(true)}
            size={18}
            style={{ cursor: 'pointer', color: '#6366f1' }}
            title={`Edit ${name}`}
          />
        </>
      )}
    </div>
  );
}

// Skill tag
function SkillTag({ skill, onRemove }) {
  return (
    <span
      onClick={onRemove}
      title="Click to remove"
      style={{
        display: 'inline-block',
        backgroundColor: '#c7d2fe',
        color: '#373a31',
        borderRadius: 20,
        padding: '5px 12px',
        marginRight: 8,
        marginBottom: 8,
        cursor: 'pointer',
        userSelect: 'none',
        fontWeight: 500,
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#a471f7')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#c7d2fe')}
    >
      {skill} &times;
    </span>
  );
}

export default function Profile() {
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [avatar, setAvatar] = useState(null);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');

  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [contactVisible, setContactVisible] = useState(true);

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    setUserInfo({
      name: localStorage.getItem('name') || '',
      email: localStorage.getItem('email') || '',
    });
    setAvatar(localStorage.getItem('avatar') || null);
    setLinkedin(localStorage.getItem('linkedin') || '');
    setGithub(localStorage.getItem('github') || '');
    setTwitter(localStorage.getItem('twitter') || '');
    setWebsite(localStorage.getItem('website') || '');
    setPhone(localStorage.getItem('phone') || '');
    setLocation(localStorage.getItem('location') || '');
    setContactVisible(localStorage.getItem('contactVisible') !== 'false');
    setSkills(JSON.parse(localStorage.getItem('skills') || '[]'));
  }, []);

  const handleAvatarSelect = (avatarUrl) => {
    setAvatar(avatarUrl);
    localStorage.setItem('avatar', avatarUrl);
    setShowAvatarSelector(false);
  };

  const saveSocialLink = (key, val) => {
    const map = { linkedin: setLinkedin, github: setGithub, twitter: setTwitter, website: setWebsite };
    if (map[key]) {
      map[key](val);
      localStorage.setItem(key, val);
    }
  };

  const savePhone = (val) => {
    setPhone(val);
    localStorage.setItem('phone', val);
  };

  const saveLocation = (val) => {
    setLocation(val);
    localStorage.setItem('location', val);
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      const updated = [...skills, trimmed];
      setSkills(updated);
      localStorage.setItem('skills', JSON.stringify(updated));
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    const updated = skills.filter(s => s !== skill);
    setSkills(updated);
    localStorage.setItem('skills', JSON.stringify(updated));
  };

  const containerStyle = {
    maxWidth: 900,
    margin: '2rem auto',
    padding: '1.5rem',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  };

  const topSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    marginBottom: 32,
  };

  const avatarWrapperStyle = {
    position: 'relative',
    width: 160,
    minHeight: 160,
  };

  const penIconStyle = {
    position: 'absolute',
    top: 6,
    right: 6,
    cursor: 'pointer',
    backgroundColor: 'white',
    borderRadius: '50%',
    padding: 6,
    boxShadow: '0 0 6px rgba(0,0,0,0.15)',
    color: '#6366f1',
    zIndex: 10,
  };

  const infoColumnStyle = {
    minWidth: 250,
    textAlign: 'left',
  };

  const sectionStyle = {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  };

  return (
    <div style={containerStyle}>
      <div style={topSectionStyle}>
        <div style={avatarWrapperStyle}>
          {avatar ? (
            <img
              src={avatar}
              alt="avatar"
              style={{
                width: '100%',
                height: 160,
                borderRadius: '50%',
                objectFit: 'cover',
                backgroundColor: '#eee',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: 160,
                backgroundColor: '#c7cbd2',
                borderRadius: '50%',
              }}
            />
          )}
          <FaPen
            onClick={() => setShowAvatarSelector(!showAvatarSelector)}
            size={22}
            style={penIconStyle}
            title="Edit avatar"
          />
          {showAvatarSelector && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'white',
                padding: 15,
                borderRadius: 10,
                boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                zIndex: 20,
              }}
            >
              <AvatarSelector selectedAvatar={avatar} onSelect={handleAvatarSelect} />
            </div>
          )}
        </div>
        <div style={infoColumnStyle}>
          <ProfileDisplay label="Name" value={userInfo.name} />
          <ProfileDisplay label="Email" value={userInfo.email} />
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: 'auto' }}>
        <div style={sectionStyle}>
          <h3>Social Media Links</h3>
          {['linkedin', 'github', 'twitter', 'website'].map((key) => (
            <EditableInput
              key={key}
              name={key}
              value={{ linkedin, github, twitter, website }[key] || ''}
              onChange={(val) => saveSocialLink(key, val)}
            />
          ))}
        </div>

        <div style={sectionStyle}>
          <h3>Contact Information</h3>
          <EditableInput name="phone" value={phone} onChange={savePhone} />
          <EditableInput name="location" value={location} onChange={saveLocation} />
          <label style={{ cursor: 'pointer', color: '#374151', marginTop: 12, display: 'block' }}>
            <input
              type="checkbox"
              checked={contactVisible}
              onChange={() => {
                const val = !contactVisible;
                setContactVisible(val);
                localStorage.setItem('contactVisible', val.toString());
              }}
              style={{ marginRight: 8 }}
            />
            Make contact info public
          </label>
        </div>

        <div style={sectionStyle}>
          <h3>Skills / Interests</h3>
          <div>
            {skills.map((skill) => (
              <SkillTag key={skill} skill={skill} onRemove={() => removeSkill(skill)} />
            ))}
          </div>
          <input
            type="text"
            placeholder="Type a skill and press Enter"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && skillInput.trim()) {
                e.preventDefault();
                addSkill();
              }
            }}
            style={{
              marginTop: 10,
              width: '100%',
              padding: 8,
              fontSize: 16,
              borderRadius: 4,
              border: '1px solid #d1d1d1',
              outline: 'none',
              backgroundColor: '#f9fafb',
            }}
          />
        </div>
      </div>
    </div>
  );
}
