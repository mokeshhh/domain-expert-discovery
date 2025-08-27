import React, { useEffect, useRef } from 'react';

export default function AutoScrollCarousel({ children, speed = 1 }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    let handle;
    let lastTimestamp = null;

    const step = (timestamp) => {
      if (lastTimestamp !== null) {
        const delta = timestamp - lastTimestamp;
        if (scrollRef.current) {
          scrollRef.current.scrollLeft += (speed * delta) / 10;
          if (
            scrollRef.current.scrollLeft >=
            scrollRef.current.scrollWidth / 2
          ) {
            scrollRef.current.scrollLeft = 0;
          }
        }
      }
      lastTimestamp = timestamp;
      handle = requestAnimationFrame(step);
    };

    handle = requestAnimationFrame(step);

    return () => cancelAnimationFrame(handle);
  }, [speed]);

  return (
    <div
      ref={scrollRef}
      style={{
        display: 'flex',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
      // Pause scroll on mouse hover
      onMouseEnter={() => cancelAnimationFrame()}
      onMouseLeave={() => requestAnimationFrame(step)}
    >
      {/* Duplicate children for infinite scroll effect */}
      {[...children, ...children].map((child, i) => (
        React.cloneElement(child, { key: i })
      ))}
    </div>
  );
}
