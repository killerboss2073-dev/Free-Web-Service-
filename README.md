# ApexWorkspace - Complete Responsive Fullstack Website

HTML5, CSS3, Vanilla JavaScript နှင့် Node.js Express Backend ပါဝင်သော Fullstack Web Application ဖြစ်ပါသည်။

---

## 📁 ဖိုင်တည်ဆောက်ပုံ (Project Structure)

```
fullstack-website/
├── package.json          # Node.js dependencies နှင့် scripts များ
├── server.js             # Express.js Backend REST API
├── public/               # Frontend Files (Client-side)
│   ├── index.html        # Responsive UI HTML
│   ├── style.css         # Modern Dark Glassmorphism CSS
│   └── app.js            # Frontend Client State & API Logic
└── README.md             # အသုံးပြုပုံလမ်းညွှန်
```

---

## 🚀 Local စက်တွင် Run လုပ်နည်း (3 Steps)

### Step 1: လိုအပ်သော Packages များ ထည့်သွင်းခြင်း
Terminal သို့မဟုတ် Command Prompt (cmd) ကို ဖွင့်ပြီး Folder ထဲတွင် အောက်ပါ command ကို ရိုက်ပါ:
```bash
npm install
```

### Step 2: Website Server ကို စတင်ဖွင့်လှစ်ခြင်း
```bash
npm start
```

### Step 3: Browser တွင် ဖွင့်ကြည့်ခြင်း
သင့် Browser (Chrome, Edge, Safari) တွင် အောက်ပါ link ကို ရိုက်ထည့်၍ အသုံးပြုနိုင်ပါပြီ:
👉 **`http://localhost:3000`**

---

## 🌐 အွန်လိုင်းတွင် Free Deploy ပြုလုပ်နည်း (Render / Railway / Vercel)

### Option A: Render.com တွင် Host လုပ်ခြင်း (အခမဲ့)
1. ဤ files များကို GitHub repository တစ်ခုသို့ Push လုပ်ပါ။
2. [Render.com](https://render.com) တွင် အကောင့်ဝင်ပြီး **New Web Service** ကို နှိပ်ပါ။
3. GitHub Repository ကို ချိတ်ဆက်ပါ။
4. Settings များတွင်:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. **Create Web Service** ကို နှိပ်ပါက ကမ္ဘာအနှံ့ အသုံးပြုနိုင်သော Live URL ရရှိမည် ဖြစ်ပါသည်။
