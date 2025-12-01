# LLM-Enhanced Search with Calculations 🧮

## What's New?

Your DocQuest.ai now has **AI-powered calculation capabilities**! The system can now:

✅ **Perform calculations** from your documents (profit = revenue - expenses)
✅ **Extract numerical data** and compute results
✅ **Show reasoning** - explains how it arrived at the answer
✅ **Free AI inference** using Groq's Llama-3.3-70b model

---

## How It Works

### Before (Basic RAG)
```
User: "What is the actual profit?"
System: ❌ "No data found for 'actual profit'"
```

### After (AI-Enhanced with Calculations)
```
User: "What is the actual profit?"
System: ✅ **Answer:** $180,000

**Calculation:**
- Found: Revenue: $500,000 (from Sales_Report.pdf)
- Found: Expenses: $320,000 (from Sales_Report.pdf)  
- Formula: Profit = Revenue - Expenses
- Result: $500,000 - $320,000 = $180,000

**Source:** *Sales_Report.pdf*
```

---

## Technical Implementation

### 1. **LLM Service** (`lib/groq-service.ts`)
- Uses Groq's free API with Llama-3.3-70b
- Handles AI reasoning and calculations
- Graceful fallback if API unavailable

### 2. **Enhanced QA Route** (`app/api/qa/route.ts`)
- Automatically detects calculation queries
- Extracts relevant numbers from documents
- Performs mathematical operations
- Shows step-by-step working

### 3. **Query Type Detection**
The system intelligently categorizes queries:
- **Calculation**: "What's the profit?", "Calculate total revenue"
- **Specific**: "Who created this?", "What is the date?"
- **Summary**: "Summarize the report"
- **List**: "List all items"

---

## Calculation Keywords

The system recognizes these keywords for calculations:
- `profit`, `loss`, `total`, `sum`, `difference`
- `calculate`, `compute`, `add`, `subtract`, `multiply`, `divide`
- `percentage`, `ratio`, `average`, `mean`
- `revenue minus`, `expenses from`, `how much`

---

## Examples You Can Try

### Financial Calculations
```
"What is the net profit?"
"Calculate total revenue for Q3"
"What's the difference between expenses and budget?"
```

### Data Analysis
```
"What is the average sales per month?"
"Calculate the percentage increase"  
"What's the total across all categories?"
```

### Comparisons
```
"What's the revenue minus expenses?"
"Compare Q1 and Q2 performance"
```

---

## API Configuration

### Environment Variables
```env
# Groq API (Free tier - no credit card needed)
GROQ_API_KEY=gsk_your_api_key_here

# Existing OpenRouter (for embeddings only)
OPENROUTER_API_KEY=sk-or-v1-your_key_here
EMBEDDING_MODEL=openai/text-embedding-3-small
```

### Cost Breakdown
- **Embeddings**: Uses OpenRouter (very cheap, ~$0.0001 per search)
- **AI Answers**: Uses Groq (FREE with rate limits)
- **Storage**: MongoDB Atlas (Free tier: 512MB)

**Monthly Cost Estimate**: ~$0-2 for typical usage

---

## Features & Benefits

### ✅ What's Included
1. **Smart Calculation Detection** - Automatically identifies when math is needed
2. **Multi-Step Reasoning** - Shows how the answer was derived
3. **Source Attribution** - Cites which documents contain the data
4. **Error Handling** - Falls back gracefully if AI unavailable
5. **Caching** - Speeds up repeated queries (5-minute cache)

### 🚀 Performance
- **Response Time**: 1-3 seconds for simple calculations
- **Accuracy**: Uses Llama-3.3-70b (very capable at math)
- **Context Window**: Up to 8000 characters from documents

---

## How to Test

### 1. Upload a Test Document

Create a file `sales_report.txt`:
```
Q3 Sales Report
Total Revenue: $500,000
Operating Expenses: $320,000
Marketing Costs: $45,000
Administrative Costs: $35,000
```

### 2. Ask Calculation Questions
- "What is the actual profit?" → Should calculate $180,000
- "Calculate total expenses" → Should sum to $400,000
- "What's the profit margin percentage?" → Should compute ~36%

### 3. Check the Response
Look for:
- ✅ **Answer** section with the final number
- ✅ **Calculation** section showing the work
- ✅ **Source** citation

---

## Troubleshooting

### "AI service not configured"
**Solution**: Add `GROQ_API_KEY` to `.env.local`

### Calculations seem wrong
**Solution**: 
- Check if numbers are clearly labeled in your documents
- Try rephrasing the question
- Upload documents with clearer formatting

### Slow responses
**Solution**:
- First query is slower (no cache)
- Subsequent identical queries are instant (cached)
- Complex multi-doc calculations take 2-3 seconds

---

## Architecture Comparison

### Old Flow (Vector Search Only)
```
Query → Embeddings → Vector Search → Return Chunks
```

### New Flow (AI-Enhanced)
```
Query → Embeddings → Vector Search → Chunks → 
LLM Analysis → Calculate → Format Answer
```

**Backwards Compatible**: Old queries still work exactly the same!

---

## Future Enhancements

Possible improvements:
1. **Chart Generation** - Create graphs from financial data
2. **Multi-Currency** - Handle different currencies automatically
3. **Complex Formulas** - Support advanced calculations
4. **Export Results** - Download calculations as PDF/Excel

---

## Credits

- **LLM**: Groq (Llama-3.3-70b-versatile)
- **Embeddings**: OpenRouter (OpenAI text-embedding-3-small)
- **Vector DB**: MongoDB Atlas
- **Framework**: Next.js 14

---

## Support

Questions or issues? Open the Chat & Support in the app or check the Help Center.

**Version**: 2.0.0 (Calculation-Enhanced)  
**Updated**: December 2024
