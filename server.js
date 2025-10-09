const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// הגשת קבצים סטטיים (תמונות אווטאר)
app.use('/public', express.static(path.join(__dirname, 'public')));

// נתיבי קבצים
const USER_TESTS_FILE = path.join(__dirname, 'data', 'userTests.json');
const TESTS_FILE = path.join(__dirname, 'data', 'tests.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const POSTS_FILE = path.join(__dirname, 'data', 'posts.json');
const COMMENTS_FILE = path.join(__dirname, 'data', 'comments.json');

// פונקציה עוזרת לקריאת קובץ JSON
const readJsonFile = (filePath, defaultData = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return defaultData;
  }
};

// פונקציה עוזרת לשמירת קובץ JSON
const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
};

// קריאת מבחני משתמש
app.get('/api/user-tests', (req, res) => {
  try {
    if (!fs.existsSync(USER_TESTS_FILE)) {
      fs.writeFileSync(USER_TESTS_FILE, '[]');
    }
    
    const data = fs.readFileSync(USER_TESTS_FILE, 'utf8');
    const tests = JSON.parse(data);
    res.json(tests);
  } catch (error) {
    console.error('Error reading user tests:', error);
    res.status(500).json({ error: 'Failed to read user tests' });
  }
});

// שמירת מבחן חדש
app.post('/api/user-tests', (req, res) => {
  try {
    const newTest = req.body;
    
    // קריאת המבחנים הקיימים
    let tests = [];
    if (fs.existsSync(USER_TESTS_FILE)) {
      const data = fs.readFileSync(USER_TESTS_FILE, 'utf8');
      tests = JSON.parse(data);
    }
    
    // הוספת id ייחודי למבחן החדש
    const testWithId = {
      ...newTest,
      id: `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    };
    
    // הוספת המבחן לתחילת הרשימה
    tests.unshift(testWithId);
    
    // שמירה לקובץ
    fs.writeFileSync(USER_TESTS_FILE, JSON.stringify(tests, null, 2));
    
    console.log('Test saved successfully:', testWithId.id);
    res.json(testWithId);
  } catch (error) {
    console.error('Error saving test:', error);
    res.status(500).json({ error: 'Failed to save test' });
  }
});

// מחיקת מבחן
app.delete('/api/user-tests/:id', (req, res) => {
  try {
    const testId = req.params.id;
    
    if (!fs.existsSync(USER_TESTS_FILE)) {
      return res.status(404).json({ error: 'No tests found' });
    }
    
    const data = fs.readFileSync(USER_TESTS_FILE, 'utf8');
    let tests = JSON.parse(data);
    
    // מחיקת המבחן לפי ID
    const filteredTests = tests.filter(test => test.id !== testId);
    
    if (filteredTests.length === tests.length) {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    // שמירה לקובץ
    fs.writeFileSync(USER_TESTS_FILE, JSON.stringify(filteredTests, null, 2));
    
    console.log('Test deleted successfully:', testId);
    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ error: 'Failed to delete test' });
  }
});

// === USERS ENDPOINTS ===
// קריאת כל המשתמשים
app.get('/api/users', (req, res) => {
  try {
    const users = readJsonFile(USERS_FILE, []);
    res.json(users);
  } catch (error) {
    console.error('Error reading users:', error);
    res.status(500).json({ error: 'Failed to read users' });
  }
});

// === TESTS ENDPOINTS ===
// קריאת כל המבחנים (סטטיים + משתמש)
app.get('/api/tests', (req, res) => {
  try {
    const staticTests = readJsonFile(TESTS_FILE, []);
    const userTests = readJsonFile(USER_TESTS_FILE, []);
    const allTests = [...userTests, ...staticTests];
    res.json(allTests);
  } catch (error) {
    console.error('Error reading tests:', error);
    res.status(500).json({ error: 'Failed to read tests' });
  }
});

// === POSTS ENDPOINTS ===
// קריאת כל הפוסטים
app.get('/api/posts', (req, res) => {
  try {
    const posts = readJsonFile(POSTS_FILE, []);
    res.json(posts);
  } catch (error) {
    console.error('Error reading posts:', error);
    res.status(500).json({ error: 'Failed to read posts' });
  }
});

// === COMMENTS ENDPOINTS ===
// קריאת כל התגובות
app.get('/api/comments', (req, res) => {
  try {
    const comments = readJsonFile(COMMENTS_FILE, []);
    res.json(comments);
  } catch (error) {
    console.error('Error reading comments:', error);
    res.status(500).json({ error: 'Failed to read comments' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 User tests file: ${USER_TESTS_FILE}`);
});