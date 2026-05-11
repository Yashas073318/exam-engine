import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { examAPI } from '../../api/endpoints';

const ExamList = () => {
  const [exams, setExams]     = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    examAPI.getAll()
      .then(({ data }) => setExams(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
              className="exam-card"
              onClick={() => navigate(`/student/exam/${exam._id}`)}
            >
              <div className="card-title">{exam.title}</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                {exam.description}
              </p>

              <div className="exam-card-meta">
                <span className="badge badge-info">⏱ {exam.timeLimit} min</span>
                <span className="badge badge-accent">❓ {exam.questions?.length} Qs</span>
                <span className="badge badge-warning">🎯 Pass: {exam.passMark}%</span>
              </div>

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
