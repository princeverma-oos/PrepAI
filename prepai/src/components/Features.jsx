import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { WordsPullUpMultiStyle } from './AnimatedText';

/* ============================================================
   Assets & Data — PrepAI Features
   ============================================================ */

const FEATURE_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4';

const CARD_ICONS = {
  roadmap:
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png&w=1280&q=85',
  coding:
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png&w=1280&q=85',
  database:
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png&w=1280&q=85',
};

const featureCards = [
  {
    type: 'video',
    title: 'Live In-Platform Simulator.',
    actionKey: 'mock',
  },
  {
    type: 'info',
    number: '01',
    title: 'Adaptive AI Roadmap.',
    icon: CARD_ICONS.roadmap,
    actionKey: 'roadmap-builder',
    items: [
      'Resume ingestion in any format (PDF, DOCX, TXT)',
      'Target Job Description gap calibration',
      'Customized N-Day timeline schedule',
      'Daily curated study concepts & formulas',
    ],
  },
  {
    type: 'info',
    number: '02',
    title: 'In-Platform Coding Rounds.',
    icon: CARD_ICONS.coding,
    actionKey: 'dsa',
    items: [
      'Interactive code editor (JS & Python)',
      'Live execution against edge test cases',
      'AI Proctor hints and voice feedback',
      'Space-time complexity telemetry',
    ],
  },
  {
    type: 'info',
    number: '03',
    title: 'Database Progress & Reports.',
    icon: CARD_ICONS.database,
    actionKey: 'report',
    items: [
      'IndexedDB persistence across sessions',
      'Hiring readiness benchmark scores',
      'Resume vs JD gap analysis report',
      'One-click exportable assessment card',
    ],
  },
];

const cardVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: (i) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: i * 0.15,
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function VideoCard({ card, index, onAction }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      onClick={() => onAction && onAction(card.actionKey)}
      className="relative rounded-2xl overflow-hidden lg:h-[480px] h-[300px] sm:h-[350px] cursor-pointer group"
      custom={index}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={cardVariants}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      >
        <source src={FEATURE_VIDEO_URL} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 flex items-center justify-between">
        <p className="text-sm sm:text-base font-medium" style={{ color: '#E1E0CC' }}>
          {card.title}
        </p>
        <span className="text-xs text-primary group-hover:translate-x-1 transition-transform">
          Launch Chamber →
        </span>
      </div>
    </motion.div>
  );
}

function InfoCard({ card, index, onAction }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      className="bg-[#212121] rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col justify-between lg:h-[480px] h-auto min-h-[280px] hover:bg-[#262626] transition-colors"
      custom={index}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={cardVariants}
    >
      <div>
        {/* Icon */}
        <img
          src={card.icon}
          alt=""
          className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover mb-4 sm:mb-5"
          loading="lazy"
        />

        {/* Title + Number */}
        <div className="mb-4 sm:mb-5">
          <h3 className="text-sm sm:text-base font-medium" style={{ color: '#E1E0CC' }}>
            {card.title}
          </h3>
          <span className="text-[10px] text-gray-500">{card.number}</span>
        </div>

        {/* Checklist */}
        <ul className="space-y-2 sm:space-y-2.5">
          {card.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-gray-400 text-[11px] sm:text-xs leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Learn more / Action */}
      <button
        onClick={() => onAction && onAction(card.actionKey)}
        className="inline-flex items-center gap-1.5 text-primary text-[11px] sm:text-xs mt-4 sm:mt-6 hover:gap-2.5 transition-all duration-200 cursor-pointer group bg-transparent border-0 p-0 text-left font-medium"
      >
        <span>Explore module</span>
        <ArrowRight
          className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
          style={{ transform: 'rotate(-45deg)' }}
        />
      </button>
    </motion.div>
  );
}

/* ============================================================
   Features Section
   ============================================================ */

export default function Features({ onOpenModal }) {
  const headingSegments = [
    { text: 'Studio-grade workflows for career-defining interviews.', className: '' },
    { text: 'Engineered for mastery. Powered by intelligent simulation.', className: 'text-gray-500' },
  ];

  return (
    <section
      id="features"
      className="relative min-h-screen bg-black px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-28"
    >
      {/* ── Noise Background ── */}
      <div className="absolute inset-0 bg-noise opacity-[0.15] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="text-center mb-10 sm:mb-14 md:mb-16">
          <h2
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-snug"
            style={{ color: '#E1E0CC' }}
          >
            <WordsPullUpMultiStyle segments={headingSegments} />
          </h2>
        </div>

        {/* ── Card Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-2 md:gap-1">
          {featureCards.map((card, i) =>
            card.type === 'video' ? (
              <VideoCard key={i} card={card} index={i} onAction={onOpenModal} />
            ) : (
              <InfoCard key={i} card={card} index={i} onAction={onOpenModal} />
            )
          )}
        </div>
      </div>
    </section>
  );
}
