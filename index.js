const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Database of interesting words with definitions, examples, and categories
const wordDatabase = [
  {
    word: 'Serendipity',
    definition: 'The occurrence of events by chance in a happy or beneficial way',
    example: 'Finding exactly what you needed while looking for something else was pure serendipity',
    category: 'positive'
  },
  {
    word: 'Eloquent',
    definition: 'Fluent or persuasive in speaking or writing',
    example: 'Her eloquent speech moved the entire audience',
    category: 'communication'
  },
  {
    word: 'Ubiquitous',
    definition: 'Present, appearing, or found everywhere',
    example: 'Mobile phones have become ubiquitous in modern society',
    category: 'descriptive'
  },
  {
    word: 'Pragmatic',
    definition: 'Dealing with things sensibly and realistically',
    example: 'We need a pragmatic approach to solving this problem',
    category: 'mindset'
  },
  {
    word: 'Ephemeral',
    definition: 'Lasting for a very short time',
    example: 'The ephemeral beauty of cherry blossoms lasts only a few days',
    category: 'descriptive'
  },
  // Add more words as needed
];

// Store the current word of the day
let currentWordOfTheDay = selectRandomWord();
let lastUpdated = new Date();

// Schedule task to update word daily at midnight
cron.schedule('0 0 * * *', () => {
  currentWordOfTheDay = selectRandomWord();
  lastUpdated = new Date();
  console.log('Word of the day updated:', currentWordOfTheDay.word);
});

function selectRandomWord() {
  const randomIndex = Math.floor(Math.random() * wordDatabase.length);
  return wordDatabase[randomIndex];
}

// Root endpoint with API information
app.get('/', (req, res) => {
  res.json({
    name: 'Daily Word API',
    description: 'A free API that provides useful words daily',
    endpoints: [
      { path: '/word', description: 'Get the current word of the day' },
      { path: '/word/random', description: 'Get a random word from the database' },
      { path: '/word/category/:category', description: 'Get a random word from a specific category' }
    ],
    author: 'Your Name',
    version: '1.0.0'
  });
});

// Get current word of the day
app.get('/word', (req, res) => {
  res.json({
    data: currentWordOfTheDay,
    lastUpdated: lastUpdated.toISOString(),
    nextUpdate: getNextUpdateTime()
  });
});

// Get random word
app.get('/word/random', (req, res) => {
  const randomWord = selectRandomWord();
  res.json({
    data: randomWord,
    timestamp: new Date().toISOString()
  });
});

// Get word by category
app.get('/word/category/:category', (req, res) => {
  const { category } = req.params;
  const wordsInCategory = wordDatabase.filter(word => word.category === category);
  
  if (wordsInCategory.length === 0) {
    return res.status(404).json({
      error: 'Category not found',
      availableCategories: [...new Set(wordDatabase.map(word => word.category))]
    });
  }
  
  const randomIndex = Math.floor(Math.random() * wordsInCategory.length);
  res.json({
    data: wordsInCategory[randomIndex],
    timestamp: new Date().toISOString()
  });
});

// Helper function to calculate next update time
function getNextUpdateTime() {
  const nextUpdate = new Date();
  nextUpdate.setHours(24, 0, 0, 0);
  return nextUpdate.toISOString();
}

// Start the server
app.listen(PORT, () => {
  console.log(`Daily Word API running on port ${PORT}`);
});