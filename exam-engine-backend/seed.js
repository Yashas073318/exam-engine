/**
 * seed.js
 * Run:  node seed.js
 *
 * Creates:
 *   - 1 admin user
 *   - 2 student users
 *   - 10 questions (mix of topics & difficulties)
 *   - 2 published exams
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User     = require('./models/User');
const Question = require('./models/Question');
const Exam     = require('./models/Exam');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🔗  Connected to MongoDB');

  // ── Clean slate ────────────────────────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    Question.deleteMany({}),
    Exam.deleteMany({}),
  ]);
  console.log('🗑   Cleared existing data');

  // ── Users ──────────────────────────────────────────────────────────────────
  const adminUser = await User.create({
    name: 'Admin Kumar',
    email: 'admin@examengine.dev',
    password: 'admin123',
    role: 'admin',
  });

  const [student1, student2] = await User.create([
    { name: 'Alice Sharma', email: 'alice@student.dev', password: 'student123', role: 'student' },
    { name: 'Bob Verma',    email: 'bob@student.dev',   password: 'student123', role: 'student' },
  ]);

  console.log('👤  Users created');

  // ── Questions ──────────────────────────────────────────────────────────────
  const questionsData = [
    {
      text: 'What does the `===` operator check in JavaScript?',
      options: [
        { label: 'A', text: 'Value only' },
        { label: 'B', text: 'Type only' },
        { label: 'C', text: 'Value and type' },
        { label: 'D', text: 'Reference equality' },
      ],
      correctOption: 'C',
      difficulty: 'easy',
      topic: 'JavaScript',
      explanation: '=== checks both value and type (strict equality).',
    },
    {
      text: 'Which Mongoose method starts an ACID transaction?',
      options: [
        { label: 'A', text: 'mongoose.beginTransaction()' },
        { label: 'B', text: 'session.startTransaction()' },
        { label: 'C', text: 'db.startSession()' },
        { label: 'D', text: 'mongoose.session()' },
      ],
      correctOption: 'B',
      difficulty: 'medium',
      topic: 'Databases',
      explanation: 'You call session.startTransaction() on a Mongoose client session.',
    },
    {
      text: 'What does $unwind do in a MongoDB aggregation pipeline?',
      options: [
        { label: 'A', text: 'Sorts the documents' },
        { label: 'B', text: 'Joins two collections' },
        { label: 'C', text: 'Deconstructs an array field into individual documents' },
        { label: 'D', text: 'Groups documents by a field' },
      ],
      correctOption: 'C',
      difficulty: 'medium',
      topic: 'Databases',
      explanation: '$unwind creates one output document per element in an array field.',
    },
    {
      text: 'Which HTTP status code indicates "resource created successfully"?',
      options: [
        { label: 'A', text: '200' },
        { label: 'B', text: '201' },
        { label: 'C', text: '204' },
        { label: 'D', text: '202' },
      ],
      correctOption: 'B',
      difficulty: 'easy',
      topic: 'REST APIs',
      explanation: '201 Created is the standard response for a successful POST.',
    },
    {
      text: 'In React, what hook would you use to run code when a component mounts?',
      options: [
        { label: 'A', text: 'useState' },
        { label: 'B', text: 'useCallback' },
        { label: 'C', text: 'useMemo' },
        { label: 'D', text: 'useEffect' },
      ],
      correctOption: 'D',
      difficulty: 'easy',
      topic: 'React',
      explanation: 'useEffect with an empty dependency array runs once after mount.',
    },
    {
      text: 'What is the purpose of `select: false` in a Mongoose schema field?',
      options: [
        { label: 'A', text: 'Makes the field read-only' },
        { label: 'B', text: 'Excludes the field from query results by default' },
        { label: 'C', text: 'Prevents the field from being indexed' },
        { label: 'D', text: 'Marks the field as optional' },
      ],
      correctOption: 'B',
      difficulty: 'medium',
      topic: 'Databases',
      explanation: 'select: false hides the field unless explicitly opted in with +fieldName.',
    },
    {
      text: 'Which aggregation stage performs a cross-collection join in MongoDB?',
      options: [
        { label: 'A', text: '$group' },
        { label: 'B', text: '$match' },
        { label: 'C', text: '$lookup' },
        { label: 'D', text: '$project' },
      ],
      correctOption: 'C',
      difficulty: 'hard',
      topic: 'Databases',
      explanation: '$lookup is MongoDB\'s equivalent of a SQL JOIN.',
    },
    {
      text: 'What does JWT stand for?',
      options: [
        { label: 'A', text: 'Java Web Token' },
        { label: 'B', text: 'JSON Web Token' },
        { label: 'C', text: 'JavaScript Web Transfer' },
        { label: 'D', text: 'JSON Web Transfer' },
      ],
      correctOption: 'B',
      difficulty: 'easy',
      topic: 'Security',
      explanation: 'JWT = JSON Web Token, a compact URL-safe token format.',
    },
    {
      text: 'In Express, what does next(err) do?',
      options: [
        { label: 'A', text: 'Moves to the next route handler' },
        { label: 'B', text: 'Sends an error response to the client' },
        { label: 'C', text: 'Passes control to the error-handling middleware' },
        { label: 'D', text: 'Terminates the request' },
      ],
      correctOption: 'C',
      difficulty: 'medium',
      topic: 'REST APIs',
      explanation: 'Calling next(err) skips remaining middleware and invokes error handlers.',
    },
    {
      text: 'Which React hook prevents a function from being recreated on every render?',
      options: [
        { label: 'A', text: 'useRef' },
        { label: 'B', text: 'useEffect' },
        { label: 'C', text: 'useMemo' },
        { label: 'D', text: 'useCallback' },
      ],
      correctOption: 'D',
      difficulty: 'hard',
      topic: 'React',
      explanation: 'useCallback memoizes the function reference across renders.',
    },
  ];

  const questions = await Question.insertMany(
    questionsData.map((q) => ({ ...q, createdBy: adminUser._id }))
  );
  console.log(`❓  ${questions.length} questions created`);

  // ── Exams ──────────────────────────────────────────────────────────────────
  const [exam1, exam2] = await Exam.create([
    {
      title: 'Full-Stack Fundamentals',
      description: 'Covers JavaScript, React, REST APIs and Mongoose basics.',
      questions: questions.slice(0, 6).map((q) => q._id),
      timeLimit: 10,
      passMark: 60,
      isPublished: true,
      createdBy: adminUser._id,
    },
    {
      title: 'Advanced Databases & Security',
      description: 'Deep-dive into MongoDB aggregations, transactions, and JWT.',
      questions: questions.slice(4).map((q) => q._id),
      timeLimit: 15,
      passMark: 70,
      isPublished: true,
      createdBy: adminUser._id,
    },
  ]);

  console.log(`📋  Exams created: "${exam1.title}", "${exam2.title}"`);

  console.log('\n✅  Seed complete!');
  console.log('──────────────────────────────────────');
  console.log('👤  Admin   → admin@examengine.dev   / admin123');
  console.log('👤  Student → alice@student.dev      / student123');
  console.log('👤  Student → bob@student.dev        / student123');
  console.log('──────────────────────────────────────');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
