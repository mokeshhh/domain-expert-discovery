import React, { useEffect, useState } from 'react';

export default function ExpertsForYou({ userId }) {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!userId) return;

    fetch(`${API_URL}/api/experts/recommended?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setExperts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  if (!userId) return null;

  if (loading) return <p>Loading personalized experts...</p>;

  if (experts.length === 0) return <p>No personalized experts available at this time.</p>;

  return (
    <section className="my-6">
      <h2 className="text-xl font-semibold mb-4">Experts For You</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {experts.map(exp => (
          <div
            key={exp._id}
            className="p-4 shadow rounded bg-white hover:shadow-lg cursor-pointer transition"
            onClick={() => window.location.href = `/experts/${exp._id}`}
          >
            <img src={exp.avatar} alt={exp.name} className="w-20 h-20 rounded-full mb-2" />
            <h3 className="font-semibold">{exp.name}</h3>
            <p className="text-gray-600">{exp.domain}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
