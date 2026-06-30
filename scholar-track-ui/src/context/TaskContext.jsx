import React, { createContext, useContext, useState, useCallback } from 'react';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [reviewTasks, setReviewTasks] = useState([]);
  const [uploadMeta, setUploadMeta]   = useState(null);

  // Called by UploadPage after backend returns extracted task data
  const loadReviewTasks = useCallback((rawTasks, meta) => {
    const mapped = rawTasks.map((t, i) => ({
      id:           Date.now() + i,
      taskTitle:    t.task_title ?? t.taskTitle ?? t.title ?? '',
      subject:      t.subject ?? '',
      deadline:     t.deadline ?? '',
      category:     t.category ?? 'Assignment',
      description:  t.description ?? t.notes ?? '',
      priority:     t.ai_analysis?.recommended_priority ?? t.priority ?? 'Low',
      confidence:   t.confidence > 1
                      ? Math.round(t.confidence)
                      : Math.round((t.confidence ?? 0.9) * 100),
      hasError:     !t.deadline,
      errorMessage: !t.deadline ? 'Deadline not detected' : '',
    }));
    setReviewTasks(mapped);
    setUploadMeta(meta ?? null);
  }, []);

  const clearReviewTasks = useCallback(() => {
    setReviewTasks([]);
    setUploadMeta(null);
  }, []);

  return (
    <TaskContext.Provider value={{
      reviewTasks,
      setReviewTasks,
      uploadMeta,
      loadReviewTasks,
      clearReviewTasks
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used inside <TaskProvider>');
  return ctx;
}
