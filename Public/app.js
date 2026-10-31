/**
 * ApexWorkspace Frontend Client
 * Handles real-time communication with the Express Backend REST API
 */

// State Management
let state = {
  tasks: [],
  filter: 'all',
  isBackendAvailable: false
};

// DOM Elements
const taskListEl = document.getElementById('taskList');
const taskFormEl = document.getElementById('taskForm');
const taskTitleInput = document.getElementById('taskTitle');
const taskCategorySelect = document.getElementById('taskCategory');
const refreshBtn = document.getElementById('refreshBtn');
const testApiBtn = document.getElementById('testApiBtn');
const contactFormEl = document.getElementById('contactForm');
const filterBtns = document.querySelectorAll('.filter-btn');

// Stats Elements
const totalTasksEl = document.getElementById('totalTasksCount');
const completedTasksEl = document.getElementById('completedTasksCount');
const pendingTasksEl = document.getElementById('pendingTasksCount');
const allCountEl = document.getElementById('allCount');
const activeCountEl = document.getElementById('activeCount');
const doneCountEl = document.getElementById('doneCount');

// Status Elements
const serverStatusBadge = document.getElementById('serverStatusBadge');
const statusLabel = document.getElementById('statusLabel');
const apiStatusText = document.getElementById('apiStatusText');
const pingSpeedEl = document.getElementById('pingSpeed');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  checkApiStatus();
  fetchTasks();
  
  // Periodic Health Check
  setInterval(checkApiStatus, 15000);
});

// Event Listeners Configuration
function setupEventListeners() {
  // Mobile Navigation Toggle
  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('show');
  });

  // Task Submission
  taskFormEl.addEventListener('submit', handleAddTask);

  // Refresh Button
  refreshBtn.addEventListener('click', () => {
    refreshBtn.querySelector('i').classList.add('fa-spin');
    fetchTasks().finally(() => {
      setTimeout(() => refreshBtn.querySelector('i').classList.remove('fa-spin'), 600);
    });
  });

  // Test API Latency
  testApiBtn.addEventListener('click', testApiLatency);

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filter = btn.dataset.filter;
      renderTasks();
    });
  });

  // Contact Form
  contactFormEl.addEventListener('submit', handleSendFeedback);
}

// 1. Fetch all tasks from Backend API
async function fetchTasks() {
  try {
    const res = await fetch('/api/tasks');
    if (!res.ok) throw new Error('API server error');
    const result = await res.json();
    state.tasks = result.data || [];
    renderTasks();
    updateStats();
  } catch (err) {
    console.error('Fetch tasks error:', err);
    // Fallback Mock State if running purely statically
    if (state.tasks.length === 0) {
      state.tasks = [
        { id: 1, title: 'Responsive Layout စစ်ဆေးခြင်း', category: 'Dev', completed: true, createdAt: 'Local' },
        { id: 2, title: 'Node.js Express Backend ချိတ်ဆက်ခြင်း', category: 'Backend', completed: false, createdAt: 'Local' }
      ];
    }
    renderTasks();
    updateStats();
  }
}

// 2. Add New Task via POST /api/tasks
async function handleAddTask(e) {
  e.preventDefault();
  const title = taskTitleInput.value.trim();
  const category = taskCategorySelect.value;

  if (!title) return;

  const submitBtn = document.getElementById('addTaskBtn');
  submitBtn.disabled = true;

  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category })
    });
    const result = await res.json();

    if (result.success) {
      state.tasks.unshift(result.data);
      taskTitleInput.value = '';
      renderTasks();
      updateStats();
      showToast('လုပ်ဆောင်ချက် အသစ် ထည့်သွင်းပြီးပါပြီ!', 'success');
    } else {
      showToast(result.message || 'Error ဖြစ်ပေါ်နေပါသည်', 'error');
    }
  } catch (err) {
    // Local fallback support
    const localTask = { id: Date.now(), title, category, completed: false, createdAt: 'Local' };
    state.tasks.unshift(localTask);
    taskTitleInput.value = '';
    renderTasks();
    updateStats();
    showToast('လုပ်ဆောင်ချက် အသစ် ထည့်သွင်းပြီးပါပြီ (Local Mode)', 'info');
  } finally {
    submitBtn.disabled = false;
  }
}

// 3. Toggle Task Completion Status
async function toggleTaskStatus(id) {
  try {
    const res = await fetch(`/api/tasks/${id}`, { method: 'PATCH' });
    const result = await res.json();
    if (result.success) {
      const idx = state.tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        state.tasks[idx].completed = result.data.completed;
      }
    }
  } catch (err) {
    const target = state.tasks.find(t => t.id === id);
    if (target) target.completed = !target.completed;
  }
  renderTasks();
  updateStats();
}

// 4. Delete Task
async function deleteTask(id) {
  try {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      state.tasks = state.tasks.filter(t => t.id !== id);
      showToast('လုပ်ဆောင်ချက်ကို ဖျက်ပြီးပါပြီ။', 'info');
    }
  } catch (err) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    showToast('လုပ်ဆောင်ချက်ကို ဖျက်ပြီးပါပြီ (Local Mode)', 'info');
  }
  renderTasks();
  updateStats();
}

// 5. Render Task List
function renderTasks() {
  let filtered = state.tasks;
  if (state.filter === 'active') {
    filtered = state.tasks.filter(t => !t.completed);
  } else if (state.filter === 'completed') {
    filtered = state.tasks.filter(t => t.completed);
  }

  if (filtered.length === 0) {
    taskListEl.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-clipboard-check"></i>
        <p>လုပ်ဆောင်ချက်များ မရှိသေးပါ။ အသစ်ထည့်သွင်းနိုင်ပါသည်။</p>
      </div>
    `;
    return;
  }

  taskListEl.innerHTML = filtered.map(task => `
    <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
      <div class="task-left">
        <div class="custom-checkbox" onclick="toggleTaskStatus(${task.id})">
          <i class="fa-solid fa-check"></i>
        </div>
        <div class="task-info">
          <span class="task-text">${escapeHtml(task.title)}</span>
          <div class="task-meta">
            <span class="category-pill ${task.category ? task.category.toLowerCase() : ''}">${task.category || 'General'}</span>
            <span><i class="fa-regular fa-clock"></i> ${task.createdAt || 'ယနေ့'}</span>
          </div>
        </div>
      </div>
      <div class="task-actions">
        <button class="action-btn delete" onclick="deleteTask(${task.id})" title="ဖျက်ရန်">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </div>
  `).join('');
}

// 6. Update Counters and Dashboard Stats
function updateStats() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.completed).length;
  const pending = total - completed;

  totalTasksEl.textContent = total;
  completedTasksEl.textContent = completed;
  pendingTasksEl.textContent = pending;

  allCountEl.textContent = total;
  activeCountEl.textContent = pending;
  doneCountEl.textContent = completed;
}

// 7. Check Server Health Status
async function checkApiStatus() {
  const start = performance.now();
  try {
    const res = await fetch('/api/status');
    const elapsed = Math.round(performance.now() - start);
    if (res.ok) {
      state.isBackendAvailable = true;
      serverStatusBadge.className = 'status-indicator online';
      statusLabel.textContent = 'Backend Online';
      apiStatusText.textContent = 'Running (200 OK)';
      apiStatusText.className = 'value badge-live text-success';
      pingSpeedEl.textContent = `${elapsed} ms`;
    } else {
      throw new Error();
    }
  } catch (err) {
    state.isBackendAvailable = false;
    serverStatusBadge.className = 'status-indicator offline';
    statusLabel.textContent = 'Offline (Preview Mode)';
    apiStatusText.textContent = 'Disconnected / Static';
    apiStatusText.className = 'value text-warning';
    pingSpeedEl.textContent = '- ms';
  }
}

// 8. Test API Latency
async function testApiLatency() {
  testApiBtn.disabled = true;
  testApiBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ချိတ်ဆက်မှု စစ်ဆေးနေသည်...';
  const start = performance.now();
  try {
    const res = await fetch('/api/status');
    const latency = Math.round(performance.now() - start);
    if (res.ok) {
      showToast(`API ချိတ်ဆက်မှု အောင်မြင်ပါသည်။ Speed: ${latency}ms`, 'success');
      pingSpeedEl.textContent = `${latency} ms`;
    } else {
      showToast('API Response Status Error', 'error');
    }
  } catch (err) {
    showToast('Backend Server မဖွင့်ရသေးပါ သို့မဟုတ် Static Mode တွင် အလုပ်လုပ်နေပါသည်', 'info');
  } finally {
    testApiBtn.disabled = false;
    testApiBtn.innerHTML = '<i class="fa-solid fa-network-wired"></i> API Connection စမ်းသပ်မည်';
  }
}

// 9. Handle Contact Form Submission
async function handleSendFeedback(e) {
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const message = document.getElementById('contactMessage').value.trim();

  const sendBtn = document.getElementById('sendMsgBtn');
  sendBtn.disabled = true;
  sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ပေးပို့နေသည်...';

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    const result = await res.json();
    if (result.success) {
      showToast('သင့်မက်ဆေ့ခ်ျကို အောင်မြင်စွာ လက်ခံရရှိပါပြီ!', 'success');
      contactFormEl.reset();
    } else {
      showToast(result.message || 'Error ဖြစ်ပေါ်နေပါသည်', 'error');
    }
  } catch (err) {
    showToast('မက်ဆေ့ခ်ျ ပေးပို့မှု အောင်မြင်ပါသည် (Offline Demo)', 'success');
    contactFormEl.reset();
  } finally {
    sendBtn.disabled = false;
    sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> မက်ဆေ့ခ်ျ ပို့မည်';
  }
}

// Toast Helper
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-exclamation';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Utility: HTML Sanitizer
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}
