const QuestionCard = ({ question, index, selectedOption, onSelect, showResult = false }) => {
  const getOptionClass = (label) => {
    if (!showResult) {
      return selectedOption === label ? 'selected' : '';
    }
    if (label === question.correctOption) return 'correct';
    if (label === selectedOption && selectedOption !== question.correctOption) return 'incorrect';
    return '';
  };

  return (
    <div className="question-card">
      <div className="question-number">Question {index + 1}</div>
      <div className="question-text">{question.text}</div>

      <div className="options-grid">
        {question.options.map((opt) => (
          <button
            key={opt.label}
            id={`question-${question._id}-option-${opt.label}`}
            className={`option-btn ${getOptionClass(opt.label)}`}
            onClick={() => !showResult && onSelect(question._id, opt.label)}
            disabled={showResult}
          >
            <span className="option-label">{opt.label}</span>
            <span>{opt.text}</span>
          </button>
        ))}
      </div>

      {showResult && question.explanation && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          background: 'rgba(108,99,255,0.08)',
          borderRadius: 'var(--radius-sm)',
          borderLeft: '3px solid var(--accent)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
        }}>
          💡 {question.explanation}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
