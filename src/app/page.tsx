"use client";

import { useState } from "react";
import { User } from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import { useAppState } from "@/hooks/useLocalStorage";
import { LoginPage } from "@/components/LoginPage";
import { Header } from "@/components/Header";
import { DayView } from "@/components/DayView";
import { CalendarView } from "@/components/CalendarView";
import { exams, courseInfo } from "@/data/schedule";
import { getDaysUntil, cn } from "@/lib/utils";
import { CourseIcon, FireIcon, AlertIcon, TrophyIcon } from "@/components/Icons";

// Inner component that has access to useAppState
function AuthenticatedApp({ user }: { user: User }) {
  const [activeView, setActiveView] = useState<"calendar" | "today">("today");
  const { reseedData } = useAppState(user);

  // Get upcoming exams
  const upcomingExams = exams
    .map((exam) => ({
      ...exam,
      daysUntil: getDaysUntil(exam.date),
    }))
    .filter((exam) => exam.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <div className="min-h-screen bg-background">
      <Header activeView={activeView} onViewChange={setActiveView} onReseed={reseedData} />

      {/* Exam Countdown Banner */}
      {upcomingExams.length > 0 && (
        <div className="bg-gradient-to-r from-background-secondary via-background to-background-secondary border-b border-border/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
              <span className="flex items-center gap-1.5 text-xs font-medium text-foreground-muted uppercase tracking-wider flex-shrink-0">
                <TrophyIcon className="w-3.5 h-3.5 text-exam" />
                Exams
              </span>
              <div className="flex items-center gap-3">
                {upcomingExams.map((exam) => {
                  const course = courseInfo[exam.course];
                  return (
                    <div
                      key={exam.course}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
                        exam.daysUntil === 0
                          ? "bg-exam-bg border-exam-border"
                          : exam.daysUntil <= 3
                          ? "bg-accent-red/5 border-accent-red/20"
                          : `bg-${course.color}-bg/50 border-${course.color}-border/50`
                      )}
                    >
                      <CourseIcon course={exam.course} className={cn(
                        "w-4 h-4",
                        exam.daysUntil === 0
                          ? "text-exam"
                          : exam.daysUntil <= 3
                          ? "text-accent-red"
                          : `text-${course.color}`
                      )} />
                      <span
                        className={cn(
                          "text-sm font-medium",
                          exam.daysUntil === 0
                            ? "text-exam"
                            : exam.daysUntil <= 3
                            ? "text-accent-red"
                            : "text-foreground"
                        )}
                      >
                        {course.shortName}
                      </span>
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded-md",
                        exam.daysUntil === 0
                          ? "bg-exam/20 text-exam font-medium"
                          : exam.daysUntil <= 3
                          ? "bg-accent-red/10 text-accent-red"
                          : "text-foreground-muted"
                      )}>
                        {exam.daysUntil === 0 ? (
                          <span className="flex items-center gap-1">
                            <FireIcon className="w-3 h-3" />
                            Today
                          </span>
                        ) : exam.daysUntil === 1 ? (
                          <span className="flex items-center gap-1">
                            <AlertIcon className="w-3 h-3" />
                            Tomorrow
                          </span>
                        ) : (
                          `${exam.daysUntil} days`
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>
        {activeView === "today" ? <DayView user={user} /> : <CalendarView user={user} />}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-border/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-foreground-muted/70">
            Finals Prep Tracker · Spring 2026 · Yale
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  const { user, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-cpsc border-t-transparent rounded-full animate-spin" />
          <p className="text-foreground-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login
  if (!user) {
    return <LoginPage onSignIn={() => {}} />;
  }

  return <AuthenticatedApp user={user} />;
}
