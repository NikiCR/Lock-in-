import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { DailyDashboard } from './components/DailyDashboard';
import { HabitsView } from './components/HabitsView';
import { LifeAreasView } from './components/LifeAreasView';
import { HistoryCalendar } from './components/HistoryCalendar';
import { AnalyticsView } from './components/AnalyticsView';

// Modals
import { ScoreBreakdownModal } from './components/ScoreBreakdownModal';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { LockInTimerModal } from './components/LockInTimerModal';
import { JournalModal } from './components/JournalModal';
import { AddHabitModal } from './components/AddHabitModal';
import { WeeklyReviewModal } from './components/WeeklyReviewModal';
import { WeeklyPlanModal } from './components/WeeklyPlanModal';
import { LifeTimelineModal } from './components/LifeTimelineModal';
import { JarvisCoachModal } from './components/JarvisCoachModal';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingModal } from './components/OnboardingModal';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentDate,
    currentScore,
    profile,
    checkIns,
    journals,
    isScoreModalOpen,
    setIsScoreModalOpen,
    isCheckInModalOpen,
    setIsCheckInModalOpen,
    isJournalModalOpen,
    setIsJournalModalOpen,
    isAddHabitModalOpen,
    setIsAddHabitModalOpen,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    isWeeklyReviewModalOpen,
    setIsWeeklyReviewModalOpen,
    isWeeklyPlanModalOpen,
    setIsWeeklyPlanModalOpen,
    isJarvisModalOpen,
    setIsJarvisModalOpen,
    isTimelineModalOpen,
    setIsTimelineModalOpen,
    isTimerActive,
    setIsTimerActive,
    saveCheckIn,
    saveJournal,
    createHabit,
    addLockInSession,
  } = useApp();

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(!profile.onboardingCompleted);

  const currentCheckIn = checkIns.find((c) => c.date === currentDate);
  const currentJournal = journals.find((j) => j.date === currentDate);

  return (
    <div className="min-h-screen bg-[#070709] text-[#F4F4F6] flex justify-center selection:bg-[#D4FF00] selection:text-black">
      {/* Mobile-First Frame: Max width 448px (max-w-md), centered with clean dark background */}
      <div className="w-full max-w-md min-h-screen bg-[#09090C] border-x border-[#16161B] flex flex-col relative shadow-2xl">
        {/* Top Header */}
        <Header
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenJarvis={() => setIsJarvisModalOpen(true)}
        />

        {/* Main Tab Screen Content */}
        <main className="flex-1 px-4 py-3 overflow-y-auto">
          {activeTab === 'today' && (
            <DailyDashboard
              onStartTimer={() => setIsTimerActive(true)}
              onOpenCheckIn={() => setIsCheckInModalOpen(true)}
              onOpenJournal={() => setIsJournalModalOpen(true)}
              onOpenScoreBreakdown={() => setIsScoreModalOpen(true)}
              onOpenAddHabit={() => setIsAddHabitModalOpen(true)}
              onOpenWeeklyPlan={() => setIsWeeklyPlanModalOpen(true)}
              onOpenJarvisCoach={() => setIsJarvisModalOpen(true)}
            />
          )}

          {activeTab === 'habits' && (
            <HabitsView
              onOpenAddHabit={() => setIsAddHabitModalOpen(true)}
              onStartSession={() => setIsTimerActive(true)}
            />
          )}

          {activeTab === 'areas' && (
            <LifeAreasView
              onStartSession={() => setIsTimerActive(true)}
              onOpenTimeline={() => setIsTimelineModalOpen(true)}
            />
          )}

          {activeTab === 'history' && (
            <div className="pb-20">
              <HistoryCalendar />
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="pb-20">
              <AnalyticsView />
            </div>
          )}
        </main>

        {/* Thumb-Zone Fixed Bottom Navigation */}
        <BottomNavigation
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'lockin' as any) {
              setIsTimerActive(true);
            } else {
              setActiveTab(tab);
            }
          }}
          onTriggerLockIn={() => setIsTimerActive(true)}
        />

        {/* Modals & Dialogs */}
        <ScoreBreakdownModal
          isOpen={isScoreModalOpen}
          onClose={() => setIsScoreModalOpen(false)}
          score={currentScore}
          dateStr={currentDate}
        />

        <DailyCheckInModal
          isOpen={isCheckInModalOpen}
          onClose={() => setIsCheckInModalOpen(false)}
          checkIn={currentCheckIn}
          onSave={(data) => saveCheckIn(data, currentDate)}
          dateStr={currentDate}
        />

        <LockInTimerModal
          isOpen={isTimerActive}
          onClose={() => setIsTimerActive(false)}
          onSessionComplete={(session) => {
            addLockInSession(session);
          }}
          dateStr={currentDate}
        />

        <JournalModal
          isOpen={isJournalModalOpen}
          onClose={() => setIsJournalModalOpen(false)}
          journal={currentJournal}
          onSave={(data) => saveJournal(data, currentDate)}
          dateStr={currentDate}
        />

        <AddHabitModal
          isOpen={isAddHabitModalOpen}
          onClose={() => setIsAddHabitModalOpen(false)}
          onCreate={createHabit}
        />

        <WeeklyReviewModal
          isOpen={isWeeklyReviewModalOpen}
          onClose={() => setIsWeeklyReviewModalOpen(false)}
        />

        <WeeklyPlanModal
          isOpen={isWeeklyPlanModalOpen}
          onClose={() => setIsWeeklyPlanModalOpen(false)}
        />

        <LifeTimelineModal
          isOpen={isTimelineModalOpen}
          onClose={() => setIsTimelineModalOpen(false)}
        />

        <JarvisCoachModal
          isOpen={isJarvisModalOpen}
          onClose={() => setIsJarvisModalOpen(false)}
        />

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onOpenAddHabit={() => setIsAddHabitModalOpen(true)}
          onRestartOnboarding={() => setIsOnboardingOpen(true)}
        />

        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
