import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import RoadmapBuilderModal from './components/RoadmapBuilderModal';
import MockInterviewModal from './components/MockInterviewModal';
import DsaPracticeModal from './components/DsaPracticeModal';
import ResumeReviewModal from './components/ResumeReviewModal';
import AnalyticsModal from './components/AnalyticsModal';
import PerformanceReportModal from './components/PerformanceReportModal';
import AdminModal from './components/AdminModal';
import AuthModal from './components/AuthModal';
import { subscribeAuth, getCurrentUser } from './utils/authService';

/**
 * PrepAI — Full AI-Powered Interview Preparation Platform
 *
 * Core Features:
 * - Working Login, Registration, 1-Click Demo & Password Reset Authentication
 * - Resume Ingestion in ANY format (PDF, DOCX, TXT, MD) + JD Parsing
 * - Calibrated N-day interview roadmap with curated study notes
 * - Scheduled in-platform live coding & DSA rounds with test cases and AI proctoring
 * - IndexedDB database persistence (Dexie.js)
 * - Comprehensive performance reports with resume-to-JD gap analysis
 */
export default function App() {
  const [activeModal, setActiveModal] = useState(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  useEffect(() => {
    const unsubscribe = subscribeAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (modalKey, questionId = null) => {
    if (questionId) setSelectedQuestionId(questionId);
    setActiveModal(modalKey);
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setActiveModal('auth');
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  // Keyboard accessibility: ESC key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main className="bg-black min-h-screen relative text-[#E1E0CC]">
      {/* ── Main Landing Experience ── */}
      <Hero
        onOpenModal={handleOpenModal}
        onOpenAuth={handleOpenAuth}
      />
      <About onOpenModal={handleOpenModal} />
      <Features onOpenModal={handleOpenModal} />

      {/* ── Authentication Modal ── */}
      <AuthModal
        isOpen={activeModal === 'auth'}
        onClose={handleCloseModal}
        initialMode={authMode}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* ── Core Workflow Modals ── */}
      <RoadmapBuilderModal
        isOpen={activeModal === 'roadmap-builder' || activeModal === 'roadmap'}
        defaultStep={activeModal === 'roadmap-builder' ? 1 : 2}
        onClose={handleCloseModal}
        onLaunchMock={(qId) => handleOpenModal('mock', qId)}
      />

      <MockInterviewModal
        isOpen={activeModal === 'mock'}
        onClose={handleCloseModal}
        initialQuestionId={selectedQuestionId}
      />

      <DsaPracticeModal
        isOpen={activeModal === 'dsa'}
        onClose={handleCloseModal}
        onLaunchMock={(qId) => handleOpenModal('mock', qId)}
      />

      <ResumeReviewModal
        isOpen={activeModal === 'resume'}
        onClose={handleCloseModal}
        onLaunchMock={(qId) => handleOpenModal('mock', qId)}
      />

      <AnalyticsModal
        isOpen={activeModal === 'analytics'}
        onClose={handleCloseModal}
        onLaunchMock={(qId) => handleOpenModal('mock', qId)}
      />

      <PerformanceReportModal
        isOpen={activeModal === 'report'}
        onClose={handleCloseModal}
        onLaunchMock={(qId) => handleOpenModal('mock', qId)}
      />

      <AdminModal
        isOpen={activeModal === 'admin'}
        onClose={handleCloseModal}
        onLaunchMock={(qId) => handleOpenModal('mock', qId)}
      />
    </main>
  );
}
