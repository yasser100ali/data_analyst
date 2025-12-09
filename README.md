# Atlas Analyst Agent 

11/19/2025
A powerful data analyst AI agent that can analyze CSV, Excel, PDF, and text files through an intuitive chat interface. Built with Next.js, FastAPI, OpenAI, and E2B Code Interpreter.

Open Source Data Analyst Agent

## Core Feature: DataAnalystAgent

The centerpiece of this project is an intelligent agent that:

-  **Auto-extracts metadata** from data files (shape, columns, types, statistics)
-  **Generates analysis code** using OpenAI GPT-5.1 
-  **Executes code securely** in E2B sandbox environment
-  **Returns insights** with explanations and visualizations

### Quick Agent Usage

```python
from api.tools.data_analyst_agent import DataAnalystAgent

# Initialize
agent = DataAnalystAgent()
agent.initialize_session({"data.csv": "/path/to/file.csv"})

# Analyze
result = agent.analyze("What is the average salary by department?")
print(result["response"])  # AI explanation
print(result["stdout"])     # Code output
agent.close()
```

examples.py
```

##  Features

- ** File Upload Support**: Drag & drop CSV, Excel, PDF, and text files for analysis
- ** Real-time Streaming**: Powered by OpenAI's Responses API for fast, responsive interactions
- ** Data Analysis**: Analyze datasets, generate insights, and create visualizations
- ** Multi-platform Deployment**: Optimized for both Vercel and Railway hosting
- ** Modern UI**: Beautiful, responsive interface with dark mode support

##  Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- Python 3.11+ and pip
- OpenAI API key
- Vercel Blob storage (for file uploads)

### 1. Clone and Setup

```bash
git clone https://github.com/yourusername/data_analyst.git
cd data_analyst
pnpm install
```

### 2. Environment Variables

Create a `.env` file:

```bash
# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key_here

# Vercel Blob Storage (for file uploads)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your_token_here

# Railway Backend URL (set automatically in production)
RAILWAY_BACKEND_URL=https://your-backend-service.up.railway.app
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run Development Servers

```bash
# Terminal 1: Next.js frontend
pnpm run dev

# Terminal 2: FastAPI backend
pnpm run fastapi-dev

# Or run both together:
pnpm run dev
```

##  File Upload Support

Users can upload and analyze:
- **CSV files** (`.csv`) - 10MB max
- **Excel spreadsheets** (`.xlsx`, `.xls`) - 10MB max
- **PDF documents** (`.pdf`) - 50MB max
- **Text files** (`.txt`) - 10MB max

### How It Works

1. **Drag & Drop**: Drop files anywhere on the page or click the 📎 icon
2. **Upload**: Files are stored in Vercel Blob storage
3. **Analysis**: Backend processes files and sends to AI for analysis
4. **Results**: AI provides insights, summaries, and visualizations

##  Deployment

### Railway (Recommended for ML/Data Science)

Railway offers **10GB free storage** and **8GB RAM** - perfect for data analysis!

```bash
# Deploy frontend
railway login
railway link
railway up --service frontend

# Deploy backend separately
railway up --service backend
```

**Railway Configuration:**
- **Frontend**: Custom build command: `pnpm run build`, Start command: `npm run start`
- **Backend**: Start command: `npm run fastapi-prod`
- **Environment**: Set `BLOB_READ_WRITE_TOKEN` in Railway dashboard

### Vercel (Alternative)

```bash
# Deploy to Vercel
vercel --prod
```

**Environment Variables in Vercel:**
- `OPENAI_API_KEY`
- `BLOB_READ_WRITE_TOKEN`

##  Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js       │    │   FastAPI        │    │   OpenAI        │
│   Frontend      │◄──►│   Backend        │◄──►│   Responses API │
│                 │    │                  │    │                 │
│ • File Upload   │    │ • Data Processing│    │ • AI Analysis   │
│ • UI/UX         │    │ • API Routes     │    │ • Streaming     │
│ • Vercel Blob   │    │ • OpenAI Client  │    │ • Responses     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

##  Tech Stack

**Frontend:**
- Next.js 13 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Vercel Blob (file storage)

**Backend:**
- FastAPI (Python)
- OpenAI Responses API
- Pydantic (data validation)
- Uvicorn (ASGI server)
- E2B for safe sandboxed code execution

**AI/ML:**
- OpenAI GPT-5.1
- Responses API (streaming)
- File processing capabilities

##  Documentation

- [File Upload Setup](./FILE_UPLOAD_SETUP.md) - Complete file upload guide
- [Quick Start](./QUICK_START.md) - Fast setup instructions
- [Feature Summary](./FEATURE_SUMMARY.md) - Technical overview

##  Key Capabilities

- **Data Analysis**: Upload CSV/Excel files and get AI-powered insights
- **Document Analysis**: Analyze PDF reports and documents
- **Text Analysis**: Process text files and documents
- **Real-time Chat**: Streaming responses for better UX
- **File Management**: Visual file preview and removal
- **Error Handling**: Comprehensive validation and error messages

## 🔧 Development

### Available Scripts

```bash
# Frontend only
pnpm run next-dev     # Next.js dev server
pnpm run build        # Production build
pnpm run start        # Production server

# Backend only
pnpm run fastapi-dev  # FastAPI dev server
pnpm run fastapi-prod # FastAPI production server

# Combined
pnpm run dev          # Both servers concurrently
pnpm run start:all    # Both servers in production mode
```

### Project Structure

```
├── app/                 # Next.js app router
│   ├── api/blob/       # File upload API routes
│   └── (chat)/         # Chat interface
├── components/         # React components
│   ├── multimodal-input.tsx  # File upload UI
│   └── markdown.tsx    # Math/LaTeX rendering
├── api/                # FastAPI backend
│   ├── index.py        # Main API routes
│   └── utils/          # Helper functions
└── requirements.txt    # Python dependencies
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ by AI Engineer Yasser Ali**
