import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { examAPI, attemptAPI } from '../../api/endpoints';

const ExamList = () => {
  const [exams, setExams]           = useState([]);
  const [attempted, setAttempted]   = useState(new Set());
  const [loading, setLoading]       = useState(true);
  const [warningExamId, setWarningExamId] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([examAPI.getAll(), attemptAPI.getMyAll()])
      .then(([examsRes, attemptsRes]) => {
        setExams(examsRes.data);
        
        // Extract IDs of exams the user has already attempted
        const attemptedSet = new Set();
        attemptsRes.data.forEach((attempt) => {
          if (attempt.exam?._id) attemptedSet.add(attempt.exam._id);
          else if (attempt.exam) attemptedSet.add(attempt.exam);
        });
        setAttempted(attemptedSet);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStart = (examId) => {
    if (attempted.has(examId)) {
      setWarningExamId(examId);
      // Auto dismiss warning after 4 seconds
      setTimeout(() => {
        setWarningExamId((prev) => prev === examId ? null : prev);
      }, 4000);
      return;
    }
    navigate(`/student/exam/${examId}`);
  };

  if (loading) return <div className="loading">Loading exams...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Available Exams</h1>
        <p>Select an exam to start. Your score is auto-graded on submission.</p>
      </div>

      {exams.length === 0 ? (
        <div className="loading">No published exams yet. Check back later.</div>
      ) : (
        <div className="exam-grid">
          {exams.map((exam) => (
            <div
              key={exam._id}
              id={`exam-card-${exam._id}`}
              className={`exam-card ${warningExamId === exam._id ? 'shake' : ''}`}
              onClick={() => handleStart(exam._id)}
            >
              <div className="card-title">{exam.title}</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                {exam.description}
              </p>

              <div className="exam-card-meta">
                <span className="badge badge-info">⏱ {exam.timeLimit} min</span>
                <span className="badge badge-accent">❓ {exam.questions?.length} Qs</span>
                <span className="badge badge-warning">🎯 Pass: {exam.passMark}%</span>
                {attempted.has(exam._id) && (
                  <span className="badge badge-success">✅ Completed</span>
                )}
              </div>

              {warningExamId === exam._id && (
                <div className="error-msg" style={{ marginTop: '1rem', marginBottom: 0, padding: '0.6rem', fontSize: '0.8rem' }} role="alert">
                  <span className="error-msg-icon">⚠️</span>
                  <span className="error-msg-text">You have already submitted this exam. Multiple attempts are not allowed.</span>
                </div>
              )}

              <div className="exam-card-footer">
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  by {exam.createdBy?.name}
                </span>
                <button className="btn btn-primary btn-sm">Start →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamList;
