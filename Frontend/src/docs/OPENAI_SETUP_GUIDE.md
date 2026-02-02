# 🔑 OpenAI API Setup Guide for Flowversal

## Why You Need This

To use Flowversal's AI features (LangChain agents, workflow generation, chat AI), you need to configure your OpenAI API key in Supabase.

---

## 📝 Step-by-Step Setup

### **Step 1: Get Your OpenAI API Key**

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to **API Keys** (https://platform.openai.com/api-keys)
4. Click **"+ Create new secret key"**
5. Give it a name: `Flowversal`
6. Copy the key (it looks like: `sk-proj-...`)
7. **⚠️ IMPORTANT**: Save it somewhere safe - you can only see it once!

### **Step 2: Add Key to Supabase**

#### **Option A: Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** (gear icon in left sidebar)
3. Click **Edge Functions** in the settings menu
4. Scroll to **Secrets** section
5. Click **"Add new secret"**
6. Enter:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-proj-your-actual-key-here`
7. Click **Save**

#### **Option B: Supabase CLI**

```bash
# Make sure you're logged in
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Set the secret
supabase secrets set OPENAI_API_KEY=sk-proj-your-actual-key-here
```

### **Step 3: Restart Edge Functions (if needed)**

If your functions were already running:

1. In Supabase Dashboard → **Edge Functions**
2. Find `make-server-020d2c80`
3. Click the **⋮** menu → **Restart**

Or via CLI:
```bash
supabase functions deploy make-server-020d2c80
```

### **Step 4: Verify Setup**

1. Open Flowversal app
2. Navigate to **Chat** tab
3. Toggle to **🤖 LangChain AI (Real)**
4. Send a test message: `"Hello, are you working?"`
5. ✅ If you get a response, it's working!
6. ❌ If you get an error about API key, check the steps above

---

## 🎯 What This Enables

Once configured, you can use:

✅ **AI Chat** - Real conversations with GPT-4  
✅ **Workflow Generation** - Create workflows from descriptions  
✅ **AI Agent Nodes** - All 7 intelligent node types  
✅ **Semantic Search** - RAG-powered search  
✅ **Text Analysis** - Sentiment, entities, intent  
✅ **Smart Decisions** - AI-powered routing  
✅ **Data Transformation** - AI data formatting  

---

## 💰 Pricing & Limits

### **OpenAI API Costs** (as of 2024)

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| GPT-4 | $30 | $60 |
| GPT-3.5-turbo | $0.50 | $1.50 |

**Example costs:**
- Chat message (~500 tokens): $0.015 (GPT-4) or $0.0005 (GPT-3.5)
- Workflow generation (~2000 tokens): $0.06 (GPT-4)
- Semantic analysis (~1000 tokens): $0.03 (GPT-4)

### **Rate Limits** (Free Tier)

- 3 requests per minute
- 40,000 tokens per minute

**Pro Tier:**
- 3,500 requests per minute
- 90,000 tokens per minute

### **Managing Costs**

1. **Use GPT-3.5** for simple tasks (much cheaper)
2. **Set max tokens** to limit response length
3. **Monitor usage** at https://platform.openai.com/usage
4. **Set spending limits** in OpenAI dashboard
5. **Cache responses** when possible

---

## 🔒 Security Best Practices

### **✅ DO:**
- Store keys in Supabase secrets (never in code)
- Use environment variables
- Rotate keys periodically
- Monitor API usage
- Set spending alerts

### **❌ DON'T:**
- Commit keys to git
- Share keys publicly
- Use the same key everywhere
- Store in frontend code
- Ignore usage alerts

---

## 🚨 Troubleshooting

### **"OpenAI API key not configured"**

**Cause**: Key not set or incorrectly named  
**Fix**: 
1. Verify secret name is exactly `OPENAI_API_KEY`
2. Check the key starts with `sk-`
3. Restart edge functions

### **"Invalid API key"**

**Cause**: Key is wrong or expired  
**Fix**:
1. Generate a new key at OpenAI
2. Update the secret in Supabase
3. Restart edge functions

### **"Rate limit exceeded"**

**Cause**: Too many requests  
**Fix**:
1. Wait a minute and try again
2. Upgrade your OpenAI plan
3. Reduce frequency of AI calls

### **"Insufficient quota"**

**Cause**: No credits or spending limit reached  
**Fix**:
1. Add payment method at OpenAI
2. Increase spending limit
3. Top up credits

### **"Model not available"**

**Cause**: Model access not enabled  
**Fix**:
1. Check OpenAI dashboard for model access
2. GPT-4 requires separate approval
3. Try GPT-3.5-turbo instead

---

## 🔧 Advanced Configuration

### **Custom Model Selection**

In your workflow nodes, you can select:
- **ChatGPT Model** → Uses GPT-4
- **Gemini Model** → Maps to GPT-3.5-turbo
- **Deepseek Model** → Maps to GPT-3.5-turbo
- **Hybrid Model** → Uses GPT-4

### **Temperature Settings**

Adjust creativity vs consistency:
```
0.0 - 0.3  → Focused, deterministic
0.4 - 0.7  → Balanced (recommended)
0.8 - 1.0  → Creative, varied
```

### **Token Limits**

Recommended settings:
```
Chat messages:        500 - 1000
Workflow generation:  2000 - 3000
Analysis:            1000 - 2000
Long-form content:   3000 - 4000
```

---

## 📊 Monitoring Usage

### **In OpenAI Dashboard**

1. Go to https://platform.openai.com/usage
2. View daily/monthly usage
3. Check costs by model
4. See rate limit status

### **In Your App**

Each API response includes usage data:
```json
{
  "usage": {
    "prompt_tokens": 234,
    "completion_tokens": 456,
    "total_tokens": 690
  }
}
```

### **Set Alerts**

In OpenAI Dashboard:
1. Settings → Limits
2. Set hard/soft limits
3. Add email for notifications

---

## 🎯 Testing Your Setup

### **Quick Test Commands**

**1. Test Chat:**
```
Message: "Hello, test"
Expected: AI response confirming it works
```

**2. Test Workflow Generation:**
```
Message: "Create a simple email workflow"
Expected: JSON workflow configuration
```

**3. Test AI Node:**
```
Add: AI Chat Agent node to workflow
Run: Execute the workflow
Expected: Node completes successfully
```

---

## 🌟 Alternative Models (Future)

While we currently use OpenAI, the system can be extended to support:

- **Anthropic Claude** - Alternative to GPT-4
- **Google Gemini** - Fast, multimodal
- **Mistral** - Open-source alternative
- **Local Models** - Llama, etc.

To add support, update the API calls in `/supabase/functions/server/langchain.ts`

---

## 📚 Additional Resources

- **OpenAI Docs**: https://platform.openai.com/docs/
- **Best Practices**: https://platform.openai.com/docs/guides/production-best-practices
- **Rate Limits**: https://platform.openai.com/docs/guides/rate-limits
- **Pricing**: https://openai.com/pricing
- **Support**: https://help.openai.com/

---

## ✅ Setup Checklist

- [ ] Created OpenAI account
- [ ] Generated API key
- [ ] Added `OPENAI_API_KEY` to Supabase secrets
- [ ] Restarted edge functions
- [ ] Tested chat interface
- [ ] Verified AI mode works
- [ ] Set spending limits
- [ ] Configured usage alerts
- [ ] Reviewed pricing
- [ ] Read security best practices

---

## 🎉 You're All Set!

Once configured, your Flowversal AI system is ready to:

🤖 Generate workflows from natural language  
💬 Provide intelligent chat responses  
🧠 Execute complex AI reasoning  
🔍 Search semantically across data  
📊 Analyze text for insights  
⚡ Automate with AI-powered nodes  

**Welcome to the future of workflow automation!** 🚀
