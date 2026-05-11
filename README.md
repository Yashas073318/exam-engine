# ExamEngine — Advanced MERN Exam Platform

A production-grade exam platform demonstrating complex Mongoose patterns: relational modeling, pre-save middleware grading, ACID transactions, and advanced aggregation pipelines (leaderboards & question insights).

---

## 🚀 Quick Start Guide ()

### 1. Prerequisites
- **Node.js** (v16+)
- **MongoDB** (Local instance or Atlas cluster)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd exam-engine-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Create a `.env` file in `exam-engine-backend/` (or edit the existing one):
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   ```
4. **Seed the Database**:
   Populate the database with test questions, exams, and users:
   ```bash
   npm run seed
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd exam-engine-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the app in your browser (usually at `http://localhost:5173` or `5174`).

---

## 👤 Demo Credentials

After running `npm run seed`, you can log in with these accounts:

- **Admin**: `admin@examengine.dev` / `admin123`
- **Student**: `alice@student.dev` / `student123`
- **Student**: `bob@student.dev` / `student123`

---

## 🛠 Features Demonstrated

- **Relational Modeling**: Using `ref` for ObjectIds to link Users, Questions, Exams, and Attempts.
- **Pre-save Middleware**: Automatic grading logic on the `Attempt` document before saving.
- **ACID Transactions**: Ensuring data consistency between `Attempt` creation and `User` profile updates.
- **Aggregation Pipelines**:
  - **Leaderboards**: Ranked performance using `$group` and `$setWindowFields`.
  - **Insights**: Question failure rates using `$unwind` and `$lookup`.
- **Premium UI**: Dark-mode interface built with Vite, React, and Recharts.
