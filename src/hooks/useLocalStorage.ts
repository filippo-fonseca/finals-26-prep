"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "firebase/auth";
import { Task, Course } from "@/data/schedule";

// Types for our app state
export interface DayProgress {
  completedTasks: string[]; // Array of task IDs
  notes: string;
  reflection: string; // What went well / not well
}

export interface CustomTask {
  id: string;
  course: Course;
  description: string;
  date: string;
  createdAt: number;
}

export interface AppState {
  days: Record<string, DayProgress>;
  customTasks: CustomTask[];
  theme: "light" | "dark" | "system";
}

const initialAppState: AppState = {
  days: {},
  customTasks: [],
  theme: "system",
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
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
        const localData = localStorage.getItem("finals-prep-state");
        if (localData) {
          const parsed = JSON.parse(localData);
          // Ensure customTasks exists (migration)
          if (!parsed.customTasks) {
            parsed.customTasks = [];
          }
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
            // Ensure customTasks exists (migration)
            if (!firestoreData.customTasks) {
              firestoreData.customTasks = [];
            }
            setState(firestoreData);
            localStorage.setItem("finals-prep-state", JSON.stringify(firestoreData));
          } else {
            // If no Firestore data, upload localStorage data
            const localData = localStorage.getItem("finals-prep-state");
            if (localData) {
              const parsed = JSON.parse(localData);
              if (!parsed.customTasks) {
                parsed.customTasks = [];
              }
              await setDoc(userDocRef, parsed);
            }
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
              if (!data.customTasks) {
                data.customTasks = [];
              }
              setState(data);
              localStorage.setItem("finals-prep-state", JSON.stringify(data));
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
        localStorage.setItem("finals-prep-state", JSON.stringify(newState));
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

  // Custom task CRUD
  const addCustomTask = useCallback(
    (task: Omit<CustomTask, "id" | "createdAt">) => {
      updateState((prev) => ({
        ...prev,
        customTasks: [
          ...prev.customTasks,
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

  const updateCustomTask = useCallback(
    (taskId: string, updates: Partial<Omit<CustomTask, "id" | "createdAt">>) => {
      updateState((prev) => ({
        ...prev,
        customTasks: prev.customTasks.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        ),
      }));
    },
    [updateState]
  );

  const deleteCustomTask = useCallback(
    (taskId: string) => {
      updateState((prev) => ({
        ...prev,
        customTasks: prev.customTasks.filter((task) => task.id !== taskId),
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

  const rescheduleCustomTask = useCallback(
    (taskId: string, newDate: string) => {
      updateState((prev) => {
        const task = prev.customTasks.find((t) => t.id === taskId);
        if (!task) return prev;

        const oldDate = task.date;

        return {
          ...prev,
          customTasks: prev.customTasks.map((t) =>
            t.id === taskId ? { ...t, date: newDate } : t
          ),
          // Move completion status to new date if it was completed
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

  const getCustomTasksForDate = useCallback(
    (date: string): CustomTask[] => {
      return state.customTasks.filter((task) => task.date === date);
    },
    [state.customTasks]
  );

  const getCustomTaskById = useCallback(
    (taskId: string): CustomTask | undefined => {
      return state.customTasks.find((task) => task.id === taskId);
    },
    [state.customTasks]
  );

  return {
    state,
    isLoaded,
    toggleTask,
    updateNotes,
    updateReflection,
    setTheme,
    getDayProgress,
    isTaskCompleted,
    // Custom task methods
    addCustomTask,
    updateCustomTask,
    deleteCustomTask,
    rescheduleCustomTask,
    getCustomTasksForDate,
    getCustomTaskById,
  };
}
