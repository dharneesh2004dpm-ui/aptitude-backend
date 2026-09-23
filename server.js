const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// IMPORTANT: Replace the string below with your actual MongoDB URL if not using process.env
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://<username>:<password>@cluster0.mongodb.net/aptitude_db"; 
mongoose.connect(MONGO_URI).then(() => console.log("MongoDB Connected")).catch(err => console.log(err));

// --- 1. SCHEMAS (Database Structure) ---
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    resetOTP: { type: String },
    otpExpiry: { type: Date }
});
const User = mongoose.model('User', userSchema);

const questionSchema = new mongoose.Schema({
    topic: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String },
    marks: { type: Number, default: 1 },
    timeSeconds: { type: Number, default: 60 }
});
const Question = mongoose.model('Question', questionSchema);

const testSchema = new mongoose.Schema({
    title: { type: String, required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    durationMinutes: { type: Number, required: true },
    isLive: { type: Boolean, default: false },
    scheduledStart: { type: Date },
    maxAttempts: { type: Number, default: 1 }
});
const Test = mongoose.model('Test', testSchema);


// --- 2. ROUTES (API Endpoints) ---

// Get all questions for Admin
app.get('/api/admin/questions', async (req, res) => {
    try {
        const questions = await Question.find();
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Add Question
app.post('/api/admin/questions', async (req, res) => {
    try {
        const newQuestion = await Question.create(req.body);
        res.json(newQuestion);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Create Test
app.post('/api/admin/tests', async (req, res) => {
    try {
        const newTest = await Test.create(req.body);
        res.json(newTest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// NEW: IndiaBix Practice Engine - Fetch questions by specific topic
app.get('/api/practice/:topic', async (req, res) => {
    try {
        const topicName = decodeURIComponent(req.params.topic);
        const questions = await Question.find({ topic: topicName });
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Student Fetch Live Test
app.get('/api/test/:id', async (req, res) => {
    try {
        const test = await Test.findById(req.params.id).populate('questions');
        res.json(test);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Student Submit Test
app.post('/api/test/:id/submit', async (req, res) => {
    res.json({ message: "Test submitted successfully" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));