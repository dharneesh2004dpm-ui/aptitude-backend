// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://dharaneeshd7:ovCosKfxTYJwL3rd@cluster0.pvff5yv.mongodb.net/?appName=Cluster0')
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Connection Error:", err));

// --- DATABASE SCHEMAS ---

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'student' } // 'student' or 'admin'
});
const User = mongoose.model('User', UserSchema);

const QuestionSchema = new mongoose.Schema({
    topic: String, 
    questionText: String,
    options: [String],
    correctAnswer: String,
    explanation: String 
});
const Question = mongoose.model('Question', QuestionSchema);

const TestSchema = new mongoose.Schema({
    title: String,
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    durationMinutes: Number,
    extraTimeAdded: { type: Number, default: 0 }
});
const Test = mongoose.model('Test', TestSchema);

const ResultSchema = new mongoose.Schema({
    studentEmail: String,
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
    score: Number,
    timeTakenSeconds: Number,
    studentAnswers: Object 
});
const Result = mongoose.model('Result', ResultSchema);

// --- API ENDPOINTS ---
// Admin: Fetch all questions to build a test
app.get('/api/admin/questions', async (req, res) => {
    try {
        const questions = await Question.find();
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Add a Question
app.post('/api/admin/questions', async (req, res) => {
    try {
        const question = await Question.create(req.body);
        res.json(question);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Create a Test
app.post('/api/admin/tests', async (req, res) => {
    try {
        const test = await Test.create(req.body);
        res.json(test);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Student: Fetch Test (Questions Shuffled, Answers Hidden)
app.get('/api/test/:id', async (req, res) => {
    try {
        const test = await Test.findById(req.params.id).populate('questions');
        const shuffled = test.questions.sort(() => Math.random() - 0.5);
        
        const safeQuestions = shuffled.map(q => ({
            _id: q._id,
            questionText: q.questionText,
            options: q.options
        }));

        res.json({ 
            title: test.title, 
            durationMinutes: test.durationMinutes + test.extraTimeAdded, 
            questions: safeQuestions 
        });
    } catch (err) {
        res.status(500).json({ error: "Test not found" });
    }
});

// Student: Submit Test and Auto-Evaluate
app.post('/api/test/:id/submit', async (req, res) => {
    try {
        const { studentEmail, studentAnswers, timeTakenSeconds } = req.body;
        const test = await Test.findById(req.params.id).populate('questions');
        
        let score = 0;
        let detailedResults = [];

        test.questions.forEach(q => {
            const isCorrect = studentAnswers[q._id] === q.correctAnswer;
            if (isCorrect) score += 1;
            
            detailedResults.push({
                question: q.questionText,
                selectedOption: studentAnswers[q._id],
                correctOption: q.correctAnswer,
                explanation: q.explanation,
                isCorrect
            });
        });

        await Result.create({
            studentEmail, testId: req.params.id, score, timeTakenSeconds, studentAnswers
        });

        res.json({ score, total: test.questions.length, detailedResults });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Leaderboard Fetch
app.get('/api/leaderboard/:testId', async (req, res) => {
    try {
        const results = await Result.find({ testId: req.params.testId })
            .sort({ score: -1, timeTakenSeconds: 1 });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(5000, () => console.log('Backend running on port 5000'));