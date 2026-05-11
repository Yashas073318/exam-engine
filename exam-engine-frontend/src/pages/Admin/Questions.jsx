import { useEffect, useState } from 'react';
import { questionAPI } from '../../api/endpoints';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const LABELS = ['A', 'B', 'C', 'D'];

const emptyForm = {
  text: '', topic: '', difficulty: 'medium', explanation: '', correctOption: 'A',
  options: LABELS.map((l) => ({ label: l, text: '' })),
};

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const load = () => {
    questionAPI.getAll()
      .then(({ data }) => setQuestions(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleOptionText = (label, value) => {
    setForm((f) => ({
      ...f,
      options: f.options.map((o) => (o.label === label ? { ...o, text: value } : o)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await questionAPI.create(form);
      setForm(emptyForm); setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create question');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    await questionAPI.remove(id);
    setQuestions((q) => q.filter((x) => x._id !== id));
  };

  const diffBadge = { easy: 'badge-success', medium: 'badge-warning', hard: 'badge-danger' };

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>Question Bank</h1>
          <p>Create and manage atomic question units.</p>
        </div>
        <button id="add-question-btn" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ New Question'}
        </button>
      </div>

      {/* ── Create form ────────────────────────────────────────────────────── */}
      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-title" style={{ marginBottom: '1.25rem' }}>New Question</div>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Question Text</label>
              <textarea className="form-textarea" value={form.text} required
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="Enter the question..." />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Topic</label>
                <input className="form-input" value={form.topic} required
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="e.g. JavaScript" />
              </div>
              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select className="form-select" value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                  {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Options</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                {LABELS.map((l) => (
                  <div key={l} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>{l}</span>
                    <input className="form-input" required placeholder={`Option ${l}`}
                      value={form.options.find((o) => o.label === l)?.text || ''}
                      onChange={(e) => handleOptionText(l, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Correct Option</label>
                <select className="form-select" value={form.correctOption}
                  onChange={(e) => setForm({ ...form, correctOption: e.target.value })}>
                  {LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Explanation (optional)</label>
                <input className="form-input" value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  placeholder="Why is this the correct answer?" />
              </div>
            </div>

            <button id="save-question-btn" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Question'}
            </button>
          </form>
        </div>
      )}

      {/* ── Questions table ────────────────────────────────────────────────── */}
      {loading ? <div className="loading">Loading...</div> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Question</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>Correct</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q._id}>
                  <td style={{ maxWidth: 340, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.text}</td>
                  <td><span className="badge badge-info">{q.topic}</span></td>
                  <td><span className={`badge ${diffBadge[q.difficulty]}`}>{q.difficulty}</span></td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-light)' }}>{q.correctOption}</td>
                  <td>
                    <button id={`delete-q-${q._id}`} className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(q._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminQuestions;
