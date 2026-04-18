"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "firebase/auth";
import { Task, Course, initialTasks, scheduleDates, getDateRange } from "@/data/schedule";

// Types for our app state
export interface DayProgress {
  completedTasks: string[]; // Array of task IDs
  notes: string;
  reflection: string; // What went well / not well
}

export interface AppState {
  days: Record<string, DayProgress>;
  tasks: Task[]; // All tasks stored in Firebase
  theme: "light" | "dark" | "system";
  seeded: boolean; // Whether initial data has been seeded
}

const initialAppState: AppState = {
  days: {},
  tasks: [],
  theme: "system",
  seeded: false,
};

// Debounce helper
function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number
): (...args: Args) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Generate unique ID
function generateId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get all dates in schedule
export function getAllScheduleDates(): string[] {
  return getDateRange(scheduleDates.start, scheduleDates.end);
}

export function useAppState(user: User | null) {
  const [state, setState] = useState<AppState>(initialAppState);
  const [isLoaded, setIsLoaded] = useState(false);
  const skipNextSync = useRef(false);

  // Initialize and load data when user changes
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const init = async () => {
      setIsLoaded(false);

      // Load from localStorage first for immediate display
      try {
        const localData = localStorage.getItem("finals-prep-state-v2");
        if (localData) {
          const parsed = JSON.parse(localData);
          setState(parsed);
        }
      } catch (e) {
        console.warn("Failed to load from localStorage:", e);
      }

      if (user) {
        const userDocRef = doc(db, "users", user.uid);

        // Try to get initial data from Firestore
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const firestoreData = docSnap.data() as AppState;
            // Migration: ensure tasks array exists
            if (!firestoreData.tasks) {
              firestoreData.tasks = [];
            }
            setState(firestoreData);
            localStorage.setItem("finals-prep-state-v2", JSON.stringify(firestoreData));
          } else {
            // First time user - seed with initial data
            const seededState: AppState = {
              days: {},
              tasks: initialTasks.map((task, index) => ({
                ...task,
                id: generateId() + `-${index}`,
                createdAt: Date.now() + index,
              })),
              theme: "system",
              seeded: true,
            };
            await setDoc(userDocRef, seededState);
            setState(seededState);
            localStorage.setItem("finals-prep-state-v2", JSON.stringify(seededState));
          }
        } catch (e) {
          console.warn("Failed to sync with Firestore:", e);
        }

        // Set up real-time listener
        unsubscribeSnapshot = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists() && !skipNextSync.current) {
              const data = docSnap.data() as AppState;
              if (!data.tasks) {
                data.tasks = [];
              }
              setState(data);
              localStorage.setItem("finals-prep-state-v2", JSON.stringify(data));
            }
            skipNextSync.current = false;
          },
          (error) => {
            console.warn("Firestore listener error:", error);
          }
        );
      }

      setIsLoaded(true);
    };

    init();

    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, [user]);

  // Sync state to Firestore (debounced)
  const syncToFirestore = useCallback(
    debounce(async (newState: AppState, currentUser: User | null) => {
      if (!currentUser) return;

      try {
        skipNextSync.current = true;
        const userDocRef = doc(db, "users", currentUser.uid);
        await setDoc(userDocRef, newState);
      } catch (e) {
        console.warn("Failed to sync to Firestore:", e);
        skipNextSync.current = false;
      }
    }, 500),
    []
  );

  // Update state and sync
  const updateState = useCallback(
    (updater: (prev: AppState) => AppState) => {
      setState((prev) => {
        const newState = updater(prev);
        localStorage.setItem("finals-prep-state-v2", JSON.stringify(newState));
        syncToFirestore(newState, user);
        return newState;
      });
    },
    [user, syncToFirestore]
  );

  const toggleTask = useCallback(
    (taskId: string, date: string) => {
      updateState((prev) => {
        const dayProgress = prev.days[date] || { completedTasks: [], notes: "", reflection: "" };
        const isCompleted = dayProgress.completedTasks.includes(taskId);

        return {
          ...prev,
          days: {
            ...prev.days,
            [date]: {
              ...dayProgress,
              completedTasks: isCompleted
                ? dayProgress.completedTasks.filter((id) => id !== taskId)
                : [...dayProgress.completedTasks, taskId],
            },
          },
        };
      });
    },
    [updateState]
  );

  const updateNotes = useCallback(
    (date: string, notes: string) => {
      updateState((prev) => {
        const dayProgress = prev.days[date] || { completedTasks: [], notes: "", reflection: "" };
        return {
          ...prev,
          days: {
            ...prev.days,
            [date]: {
              ...dayProgress,
              notes,
            },
          },
        };
      });
    },
    [updateState]
  );

  const updateReflection = useCallback(
    (date: string, reflection: string) => {
      updateState((prev) => {
        const dayProgress = prev.days[date] || { completedTasks: [], notes: "", reflection: "" };
        return {
          ...prev,
          days: {
            ...prev.days,
            [date]: {
              ...dayProgress,
              reflection,
            },
          },
        };
      });
    },
    [updateState]
  );

  const setTheme = useCallback(
    (theme: "light" | "dark" | "system") => {
      updateState((prev) => ({ ...prev, theme }));
    },
    [updateState]
  );

  const getDayProgress = useCallback(
    (date: string): DayProgress => {
      return state.days[date] || { completedTasks: [], notes: "", reflection: "" };
    },
    [state.days]
  );

  const isTaskCompleted = useCallback(
    (taskId: string, date: string): boolean => {
      return state.days[date]?.completedTasks.includes(taskId) || false;
    },
    [state.days]
  );

  // Task CRUD - now works for ALL tasks
  const addTask = useCallback(
    (task: Omit<Task, "id" | "createdAt">) => {
      updateState((prev) => ({
        ...prev,
        tasks: [
          ...prev.tasks,
          {
            ...task,
            id: generateId(),
            createdAt: Date.now(),
          },
        ],
      }));
    },
    [updateState]
  );

  const updateTask = useCallback(
    (taskId: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => {
      updateState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        ),
      }));
    },
    [updateState]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      updateState((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((task) => task.id !== taskId),
        // Also remove from completedTasks
        days: Object.fromEntries(
          Object.entries(prev.days).map(([date, progress]) => [
            date,
            {
              ...progress,
              completedTasks: progress.completedTasks.filter((id) => id !== taskId),
            },
          ])
        ),
      }));
    },
    [updateState]
  );

  const rescheduleTask = useCallback(
    (taskId: string, newDate: string) => {
      updateState((prev) => {
        const task = prev.tasks.find((t) => t.id === taskId);
        if (!task) return prev;

        const oldDate = task.date;

        return {
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === taskId ? { ...t, date: newDate } : t
          ),
          // Remove completion status when rescheduling
          days: {
            ...prev.days,
            [oldDate]: prev.days[oldDate]
              ? {
                  ...prev.days[oldDate],
                  completedTasks: prev.days[oldDate].completedTasks.filter((id) => id !== taskId),
                }
              : { completedTasks: [], notes: "", reflection: "" },
          },
        };
      });
    },
    [updateState]
  );

  const getTasksForDate = useCallback(
    (date: string): Task[] => {
      return state.tasks
        .filter((task) => task.date === date)
        .sort((a, b) => a.createdAt - b.createdAt);
    },
    [state.tasks]
  );

  const getTaskById = useCallback(
    (taskId: string): Task | undefined => {
      return state.tasks.find((task) => task.id === taskId);
    },
    [state.tasks]
  );

  // Reseed data (for reset functionality)
  const reseedData = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      tasks: initialTasks.map((task, index) => ({
        ...task,
        id: generateId() + `-${index}`,
        createdAt: Date.now() + index,
      })),
      days: {}, // Clear all progress
      seeded: true,
    }));
  }, [updateState]);

  return {
    state,
    isLoaded,
    toggleTask,
    updateNotes,
    updateReflection,
    setTheme,
    getDayProgress,
    isTaskCompleted,
    // Task methods (unified - all tasks are editable now)
    addTask,
    updateTask,
    deleteTask,
    rescheduleTask,
    getTasksForDate,
    getTaskById,
    reseedData,
    allTasks: state.tasks,
  };
}
