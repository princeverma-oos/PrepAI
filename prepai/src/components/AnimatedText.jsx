import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * WordsPullUp — Splits text by spaces, each word slides up from y:20.
 * Inspired by UI/UX Pro Max Stagger List pattern:
 *   Duration: 400-700ms, Easing: expo.out equivalent
 *   Do: Keep per-item stagger delay small
 *   Don't: Don't stagger by more than 0.1s per item
 */
export function WordsPullUp({ text, className = '', showAsterisk = false }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const words = text.split(' ');

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <motion.span
            className="inline-block"
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{
              delay: i * 0.08,
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
            {showAsterisk && i === words.length - 1 && (
              <span className="relative inline-block">
                <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">*</span>
              </span>
            )}
            {i < words.length - 1 && '\u00A0'}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/**
 * WordsPullUpMultiStyle — Takes array of {text, className} segments.
 * Splits all into individual words preserving per-word className.
 * Same pull-up animation with staggered delays.
 */
export function WordsPullUpMultiStyle({ segments, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const allWords = [];
  segments.forEach((segment) => {
    const words = segment.text.split(' ');
    words.forEach((word) => {
      allWords.push({ word, className: segment.className || '' });
    });
  });

  return (
    <span ref={ref} className={`inline-flex flex-wrap justify-center ${className}`}>
      {allWords.map((item, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <motion.span
            className={`inline-block ${item.className}`}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{
              delay: i * 0.08,
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {item.word}
            {i < allWords.length - 1 && '\u00A0'}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/**
 * AnimatedLetter — Scroll-linked character opacity animation.
 * Each character's opacity transitions from 0.2 to 1 based on scroll position.
 * Uses charProgress staggering for progressive text reveal effect.
 * 
 * Per UI/UX Pro Max Scroll Reveal pattern:
 *   Keep the y offset small so it reads as a fade, not a slide
 */
export function AnimatedLetter({ char, progress, index, total }) {
  const charProgress = index / total;
  const start = Math.max(charProgress - 0.1, 0);
  const end = Math.min(charProgress + 0.05, 1);

  const range = end - start;
  const normalizedProgress = Math.max(0, Math.min(1, (progress - start) / (range || 0.01)));
  const opacity = 0.2 + normalizedProgress * 0.8;

  return (
    <span
      style={{
        opacity,
        transition: 'opacity 0.05s ease',
        willChange: 'opacity',
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  );
}
