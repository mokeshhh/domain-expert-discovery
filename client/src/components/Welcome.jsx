import React, { useEffect } from 'react';
import { gsap } from 'gsap';


const Welcome = () => {
  useEffect(() => {
    // Animate the welcome heading and description on load
    gsap.fromTo(
      ".welcome-heading",
      { opacity: 0, y: 50, scale: 0.8 },  // Initial state: invisible, down, and smaller
      { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: "power3.out" }  // Final state: visible, normal position, and full scale
    );
    gsap.fromTo(
      ".welcome-description",
      { opacity: 0, y: 30 },  // Initial state: invisible and slightly down
      { opacity: 1, y: 0, duration: 1.5, ease: "power3.out", delay: 0.5 }  // Fade in after 0.5s delay
    );
  }, []);


  return (
    <div className="text-center p-10">
      <h2 className="welcome-heading text-3xl font-semibold mb-4">
        Welcome to the Domain Expert Discovery Platform
      </h2>
      <p className="welcome-description text-gray-700 max-w-xl mx-auto">
        This platform helps you discover experts in various domains through intelligent search and advanced filtering.
      </p>
    </div>
  );
};


export default Welcome;