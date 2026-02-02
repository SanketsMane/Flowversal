# 🚀 AI Agent Quick Start Guide

## Setup in 3 Steps

### 1️⃣ Add OpenAI API Key

Go to Supabase Dashboard:
```
Project Settings → Edge Functions → Secrets
```

Add secret:
```
Name: OPENAI_API_KEY
Value: sk-your-openai-api-key
```

### 2️⃣ Enable AI Mode in Chat

1. Navigate to **Chat** tab
2. Click **AI Mode** toggle
3. Select **🤖 LangChain AI (Real)**
4. Choose your model (GPT-4 recommended)

### 3️⃣ Start Creating!

Try these prompts:
```
✨ "Create a workflow for email automation"
✨ "Generate a customer onboarding process"
✨ "Build a data processing pipeline"
✨ "Create an AI content generator workflow"
```

---

## 🎯 Available AI Nodes

### Add to Your Workflows

**Drag & Drop from Sidebar:**

1. **AI Chat Agent** 🎯
   - Add conversational AI to any workflow
   - Maintains context across conversations

2. **Workflow Generator** ⚡
   - Auto-create workflows from descriptions
   - Saves hours of manual configuration

3. **AI Agent Executor** 🧠
   - Complex multi-step reasoning
   - Uses tools intelligently

4. **RAG Search** 🔍
   - Semantic search across your data
   - Vector-based similarity

5. **Semantic Analyzer** 📊
   - Sentiment analysis
   - Entity extraction
   - Intent detection

6. **AI Decision Maker** 🤖
   - Intelligent conditional routing
   - Confidence-based decisions

7. **Smart Data Transformer** ✨
   - AI-powered data formatting
   - Natural language transformations

---

## 💡 Example Workflows

### Email Automation
```
Trigger: New Email
  ↓
Semantic Analyzer: Extract intent
  ↓
AI Decision Maker: Route to category
  ↓
AI Chat Agent: Generate response
  ↓
Action: Send Email
```

### Content Pipeline
```
Trigger: Manual/Schedule
  ↓
RAG Search: Find relevant topics
  ↓
AI Agent Executor: Generate content
  ↓
Semantic Analyzer: Quality check
  ↓
Action: Publish
```

### Smart Customer Support
```
Trigger: Support Ticket
  ↓
Semantic Analyzer: Analyze urgency
  ↓
AI Decision Maker: Prioritize
  ↓
AI Chat Agent: Generate reply
  ↓
Action: Send Response
```

---

## 🔑 Configuration Tips

### For Best Results:

**Temperature:**
- `0.2-0.3` = Precise, consistent
- `0.5-0.7` = Balanced (recommended)
- `0.8-1.0` = Creative, varied

**System Prompts:**
```
Good: "You are a customer support agent. Be helpful and professional."
Better: "You are an expert customer support agent for an e-commerce platform. 
         Always be helpful, professional, and resolve issues quickly."
```

**Max Tokens:**
- Short responses: 500
- Standard: 1000-2000
- Long-form: 3000-4000

---

## 🎨 Chat Interface

### Model Selection

| Model | Best For |
|-------|----------|
| **ChatGPT Model** | Most tasks, high quality |
| **Gemini Model** | Fast responses |
| **Deepseek Model** | Technical/code tasks |
| **Hybrid Model** | Balanced cost/quality |

### Workflow Generation

Just describe what you need:
```
"I need a workflow that:
1. Monitors Twitter for brand mentions
2. Analyzes sentiment
3. Creates a daily report
4. Emails the marketing team"
```

Click **Download** to get the JSON, or **Preview** to see it visually.

---

## ⚡ Power User Tips

1. **Chain AI Nodes**: Connect multiple AI nodes for complex logic
2. **Use Memory**: Enable conversation memory for context
3. **Set Confidence**: Higher thresholds = more reliable decisions
4. **Validate Outputs**: Always check AI-generated content
5. **Iterate**: Refine prompts based on results

---

## 🆘 Troubleshooting

**"OpenAI API key not configured"**
→ Add `OPENAI_API_KEY` to Supabase secrets

**"Please log in to use AI features"**
→ Ensure you're logged in to the app

**Slow responses?**
→ Try Gemini or Deepseek models

**Unexpected results?**
→ Adjust temperature or refine system prompt

---

## 📞 Support

Need help? The AI agents are ready to assist you in building intelligent, automated workflows!

**Happy Automating!** 🎉
