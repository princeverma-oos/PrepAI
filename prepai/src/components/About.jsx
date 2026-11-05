import React, { useRef } from 'react';
import { useScroll } from 'framer-motion';
import { WordsPullUpMultiStyle, AnimatedLetter } from './AnimatedText';

const ABOUT_TEXT =
  'Trained on thousands of real-world hiring loops from Tier-1 tech giants, PrepAI dynamically adapts question difficulty, pinpoints blind spots in your DSA and system design intuition, and provides line-by-line feedback so you walk into every interview with unwavering confidence.';

export default function About() {
  const scrollContainerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ['start 0.8', 'end 0.2'],
  });

  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => setProgress(v));
    return () => unsubscribe();
  }, [scrollYProgress]);

  const chars = ABOUT_TEXT.split('');

  const headingSegments = [
    { text: "Don't practice to compete.", className: 'font-normal' },
    { text: 'Practice to dominate.', className: 'italic font-serif text-primary' },
  ];

  return (
    <section id="about" className="bg-black py-16 sm:py-20 md:py-28 px-4 sm:px-6 md:px-8">
      <div className="bg-[#101010] rounded-2xl md:rounded-3xl max-w-6xl mx-auto px-6 sm:px-10 md:px-16 py-12 sm:py-16 md:py-20 text-center">
        {/* ── Label ── */}
        <p className="text-primary text-[10px] sm:text-xs tracking-widest uppercase mb-8 sm:mb-10 md:mb-12">
          AI Interview Intelligence
        </p>

        {/* ── Heading — Mixed Styles ── */}
        <h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-3xl mx-auto leading-[0.95] sm:leading-[0.9] mb-10 sm:mb-14 md:mb-16"
          style={{ color: '#E1E0CC' }}
        >
          <WordsPullUpMultiStyle segments={headingSegments} />
        </h2>

        {/* ── Scroll-Linked Character Opacity ── */}
        <div ref={scrollContainerRef} className="max-w-2xl mx-auto">
          <p
            className="text-xs sm:text-sm md:text-base leading-relaxed"
            style={{ color: '#DEDBC8' }}
          >
            {chars.map((char, i) => (
              <AnimatedLetter
                key={i}
                char={char}
                progress={progress}
                index={i}
                total={chars.length}
              />
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
