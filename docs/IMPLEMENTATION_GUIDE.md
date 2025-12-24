# Integration Implementation Guide

## ✅ What's Been Implemented

### Backend API (`server/integrations/google-sheets/api.ts`)

Five essential endpoints matching n8n's architecture:

#### 1. **List Spreadsheets** 
```
GET /api/integrations/google-sheets/spreadsheets?credentialId=xxx
```
- Returns user's Google Spreadsheets
- Currently returns mock data (4 sample spreadsheets)
- **TODO**: Replace with actual Google Sheets API call using `googleapis` package

#### 2. **Get Sheets**
```
GET /api/integrations/google-sheets/:spreadsheetId/sheets?credentialId=xxx
```
- Returns sheets within selected spreadsheet
- Mock data based on spreadsheet ID
- **TODO**: Call Google Sheets API to fetch real sheets

#### 3. **Get Column Headers**
```
GET /api/integrations/google-sheets/:spreadsheetId/sheets/:sheetName/headers?credentialId=xxx
```
- Returns actual column headers from first row
- Mock data with realistic column names
- **TODO**: Fetch real headers from Google Sheets

#### 4. **Test Execution**
```
POST /api/integrations/google-sheets/test
Body: {
  credentialId, spreadsheetId, sheetName,
  operation, values, rowNumber, range
}
```
- Executes test run with current configuration
- Supports: append, update, read, clear operations
- Returns execution result with updated ranges
- **TODO**: Execute actual Google Sheets operations

#### 5. **Get Sample Data**
```
GET /api/integrations/google-sheets/:spreadsheetId/sheets/:sheetName/sample?rows=5
```
- Returns sample rows for mapping preview
- Mock data with realistic values
- **TODO**: Fetch actual sample data

---

### Frontend Components

#### 1. **SpreadsheetPicker** (`client/src/components/workspace/SpreadsheetPicker.tsx`)

✅ **Features:**
- Dropdown showing user's actual spreadsheets
- Loading state with spinner
- Refresh button to reload spreadsheets
- External link to open in Google Sheets
- Error handling with helpful messages
- Disabled state when credential not connected
- Auto-loads when credentialId changes

✅ **Usage:**
```tsx
<SpreadsheetPicker
  credentialId={credentialId}
  value={spreadsheetId}
  onChange={(id, name) => {
    setSpreadsheetId(id);
    setSpreadsheetName(name);
  }}
  disabled={!isConnected}
/>
```

#### 2. **SheetPicker** (`client/src/components/workspace/SheetPicker.tsx`)

✅ **Features:**
- Cascading selection (depends on spreadsheet)
- Loads sheets from selected spreadsheet
- Refresh button
- Loading/error states
- Auto-resets when spreadsheet changes
- Shows selected sheet name

✅ **Usage:**
```tsx
<SheetPicker
  credentialId={credentialId}
  spreadsheetId={spreadsheetId}
  value={sheetName}
  onChange={setSheetName}
  disabled={!isConnected}
/>
```

#### 3. **ColumnMapper** (`client/src/components/workspace/ColumnMapper.tsx`)

✅ **Features:**
- Dynamic column loading from actual sheet
- Expression support with `{{$json.field}}` syntax
- Common expressions dropdown
- Visual field mapping interface
- Add/remove column mappings
- Auto-initializes with sheet columns
- Expression helper popover
- Support for different operations (append, update, read)

✅ **Usage:**
```tsx
<ColumnMapper
  credentialId={credentialId}
  spreadsheetId={spreadsheetId}
  sheetName={sheetName}
  value={columnMappings}
  onChange={setColumnMappings}
  operation="append"
  disabled={!isConnected}
/>
```

#### 4. **TestExecutionPanel** (`client/src/components/workspace/TestExecutionPanel.tsx`)

✅ **Features:**
- Test button with loading state
- Success/error output display
- Collapsible result panel
- Copy to clipboard
- Execution details (range, rows updated, etc.)
- Helpful error messages
- Troubleshooting tips
- Configuration validation
- Mock expression evaluation for testing

✅ **Usage:**
```tsx
<TestExecutionPanel
  config={{
    credentialId,
    spreadsheetId,
    sheetName,
    operation: 'append',
    columnMappings,
  }}
  disabled={!isConnected}
/>
```

---

## 🔄 How to Integrate into ConfigPanel

### Step 1: Import Components

Add to `ConfigPanel.tsx`:

```tsx
import { SpreadsheetPicker } from './SpreadsheetPicker';
import { SheetPicker } from './SheetPicker';
import { ColumnMapper } from './ColumnMapper';
import { TestExecutionPanel } from './TestExecutionPanel';
```

### Step 2: Add State Management

```tsx
// Google Sheets specific state
const [spreadsheetId, setSpreadsheetId] = useState("");
const [spreadsheetName, setSpreadsheetName] = useState("");
const [sheetName, setSheetName] = useState("");
const [columnMappings, setColumnMappings] = useState<Array<{ column: string; expression: string }>>([]);
const [operation, setOperation] = useState<'append' | 'update' | 'read' | 'clear'>('append');
```

### Step 3: Load from Node Config

```tsx
useEffect(() => {
  if (node) {
    // Load Google Sheets config
    setSpreadsheetId(node.config?.spreadsheetId || "");
    setSpreadsheetName(node.config?.spreadsheetName || "");
    setSheetName(node.config?.sheetName || "");
    setColumnMappings(node.config?.columnMappings || []);
    setOperation(node.config?.operation || 'append');
  }
}, [node?.id]);
```

### Step 4: Replace Static Fields in Setup Tab

**BEFORE (Static text inputs):**
```tsx
<div className="space-y-2">
  <Label>Spreadsheet ID</Label>
  <Input placeholder="Enter spreadsheet ID" />
</div>
```

**AFTER (Dynamic resource pickers):**
```tsx
<div className="space-y-4">
  {/* 1. Spreadsheet Selection */}
  <SpreadsheetPicker
    credentialId={isConnected ? "temp-credential-id" : undefined}
    value={spreadsheetId}
    onChange={(id, name) => {
      setSpreadsheetId(id);
      setSpreadsheetName(name);
      updateConfig('spreadsheetId', id);
      updateConfig('spreadsheetName', name);
    }}
    disabled={!isConnected}
  />

  {/* 2. Sheet Selection */}
  <SheetPicker
    credentialId={isConnected ? "temp-credential-id" : undefined}
    spreadsheetId={spreadsheetId}
    value={sheetName}
    onChange={(name) => {
      setSheetName(name);
      updateConfig('sheetName', name);
    }}
    disabled={!isConnected}
  />

  {/* 3. Operation Selection */}
  <div className="space-y-2">
    <Label>Operation *</Label>
    <Select
      value={operation}
      onValueChange={(value: any) => {
        setOperation(value);
        updateConfig('operation', value);
      }}
      disabled={!isConnected || !sheetName}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select operation" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="append">Append Row</SelectItem>
        <SelectItem value="update">Update Row</SelectItem>
        <SelectItem value="read">Read Rows</SelectItem>
        <SelectItem value="clear">Clear Sheet</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* 4. Column Mapping */}
  {(operation === 'append' || operation === 'update') && (
    <ColumnMapper
      credentialId={isConnected ? "temp-credential-id" : undefined}
      spreadsheetId={spreadsheetId}
      sheetName={sheetName}
      value={columnMappings}
      onChange={(mappings) => {
        setColumnMappings(mappings);
        updateConfig('columnMappings', mappings);
      }}
      operation={operation}
      disabled={!isConnected}
    />
  )}

  {/* 5. Test Execution */}
  <TestExecutionPanel
    config={{
      credentialId: isConnected ? "temp-credential-id" : undefined,
      spreadsheetId,
      sheetName,
      operation,
      columnMappings,
    }}
    disabled={!isConnected}
  />
</div>
```

### Step 5: Update Save Handler

```tsx
const handleSave = () => {
  const updatedConfig = {
    ...config,
    spreadsheetId,
    spreadsheetName,
    sheetName,
    operation,
    columnMappings,
  };
  
  onUpdate(node.id, updatedConfig);
  toast({
    title: "Configuration Saved",
    description: `${node.appName} is now configured`,
  });
};
```

---

## 🎯 Progressive Disclosure Flow

The components implement n8n's progressive disclosure pattern:

```
Step 1: Connect Google Account
  ↓ (credentialId available)
Step 2: SpreadsheetPicker loads spreadsheets
  ↓ (spreadsheetId selected)
Step 3: SheetPicker loads sheets
  ↓ (sheetName selected)
Step 4: ColumnMapper loads columns
  ↓ (operation selected)
Step 5: ColumnMapper shows mapping interface
  ↓ (mappings configured)
Step 6: TestExecutionPanel enabled
  ↓ (test successful)
Step 7: Node ready ✅
```

---

## 🔒 Credential Management (TODO)

You'll need to implement OAuth credential storage:

```typescript
// server/integrations/google-sheets/credentials.ts
interface GoogleSheetsCredential {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
  scopes: string[];
}

async function refreshAccessToken(credentialId: string) {
  // Use refresh token to get new access token
  // Update in database
  // Return new access token
}

async function getValidCredential(credentialId: string) {
  const credential = await db.query.credentials.findFirst({
    where: eq(credentials.id, credentialId)
  });
  
  // Check if token expired
  if (Date.now() >= credential.expiryDate) {
    return await refreshAccessToken(credentialId);
  }
  
  return credential;
}
```

---

## 📦 Install googleapis Package

```bash
npm install googleapis
```

### Replace Mock Data with Real API Calls

```typescript
import { google } from 'googleapis';

// Initialize OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set credentials from database
oAuth2Client.setCredentials({
  access_token: credential.accessToken,
  refresh_token: credential.refreshToken,
  expiry_date: credential.expiryDate,
});

// Example: List spreadsheets
const drive = google.drive({ version: 'v3', auth: oAuth2Client });
const response = await drive.files.list({
  q: "mimeType='application/vnd.google-apps.spreadsheet'",
  fields: 'files(id, name, webViewLink)',
  pageSize: 100,
});

// Example: Get sheets
const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
const spreadsheet = await sheets.spreadsheets.get({
  spreadsheetId,
  fields: 'sheets(properties(sheetId,title,index))',
});

// Example: Get headers
const headers = await sheets.spreadsheets.values.get({
  spreadsheetId,
  range: `${sheetName}!1:1`,
});

// Example: Append row
const appendResult = await sheets.spreadsheets.values.append({
  spreadsheetId,
  range: `${sheetName}!A1`,
  valueInputOption: 'USER_ENTERED',
  requestBody: {
    values: [values],
  },
});
```

---

## 🎨 Visual Comparison: Before vs After

### Before (Static):
```
┌─────────────────────────────────────┐
│ Spreadsheet ID                      │
│ [Enter spreadsheet ID manually...] │ ❌ Manual entry
│                                     │
│ Sheet Name                          │
│ [Type sheet name...]                │ ❌ Manual typing
└─────────────────────────────────────┘
```

### After (Dynamic):
```
┌─────────────────────────────────────┐
│ Spreadsheet              [⟳]        │
│ ▼ Sales Leads 2024                  │ ✅ Actual spreadsheets
│   - Sales Leads 2024                │
│   - Customer Database               │
│   - Q4 Revenue Tracking             │
│                                     │
│ Sheet                    [⟳]        │
│ ▼ Leads                             │ ✅ Actual sheets
│   - Leads                           │
│   - Qualified                       │
│   - Customers                       │
│                                     │
│ Column Mapping                      │
│ Name     → {{$json.firstName}}      │ ✅ Real columns
│ Email    → {{$json.email}}     [<>] │
│ Phone    → {{$json.phone}}     [<>] │
│ [+ Add Column Mapping]              │
│                                     │
│ Test Execution              [▶ Test]│ ✅ Live testing
└─────────────────────────────────────┘
```

---

## ✅ Validation Updates

Update WorkflowValidator to check new fields:

```typescript
// Add to validation logic
if (node.appId === 'google_sheets') {
  if (!config.spreadsheetId) {
    issues.push('Select a spreadsheet');
  }
  if (!config.sheetName) {
    issues.push('Select a sheet');
  }
  if (!config.operation) {
    issues.push('Choose an operation');
  }
  if ((config.operation === 'append' || config.operation === 'update') && 
      (!config.columnMappings || config.columnMappings.length === 0)) {
    issues.push('Configure column mappings');
  }
}
```

---

## 🚀 Testing Checklist

### Frontend Testing:
- [ ] SpreadsheetPicker loads mock spreadsheets
- [ ] SheetPicker loads after spreadsheet selected
- [ ] ColumnMapper loads headers from selected sheet
- [ ] Column mappings can be added/removed
- [ ] Expression helper popover works
- [ ] Test button executes and shows result
- [ ] Error states display correctly
- [ ] Loading states work
- [ ] Refresh buttons work
- [ ] All components disabled when not connected

### Backend Testing:
- [ ] All 5 endpoints return mock data
- [ ] Error handling works
- [ ] Query parameters validated
- [ ] Test execution simulates delays
- [ ] Operations (append, update, read, clear) work

### Integration Testing:
- [ ] Component state syncs with ConfigPanel
- [ ] Save button persists all fields
- [ ] Workflow validator checks new fields
- [ ] Navigation between tabs works
- [ ] Multiple Google Sheets nodes can coexist

---

## 📚 Next Steps

1. ✅ **Backend Routes Created** - All 5 endpoints ready
2. ✅ **Frontend Components Built** - 4 components complete
3. ⚠️ **Integration Pending** - Need to add to ConfigPanel
4. ❌ **Real API Connection** - Replace mock with googleapis
5. ❌ **Credential Management** - OAuth flow + storage
6. ❌ **Expression Engine** - Proper expression parser

---

## 💡 Key Architectural Improvements

### 1. **Resource Loading Pattern**
- Credentials → Resources → Sub-resources → Operations
- Each level depends on previous selection
- Auto-loads when dependencies change
- Clean state management

### 2. **Expression Support**
- `{{$json.field}}` syntax
- Common expressions helper
- Mock evaluation for testing
- Ready for real expression engine

### 3. **Test-Driven Configuration**
- Test at any point in setup
- Real-time validation
- Helpful error messages
- Success/failure feedback

### 4. **Progressive Disclosure**
- Only show relevant fields
- Disable until dependencies met
- Clear visual hierarchy
- Reduces cognitive load

### 5. **Error Handling**
- User-friendly error messages
- Troubleshooting tips
- Retry mechanisms
- Graceful degradation

---

*Last Updated: 2024-12-24*
*Implementation Status: 70% Complete (Components ready, integration pending)*
