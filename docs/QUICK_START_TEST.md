# 🚀 Quick Start - Test Google Sheets Integration

## ▶️ Start in 30 Seconds

### 1. Start the Dev Server
```bash
npm run dev
```

### 2. Navigate to Integration Workspace
1. Open browser: `http://localhost:5000` (or your dev URL)
2. Go to **Dashboard** → **Integration Workspace**

### 3. Add Google Sheets Node
1. Click **"+ Add Node"** or drag from Apps Panel
2. Select **"Google Sheets"**
3. Node appears on canvas

### 4. Open Configuration
1. Click the Google Sheets node
2. ConfigPanel opens on the right

---

## 🎯 What You'll See (With Mock Data)

### Connect Tab
- **OAuth Section:** "Connect Google Account" button (simulated)
- Click it → See "Connecting..." → "Connected Successfully" ✅

### Setup Tab (After connecting)

#### 1. **Spreadsheet Picker** 🔄
- Dropdown shows 4 mock spreadsheets:
  - Sales Leads 2024
  - Customer Database
  - Q4 Revenue Tracking
  - Test Data Sheet
- Click to select any spreadsheet
- See external link icon to "open in Google Sheets"

#### 2. **Sheet Picker** 🔄
- After selecting spreadsheet, this dropdown populates
- Shows actual sheets from selected spreadsheet
- Example: "Sales Leads 2024" → Shows "Leads", "Qualified", "Customers"

#### 3. **Operation Selector**
- Choose between:
  - **Append Row** - Add new row
  - **Update Row** - Update existing row
  - **Read Rows** - Fetch data
  - **Clear Sheet** - Remove all data

#### 4. **Column Mapper** (for Append/Update)
- Shows actual column headers from sheet
- Example columns: Name, Email, Phone, Company, Status, Source, Created Date
- Each column has expression input: `{{$json.fieldName}}`
- Click **`< >`** button to see common expressions dropdown
- Add/remove column mappings

### Test Tab

#### **Test Execution Panel**
1. Click **"Test Step"** button
2. See "Testing..." spinner
3. Success message with JSON output:
```json
{
  "operation": "append",
  "spreadsheetId": "...",
  "sheetName": "Leads",
  "updatedRange": "A2:G2",
  "updatedRows": 1
}
```

---

## 🔍 What to Observe

### ✅ Progressive Disclosure
- Spreadsheet picker **disabled** until connected
- Sheet picker **disabled** until spreadsheet selected
- Operation selector **disabled** until sheet selected
- Column mapper **only shows** for append/update operations
- Test button **disabled** until configuration complete

### ✅ Loading States
- "Loading spreadsheets..." spinner
- "Loading sheets..." spinner
- "Loading columns..." spinner
- "Testing..." spinner

### ✅ Cascading Updates
1. Select spreadsheet → Sheet picker refreshes
2. Select sheet → Column mapper loads headers
3. Change operation → Column mapper updates
4. Change spreadsheet → Sheet resets

### ✅ Error Handling
- Try selecting nothing → See validation messages
- Connection errors show helpful tips
- Test failures show troubleshooting guide

---

## 🎨 UI Features to Check

### Refresh Buttons 🔄
- Every dropdown has refresh button
- Click to reload resource from API
- Shows spinning icon while loading

### External Links 🔗
- Spreadsheet picker shows "Open in Google Sheets" link
- Hover over spreadsheet items to see external link icon

### Expression Helper `< >`
- Click icon next to expression inputs
- Popover shows common expressions:
  - `{{$json.email}}`
  - `{{$json.firstName}}`
  - `{{$now}}`
  - `{{$randomId}}`
- Click to insert into field

### Badges
- Column count badge: "7 columns"
- Shows number of detected columns

### Info Tooltips ℹ️
- Helpful explanations throughout
- Operation descriptions
- Expression syntax hints

---

## 🧪 Test Scenarios

### Scenario 1: Happy Path
1. ✅ Connect Google account
2. ✅ Select "Sales Leads 2024"
3. ✅ Select "Leads" sheet
4. ✅ Choose "Append Row"
5. ✅ See 7 columns auto-loaded: Name, Email, Phone, etc.
6. ✅ Mappings auto-filled with `{{$json.name}}`, etc.
7. ✅ Click "Test Step"
8. ✅ See success with updated range "A2:G2"

### Scenario 2: Operation Change
1. ✅ Configure for "Append Row"
2. ✅ See column mappings
3. ✅ Change to "Read Rows"
4. ✅ Column mapper hides (not needed for read)
5. ✅ Change back to "Append Row"
6. ✅ Column mapper reappears

### Scenario 3: Resource Change
1. ✅ Select "Sales Leads 2024" → "Leads"
2. ✅ Configure column mappings
3. ✅ Change spreadsheet to "Customer Database"
4. ✅ Sheet resets to empty
5. ✅ Column mappings reset
6. ✅ Select "Active Customers" sheet
7. ✅ See different columns loaded

### Scenario 4: Expression Helper
1. ✅ Focus on Email mapping
2. ✅ Click `< >` button
3. ✅ See expression dropdown
4. ✅ Click "Email field"
5. ✅ See `{{$json.email}}` inserted

---

## 📊 Mock Data Reference

### Available Spreadsheets:
```javascript
1. Sales Leads 2024
   - Sheets: Leads, Qualified, Customers
   - Columns: Name, Email, Phone, Company, Status, Source, Created Date

2. Customer Database
   - Sheets: Active Customers, Churned, Archive
   - Columns: ID, Name, Email, Plan, Billing Cycle, Next Renewal

3. Q4 Revenue Tracking
   - Sheets: Monthly Revenue, Expenses
   - Columns: Month, New MRR, Expansion, Churn, Net MRR, Total Customers

4. Test Data Sheet
   - Sheets: Sheet1
   - Columns: Column A, Column B, Column C, Column D
```

---

## 🎯 Success Checklist

After testing, you should have seen:

- [ ] ✅ Dropdown loads actual spreadsheet names
- [ ] ✅ Dropdown loads actual sheet names
- [ ] ✅ Column headers loaded from sheet
- [ ] ✅ Loading spinners during API calls
- [ ] ✅ Refresh buttons work
- [ ] ✅ External links visible
- [ ] ✅ Progressive disclosure (fields appear when ready)
- [ ] ✅ Cascading updates (changing parent resets children)
- [ ] ✅ Expression helper popover
- [ ] ✅ Test execution with success output
- [ ] ✅ Error messages when configuration incomplete
- [ ] ✅ Badges showing counts
- [ ] ✅ Info tooltips and help text

---

## 🔧 Troubleshooting

### Issue: Dropdowns are empty
**Fix:** Check browser console for API errors. Mock data should always return.

### Issue: "Connect Google Account" does nothing
**Expected:** This is simulated. In real implementation, triggers OAuth flow.

### Issue: Test button disabled
**Check:**
- [ ] OAuth connected?
- [ ] Spreadsheet selected?
- [ ] Sheet selected?
- [ ] Operation selected?
- [ ] Column mappings configured (for append/update)?

### Issue: Components not rendering
**Check:**
1. ConfigPanel imports: `GoogleSheetsConfig` should be registered
2. Browser console for React errors
3. Network tab for API call failures

---

## 📝 Next: Compare to n8n

### Open n8n Demo:
Visit: https://demo.n8n.io

### Create Google Sheets Node:
1. Add "Google Sheets" node
2. Compare UI with yours
3. Notice the same patterns:
   - Resource picker (spreadsheet)
   - Sub-resource picker (sheet)
   - Operation dropdown
   - Column mapping
   - Test button

### Your Implementation Should:
✅ Look similar (progressive disclosure)
✅ Feel similar (resource selection flow)
✅ Work similar (test execution)

---

## 🎉 Congratulations!

If everything works, you've successfully implemented:
- N8N-style resource loading
- Dynamic field configuration
- Progressive disclosure UX
- Test-driven setup

**You're 85% done!** Only OAuth and real Google API integration remain.

---

*For full implementation details, see: `docs/COMPLETE_IMPLEMENTATION_SUMMARY.md`*
