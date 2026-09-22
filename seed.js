const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/aptitude_test')
  .then(() => console.log("MongoDB Connected for Seeding"))
  .catch(err => console.log("MongoDB Connection Error:", err));

// Schemas
const QuestionSchema = new mongoose.Schema({
    topic: String, questionText: String, options: [String], correctAnswer: String, explanation: String 
});
const Question = mongoose.model('Question', QuestionSchema);

const TestSchema = new mongoose.Schema({
    title: String, questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }], durationMinutes: Number, extraTimeAdded: { type: Number, default: 0 }
});
const Test = mongoose.model('Test', TestSchema);

// Insert Dummy Data
async function seedDatabase() {
    // Clear old data to avoid duplicates
    await Question.deleteMany({});
    await Test.deleteMany({});

    console.log("Adding IndiaBix Style Questions...");

    const q1 = await Question.create({
        topic: "Arithmetic",
        questionText: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
        options: ["120 metres", "180 metres", "324 metres", "150 metres"],
        correctAnswer: "150 metres",
        explanation: "Speed = 60 * (5/18) m/sec = 50/3 m/sec. Length of train = Speed * Time = (50/3) * 9 = 150 metres."
    });

    const q2 = await Question.create({
        topic: "Arithmetic",
        questionText: "The sum of ages of 5 children born at the intervals of 3 years each is 50 years. What is the age of the youngest child?",
        options: ["4 years", "8 years", "10 years", "None of these"],
        correctAnswer: "4 years",
        explanation: "Let the ages be x, x+3, x+6, x+9, x+12. Sum = 5x + 30 = 50. 5x = 20. x = 4 years."
    });

    const q3 = await Question.create({
        topic: "Arithmetic",
        questionText: "A vendor bought toffees at 6 for a rupee. How many for a rupee must he sell to gain 20%?",
        options: ["3", "4", "5", "6"],
        correctAnswer: "5",
        explanation: "C.P. of 6 toffees is Rs. 1. S.P. of 6 toffees = 120% of Rs. 1 = Rs. 1.20. For Rs. 1.20, toffees sold = 6. For Rs. 1, toffees sold = (6 / 1.20) * 1 = 5."
    });

    const test = await Test.create({
        title: "Arithmetic Aptitude Mock Test - Set 1",
        questions: [q1._id, q2._id, q3._id],
        durationMinutes: 30
    });

    console.log("\n✅ Database Seeded Successfully!");
    console.log(`\n🚀 YOUR TEST IS READY! Copy and paste this exact link into your browser to take the test:`);
    console.log(`\n--->  http://localhost:3000/test/${test._id}  <---\n`);
    process.exit();
}

seedDatabase();