# AI Calculation Test Questions
## For ACME Corporation Q4 2024 Financial Report

Use these questions to test your AI's calculation and reasoning abilities. Each question is designed to test different aspects of the AI's understanding.

---

## ✅ LEVEL 1: Basic Retrieval (Should be EASY)

### Q1: Direct Information
**Question:** "What was the total revenue in Q4 2024?"  
**Expected Answer:** $2,730,000  
**Tests:** Basic information retrieval

### Q2: Simple Lookup
**Question:** "How much did we spend on marketing and sales?"  
**Expected Answer:** $478,000  
**Tests:** Category-specific data extraction

### Q3: Explicit Value
**Question:** "What is the net profit after tax?"  
**Expected Answer:** $425,000  
**Tests:** Reading pre-calculated values

---

## 🧮 LEVEL 2: Simple Calculations (Should be CORRECT)

### Q4: Basic Subtraction
**Question:** "What is the gross profit?"  
**Expected Answer:** $500,000 (Revenue $2,730,000 - Expenses $2,230,000)  
**Tests:** Simple two-number subtraction

### Q5: Tax Calculation
**Question:** "How much tax did we pay?"  
**Expected Answer:** $75,000 (15% of $500,000 pre-tax profit)  
**Tests:** Percentage calculation

### Q6: Addition Verification
**Question:** "What is the total of all operating expenses?"  
**Expected Answer:** $865,000  
**Tests:** Verifying pre-calculated totals

---

## 🔢 LEVEL 3: Multi-Step Calculations (TRICKY)

### Q7: Profit Margin Calculation
**Question:** "What is our profit margin percentage?"  
**Expected Answer:** 18.32% (Gross profit $500,000 / Revenue $2,730,000 × 100)  
**Tests:** Division + percentage conversion

### Q8: Growth Percentage
**Question:** "What was the revenue growth percentage from Q4 2023 to Q4 2024?"  
**Expected Answer:** 26.98% (($2,730,000 - $2,150,000) / $2,150,000 × 100)  
**Tests:** Year-over-year comparison + percentage

### Q9: Net Cash Position
**Question:** "What is the net cash flow for Q4?"  
**Expected Answer:** $350,000 (Cash inflows $2,775,000 - Cash outflows $2,425,000)  
**Tests:** Multi-category aggregation

---

## 🎯 LEVEL 4: Complex Analysis (CHALLENGING)

### Q10: Department Efficiency
**Question:** "Which department is more profitable - Sales or Service?"  
**Expected Answer:** Sales Department ($1,232,000 profit) vs Service ($320,000 profit) - Sales is more profitable  
**Tests:** Comparison between categories

### Q11: Regional Performance
**Question:** "What percentage of total revenue comes from North America?"  
**Expected Answer:** 50% ($1,365,000 / $2,730,000 × 100)  
**Tests:** Category percentage calculation

### Q12: Cost Efficiency
**Question:** "How much does it cost us to generate $1 of revenue?"  
**Expected Answer:** $0.82 ($2,230,000 expenses / $2,730,000 revenue)  
**Tests:** Ratio calculation

---

## 🧠 LEVEL 5: Tricky Questions (AI KILLER TESTS)

### Q13: Hidden Calculation
**Question:** "What is the actual profit if we exclude investment income?"  
**Expected Answer:** $380,000 (Net profit $425,000 - tax adjustment from excluding $45k investment income)  
**Calculation:**
- Revenue without investment: $2,730,000 - $45,000 = $2,685,000
- Profit before tax: $2,685,000 - $2,230,000 = $455,000
- Tax (15%): $68,250
- Net profit: $455,000 - $68,250 = $386,750
**Tests:** Multi-step reasoning with exclusions

### Q14: Aggregate + Compare
**Question:** "Did we spend more on R&D or Marketing & Sales?"  
**Expected Answer:** Marketing & Sales ($478,000) vs R&D ($487,000) - R&D is higher by $9,000  
**Tests:** Category comparison with difference calculation

### Q15: Multiple Operations
**Question:** "What would our profit margin be if we reduced marketing spend by 20%?"  
**Expected Answer:** 
- Marketing reduction: $478,000 × 0.20 = $95,600
- New expenses: $2,230,000 - $95,600 = $2,134,400
- New profit: $2,730,000 - $2,134,400 = $595,600
- New margin: ($595,600 / $2,730,000) × 100 = 21.82%
**Tests:** Hypothetical scenario with multiple calculations

### Q16: Average Calculation
**Question:** "What is the average monthly revenue per employee?"  
**Expected Answer:** 
- Q4 Revenue: $2,730,000
- Employees: 45
- Months: 3
- Monthly revenue per employee: $2,730,000 / 45 / 3 = $20,222
**Tests:** Division across multiple dimensions

### Q17: Budget Variance Analysis
**Question:** "Did we exceed our expense budget, and by how much?"  
**Expected Answer:** Yes, exceeded by $130,000 (Actual $2,230,000 vs Budget $2,100,000, which is 6.2% over)  
**Tests:** Comparison + variance calculation

---

## 🔥 LEVEL 6: Ambiguity Tests (SHOULD CLARIFY)

### Q18: Ambiguous Reference
**Question:** "What was the total profit?"  
**Expected Clarification:** AI should ask: "Do you mean gross profit ($500,000), net profit after tax ($425,000), or pre-tax profit ($500,000)?"  
**Tests:** Handling ambiguous terminology

### Q19: Missing Context
**Question:** "What's the profit margin?"  
**Expected Clarification:** AI should ask: "Do you mean gross profit margin (18.32%) or net profit margin (15.57%)?"  
**Tests:** Identifying when clarification is needed

### Q20: Incomplete Question
**Question:** "Calculate the difference"  
**Expected Response:** AI should ask: "What would you like me to calculate the difference between?"  
**Tests:** Handling incomplete queries

---

## 📊 SCORING RUBRIC

### Excellent Performance (18-20 correct)
- ✅ All basic and simple calculations correct
- ✅ Most multi-step calculations accurate
- ✅ Shows working/reasoning
- ✅ Identifies ambiguities

### Good Performance (14-17 correct)
- ✅ Basic calculations perfect
- ✅ Most simple calculations correct
- ⚠️ Some errors in complex scenarios
- ⚠️ May miss some ambiguities

### Needs Improvement (10-13 correct)
- ✅ Can retrieve direct information
- ⚠️ Struggles with multi-step calculations
- ❌ Makes calculation errors
- ❌ Doesn't identify ambiguities

### Poor Performance (< 10 correct)
- ⚠️ Basic retrieval works
- ❌ Cannot perform calculations
- ❌ Frequent errors
- ❌ No reasoning shown

---

## 🧪 Testing Protocol

### How to Test
1. **Upload** the TEST_FINANCIAL_REPORT.txt to your app
2. **Ask each question** in order
3. **Record the answer** and compare with expected
4. **Check reasoning** - does it show its work?
5. **Note response time** - should be 1-3 seconds

### What to Look For
- ✅ **Correct final answer**
- ✅ **Shows calculation steps**
- ✅ **Cites source document**
- ✅ **Identifies when data is ambiguous**
- ✅ **Explains assumptions made**

### Red Flags
- ❌ Double-counting expenses
- ❌ Wrong mathematical operations
- ❌ Ignoring clearly stated totals
- ❌ Making up numbers not in document
- ❌ No explanation of reasoning

---

## 💡 Pro Tips

1. **Start with easy questions** (Q1-Q6) to verify basic functionality
2. **Test one level at a time** to isolate issues
3. **Compare response time** - complex queries take longer
4. **Check source citations** - AI should reference the document
5. **Look for reasoning** - good AI explains its thinking

---

## 📝 Results Template

```
Question #: _____
Question: "_____________________"
AI Answer: "_____________________"
Expected: "_____________________"
✅ Correct / ❌ Incorrect
Notes: _____________________
Response Time: _____ seconds
```

---

**Happy Testing! 🚀**

Remember: The goal is not perfection, but to understand the AI's capabilities and limitations so you can use it effectively.
