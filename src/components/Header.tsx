"use client";

import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { BookIcon, CalendarIcon, SunIcon, MoonIcon, MonitorIcon, SparklesIcon } from "./Icons";

interface HeaderProps {
  activeView: "calendar" | "today";
  onViewChange: (view: "calendar" | "today") => void;
}

export function Header({ activeView, onViewChange }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cpsc via-ece to-meng flex items-center justify-center shadow-sm">
              <BookIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-medium text-foreground flex items-center gap-1.5">
                Finals Prep
                <SparklesIcon className="w-4 h-4 text-exam" />
              </h1>
              <p className="text-xs text-foreground-muted">Spring 2026 · Yale</p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-background-secondary/80 rounded-xl border border-border/50">
            <button
              onClick={() => onViewChange("today")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all duration-200",
                activeView === "today"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-foreground-secondary hover:text-foreground"
              )}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Daily
            </button>
            <button
              onClick={() => onViewChange("calendar")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all duration-200",
                activeView === "calendar"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-foreground-secondary hover:text-foreground"
              )}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Month
            </button>
          </div>

          {/* Right Section: Theme Toggle + User */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <div className="flex items-center gap-0.5 p-1 bg-background-secondary/80 rounded-xl border border-border/50">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  theme === "light"
                    ? "bg-exam/20 text-exam shadow-sm"
                    : "text-foreground-muted hover:text-foreground hover:bg-background"
                )}
                aria-label="Light mode"
              >
                <SunIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  theme === "dark"
                    ? "bg-cpsc/20 text-cpsc shadow-sm"
                    : "text-foreground-muted hover:text-foreground hover:bg-background"
                )}
                aria-label="Dark mode"
              >
                <MoonIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme("system")}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  theme === "system"
                    ? "bg-ece/20 text-ece shadow-sm"
                    : "text-foreground-muted hover:text-foreground hover:bg-background"
                )}
                aria-label="System theme"
              >
                <MonitorIcon className="w-4 h-4" />
              </button>
            </div>

            {/* User Menu */}
            {user && (
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-cpsc/20 flex items-center justify-center text-cpsc text-sm font-medium">
                    {user.email?.[0].toUpperCase()}
                  </div>
                )}
                <button
                  onClick={signOut}
                  className="text-xs text-foreground-muted hover:text-foreground transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
