# 🧪 Testing Your AI Calculation Feature

## Quick Start Guide

### Step 1: Upload the Test Document
📁 File: `TEST_FINANCIAL_REPORT.txt`
- Contains: ACME Corporation Q4 2024 Financial Report
- Size: ~6KB
- Data: Comprehensive financial data with intentional complexity

### Step 2: Use the Test Questions
📋 File: `TEST_QUESTIONS.md`
- Contains: 20 carefully designed test questions
- Levels: From basic (easy) to tricky (AI killer tests)
- Purpose: Verify calculation accuracy and reasoning

---

## 🎯 Recommended Testing Sequence

### Phase 1: Sanity Check (Questions 1-3)
**Purpose**: Verify basic retrieval works
```
✅ Q1: "What was the total revenue in Q4 2024?"
✅ Q2: "How much did we spend on marketing and sales?"
✅ Q3: "What is the net profit after tax?"
```
**Expected**: All should be instant and 100% accurate

### Phase 2: Simple Math (Questions 4-6)
**Purpose**: Test basic calculations
```
🧮 Q4: "What is the gross profit?"
🧮 Q5: "How much tax did we pay?"
🧮 Q6: "What is the total of all operating expenses?"
```
**Expected**: Correct with calculation steps shown

### Phase 3: Real Test (Questions 7-12)
**Purpose**: Multi-step calculations
```
🔢 Q8: "What was the revenue growth percentage from Q4 2023 to Q4 2024?"
🔢 Q11: "What percentage of total revenue comes from North America?"
🔢 Q12: "How much does it cost us to generate $1 of revenue?"
```
**Expected**: Accurate with detailed reasoning

### Phase 4: Challenge Mode (Questions 13-17)
**Purpose**: Complex scenarios
```
🧠 Q13: "What is the actual profit if we exclude investment income?"
🧠 Q15: "What would our profit margin be if we reduced marketing spend by 20%?"
🧠 Q16: "What is the average monthly revenue per employee?"
```
**Expected**: May struggle but should show attempt at reasoning

---

## 📊 What to Expect

### ✅ Should Work Well
- Direct information retrieval (100% accuracy)
- Simple calculations: subtraction, addition, multiplication (95%+ accuracy)
- Percentage calculations (90%+ accuracy)
- Basic comparisons (90%+ accuracy)

### ⚠️ May Be Challenging
- Multi-step calculations with 3+ operations (70-80% accuracy)
- Hypothetical scenarios ("what if") (60-70% accuracy)
- Calculations requiring context understanding (70-80% accuracy)

### ❌ Known Limitations
- Very complex formulas (may make errors)
- Calculations with ambiguous data relationships (may double-count)
- When document is unclear about inclusions/exclusions

---

## 🔍 Key Features to Verify

### 1. Shows Its Work ✅
```
Good Response:
"**Answer:** $500,000

**Calculation:**
- Total Revenue: $2,730,000
- Total Expenses: $2,230,000
- Formula: $2,730,000 - $2,230,000 = $500,000

**Source:** ACME Corporation Q4 2024 Financial Report"
```

### 2. Cites Sources ✅
Every answer should reference which document it came from

### 3. Handles Edge Cases ✅
- Should ask for clarification when ambiguous
- Should state assumptions clearly
- Should acknowledge when data is missing

---

## 🚨 Red Flags to Watch For

### ❌ Double-Counting
```
Bad: "Profit = Revenue - Expenses - Marketing"
(if Marketing is already in Expenses)
```

### ❌ Making Up Numbers
```
Bad: "The profit margin is approximately 25%"
(when the document clearly states 18.32%)
```

### ❌ Wrong Operations
```
Bad: "To get percentage, I added the two numbers"
(should divide and multiply by 100)
```

### ❌ No Reasoning
```
Bad: "The answer is $500,000"
(without showing how it calculated)
```

---

## 💡 Tips for Best Results

### 1. Use Clear Document Formatting
```
✅ Good:
Expenses:
- Marketing: $478,000
- R&D: $487,000
- Total: $965,000

❌ Avoid:
Marketing $478k, R&D $487k, total $965k
```

### 2. Include Calculations in Documents
```
✅ Good:
Net Profit: $425,000 ($500,000 - $75,000 tax)

❌ Unclear:
Net profit after tax is shown below
```

### 3. Be Specific in Questions
```
✅ Good: "What is the gross profit margin percentage?"
❌ Vague: "What's the profit?"
```

---

## 📈 Benchmark Performance

Based on Llama-3.3-70b capabilities:

| Category | Expected Accuracy | Speed |
|----------|------------------|-------|
| Direct Retrieval | 98-100% | < 1s |
| Simple Math | 95-98% | 1-2s |
| Multi-Step Calc | 85-95% | 2-3s |
| Complex Analysis | 70-85% | 3-5s |
| Ambiguity Handling | 60-70% | 2-3s |

---

## 🎓 Learning from Results

### If AI Scores 18-20/20
🎉 **Excellent!** Your system is working perfectly. The AI can handle complex financial analysis.

### If AI Scores 14-17/20
✅ **Good!** Most calculations work. Focus on improving document formatting for complex scenarios.

### If AI Scores 10-13/20
⚠️ **Needs Work.** Check if:
- Documents are clearly formatted
- Groq API is working properly
- Context window isn't being cut off

### If AI Scores < 10/20
❌ **Issue Detected.** Possible problems:
- API key not configured
- Model not receiving full context
- System prompt needs adjustment

---

## 🔧 Troubleshooting

### Issue: Wrong Calculations
**Fix**: Check document formatting - make hierarchies clear

### Issue: Slow Responses (>5 seconds)
**Fix**: Normal for first query, subsequent should be cached

### Issue: "No data found"
**Fix**: Ensure document was successfully uploaded and embedded

### Issue: Inconsistent Results
**Fix**: Clear cache, restart server, try again

---

## 📞 Next Steps

1. **Upload** TEST_FINANCIAL_REPORT.txt to your app
2. **Run through** all 20 questions systematically
3. **Document results** using the template in TEST_QUESTIONS.md
4. **Share findings** if you need adjustments to the system

---

**Ready to Test?** 🚀

The test report is intentionally complex to push the AI to its limits. Real-world documents will likely be simpler and the AI will perform even better!

Good luck! 🎯
