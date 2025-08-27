import React from 'react';

// Images should be placed in the 'public/assets/' folder so they can be served directly
const avatars = [
  "assets/3d-glasses_4845146.png",
  "assets/astronaut_2193406.png",
  "assets/disc-jockey_432509.png",
  "assets/man_145928.png",
  "assets/woman_1912058.png",
  "assets/woman_2566272.png"
];

export default function AvatarSelector({ selectedAvatar, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {avatars.map((url, index) => (
        <img
          key={index}
          src={url}
          alt={`Avatar ${index + 1}`}
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            cursor: 'pointer',
            border: selectedAvatar === url ? '3px solid #8b5cf6' : '2px solid #ccc',
            objectFit: 'cover',
            background: '#eee',
            transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
          }}
          onClick={() => onSelect(url)}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(80, 80, 160, 0.15)';
            e.currentTarget.style.borderColor = '#6366f1';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = selectedAvatar === url ? '#8b5cf6' : '#ccc';
          }}
        />
      ))}
    </div>
  );
}
