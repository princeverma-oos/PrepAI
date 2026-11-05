import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles, Play } from 'lucide-react';
import { WordsPullUp } from './AnimatedText';
import UserMenu from './UserMenu';

const HERO_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4';

const NAV_ITEMS = [
  { label: 'AI Roadmap', key: 'roadmap-builder' },
  { label: 'Daily Schedule', key: 'roadmap' },
  { label: 'Live Mock Test', key: 'mock' },
  { label: 'DSA Practice', key: 'dsa' },
  { label: 'Resume Review', key: 'resume' },
  { label: 'Reports & DB', key: 'report' },
  { label: 'Admin Portal', key: 'admin' },
];

const navLinkStyle = {
  color: 'rgba(225, 224, 204, 0.8)',
  textDecoration: 'none',
  transition: 'color 0.2s ease',
};

const navLinkHoverColor = '#E1E0CC';

export default function Hero({ onOpenModal, onOpenAuth }) {
  const contentRef = useRef(null);
  const isInView = useInView(contentRef, { once: true });

  const handleNavClick = (e, key) => {
    e.preventDefault();
    if (onOpenModal) {
      onOpenModal(key);
    }
  };

  return (
    <section id="hero" className="h-screen w-full p-4 md:p-6">
      <div className="relative w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden">
        {/* ── Background Video ── */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>

        {/* ── Noise Overlay ── */}
        <div className="absolute inset-0 noise-overlay opacity-[0.7] mix-blend-overlay pointer-events-none z-10" />

        {/* ── Gradient Overlay ── */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 z-10" />

        {/* ── Navbar Pill ── */}
        <nav className="absolute top-0 left-1/2 -translate-x-1/2 z-30" aria-label="Main navigation">
          <div className="bg-black rounded-b-2xl md:rounded-b-3xl px-3 sm:px-5 md:px-7 py-2 shadow-2xl flex items-center gap-3 sm:gap-6">
            <ul className="flex items-center gap-2 sm:gap-4 md:gap-8 lg:gap-10 list-none m-0 p-0">
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={(e) => handleNavClick(e, item.key)}
                    className="text-[10px] sm:text-xs md:text-sm whitespace-nowrap cursor-pointer bg-transparent border-0 font-medium"
                    style={navLinkStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.color = navLinkHoverColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = navLinkStyle.color)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* User Auth Status / Sign In Menu */}
            <div className="border-l border-white/15 pl-2 sm:pl-3">
              <UserMenu
                onOpenAuth={onOpenAuth}
                onOpenReports={() => onOpenModal && onOpenModal('report')}
                onOpenAdmin={() => onOpenModal && onOpenModal('admin')}
              />
            </div>
          </div>
        </nav>

        {/* ── Hero Content (Bottom-Aligned) ── */}
        <div
          ref={contentRef}
          className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8"
        >
          <div className="grid grid-cols-12 gap-4 items-end">
            {/* Left 8 columns — Giant Heading */}
            <div className="col-span-12 lg:col-span-8">
              <h1
                className="text-[26vw] sm:text-[24vw] md:text-[22vw] lg:text-[20vw] xl:text-[19vw] 2xl:text-[20vw] font-medium leading-[0.85] tracking-[-0.07em]"
                style={{ color: '#E1E0CC' }}
              >
                <WordsPullUp text="PrepAI" showAsterisk={true} />
              </h1>
            </div>

            {/* Right 4 columns — Description + Dual Action CTAs */}
            <div className="col-span-12 lg:col-span-4 pb-2 lg:pb-4">
              <motion.p
                className="text-primary/70 text-xs sm:text-sm md:text-base mb-4 sm:mb-6"
                style={{ lineHeight: 1.25 }}
                initial={{ y: 20, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                Upload your resume in any format & target Job Description. PrepAI dynamically builds a personalized day-by-day roadmap, schedules in-platform DSA coding tests, and stores your progress reports.
              </motion.p>

              <motion.div
                className="flex flex-wrap items-center gap-3"
                initial={{ y: 20, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  onClick={() => onOpenModal && onOpenModal('roadmap-builder')}
                  className="group inline-flex items-center gap-1 hover:gap-2.5 bg-primary rounded-full pl-4 sm:pl-5 pr-1 py-1 transition-all duration-300 cursor-pointer border-0"
                >
                  <span className="text-black font-medium text-xs sm:text-sm whitespace-nowrap">
                    Build My Roadmap
                  </span>
                  <span className="bg-black rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#E1E0CC' }} />
                  </span>
                </button>

                <button
                  onClick={() => onOpenModal && onOpenModal('mock')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 hover:border-primary text-xs sm:text-sm text-[#E1E0CC] hover:text-white transition-all cursor-pointer bg-black/40 backdrop-blur-sm"
                >
                  <Play className="w-3 h-3 text-primary fill-current" />
                  <span>Quick Mock Test</span>
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
