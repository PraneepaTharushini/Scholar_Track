import React, { createContext, useContext, useState, useCallback } from 'react';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [reviewTasks, setReviewTasks] = useState([]);
  const [uploadMeta, setUploadMeta]   = useState(null);
  const [tasks, setTasks]             = useState([]);   // ← persistent task list

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

  // Called by ReviewPage when the user confirms and saves tasks
  const commitReviewTasks = useCallback((confirmedTasks) => {
    const normalized = confirmedTasks.map((t) => ({
      id:          t.id ?? Date.now() + Math.random(),
      title:       t.taskTitle ?? t.title ?? '',
      subjectFull: t.subject ?? '',
      subject:     (t.subject ?? '').split(' ').map(w => w[0]).join('').slice(0, 4).toUpperCase(),
      deadline:    t.deadline ?? '',
      category:    t.category ?? 'Assignment',
      description: t.description ?? '',
      priority:    (t.priority ?? 'low').toLowerCase(),
      status:      'pending',
      source:      'Uploaded Document',
      ai: {
        urgency:     t.urgency     ?? null,
        importance:  t.importance  ?? null,
        recommended: t.priority    ?? 'Low',
      },
    }));

    setTasks(prev => [...prev, ...normalized]);
    setReviewTasks([]);
    setUploadMeta(null);
  }, []);

  const updateTask = useCallback((updated) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearReviewTasks = useCallback(() => {
    setReviewTasks([]);
    setUploadMeta(null);
  }, []);

  return (
    <TaskContext.Provider value={{
      // Persistent task list
      tasks,
      setTasks,
      updateTask,
      deleteTask,
      commitReviewTasks,
      // Review buffer (temporary, pre-confirmation)
      reviewTasks,
      setReviewTasks,
      uploadMeta,
      loadReviewTasks,
      clearReviewTasks,
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