import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import './ExpertDetail.css';

// Capitalize first letter of each word
function capitalizeWords(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

// Notification component for success/error messages
function Notification({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2500); // Hide after 2.5s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`notification-toast ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
      role="alert"
    >
      {message}
    </div>
  );
}

export default function ExpertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [wikiInfo, setWikiInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState('success');

  const isLoggedIn = !!localStorage.getItem('token');
  const userEmail = localStorage.getItem('email');
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/experts/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Expert not found');
        return res.json();
      })
      .then(data => {
        setExpert(data);
        setLoading(false);

        if (isLoggedIn && userEmail) {
          fetch(`${API_URL}//api/auth/get-saved-experts?email=${userEmail}`)
            .then(res => res.json())
            .then(({ savedExperts }) => {
              setIsSaved(savedExperts?.includes(data._id) || false);
            })
            .catch(() => setIsSaved(false));
        } else {
          setIsSaved(false);
        }

        if (data.wikipedia_url) {
          const title = data.wikipedia_url.split('/').pop();
          setWikiLoading(true);
          fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`)
            .then(res => res.json())
            .then(info => {
              setWikiInfo(info);
              setWikiLoading(false);
            })
            .catch(() => {
              setWikiInfo(null);
              setWikiLoading(false);
            });
        }
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, isLoggedIn, userEmail]);

  const showNotification = (msg, type = 'success') => {
    setNotification(msg);
    setNotificationType(type);
  };

  const handleBookmark = async () => {
    if (!isLoggedIn) {
      showNotification('Please log in to save experts.', 'error');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      const url = isSaved
        ? '${API_URL}/auth/remove-saved-expert'
        : '${API_URL}/auth/save-expert';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, expertId: expert._id }),
      });
      const resData = await res.json();

      if (res.ok) {
        setIsSaved(!isSaved);
        showNotification(
          isSaved
            ? 'Expert removed from saved.'
            : 'Expert saved successfully.',
          isSaved ? 'error' : 'success'
        );
      } else {
        showNotification(resData.message, 'error');
      }
    } catch {
      showNotification('Network error. Please try again.', 'error');
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-600">
        Loading expert details...
      </div>
    );

  if (error)
    return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <>
      {/* Notification at top of screen, outside main card */}
      {notification && (
        <Notification
          message={notification}
          type={notificationType}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Main expert detail card */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-10 relative text-gray-900" style={{ marginTop: 20 }}>

        <Link
          to="/experts"
          className="text-blue-500 hover:underline font-medium mb-8 inline-block"
        >
          ← Back to experts
        </Link>

        <button
          onClick={handleBookmark}
          aria-label={isSaved ? 'Unsave Profile' : 'Save Profile'}
          title={isSaved ? 'Unsave Profile' : 'Save Profile'}
          className="absolute top-8 right-8 p-0 bg-transparent border-none cursor-pointer transition-transform hover:scale-105"
        >
          {isSaved ? (
            <svg
              width="32"
              height="32"
              fill="#1976ed"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M6 4a2 2 0 0 0-2 2v16l8-5.333L20 22V6a2 2 0 0 0-2-2H6z" />
            </svg>
          ) : (
            <svg
              width="32"
              height="32"
              fill="none"
              stroke="#1976ed"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M6 4a2 2 0 0 0-2 2v16l8-5.333L20 22V6a2 2 0 0 0-2-2H6z" />
            </svg>
          )}
        </button>

        <div className="flex flex-col md:flex-row items-center md:items-start mb-6">
          {expert.avatar && (
            <img
              src={expert.avatar}
              alt={expert.name}
              className="w-32 h-32 rounded-full shadow-lg object-cover mb-6 md:mb-0 md:mr-8 border-4 border-blue-100"
            />
          )}
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">{expert.name}</h2>
            {expert.domain && (
              <span className="inline-block px-4 py-1 bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-full text-sm font-semibold">
                {capitalizeWords(expert.domain)}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {expert.username && (
            <p>
              <strong>Username:</strong> {expert.username}
            </p>
          )}
          {expert.location && (
            <p>
              <strong>Location:</strong> {expert.location}
            </p>
          )}
          {expert.bio && (
            <p>
              <strong>Bio:</strong> {expert.bio}
            </p>
          )}

          {expert.linkedin_url && (
            <p>
              <strong>LinkedIn: </strong>
              <a
                href={expert.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 8a6 6 0 016 6v6h-2v-6a4 4 0 00-4-4h-2v10h-2V8h2zM6 8h2v10H6zM7 6a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
                LinkedIn Profile
              </a>
            </p>
          )}

          {expert.profile_url && (
            <p>
              <strong>Profile URL: </strong>
              <a
                href={expert.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#2563eb"
                    strokeWidth="1.5"
                  />
                  <path d="M12 6v6l4 2" stroke="#2563eb" strokeWidth="1.5" />
                </svg>
                External Profile
              </a>
            </p>
          )}
        </div>

        {wikiLoading && <p>Loading Wikipedia info...</p>}

        {wikiInfo && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 flex gap-4 items-start">
            {wikiInfo.thumbnail && (
              <img
                src={wikiInfo.thumbnail.source}
                alt={`${expert.name} thumbnail`}
                className="w-24 h-24 rounded shadow-md object-cover"
              />
            )}
            <div>
              {wikiInfo.description && (
                <p className="mb-1 font-semibold text-gray-800">
                  <strong>Occupation:</strong> {wikiInfo.description}
                </p>
              )}
              {wikiInfo.extract && (
                <p className="text-gray-700">{wikiInfo.extract}</p>
              )}
            </div>
          </div>
        )}

        {expert.about && (
          <section>
            <h3 className="text-xl font-semibold mb-2">About</h3>
            <p className="text-gray-800">{expert.about}</p>
          </section>
        )}

        {expert.wikipedia_url && (
          <p className="mt-4">
            <a
              href={expert.wikipedia_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline font-medium inline-flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M14 3h7v7M10 14L3 21M21 3l-7 7" />
              </svg>
              View Full Wikipedia Profile
            </a>
          </p>
        )}
      </div>
    </>
  );
}
