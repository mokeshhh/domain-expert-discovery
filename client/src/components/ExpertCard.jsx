import React from 'react';
import { Link } from 'react-router-dom';

const ExpertCard = ({ expert }) => (
  <div className="bg-white rounded shadow p-6 m-4 w-full sm:w-80 flex flex-col items-center">
    <img src={expert.avatar} alt={expert.name} className="w-24 h-24 rounded-full mb-4" />
    <h3 className="text-xl font-bold mb-1">{expert.name}</h3>
    <p className="text-blue-600 font-medium">{expert.domain}</p>
    <div className="mb-2 text-sm text-gray-700">{expert.skills.join(", ")}</div>
    <div className="mb-2 text-yellow-500">★ {expert.rating}</div>
    <p className="text-gray-500 mb-4">{expert.about}</p>
    <Link to={`/experts/${expert.id}`} className="mt-auto text-blue-500 hover:underline">
      View Profile
    </Link>
  </div>
);

export default ExpertCard;
