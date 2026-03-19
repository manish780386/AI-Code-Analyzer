# ⚡ CodeScan AI — Advanced AI Code Reviewer

![CodeScan AI Banner](https://img.shields.io/badge/CodeScan-AI-7c3aed?style=for-the-badge&logo=lightning&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.x-092E20?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-f55036?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

> **AI-powered code review tool** that analyzes your code for bugs, security issues, optimizations, and best practices — in seconds.
>
> <img width="1898" height="874" alt="image" src="https://github.com/user-attachments/assets/6083a211-f5c5-4e6c-94d7-f805c95eccd6" />


---

## 🖥️ Preview

```
┌─────────────────────────────────────────────────────────┐
│  ⚡ CodeScan AI                    📋 History  ☀️       │
├──────────────────────────┬──────────────────────────────┤
│  SELECT LANGUAGE         │  📊 Code Quality: 7/10       │
│  🐍 Python  ⚡ JS  ☕ Java │                              │
│                          │  🐞 Bugs Found    (2)        │
│  ┌────────────────────┐  │  🔒 Security      (1)        │
│  │  // Your code here │  │  ⚡ Optimization  (3)        │
│  │                    │  │  💡 Best Practices(2)        │
│  └────────────────────┘  │                              │
│                          │  [Analysis] [Raw] [Fixed]    │
│  [⚡ Analyze Code with AI]│                              │
└──────────────────────────┴──────────────────────────────┘
```

---

## ✨ Features

- 🔍 **Deep Code Analysis** — Bugs, security vulnerabilities, optimization tips & best practices
- 📊 **Code Quality Score** — Animated score ring from 1–10
- 🌐 **10 Languages** — Python, JavaScript, TypeScript, Java, C++, C, Go, Rust, PHP, Ruby
- 📋 **Review History** — Last 10 reviews saved locally
- ✅ **Improved Code Tab** — AI rewrites your code with all fixes applied
- 📄 **Raw Output Tab** — Full unformatted AI response
- 🌙 **Dark/Light Theme** — Toggle editor theme
- 📋 **Copy to Clipboard** — One-click copy of improved code
- ⚡ **Ultra Fast** — Powered by Groq's LLaMA 3.3 70B (fastest inference available)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Monaco Editor, Axios |
| Backend | Django 5, Django REST Framework |
| AI Model | Groq API (LLaMA 3.3 70B Versatile) |
| Styling | Pure CSS with CSS Variables |
| Storage | localStorage (review history) |

---

## 📁 Project Structure

```
Ai-codeAnalyzer/
├── backend/                  # Django Backend
│   ├── backend/
│   │   ├── settings.py       # Django settings + API keys
│   │   ├── urls.py           # Root URL config
│   │   └── wsgi.py
│   ├── api/
│   │   ├── views.py          # Core review logic (Groq API)
│   │   ├── urls.py           # API endpoints
│   │   └── models.py
│   ├── .env                  # API keys (never commit this!)
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/                 # React Frontend
    ├── src/
    │   ├── App.jsx            # Main component
    │   └── index.jsx
    ├── public/
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Groq API Key (free at [console.groq.com](https://console.groq.com))

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-code-analyzer.git
cd ai-code-analyzer
```

---

### 2️⃣ Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install django djangorestframework django-cors-headers python-dotenv groq

# Create .env file
echo GROQ_API_KEY="your_groq_key_here" > .env

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000`

---

### 3️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
npm install @monaco-editor/react axios

# Start development server
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🔑 Getting a Free Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up with GitHub or Google
3. Navigate to **API Keys** → **Create API Key**
4. Copy your key (`gsk_...`)
5. Paste it in `backend/.env`:

```env
GROQ_API_KEY="gsk_your_key_here"
```

> ✅ Groq is completely **free** — no credit card required!

---

## 📡 API Reference

### `POST /api/review/`

Analyzes code and returns a detailed review.

**Request Body:**
```json
{
  "code": "def hello():\n    print('Hello World')",
  "language": "python"
}
```

**Response:**
```json
{
  "review": "🐞 Bugs Found:\n- No bugs found ✅\n\n⚡ Optimization:\n..."
}
```

**Supported Languages:**
`python`, `javascript`, `typescript`, `java`, `cpp`, `c`, `go`, `rust`, `php`, `ruby`

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory:

```env
GROQ_API_KEY="gsk_..."        # Required — get from console.groq.com
```

> ⚠️ **Never commit your `.env` file to GitHub!** It's already in `.gitignore`.

---

## 📦 Requirements

### Backend (`requirements.txt`)

```
django>=5.0
djangorestframework>=3.15
django-cors-headers>=4.3
python-dotenv>=1.0
groq>=0.9
```

Install all at once:
```bash
pip install -r requirements.txt
```

---

## 🔒 Security Notes

- API keys are stored in `.env` — never hardcoded
- CORS is configured for local development only
- No user data is stored on the server
- Review history is stored only in browser localStorage

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

Made with ❤️ by **[Manish Dange](https://github.com/manish780386/)**

---

## 🌟 Show Your Support

If this project helped you, please consider giving it a ⭐ on GitHub!

[![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/ai-code-analyzer?style=social)](https://github.com/YOUR_USERNAME/ai-code-analyzer)
