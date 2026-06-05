import React, { createContext, useContext, useState, useCallback } from 'react';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [savedTasks, setSavedTasks]   = useState([]);
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

  // Called by ReviewTaskPage "Confirm & Save Tasks"
  const confirmReviewTasks = useCallback((tasks) => {
    const confirmed = tasks.map(t => ({
      id:          t.id,
      createdAt:   new Date().toISOString(),
      status:      'pending',
      source:      uploadMeta?.filename ?? 'Uploaded document',
      title:       t.taskTitle,
      subject:     t.subject?.split(' ').map(w => w[0]).join('').slice(0, 6).toUpperCase() || t.subject,
      subjectFull: t.subject,
      deadline:    t.deadline,
      priority:    (t.priority ?? 'Low').toLowerCase(),
      category:    t.category,
      description: t.description,
      ai: {
        urgency:     t.confidence >= 80 ? 8 : t.confidence >= 60 ? 5 : 3,
        importance:  t.confidence >= 80 ? 8 : t.confidence >= 60 ? 5 : 3,
        recommended: t.priority ?? 'Low',
      },
    }));
    setSavedTasks(prev => [...prev, ...confirmed]);
    setReviewTasks([]);
    setUploadMeta(null);
  }, [uploadMeta]);

  const updateSavedTask = useCallback((updated) => {
    setSavedTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  }, []);

  const deleteSavedTask = useCallback((id) => {
    setSavedTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const stats = {
    total:        savedTasks.length,
    completed:    savedTasks.filter(t => t.status === 'completed').length,
    pending:      savedTasks.filter(t => t.status === 'pending').length,
    overdue:      savedTasks.filter(t =>
                    t.status !== 'completed' &&
                    t.deadline &&
                    new Date(t.deadline) < new Date()
                  ).length,
    highPriority: savedTasks.filter(t =>
                    ['high', 'critical'].includes((t.priority ?? '').toLowerCase())
                  ).length,
  };

  return (
    <TaskContext.Provider value={{
      savedTasks, reviewTasks, setReviewTasks,
      uploadMeta, stats,
      loadReviewTasks, confirmReviewTasks,
      updateSavedTask, deleteSavedTask,
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