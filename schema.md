# ExamEngine — Database Schema Reference

> MongoDB + Mongoose | 4 Collections | Cross-collection relations via `ObjectId ref`

---

## Collections at a Glance

```
users ──────────────────────────────────────────┐
                                                 │  (createdBy)
questions ──────────────────────────────────────┤
              │                                  │
              │  (questions[])                   │
exams ─────────────────────────────────────────┤
              │                                  │
              │  (exam ref, user ref)            │
attempts ──────────────────────────────────────┘
```

---

## 1. `users` Collection

**Model file:** `models/User.js`

| Field          | Type       | Required | Default     | Notes                              |
|----------------|------------|----------|-------------|------------------------------------|
| `_id`          | ObjectId   | auto     | —           | Primary key (auto-generated)       |
| `name`         | String     | ✅        | —           | Display name                       |
| `email`        | String     | ✅        | —           | Unique, lowercase, indexed         |
| `password`     | String     | ✅        | —           | bcrypt hashed, never returned      |
| `role`         | String     | ✅        | `"student"` | Enum: `"admin"` \| `"student"`     |
| `totalPoints`  | Number     | —        | `0`         | Incremented by ACID transaction    |
| `attemptCount` | Number     | —        | `0`         | Incremented per submitted attempt  |
| `createdAt`    | Date       | auto     | `Date.now`  | Mongoose timestamps                |
| `updatedAt`    | Date       | auto     | `Date.now`  | Mongoose timestamps                |

### Indexes
```js
{ email: 1 }  // unique: true
{ role: 1 }   // for admin filtering
```

### Mongoose Schema
```js
const UserSchema = new Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, required: true, select: false },  // hidden by default
  role:         { type: String, enum: ['admin', 'student'], default: 'student' },
  totalPoints:  { type: Number, default: 0 },
  attemptCount: { type: Number, default: 0 },
}, { timestamps: true });
```

---

## 2. `questions` Collection

**Model file:** `models/Question.js`

| Field           | Type       | Required | Default | Notes                                  |
|-----------------|------------|----------|---------|----------------------------------------|
| `_id`           | ObjectId   | auto     | —       | Primary key                            |
| `text`          | String     | ✅        | —       | The question body                      |
| `options`       | Array      | ✅        | —       | 4 objects: `{ label, text }`           |
| `options.label` | String     | ✅        | —       | `"A"`, `"B"`, `"C"`, `"D"`            |
| `options.text`  | String     | ✅        | —       | Option description                     |
| `correctOption` | String     | ✅        | —       | `"A"/"B"/"C"/"D"` — **never sent to student** |
| `difficulty`    | String     | ✅        | —       | Enum: `"easy"` \| `"medium"` \| `"hard"` |
| `topic`         | String     | ✅        | —       | e.g. `"JavaScript"`, `"Databases"`     |
| `explanation`   | String     | —        | —       | Shown after attempt submission         |
| `createdBy`     | ObjectId   | ✅        | —       | **ref → `users`** (admin who created)  |
| `createdAt`     | Date       | auto     | —       | Mongoose timestamps                    |

### Indexes
```js
{ topic: 1 }
{ difficulty: 1 }
{ createdBy: 1 }
```

### Mongoose Schema
```js
const QuestionSchema = new Schema({
  text:          { type: String, required: true },
  options: [{
    label:       { type: String, required: true },
    text:        { type: String, required: true },
  }],
  correctOption: { type: String, required: true, select: false }, // hidden from API
  difficulty:    { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  topic:         { type: String, required: true },
  explanation:   { type: String },
  createdBy:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
```

---

## 3. `exams` Collection

**Model file:** `models/Exam.js`

| Field         | Type          | Required | Default | Notes                                    |
|---------------|---------------|----------|---------|------------------------------------------|
| `_id`         | ObjectId      | auto     | —       | Primary key                              |
| `title`       | String        | ✅        | —       | Exam display name                        |
| `description` | String        | —        | —       | Short summary shown on listing page      |
| `questions`   | [ObjectId]    | ✅        | —       | **ref → `questions`** (ordered list)     |
| `timeLimit`   | Number        | ✅        | —       | Minutes — used by frontend `useTimer`    |
| `passMark`    | Number        | —        | `50`    | Percentage to "pass" (shown on result)   |
| `isPublished` | Boolean       | —        | `false` | Students only see `isPublished: true`    |
| `createdBy`   | ObjectId      | ✅        | —       | **ref → `users`** (admin)                |
| `createdAt`   | Date          | auto     | —       | Mongoose timestamps                      |

### Indexes
```js
{ isPublished: 1 }
{ createdBy: 1 }
```

### Mongoose Schema
```js
const ExamSchema = new Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String },
  questions:   [{ type: Schema.Types.ObjectId, ref: 'Question', required: true }],
  timeLimit:   { type: Number, required: true },  // in minutes
  passMark:    { type: Number, default: 50 },      // percentage
  isPublished: { type: Boolean, default: false },
  createdBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
```

---

## 4. `attempts` Collection

**Model file:** `models/Attempt.js`
> ⚠️ This is the most important collection — it has a **pre-save middleware** that auto-grades.

| Field             | Type       | Required | Default    | Notes                                        |
|-------------------|------------|----------|------------|----------------------------------------------|
| `_id`             | ObjectId   | auto     | —          | Primary key                                  |
| `user`            | ObjectId   | ✅        | —          | **ref → `users`**                            |
| `exam`            | ObjectId   | ✅        | —          | **ref → `exams`**                            |
| `answers`         | Array      | ✅        | —          | Student's responses (see sub-schema below)   |
| `answers.questionId` | ObjectId | ✅      | —          | **ref → `questions`**                        |
| `answers.selectedOption` | String | ✅   | —          | `"A"/"B"/"C"/"D"`                           |
| `score`           | Number     | —        | computed   | **Set by pre-save middleware (0–100)**        |
| `correctAnswers`  | Number     | —        | computed   | Count of correct answers — set by middleware |
| `totalQuestions`  | Number     | —        | computed   | Populated from `exam.questions.length`       |
| `timeTaken`       | Number     | —        | —          | Seconds elapsed before submission            |
| `submittedAt`     | Date       | —        | `Date.now` | Timestamp of submission                      |

### Indexes
```js
{ user: 1, exam: 1 }       // compound — used in "has student attempted?" check
{ exam: 1, score: -1 }     // used by leaderboard aggregation
{ submittedAt: -1 }        // for recent-attempts queries
```

### Mongoose Schema + Pre-save Middleware
```js
const AttemptSchema = new Schema({
  user:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  exam:   { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  answers: [{
    questionId:     { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedOption: { type: String, required: true },
  }],
  score:           { type: Number },   // DO NOT set from client — middleware handles this
  correctAnswers:  { type: Number },
  totalQuestions:  { type: Number },
  timeTaken:       { type: Number },   // seconds
  submittedAt:     { type: Date, default: Date.now },
});

// ── PRE-SAVE MIDDLEWARE ──────────────────────────────────────────────────────
AttemptSchema.pre('save', async function (next) {
  if (!this.isNew) return next();  // only grade on first save

  const exam = await Exam.findById(this.exam).populate({
    path: 'questions',
    select: '+correctOption',  // correctOption has select:false, must opt-in
  });

  const { score, correctAnswers } = gradeAttempt(this.answers, exam.questions);

  this.score           = score;
  this.correctAnswers  = correctAnswers;
  this.totalQuestions  = exam.questions.length;
  next();
});
```

---

## Relationships Diagram

```
┌─────────────┐         ┌──────────────┐
│    users    │◄────────│   attempts   │
│─────────────│  user   │──────────────│
│ _id         │         │ _id          │
│ name        │         │ user  ───────┤── ref → users._id
│ email       │         │ exam  ───────┤── ref → exams._id
│ role        │         │ answers[]    │
│ totalPoints │         │  .questionId ┤── ref → questions._id
│ attemptCount│         │  .selected   │
└─────────────┘         │ score ◄──── │ (pre-save middleware)
       ▲                │ correctAns  │
       │createdBy       └──────────────┘
       │                       ▲
┌─────────────┐                │ exam
│    exams    │────────────────┘
│─────────────│
│ _id         │
│ title       │
│ questions[] ┼──── ref → questions._id[]
│ timeLimit   │
│ isPublished │
│ createdBy───┼──── ref → users._id
└─────────────┘
       │
       │ questions[]
       ▼
┌──────────────┐
│  questions   │
│──────────────│
│ _id          │
│ text         │
│ options[]    │
│ correctOption│ ← select: false (hidden from API responses)
│ difficulty   │
│ topic        │
│ createdBy────┼──── ref → users._id
└──────────────┘
```

---

## ACID Transaction Flow

When a student submits an exam, **two writes happen atomically**:

```
START SESSION
  │
  ├─ 1. attempt.save({ session })
  │      └── pre-save middleware grades the attempt
  │
  ├─ 2. User.findByIdAndUpdate(
  │        userId,
  │        { $inc: { totalPoints: score, attemptCount: 1 } },
  │        { session }
  │      )
  │
COMMIT  ← both succeed, or
ABORT   ← neither persists (e.g. if user doc not found)
```

---

## Aggregation Pipeline Inputs/Outputs

### Leaderboard — `/api/analytics/leaderboard/:examId`
**Input collection:** `attempts`
**Output shape:**
```json
[
  { "rank": 1, "name": "Alice",   "bestScore": 95, "attempts": 2 },
  { "rank": 2, "name": "Bob",     "bestScore": 82, "attempts": 1 },
  { "rank": 3, "name": "Charlie", "bestScore": 70, "attempts": 3 }
]
```

### Question Insights — `/api/analytics/insights`
**Input collection:** `attempts` → `$unwind answers` → `$lookup questions`
**Output shape:**
```json
[
  {
    "questionText": "What does `===` check in JavaScript?",
    "topic": "JavaScript",
    "totalAttempts": 120,
    "wrongAnswers": 98,
    "failureRate": 0.817
  }
]
```
> Sorted descending by `failureRate` — the most-failed questions appear first.

---

## Environment Variables (`.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/examengine
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```
