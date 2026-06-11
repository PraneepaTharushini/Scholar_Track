import { useState, useRef, useEffect } from 'react';
import './UploadPage.css';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';

const ACCEPTED = ['.pdf', '.png', '.jpg', '.jpeg', '.docx', '.doc', '.txt'];
const API = '/api';

export default function UploadPage() {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [docs, setDocs] = useState([]);
  const inputRef = useRef();
  const navigate = useNavigate();
  const { loadReviewTasks } = useTaskContext();

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await fetch(`${API}/documents`);
      const data = await res.json();
      setDocs(data.documents || []);
    } catch (e) {
      console.error('Failed to fetch documents:', e);
    }
  };

  const addFiles = (newFiles) => {
    const list = Array.from(newFiles).map(f => ({
      id: Date.now() + Math.random(),
      file: f,
      name: f.name,
      size: formatBytes(f.size),
      progress: 0,
      done: false,
      error: null,
      task: null,
    }));
    setFiles(prev => [...prev, ...list]);
    list.forEach(item => uploadFile(item));
  };

  const uploadFile = async (item) => {
    const formData = new FormData();
    formData.append('file', item.file);

    try {
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, progress: 30 } : f));

      const uploadRes = await fetch(`${API}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || 'Upload failed');
      }

      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, progress: 60 } : f));

      const taskRes = await fetch(`${API}/task-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: item.name }),
      });

      if (!taskRes.ok) {
        const err = await taskRes.json();
        throw new Error(err.error || 'AI extraction failed');
      }

      const taskData = await taskRes.json();

      setFiles(prev => prev.map(f =>
        f.id === item.id ? { ...f, progress: 100, done: true, task: taskData } : f
      ));

      fetchDocs();

      // Send to context and navigate to Review Tasks page
      const tasksArray = Array.isArray(taskData) ? taskData : [taskData];
      loadReviewTasks(tasksArray, { filename: item.name });
      navigate('/review');

    } catch (e) {
      setFiles(prev => prev.map(f =>
        f.id === item.id ? { ...f, progress: 0, error: e.message } : f
      ));
    }
  };

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  const fileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📕';
    if (['png', 'jpg', 'jpeg'].includes(ext)) return '🖼️';
    if (['doc', 'docx'].includes(ext)) return '📘';
    return '📄';
  };

  return (
    <div className="up-page">
      {/* Header info */}
      <div className="up-info-bar">
        <div className="up-info-card">
          <span className="up-info-icon">📤</span>
          <div>
            <div className="up-info-num">{docs.filter(d => d.status === 'Processed').length}</div>
            <div className="up-info-lbl">Docs Processed</div>
          </div>
        </div>
        <div className="up-info-card">
          <span className="up-info-icon">✅</span>
          <div>
            <div className="up-info-num">
              {docs.filter(d => d.status === 'Processed').length * 2}
            </div>
            <div className="up-info-lbl">Tasks Extracted</div>
          </div>
        </div>
        <div className="up-info-card">
          <span className="up-info-icon">🤖</span>
          <div>
            <div className="up-info-num">96%</div>
            <div className="up-info-lbl">OCR Accuracy</div>
          </div>
        </div>
        <div className="up-info-card">
          <span className="up-info-icon">⚡</span>
          <div>
            <div className="up-info-num">~1.2s</div>
            <div className="up-info-lbl">Avg. Process Time</div>
          </div>
        </div>
      </div>

      <div className="up-main-grid">
        {/* Left: drop zone + queue */}
        <div className="up-left">
          {/* Drop zone */}
          <div
            className={`up-dropzone ${dragging ? 'dragging' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current.click()}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED.join(',')}
              style={{ display: 'none' }}
              onChange={e => addFiles(e.target.files)}
            />
            <div className="up-drop-icon">{dragging ? '📂' : '📤'}</div>
            <div className="up-drop-title">
              {dragging ? 'Release to upload' : 'Drag & drop files here'}
            </div>
            <div className="up-drop-sub">
              or <span className="up-drop-link">browse your device</span>
            </div>
            <div className="up-drop-types">
              {['PDF', 'DOCX', 'PNG', 'JPG', 'TXT'].map(t => (
                <span key={t} className="up-type-badge">{t}</span>
              ))}
            </div>
          </div>

          {/* Upload queue */}
          {files.length > 0 && (
            <div className="panel up-queue">
              <div className="panel-header">
                <div className="panel-title">📋 Upload Queue</div>
                <span className="up-queue-count">{files.length} file{files.length > 1 ? 's' : ''}</span>
              </div>
              {files.map(f => (
                <div key={f.id} className="up-queue-item">
                  <span className="up-file-icon">{fileIcon(f.name)}</span>
                  <div className="up-queue-info">
                    <div className="up-queue-name">{f.name}</div>
                    <div className="up-queue-size">{f.size}</div>
                    
                    {!f.error && (
                      <>
                        <div className="up-prog-bar">
                          <div className="up-prog-fill" style={{ width: `${f.progress}%` }} />
                        </div>
                        <div className="up-prog-label">
                          {f.done ? '✅ Processing complete' : `Uploading… ${f.progress}%`}
                        </div>
                      </>
                    )}

                    {f.error && (
                      <div className="up-prog-label" style={{ color: '#ef4444' }}>
                        ❌ {f.error}
                      </div>
                    )}
                  </div>
                  <button className="up-remove-btn" onClick={() => removeFile(f.id)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: recent documents */}
        <div className="panel up-recent">
          <div className="panel-header">
            <div className="panel-title">📂 Recent Documents</div>
          </div>
          {docs.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No documents uploaded yet.
            </div>
          ) : (
            docs.map((d, i) => (
              <div key={i} className="up-doc-row">
                <span className="up-file-icon">{fileIcon(d.filename)}</span>
                <div className="up-doc-info">
                  <div className="up-doc-name">{d.filename}</div>
                </div>
                <div className="up-doc-right">
                  {d.status === 'Processed' ? (
                    <span className="up-status-ok">✅ Processed</span>
                  ) : d.status === 'Failed' ? (
                    <span style={{ color: '#ef4444' }}>❌ Failed</span>
                  ) : (
                    <span className="up-status-proc">⏳ {d.status}</span>
                  )}
                </div>
              </div>
            ))
          )}
          <div className="up-how-it-works">
            <div className="up-how-title">🤖 How it works</div>
            <div className="up-how-steps">
              {[
                { icon: '📤', label: 'Upload your syllabus, notes, or assignments' },
                { icon: '🔍', label: 'Our OCR engine extracts all text' },
                { icon: '🧠', label: 'NLP pipeline identifies tasks & deadlines' },
                { icon: '📝', label: 'Tasks are added to your task list automatically' },
              ].map((s, i) => (
                <div key={i} className="up-how-step">
                  <span className="up-how-step-icon">{s.icon}</span>
                  <span className="up-how-step-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
