import { useState, useRef } from 'react';
import './UploadPage.css';

const ACCEPTED = ['.pdf', '.png', '.jpg', '.jpeg', '.docx', '.doc', '.txt'];

const SAMPLE_DOCS = [
  { name: 'CS3042_Course_Outline.pdf', size: '245 KB', status: 'processed', tasks: 7, date: 'May 9, 2026' },
  { name: 'PHY1012_Lab_Manual.pdf',    size: '1.2 MB', status: 'processed', tasks: 3, date: 'May 8, 2026' },
  { name: 'MAT2012_Syllabus.docx',     size: '88 KB',  status: 'processing', tasks: 0, date: 'May 10, 2026' },
];

export default function UploadPage() {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [docs, setDocs] = useState(SAMPLE_DOCS);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const addFiles = (newFiles) => {
    const list = Array.from(newFiles).map(f => ({
      id: Date.now() + Math.random(),
      file: f,
      name: f.name,
      size: formatBytes(f.size),
      progress: 0,
    }));
    setFiles(prev => [...prev, ...list]);
    // Simulate upload progress
    list.forEach(item => simulateUpload(item.id));
  };

  const simulateUpload = (id) => {
    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.random() * 20;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: 100, done: true } : f));
      } else {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: Math.round(pct) } : f));
      }
    }, 300);
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
    if (ext === 'pdf')  return '📕';
    if (['png','jpg','jpeg'].includes(ext)) return '🖼️';
    if (['doc','docx'].includes(ext)) return '📘';
    return '📄';
  };

  return (
    <div className="up-page">
      {/* Header info */}
      <div className="up-info-bar">
        <div className="up-info-card">
          <span className="up-info-icon">📤</span>
          <div>
            <div className="up-info-num">{docs.filter(d => d.status === 'processed').length}</div>
            <div className="up-info-lbl">Docs Processed</div>
          </div>
        </div>
        <div className="up-info-card">
          <span className="up-info-icon">✅</span>
          <div>
            <div className="up-info-num">{docs.reduce((a, d) => a + d.tasks, 0)}</div>
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
            <div className="up-info-num">~2.3s</div>
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
                    <div className="up-prog-bar">
                      <div className="up-prog-fill" style={{ width: `${f.progress}%` }} />
                    </div>
                    <div className="up-prog-label">
                      {f.done ? '✅ Processing complete' : `Uploading… ${f.progress}%`}
                    </div>
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
          {docs.map((d, i) => (
            <div key={i} className="up-doc-row">
              <span className="up-file-icon">{fileIcon(d.name)}</span>
              <div className="up-doc-info">
                <div className="up-doc-name">{d.name}</div>
                <div className="up-doc-meta">{d.size} · {d.date}</div>
              </div>
              <div className="up-doc-right">
                {d.status === 'processed' ? (
                  <span className="up-status-ok">✅ {d.tasks} tasks found</span>
                ) : (
                  <span className="up-status-proc">⏳ Processing…</span>
                )}
              </div>
            </div>
          ))}
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
