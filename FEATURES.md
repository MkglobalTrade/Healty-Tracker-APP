# Health Command Center — Complete Feature List

## 🏥 Dashboard

### Overall Health Status
- **Aggregated Indicator**: Combines glucose, blood pressure, and lab results into a single status
- **Status Levels**: 
  - 🟢 **GOOD** (Green): All values within normal range
  - 🟡 **WATCH** (Yellow): Some values borderline or slightly elevated
  - 🔴 **CRITICAL** (Red): One or more values significantly abnormal
- **Visual Feedback**: Color-coded circle with icon and glow effect

### Latest Readings
- **Glucose**: Most recent glucose reading with status indicator and reference range (70–99 mg/dL fasting)
- **Blood Pressure**: Most recent BP reading (systolic/diastolic) with status and reference (under 120/80 mmHg)
- **Quick View**: Large, easy-to-read numbers with clinical context

### Trend Charts
- **Glucose Trend**: 7-day line chart with reference lines at 99 (normal) and 126 (prediabetic)
- **Blood Pressure Trend**: Dual-line chart showing systolic (gold) and diastolic (blue) trends
- **Reference Lines**: Visual guides for clinical thresholds
- **Interactive Tooltips**: Hover to see exact values and dates

### Latest Lab Report
- **Quick Summary**: Most recent lab report with extracted values
- **Status Indicators**: Each value color-coded by clinical significance
- **Reference Ranges**: Normal ranges displayed for context

---

## 📤 Upload Labs

### AI-Powered Lab Analysis
- **Supported Formats**: PDF documents and image files (JPG, PNG)
- **Automatic Extraction**: Claude AI reads and extracts all test values
- **Intelligent Parsing**: Recognizes dates, units, reference ranges, and clinical significance
- **Status Categorization**: Automatically assigns green/yellow/red status to each value

### Quick Entry Forms
- **Glucose Entry**: Manual glucose reading with date selector
- **Blood Pressure Entry**: Systolic and diastolic inputs with date selector
- **Instant Save**: Readings automatically feed into trend charts

### Data Integration
- **Automatic Glucose Integration**: Glucose values from lab reports automatically added to trend chart
- **Automatic BP Integration**: Blood pressure values from lab reports automatically added to trend chart
- **History Logging**: All uploads logged in activity history with file name and value count

---

## 💊 Medications

### Add Medications
- **Medication Name**: Full name of the medication
- **Dosage**: Amount and unit (e.g., "500 mg", "1 tablet")
- **Frequency**: Morning, Night, or Twice Daily
- **Easy Management**: Add or delete medications with one click

### Schedule Organization
- **Day Schedule**: Morning medications displayed with sun icon
- **Night Schedule**: Evening medications displayed with moon icon
- **Frequency Indicator**: "2×/day" badge for medications taken twice daily
- **Visual Organization**: Medications grouped by time of day

### Medication Tracking
- **Current List**: Always shows active medications
- **Quick Reference**: Accessible from dashboard for daily planning
- **Flexible Updates**: Add or remove medications anytime

---

## 📋 History & Reports

### Complete Activity Log
- **Chronological View**: All entries sorted by date (newest first)
- **Entry Types**: 
  - Glucose readings (manual and from lab reports)
  - Blood pressure readings (manual and from lab reports)
  - Lab report uploads
  - Medications added/removed
- **Detailed Information**: Date, type, value, and source for each entry

### Download Report
- **HTML Format**: Professional-looking report with your health data
- **Print to PDF**: Use browser print function to save as PDF
- **Complete Summary**: Includes:
  - Personal information (name, birth date, generation date)
  - Full activity history with all readings
  - All lab reports with extracted values and status
  - Current medication list with dosages and frequency
- **Disclaimer**: Includes medical disclaimer for personal records

### Data Portability
- **Export**: Download your complete health history anytime
- **Backup**: Save reports for your physician or personal records
- **No Lock-in**: Your data is yours to keep

---

## 🤖 AI Doctor Chat

### Context-Aware Conversations
- **Your Data**: Chat has access to:
  - Last 10 glucose readings with dates
  - Last 10 blood pressure readings with dates
  - Latest lab report with all values and status
  - Current medications with dosages and frequency
  - Your age and birth date
- **Clinical Context**: AI understands your personal health profile

### Intelligent Analysis
- **Ask Questions**: "Is my glucose trend improving?", "What should I be concerned about?", "Analyze my latest labs"
- **Personalized Responses**: Answers reference YOUR specific data
- **Clinical Reasoning**: Claude Sonnet 4 provides accurate health analysis
- **Always Reminds**: Every response includes reminder that your physician has final say

### Message Management
- **Conversation History**: All messages preserved in current session
- **Clear Chat**: Start fresh conversation anytime
- **Auto-Scroll**: Chat automatically scrolls to latest message
- **Loading Indicator**: Visual feedback while AI is thinking

### Safety Features
- **Disclaimer**: Clearly states this is not medical advice
- **Physician Reminder**: Every response reminds user to confirm with doctor
- **No Diagnosis**: AI provides analysis, not diagnosis
- **Information Only**: For personal tracking and general information

---

## 📰 Health News

### Curated Health Topics
- **Longevity Research**: Latest findings on healthy aging
- **Glucose Management**: Diabetes and blood sugar news
- **Cardiovascular Health**: Heart health and blood pressure news
- **Medical Breakthroughs**: Major health discoveries and treatments

### Auto-Refresh
- **3-Hour Cycle**: News automatically refreshes every 3 hours while app is open
- **Manual Refresh**: Click refresh button to get latest news immediately
- **Last Updated**: Timestamp shows when news was last fetched

### Web Search Integration
- **Real-Time News**: Claude searches the web for latest articles
- **Curated Selection**: 5-6 most important articles shown
- **Topic Filtering**: Color-coded by category for quick scanning
- **Source Attribution**: Each article includes publication name

### News Display
- **Title**: Headline of the article
- **Summary**: 2-sentence summary in plain English
- **Topic Tag**: Color-coded category label
- **Source**: Publication name for credibility

---

## 👤 User Profile

### Profile Photo
- **Upload Photo**: Click profile photo area to upload image
- **Auto-Resize**: Photos automatically resized to 200×200 for performance
- **Display**: Photo shown in circular frame at top-right of app
- **Persistent**: Photo saved to browser storage

### Personal Information
- **Name**: Mikail Kocak (customizable in code)
- **Birth Date**: July 23, 1979 (customizable in code)
- **Age**: Automatically calculated and displayed
- **Quick Reference**: Name and age shown in header

---

## 🎨 Design & UX

### Color Scheme
- **Background**: Soft white (#F7F8FA) for easy reading
- **Panels**: Clean white cards with subtle shadows
- **Accent**: Gold (#C9A24B) for primary actions and highlights
- **Status Colors**:
  - 🟢 Green (#179A52): Normal/healthy values
  - 🟡 Yellow (#C78A00): Borderline/watch values
  - 🔴 Red (#D6453C): Critical/abnormal values

### Responsive Design
- **Mobile First**: Optimized for phones, tablets, and desktops
- **Flexible Layout**: Grid layouts adapt to screen size
- **Touch-Friendly**: Large buttons and inputs for easy interaction
- **Readable Text**: Proper font sizes and line heights for all devices

### Accessibility
- **Keyboard Navigation**: All controls accessible via keyboard
- **Focus Indicators**: Clear focus states for keyboard users
- **Color Contrast**: WCAG AA compliant contrast ratios
- **Semantic HTML**: Proper heading hierarchy and ARIA labels

### Navigation
- **Tab-Based**: Six main sections easily accessible via tabs
- **Clear Labels**: Each tab has icon and text label
- **Active State**: Current tab highlighted with gold border
- **Scrollable Tabs**: On small screens, tabs scroll horizontally

---

## 💾 Data Storage

### Browser localStorage
- **Storage Location**: Browser's local storage under key `mk-health-center-v1`
- **Data Structure**: All data stored as single JSON object
- **Automatic Save**: Every change automatically saved to storage
- **No Server**: All data stays on your device

### What's Stored
- **Glucose Readings**: All manual and imported glucose values
- **Blood Pressure Readings**: All manual and imported BP values
- **Lab Reports**: Complete lab data with extracted values
- **Medications**: Current medication list with dosages
- **Chat History**: All messages in current session
- **News**: Cached news articles and fetch timestamp
- **Profile Photo**: Base64-encoded profile image

### Data Privacy
- ✅ **Your Device**: Data never leaves your browser
- ✅ **No Server Storage**: No backend database
- ✅ **No Tracking**: No analytics or tracking cookies
- ⚠️ **Clearing Data**: Clearing browser storage erases everything
- ⚠️ **Backup**: No automatic backup (download reports for backup)

---

## 🔐 Security & Privacy

### API Security
- **Anthropic API Key**: Kept secure on server (Vercel serverless)
- **HTTPS Only**: All communication encrypted
- **No Key Exposure**: API key never sent to browser
- **Request Validation**: All requests validated before forwarding

### Data Protection
- **No Third Parties**: Data not shared with any third parties
- **No Ads**: No advertising or tracking
- **No Selling**: Your data is never sold
- **Open Source**: Code is transparent and auditable

### Limitations
- **File Size**: PDFs/images larger than ~3MB may fail (serverless limit)
- **Offline**: AI features require internet connection
- **Browser Dependent**: Data tied to specific browser/device
- **No Sync**: Data doesn't sync across devices

---

## 📱 Mobile Experience

### Responsive Tabs
- **Horizontal Scroll**: Tabs scroll on small screens
- **Touch Friendly**: Large tap targets for mobile
- **Full Width**: Content adapts to screen width

### Mobile-Optimized Forms
- **Single Column**: Forms stack vertically on mobile
- **Large Inputs**: Easy to tap and type
- **Date Picker**: Native date picker on mobile devices
- **File Upload**: Easy photo/PDF upload from phone

### Mobile Charts
- **Responsive Charts**: Automatically resize to fit screen
- **Touch Tooltips**: Tap to see values on mobile
- **Readable Labels**: Font sizes adjust for readability

---

## ⚡ Performance

### Optimizations
- **Code Splitting**: Large components lazy-loaded as needed
- **Image Optimization**: Profile photos compressed and resized
- **Efficient Rendering**: React optimizations prevent unnecessary re-renders
- **Local Storage**: Instant data loading from browser storage

### Build Size
- **Minified**: Production build is ~180KB gzipped
- **Fast Load**: Loads in under 2 seconds on typical connection
- **No External CDN**: All assets served locally

---

## 🚀 Deployment

### Vercel Deployment
- **Serverless Functions**: `/api/claude.js` runs on Vercel
- **Auto-Deploy**: Every GitHub push automatically redeploys
- **Environment Variables**: `ANTHROPIC_API_KEY` configured in Vercel
- **Global CDN**: App served from edge locations worldwide

### Local Development
- **Express Server**: `server.js` for local development
- **Hot Reload**: Vite provides fast refresh during development
- **API Proxy**: Local server proxies Claude API requests
- **Same API**: Local and production use same API endpoint

---

## 📊 Clinical References

### Glucose Ranges (ADA Standards)
- **Normal Fasting**: 70–99 mg/dL (green)
- **Prediabetic**: 100–125 mg/dL (yellow)
- **Diabetic**: ≥126 mg/dL (red)
- **Low**: <70 mg/dL (red)

### Blood Pressure Ranges (AHA Standards)
- **Normal**: <120/<80 mmHg (green)
- **Elevated**: 120–129/<80 mmHg (yellow)
- **Stage 1 Hypertension**: 130–139/80–89 mmHg (yellow)
- **Stage 2 Hypertension**: ≥140/≥90 mmHg (red)

---

## 🎯 Use Cases

### Daily Health Tracking
- Log morning and evening glucose readings
- Track blood pressure trends
- Manage medication schedule
- Monitor overall health status

### Lab Report Management
- Upload lab results from doctor visits
- Automatically extract and categorize values
- Track lab trends over time
- Download reports for physician

### Health Research
- Read latest health news and research
- Ask AI doctor about your specific values
- Understand what your numbers mean
- Make informed health decisions

### Medical Appointments
- Download complete health report to share with doctor
- Show trends and history
- Discuss specific values with physician
- Keep personal records

---

## 📝 Disclaimer

This app is for **personal health tracking and general information only**. It is **not medical advice**, diagnosis, or treatment. Always consult with a qualified healthcare provider before making any health decisions. The AI Doctor is an informational tool, not a substitute for professional medical care.

Your physician has the final say on all health matters.
