import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { attemptAPI } from '../../api/endpoints';
import QuestionCard from '../../components/Exam/QuestionCard';

const Results = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attemptAPI.getById(attemptId)
      .then(({ data }) => setAttempt(data))
      .catch(() => navigate('/student/exams'))
      .finally(() => setLoading(false));
  }, [attemptId, navigate]);

  if (loading) return <div className="loading">Loading results...</div>;
  if (!attempt) return null;

  const { score, correctAnswers, totalQuestions, timeTaken, exam, answers } = attempt;
  const passed  = score >= (exam?.passMark || 50);
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  // Build answer lookup for QuestionCard result mode
  const answerMap = {};
  answers.forEach((a) => { answerMap[a.questionId?._id] = a.selectedOption; });

  return (
    <div>
      {/* ── Score hero ──────────────────────────────────────────────────────── */}
      <div style={{
        background: passed
          ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))'
          : 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))',
        border: `1px solid ${passed ? 'var(--success)' : 'var(--danger)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem',
        textAlign: 'center',
        marginBottom: '2rem',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
          {passed ? '🎉' : '😔'}
        </div>
        <div style={{ fontSize: '3.5rem', fontWeight: 800, color: passed ? 'var(--success)' : 'var(--danger)' }}>
          {score}%
        </div>
        <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
          {passed ? 'Congratulations — You Passed!' : 'Better luck next time!'}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.5rem' }}>{correctAnswers}/{totalQuestions}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Correct</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.5rem' }}>{minutes}m {seconds}s</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Time Taken</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.5rem' }}>{exam?.passMark}%</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pass Mark</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/student/exams" className="btn btn-outline">← Back to Exams</Link>
        <Link to="/student/history" className="btn btn-primary">📝 My History</Link>
      </div>

      {/* ── Per-question review ─────────────────────────────────────────────── */}
      <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Review Answers</h2>
      {answers.map((answer, i) => (
        answer.questionId && (
          <QuestionCard
            key={answer.questionId._id}
            question={answer.questionId}
            index={i}
            selectedOption={answer.selectedOption}
            showResult={true}
          />
        )
      ))}
    </div>
  );
};

export default Results;
