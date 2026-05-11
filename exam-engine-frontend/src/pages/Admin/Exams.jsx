import { useEffect, useState } from 'react';
import { examAPI, questionAPI } from '../../api/endpoints';

const emptyForm = { title: '', description: '', timeLimit: 15, passMark: 60, questions: [], mode: 'open' };

const AdminExams = () => {
  const [exams, setExams]         = useState([]);
  const [allQs, setAllQs]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const [e, q] = await Promise.all([examAPI.getAll(), questionAPI.getAll()]);
    setExams(e.data); setAllQs(q.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleQuestion = (id) => {
    setForm((f) => ({
      ...f,
      questions: f.questions.includes(id)
        ? f.questions.filter((q) => q !== id)
        : [...f.questions, id],
    }));
  };

  const handleEdit = (exam) => {
    setEditingId(exam._id);
    setForm({
      title: exam.title,
      description: exam.description || '',
      timeLimit: exam.timeLimit,
      passMark: exam.passMark,
      questions: exam.questions?.map(q => typeof q === 'object' ? q._id : q) || [],
      mode: exam.mode || 'open'
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editingId) {
        await examAPI.update(editingId, form);
      } else {
        await examAPI.create(form);
      }
      cancelEdit();
      load();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const togglePublish = async (exam) => {
    const fn = exam.isPublished ? examAPI.unpublish : examAPI.publish;
    await fn(exam._id);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam?')) return;
    await examAPI.remove(id); setExams((e) => e.filter((x) => x._id !== id));
  };

  const diffColor = { easy: 'var(--success)', medium: 'var(--warning)', hard: 'var(--danger)' };

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>Exam Management</h1>
          <p>Create and edit exams by selecting questions from the bank.</p>
        </div>
        <button id="add-exam-btn" className="btn btn-primary" onClick={() => showForm ? cancelEdit() : setShowForm(true)}>
          {showForm ? '✕ Cancel' : '+ New Exam'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-title" style={{ marginBottom: '1.25rem' }}>
            {editingId ? 'Edit Exam' : 'New Exam'}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Exam title" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description" style={{ minHeight: 60 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Time Limit (minutes)</label>
                <input className="form-input" type="number" min="1" required value={form.timeLimit}
                  onChange={(e) => setForm({ ...form, timeLimit: +e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Pass Mark (%)</label>
                <input className="form-input" type="number" min="0" max="100" value={form.passMark}
                  onChange={(e) => setForm({ ...form, passMark: +e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Exam Mode</label>
                <select className="form-select" value={form.mode}
                  onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                  <option value="open">Open (No tracking)</option>
                  <option value="proctored">Proctored (Strict monitoring)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Select Questions ({form.questions.length} selected)
              </label>
              <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {allQs.map((q) => {
                  const selected = form.questions.includes(q._id);
                  return (
                    <div key={q._id}
                      id={`select-q-${q._id}`}
                      onClick={() => toggleQuestion(q._id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)',
                        background: selected ? 'var(--accent-glow)' : 'var(--bg-surface)',
                        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                        cursor: 'pointer', transition: 'all 0.12s',
                      }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4,
                        background: selected ? 'var(--accent)' : 'var(--bg-hover)',
                        border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', flexShrink: 0,
                      }}>
                        {selected && '✓'}
                      </div>
                      <span style={{ fontSize: '0.85rem', flex: 1 }}>{q.text}</span>
                      <span style={{ fontSize: '0.72rem', color: diffColor[q.difficulty], fontWeight: 600 }}>
                        {q.difficulty}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button id="save-exam-btn" type="submit" className="btn btn-primary" disabled={saving || form.questions.length === 0}>
              {saving ? 'Saving...' : (editingId ? '💾 Update Exam' : '💾 Create Exam')}
            </button>
          </form>
        </div>
      )}

      {loading ? <div className="loading">Loading...</div> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Title</th><th>Questions</th><th>Time</th><th>Pass</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam._id}>
                  <td style={{ fontWeight: 600 }}>{exam.title}</td>
                  <td>{exam.questions?.length}</td>
                  <td>{exam.timeLimit} min</td>
                  <td>{exam.passMark}%</td>
                  <td>
                    <span className={`badge ${exam.isPublished ? 'badge-success' : 'badge-warning'}`}>
                      {exam.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <button id={`toggle-publish-${exam._id}`}
                      className={`btn btn-sm ${exam.isPublished ? 'btn-outline' : 'btn-success'}`}
                      onClick={() => togglePublish(exam)}>
                      {exam.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button id={`edit-exam-${exam._id}`}
                      className="btn btn-outline btn-sm" onClick={() => handleEdit(exam)}>Edit</button>
                    <button id={`delete-exam-${exam._id}`}
                      className="btn btn-danger btn-sm" onClick={() => handleDelete(exam._id)}>Delete</button>
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

export default AdminExams;
