import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white shadow-inner mt-16 py-6 text-center text-gray-600">
      <p>
        © {new Date().getFullYear()} Domain Expert Discovery Platform. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
