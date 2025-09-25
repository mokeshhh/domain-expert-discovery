import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './AnimatedMascot.css';

const AnimatedMascot = ({ isPasswordFocused, isEmailFocused, emailValue }) => {
  const mascotRef    = useRef(null);
  const headRef      = useRef(null);
  const leftEyeRef   = useRef(null);
  const rightEyeRef  = useRef(null);
  const leftPupilRef = useRef(null);
  const rightPupilRef= useRef(null);
  const leftHandRef  = useRef(null);
  const rightHandRef = useRef(null);
  const mouthRef     = useRef(null);
  const canvasRef    = useRef(null);

  // Create offscreen canvas for text measurements
  useEffect(() => {
    canvasRef.current = document.createElement('canvas').getContext('2d');
  }, []);

  // Entrance animation
  useEffect(() => {
    gsap.set(mascotRef.current, { y: -50, opacity: 0 });
    gsap.to(mascotRef.current, {
      y: 0, opacity: 1, duration: 1, ease: 'bounce.out', delay: 0.3
    });
  }, []);

  // Global mouse tracking (unless email or password is focused)
  useEffect(() => {
    const onMouseMove = e => {
      if (isEmailFocused || isPasswordFocused) return;
      [leftPupilRef.current, rightPupilRef.current].forEach(pupil => {
        if (!pupil) return;
        const rect = pupil.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;
        const angle = Math.atan2(e.clientY-cy, e.clientX-cx);
        const dist  = Math.min(8, Math.hypot(e.clientX-cx, e.clientY-cy)/15);
        gsap.to(pupil, {
          x: Math.cos(angle)*dist,
          y: Math.sin(angle)*dist,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    };
    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  }, [isEmailFocused, isPasswordFocused]);

  // Password focus: cover eyes
  useEffect(() => {
    if (isPasswordFocused) {
      gsap.to([leftHandRef.current, rightHandRef.current], {
        scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)'
      });
      gsap.to([leftEyeRef.current, rightEyeRef.current], {
        scaleY: 0.1, duration: 0.3, ease: 'power2.out'
      });
      gsap.to(mouthRef.current, {
        scaleY: 0.5, backgroundColor: '#666', duration: 0.3
      });
    } else {
      gsap.to([leftHandRef.current, rightHandRef.current], {
        scale: 0, opacity: 0, duration: 0.4, ease: 'back.in(1.7)'
      });
      gsap.to([leftEyeRef.current, rightEyeRef.current], {
        scaleY: 1, duration: 0.3, ease: 'power2.out'
      });
      gsap.to(mouthRef.current, {
        scaleY: 1, backgroundColor: '#333', duration: 0.3
      });
    }
  }, [isPasswordFocused]);

  // Email focus: caret position tracking
  useEffect(() => {
    const input = document.querySelector('input[name="email"]');
    if (!input || !canvasRef.current) return;

    // Match input font on canvas
    const cs = getComputedStyle(input);
    canvasRef.current.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;

    const updateCaret = () => {
      if (!isEmailFocused) {
        // Reset when not focused
        gsap.to(headRef.current, { rotation: 0, duration: 0.5, ease: 'power2.out' });
        gsap.to([leftPupilRef.current, rightPupilRef.current], {
          x: 0, duration: 0.3, ease: 'power2.out'
        });
        return;
      }
      const pos = input.selectionStart || 0;
      const textWidth = canvasRef.current.measureText(emailValue.slice(0, pos) || '.').width;
      const rect = input.getBoundingClientRect();
      const caretX = rect.left + textWidth;
      const centerX = rect.left + rect.width / 2;
      const delta = (caretX - centerX) / 10;
      const clamped = Math.max(-20, Math.min(20, delta));

      gsap.to([leftPupilRef.current, rightPupilRef.current], {
        x: clamped, duration: 0.3, ease: 'power2.out'
      });
      gsap.to(headRef.current, {
        rotation: clamped / 2, duration: 0.3, ease: 'power2.out'
      });
    };

    input.addEventListener('input', updateCaret);
    input.addEventListener('keyup', updateCaret);
    input.addEventListener('click', updateCaret);
    updateCaret(); // initial

    return () => {
      input.removeEventListener('input', updateCaret);
      input.removeEventListener('keyup', updateCaret);
      input.removeEventListener('click', updateCaret);
    };
  }, [isEmailFocused, emailValue]);

  // Reset head when email loses focus
  useEffect(() => {
    if (!isEmailFocused) {
      gsap.to(headRef.current, {
        rotation: 0, duration: 0.3, ease: 'power2.out'
      });
    }
  }, [isEmailFocused]);

  return (
    <div ref={mascotRef} className="animated-mascot">
      <div ref={headRef} className="mascot-head">
        <div ref={leftEyeRef} className="eye left-eye">
          <div ref={leftPupilRef} className="pupil" />
        </div>
        <div ref={rightEyeRef} className="eye right-eye">
          <div ref={rightPupilRef} className="pupil" />
        </div>
        <div className="nose" />
        <div ref={mouthRef} className="mouth" />
        <div ref={leftHandRef} className="hand left-hand" />
        <div ref={rightHandRef} className="hand right-hand" />
      </div>
    </div>
  );
};

export default AnimatedMascot;
