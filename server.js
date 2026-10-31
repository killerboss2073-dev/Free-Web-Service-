const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory Database / Data Store
let tasks = [
  { id: 1, title: 'Gemini ဖြင့် Website ရေးသားခြင်း', category: 'Dev', completed: true, createdAt: new Date().toLocaleDateString() },
  { id: 2, title: 'Responsive UI ဖုန်းနှင့် ကွန်ပျူတာ စမ်းသပ်ခြင်း', category: 'Design', completed: false, createdAt: new Date().toLocaleDateString() },
  { id: 3, title: 'Backend REST API စမ်းသပ်စစ်ဆေးခြင်း', category: 'Backend', completed: false, createdAt: new Date().toLocaleDateString() }
];

let messages = [];

// REST API Endpoints
// 1. Get all tasks
app.get('/api/tasks', (req, res) => {
  res.json({ success: true, data: tasks });
});

// 2. Add new task
app.post('/api/tasks', (req, res) => {
  const { title, category } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'ခေါင်းစဉ် ရိုက်ထည့်ရန် လိုအပ်ပါသည်။' });
  }
  const newTask = {
    id: Date.now(),
    title: title.trim(),
    category: category || 'General',
    completed: false,
    createdAt: new Date().toLocaleDateString()
  };
  tasks.unshift(newTask);
  res.status(201).json({ success: true, data: newTask });
});

// 3. Toggle task completion status
app.patch('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ success: false, message: 'လုပ်ဆောင်ချက် ရှာမတွေ့ပါ။' });
  }
  task.completed = !task.completed;
  res.json({ success: true, data: task });
});

// 4. Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const initialLength = tasks.length;
  tasks = tasks.filter(t => t.id !== taskId);
  if (tasks.length === initialLength) {
    return res.status(404).json({ success: false, message: 'လုပ်ဆောင်ချက် ရှာမတွေ့ပါ။' });
  }
  res.json({ success: true, message: 'ဖျက်သိမ်းပြီးပါပြီ။' });
});

// 5. Contact / Feedback API
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'အချက်အလက်များ ပြည့်စုံစွာ ဖြည့်သွင်းပေးပါ။' });
  }
  const newMessage = {
    id: Date.now(),
    name,
    email,
    message,
    sentAt: new Date().toLocaleString()
  };
  messages.push(newMessage);
  res.status(201).json({ success: true, message: 'မက်ဆေ့ခ်ျ ပေးပို့မှု အောင်မြင်ပါသည်။' });
});

// 6. System Status / Health Check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    totalTasks: tasks.length,
    activeTasks: tasks.filter(t => !t.completed).length
  });
});

// Serve frontend for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
