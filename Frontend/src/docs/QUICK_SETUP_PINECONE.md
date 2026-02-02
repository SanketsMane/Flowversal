# 🚀 Quick Setup: Pinecone + OpenAI Integration

## ⏱️ Setup Time: 5 minutes

---

## ✅ **Step 1: Get Your OpenAI API Key** (If you don't have it)

1. Go to https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Copy the key (starts with `sk-...`)
4. Save it somewhere safe (you can't see it again!)

**Cost:** OpenAI has a free trial, then pay-as-you-go
- Embeddings: ~$0.0001 per 1K tokens (very cheap!)
- GPT-4: ~$0.03 per 1K tokens

---

## ✅ **Step 2: Get Your Pinecone API Key**

### **2.1 Sign Up**
1. Go to https://app.pinecone.io/
2. Click **"Sign Up"** (it's free!)
3. Choose **Google** or **Email** signup

### **2.2 Create a Project** (if not created automatically)
1. Click **"Create Project"**
2. Name it anything (e.g., "Flowversal")
3. Click **"Create"**

### **2.3 Get Your API Key**
1. In the left sidebar, click **"API Keys"**
2. You'll see your API key
3. Copy it (starts with `pcsk_...` or similar)

### **2.4 (Optional) Create an Index**
The system will auto-create this, but you can do it manually:
1. Click **"Indexes"** in sidebar
2. Click **"Create Index"**
3. Settings:
   - **Name:** `flowversal-vectors`
   - **Dimensions:** `1536`
   - **Metric:** `cosine`
   - **Cloud:** `AWS`
   - **Region:** `us-east-1`
4. Click **"Create Index"**

**Cost:** Pinecone free tier includes:
- 1 index
- 100K vectors
- Perfect for prototyping!

---

## ✅ **Step 3: Add Keys to Supabase**

### **3.1 Open Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Find your Flowversal project (ID: `ghuxzxxxuaiuumdmytkf`)
3. Click on it

### **3.2 Navigate to Secrets**
1. Click **"Project Settings"** (gear icon in sidebar)
2. Click **"Edge Functions"** in the left menu
3. Scroll to **"Secrets"** section

### **3.3 Add OpenAI API Key**
1. Click **"Add new secret"**
2. **Name:** `OPENAI_API_KEY`
3. **Value:** Paste your OpenAI key (`sk-...`)
4. Click **"Save"**

### **3.4 Add Pinecone API Key**
1. Click **"Add new secret"** again
2. **Name:** `PINECONE_API_KEY`
3. **Value:** Paste your Pinecone key
4. Click **"Save"**

### **3.5 (Optional) Set Custom Index Name**
If you used a different name than `flowversal-vectors`:
1. Click **"Add new secret"**
2. **Name:** `PINECONE_INDEX_NAME`
3. **Value:** Your index name
4. Click **"Save"**

---

## ✅ **Step 4: Verify Setup**

### **Test in Your Browser Console**

1. Open your Flowversal app
2. Open browser console (F12)
3. Run this test:

```javascript
// Test 1: Create a workflow (will auto-index in Pinecone)
const testCreate = async () => {
  const response = await fetch(
    'https://ghuxzxxxuaiuumdmytkf.supabase.co/functions/v1/make-server-020d2c80/workflows',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Email Workflow',
        description: 'Automatically send emails when form is submitted',
        tags: ['email', 'automation']
      })
    }
  );
  const data = await response.json();
  console.log('✅ Create workflow:', data);
  return data.workflow?.id;
};

// Test 2: Semantic search
const testSearch = async () => {
  const response = await fetch(
    'https://ghuxzxxxuaiuumdmytkf.supabase.co/functions/v1/make-server-020d2c80/langchain/rag-search',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'email automation',
        limit: 5
      })
    }
  );
  const data = await response.json();
  console.log('✅ Semantic search:', data);
};

// Test 3: Chat with AI
const testChat = async () => {
  const response = await fetch(
    'https://ghuxzxxxuaiuumdmytkf.supabase.co/functions/v1/make-server-020d2c80/langchain/chat',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Hello! Can you help me create a workflow?',
        model: 'gpt-4'
      })
    }
  );
  const data = await response.json();
  console.log('✅ Chat:', data);
};

// Run tests
(async () => {
  const workflowId = await testCreate();
  await new Promise(r => setTimeout(r, 2000)); // Wait for indexing
  await testSearch();
  await testChat();
})();
```

**Expected Results:**
- ✅ Create workflow: `{ success: true, workflow: {...} }`
- ✅ Semantic search: `{ success: true, results: [...], searchMethod: "semantic-search" }`
- ✅ Chat: `{ success: true, response: "..." }`

---

## ❌ **Troubleshooting**

### **Error: "OpenAI API key not configured"**
- Check that `OPENAI_API_KEY` is added in Supabase secrets
- Make sure there are no extra spaces
- Key should start with `sk-`

### **Error: "Pinecone API key not configured"**
- Check that `PINECONE_API_KEY` is added in Supabase secrets
- Verify the key is correct in Pinecone dashboard

### **Search returns "text-search" instead of "semantic-search"**
- Pinecone might not be configured properly
- Check Edge Function logs in Supabase
- The system still works, just uses text search as fallback

### **Error: "Unauthorized"**
- Make sure you're logged in
- Check that `session.access_token` is valid
- Try logging out and back in

### **Index creation failed**
- Check Pinecone free tier limits (1 index)
- Delete unused indexes in Pinecone dashboard
- Verify region is supported

---

## 📊 **Monitoring Usage**

### **OpenAI Usage**
1. Go to https://platform.openai.com/usage
2. See costs per day
3. Set usage limits if needed

### **Pinecone Usage**
1. Go to https://app.pinecone.io/
2. Click on your index
3. See vector count and queries

### **Supabase Edge Function Logs**
1. Supabase Dashboard → Functions
2. Click on `make-server-020d2c80`
3. View logs and invocations

---

## 🎯 **What You Get**

With this setup complete, your Flowversal app now has:

✅ **Intelligent Search**
- Search workflows by meaning, not just keywords
- "customer support" finds "email automation" workflows

✅ **AI Chat Assistant**
- Context-aware responses
- Can generate workflows from descriptions

✅ **Workflow Recommendations**
- Suggests similar workflows
- Prevents duplicates

✅ **Semantic Understanding**
- Understands intent and context
- Matches by concept, not exact words

---

## 🚀 **Next Steps**

1. ✅ **Test the integration** using the console tests above
2. 📝 **Create some workflows** with descriptions and tags
3. 🔍 **Try semantic search** - search for related concepts
4. 💬 **Chat with the AI** - ask it to create workflows
5. 🎨 **Build UI components** - use `/utils/api/workflows.ts` helpers

---

## 💰 **Cost Estimates**

### **For 1,000 workflows with search:**
- **Embeddings:** 1,000 × $0.0001 = **$0.10**
- **Pinecone:** Free tier (up to 100K vectors)
- **Total:** **~$0.10** 🎉

### **For 1,000 chat messages:**
- **GPT-4:** ~$0.03 per message × 1,000 = **$30**
- **GPT-3.5:** ~$0.002 per message × 1,000 = **$2**

**Tip:** Use GPT-3.5 for most queries, GPT-4 for complex ones!

---

## ✨ **Done!**

Your Flowversal platform now has production-grade AI capabilities! 🎉

**Questions?** Check:
- 📖 `/PINECONE_INTEGRATION_COMPLETE.md` - Full documentation
- 🔍 Supabase Edge Function logs - Debug issues
- 💬 Pinecone docs - https://docs.pinecone.io/

**Happy building! 🚀**
