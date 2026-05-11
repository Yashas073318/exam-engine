import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examAPI, attemptAPI } from '../../api/endpoints';
import QuestionCard from '../../components/Exam/QuestionCard';
import Timer from '../../components/Exam/Timer';

const ActiveExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [answers, setAnswers]     = useState({});  // { questionId: selectedOption }
  const [currentIdx, setCurrentIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [startTime]               = useState(Date.now());

  const submittingRef = useRef(false);

  useEffect(() => {
    examAPI.getById(id)
      .then(({ data }) => setExam(data))
      .catch(() => navigate('/student/exams'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSelect = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  // ── Auto-submit when timer expires ─────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return;  // prevent double-submit
    submittingRef.current = true;
    setSubmitting(true);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const answersArray = Object.entries(answers).map(([questionId, selectedOption]) => ({
      questionId,
      selectedOption,
    }));

    try {
      const { data } = await attemptAPI.submit({
        examId: id,
        answers: answersArray,
        timeTaken,
      });
      navigate(`/student/results/${data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
      setSubmitting(false);
      submittingRef.current = false;
    }
  }, [answers, id, startTime, navigate]);

  if (loading) return <div className="loading">Loading exam...</div>;
  if (!exam)   return null;

  const questions = exam.questions || [];
  const answered  = Object.keys(answers).length;
  const progress  = (answered / questions.length) * 100;
  const current   = questions[currentIdx];

  return (
    <div>
      {/* ── Header bar ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{exam.title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {answered} of {questions.length} answered
          </p>
        </div>
        <Timer
          totalSeconds={exam.timeLimit * 60}
          storageKey={`exam-timer-${id}`}
          onExpire={handleSubmit}
        />
      </div>

      {/* ── Progress ────────────────────────────────────────────────────────── */}
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* ── Question navigation strip ────────────────────────────────────────── */}
      <div className="question-nav">
        {questions.map((q, i) => (
          <button
            key={q._id}
            id={`q-nav-${i}`}
            className={`q-nav-btn ${answers[q._id] ? 'answered' : ''} ${i === currentIdx ? 'current' : ''}`}
            onClick={() => setCurrentIdx(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* ── Active question ──────────────────────────────────────────────────── */}
      {current && (
        <QuestionCard
          question={current}
          index={currentIdx}
          selectedOption={answers[current._id]}
          onSelect={handleSelect}
        />
      )}

      {/* ── Navigation buttons ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
        <button
          id="prev-question-btn"
          className="btn btn-outline"
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
        >
          ← Previous
        </button>

        {currentIdx < questions.length - 1 ? (
          <button
            id="next-question-btn"
            className="btn btn-primary"
            onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
          >
            Next →
          </button>
        ) : (
          <button
            id="submit-exam-btn"
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? '⏳ Submitting...' : '✅ Submit Exam'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ActiveExam;
