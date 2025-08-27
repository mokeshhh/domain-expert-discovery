import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const SplitText = ({ text, className, delay = 0.05, onComplete }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const letters = containerRef.current.querySelectorAll('.split-letter');

    // Make sure all letters start hidden but still take up space
    gsap.set(letters, { opacity: 0, y: 40 });

    gsap.to(letters, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: delay,
      onComplete,
    });
  }, [text, delay, onComplete]);

  return (
    <div ref={containerRef} className={className}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="split-letter"
          style={{
            display: 'inline-block',
            whiteSpace: 'pre', // preserves spaces
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
};

export default SplitText;
