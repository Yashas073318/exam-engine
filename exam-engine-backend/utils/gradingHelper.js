/**
 * gradingHelper.js
 *
 * Pure grading logic — intentionally separated from the Mongoose middleware
 * so it can be unit-tested without a DB connection.
 *
 * @param {Array} answers       - Student's answers: [{ questionId, selectedOption }]
 * @param {Array} questions     - Populated Question documents (must include correctOption)
 * @returns {{ score: Number, correctAnswers: Number }}
 */
const gradeAttempt = (answers, questions) => {
  // Build a quick-lookup map: questionId (string) → correctOption
  const answerKey = {};
  for (const q of questions) {
    answerKey[q._id.toString()] = q.correctOption;
  }

  let correctAnswers = 0;

  for (const answer of answers) {
    const correct = answerKey[answer.questionId.toString()];
    if (correct && answer.selectedOption === correct) {
      correctAnswers++;
    }
  }

  // Score as percentage (rounded to 2 decimal places)
  const score =
    questions.length > 0
      ? parseFloat(((correctAnswers / questions.length) * 100).toFixed(2))
      : 0;

  return { score, correctAnswers };
};

module.exports = { gradeAttempt };
