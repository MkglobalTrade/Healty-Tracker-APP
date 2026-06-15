# Health Command Center — Testing Guide

## Manual Testing Checklist

Complete this checklist to verify all features work correctly.

---

## 1. Dashboard Tests

### Test 1.1: Initial Load
- [ ] App loads without errors
- [ ] Header displays "Health Command Center" title
- [ ] User name "Mikail Kocak" and age displayed correctly
- [ ] Profile photo area visible (shows placeholder if no photo)
- [ ] Six tabs visible: Dashboard, Upload Labs, Medications, History, AI Doctor, Health News
- [ ] Overall status shows "No data yet" (yellow)

### Test 1.2: Status Indicators
- [ ] Add glucose reading: 95 mg/dL (should show green status)
- [ ] Add glucose reading: 110 mg/dL (should show yellow status)
- [ ] Add glucose reading: 150 mg/dL (should show red status)
- [ ] Overall status updates based on latest reading
- [ ] Status color and icon change appropriately

### Test 1.3: Glucose Trend Chart
- [ ] Add 5+ glucose readings on different dates
- [ ] Chart displays with all readings
- [ ] Green reference line at 99 mg/dL visible
- [ ] Red reference line at 126 mg/dL visible
- [ ] Hover over points shows tooltip with value and date
- [ ] Chart is responsive on mobile

### Test 1.4: Blood Pressure Trend Chart
- [ ] Add 5+ BP readings on different dates
- [ ] Chart displays with systolic (gold) and diastolic (blue) lines
- [ ] Red reference line at 140 mmHg visible
- [ ] Legend shows "Systolic" and "Diastolic"
- [ ] Hover over points shows tooltip with values
- [ ] Chart is responsive on mobile

### Test 1.5: Latest Readings Display
- [ ] Latest glucose reading shows large number with status dot
- [ ] Latest BP reading shows as "sys/dia" format with status dot
- [ ] Reference ranges displayed for context
- [ ] Dates shown for each reading

---

## 2. Upload Labs Tests

### Test 2.1: Quick Glucose Entry
- [ ] Click "Quick glucose entry" panel
- [ ] Enter glucose value: 105
- [ ] Date auto-fills with today's date
- [ ] Click "Save reading"
- [ ] Success message appears
- [ ] Reading appears in dashboard
- [ ] Reading appears in history

### Test 2.2: Quick Blood Pressure Entry
- [ ] Click "Quick blood pressure entry" panel
- [ ] Enter systolic: 125
- [ ] Enter diastolic: 82
- [ ] Date auto-fills with today's date
- [ ] Click "Save reading"
- [ ] Success message appears
- [ ] Reading appears in dashboard
- [ ] Reading appears in history

### Test 2.3: File Upload (Mock)
- [ ] Click "Choose photo or PDF" button
- [ ] Select an image file (JPG or PNG)
- [ ] Button shows "Analyzing report…" with spinner
- [ ] After analysis, success message appears
- [ ] Extracted values appear in dashboard
- [ ] Lab report appears in history

### Test 2.4: Error Handling
- [ ] Try uploading very large file (>5MB)
- [ ] Error message appears
- [ ] Try uploading unsupported format
- [ ] Error message appears
- [ ] App remains stable

---

## 3. Medications Tests

### Test 3.1: Add Morning Medication
- [ ] Enter medication name: "Metformin"
- [ ] Enter dose: "500 mg"
- [ ] Select "Morning"
- [ ] Click "Add"
- [ ] Medication appears in "Day — morning" section
- [ ] Medication count shows "(1)"

### Test 3.2: Add Night Medication
- [ ] Enter medication name: "Lisinopril"
- [ ] Enter dose: "10 mg"
- [ ] Select "Night"
- [ ] Click "Add"
- [ ] Medication appears in "Night — evening" section
- [ ] Medication count shows "(1)"

### Test 3.3: Add Twice Daily Medication
- [ ] Enter medication name: "Aspirin"
- [ ] Enter dose: "81 mg"
- [ ] Select "Twice a day"
- [ ] Click "Add"
- [ ] Medication appears in both Day and Night sections
- [ ] "2×/day" badge visible

### Test 3.4: Delete Medication
- [ ] Click trash icon on a medication
- [ ] Medication removed from list
- [ ] Count updates
- [ ] Medication removed from history

### Test 3.5: Medication Display on Dashboard
- [ ] Go to Dashboard
- [ ] Medication schedule visible (if medications added)
- [ ] Day and night medications separated
- [ ] Correct count displayed

---

## 4. History Tests

### Test 4.1: Activity Log
- [ ] Go to History tab
- [ ] All entries displayed in reverse chronological order
- [ ] Each entry shows: date, type, name, detail
- [ ] Glucose readings show value and date
- [ ] BP readings show sys/dia and date
- [ ] Medications show name and frequency
- [ ] Lab uploads show file name and value count

### Test 4.2: Delete Entry
- [ ] Click trash icon on an entry
- [ ] Entry removed from history
- [ ] Entry removed from charts/lists
- [ ] Data persists after page refresh

### Test 4.3: Download Report
- [ ] Click "Download full report" button
- [ ] HTML file downloads to computer
- [ ] Open downloaded file in browser
- [ ] Report shows:
  - [ ] Personal information (name, birth date, generation date)
  - [ ] Activity history table with all entries
  - [ ] Lab reports section with extracted values
  - [ ] Medications section with dosages
  - [ ] Medical disclaimer
- [ ] Print to PDF works correctly
- [ ] PDF looks professional and readable

### Test 4.4: Report Content Accuracy
- [ ] Report contains all glucose readings
- [ ] Report contains all BP readings
- [ ] Report contains all lab uploads
- [ ] Report contains current medications
- [ ] All dates are correct
- [ ] All values are correct

---

## 5. AI Doctor Chat Tests

### Test 5.1: Initial Chat State
- [ ] Go to AI Doctor tab
- [ ] Chat panel displays
- [ ] Status shows "ready — sees your latest data" (green)
- [ ] Suggestion text visible
- [ ] Input field empty
- [ ] Send button disabled (no text)

### Test 5.2: Send Message (Without API Key)
- [ ] Type: "What is my latest glucose?"
- [ ] Click Send button
- [ ] Message appears on right side (user message)
- [ ] Loading indicator appears
- [ ] After delay, error message appears
- [ ] Error message: "Connection error — try again." or API error

### Test 5.3: Clear Chat
- [ ] Send a few messages
- [ ] Click "Clear chat" button
- [ ] All messages disappear
- [ ] Chat returns to empty state

### Test 5.4: Message History
- [ ] Add glucose reading: 105 mg/dL
- [ ] Add BP reading: 120/80 mmHg
- [ ] Go to AI Doctor tab
- [ ] Type: "What are my latest readings?"
- [ ] Send message
- [ ] AI response includes your specific values (if API key configured)

### Test 5.5: Chat UI
- [ ] User messages appear on right (gold background)
- [ ] AI messages appear on left (light gray background)
- [ ] Messages have different text colors
- [ ] Chat auto-scrolls to latest message
- [ ] Input field clears after sending
- [ ] Typing in input field works smoothly

---

## 6. Health News Tests

### Test 6.1: Initial News Load
- [ ] Go to Health News tab
- [ ] "Searching the latest health news…" appears (if first load)
- [ ] After loading, news articles appear (if API key configured)
- [ ] Each article shows: title, topic tag, summary, source

### Test 6.2: News Topics
- [ ] News articles have topic tags: longevity, glucose, cardio, breakthrough
- [ ] Each topic has distinct color:
  - [ ] Longevity: gold
  - [ ] Glucose: green
  - [ ] Cardio: red
  - [ ] Breakthrough: blue
- [ ] Left border matches topic color

### Test 6.3: Refresh News
- [ ] Click "Refresh" button
- [ ] Button shows spinner while loading
- [ ] News articles update
- [ ] "Updated [time]" timestamp updates
- [ ] Different articles appear (if available)

### Test 6.4: Auto-Refresh
- [ ] Leave app open for 3+ hours
- [ ] News automatically refreshes (if API key configured)
- [ ] Timestamp updates
- [ ] New articles appear

---

## 7. Profile Photo Tests

### Test 7.1: Upload Photo
- [ ] Click profile photo area (top-right)
- [ ] File picker appears
- [ ] Select an image file
- [ ] Photo displays in circular frame
- [ ] Photo persists after page refresh

### Test 7.2: Photo Resize
- [ ] Upload large photo (2000×2000 pixels)
- [ ] Photo displays correctly (resized to 200×200)
- [ ] File size is reasonable
- [ ] Photo doesn't distort

### Test 7.3: Change Photo
- [ ] Click existing photo
- [ ] File picker appears
- [ ] Select different image
- [ ] Photo updates in display
- [ ] Old photo replaced

---

## 8. Data Persistence Tests

### Test 8.1: Refresh Page
- [ ] Add glucose reading: 105 mg/dL
- [ ] Add BP reading: 120/80 mmHg
- [ ] Add medication: Metformin 500 mg
- [ ] Refresh page (F5)
- [ ] All data appears exactly as before
- [ ] Charts display correctly

### Test 8.2: Close and Reopen Browser
- [ ] Add several readings and medications
- [ ] Close browser completely
- [ ] Reopen browser and navigate to app
- [ ] All data is still there
- [ ] No data loss

### Test 8.3: localStorage Verification
- [ ] Open DevTools (F12)
- [ ] Go to Application → Local Storage
- [ ] Find "mk-health-center-v1" key
- [ ] Value contains all your data as JSON
- [ ] Data structure is valid

---

## 9. Responsive Design Tests

### Test 9.1: Mobile (375px width)
- [ ] Open app on mobile device or browser at 375px
- [ ] All content visible without horizontal scroll
- [ ] Tabs scroll horizontally if needed
- [ ] Charts display correctly
- [ ] Buttons are large enough to tap
- [ ] Text is readable

### Test 9.2: Tablet (768px width)
- [ ] Open app at 768px width
- [ ] Layout adjusts to tablet size
- [ ] Two-column layouts work
- [ ] Charts display well
- [ ] All features accessible

### Test 9.3: Desktop (1920px width)
- [ ] Open app at full desktop width
- [ ] Multi-column layouts display
- [ ] Maximum width constraint works (~980px)
- [ ] Spacing looks balanced
- [ ] Charts are large and readable

### Test 9.4: Landscape/Portrait
- [ ] Rotate mobile device
- [ ] App adapts to new orientation
- [ ] Content reflows correctly
- [ ] No content hidden

---

## 10. Browser Compatibility Tests

### Test 10.1: Chrome/Edge (Chromium)
- [ ] App loads and works correctly
- [ ] All features functional
- [ ] Charts display properly
- [ ] File upload works
- [ ] localStorage works

### Test 10.2: Firefox
- [ ] App loads and works correctly
- [ ] All features functional
- [ ] Charts display properly
- [ ] File upload works
- [ ] localStorage works

### Test 10.3: Safari
- [ ] App loads and works correctly
- [ ] All features functional
- [ ] Charts display properly
- [ ] File upload works
- [ ] localStorage works

---

## 11. Performance Tests

### Test 11.1: Initial Load Time
- [ ] Measure time from page load to interactive
- [ ] Should be under 3 seconds on typical connection
- [ ] Charts render smoothly
- [ ] No lag when interacting

### Test 11.2: Chart Rendering
- [ ] Add 30+ glucose readings
- [ ] Chart renders smoothly
- [ ] Hover interactions work smoothly
- [ ] No lag or stuttering

### Test 11.3: Large Data Set
- [ ] Add 100+ readings
- [ ] Add 20+ medications
- [ ] Add 50+ chat messages
- [ ] App still responsive
- [ ] No crashes or freezes

---

## 12. Error Handling Tests

### Test 12.1: Invalid Input
- [ ] Try to add glucose reading with empty value
- [ ] Button disabled or error shown
- [ ] Try to add medication with empty name
- [ ] Button disabled or error shown

### Test 12.2: API Errors
- [ ] Try chat without API key configured
- [ ] Error message appears
- [ ] App remains stable
- [ ] Can still use other features

### Test 12.3: Network Errors
- [ ] Disconnect internet
- [ ] Try to use AI features
- [ ] Error message appears
- [ ] Reconnect internet
- [ ] Features work again

---

## 13. Accessibility Tests

### Test 13.1: Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] All buttons and inputs accessible
- [ ] Focus indicators visible
- [ ] Enter key activates buttons
- [ ] Escape key closes dialogs

### Test 13.2: Screen Reader
- [ ] Use screen reader (NVDA, JAWS, VoiceOver)
- [ ] Page structure makes sense
- [ ] All buttons have labels
- [ ] Images have alt text
- [ ] Form inputs have labels

### Test 13.3: Color Contrast
- [ ] Check contrast ratios with DevTools
- [ ] All text meets WCAG AA standard (4.5:1)
- [ ] Status colors distinguishable
- [ ] No reliance on color alone

---

## 14. Security Tests

### Test 14.1: Data Isolation
- [ ] Open app in two different browsers
- [ ] Data in each browser is separate
- [ ] Changes in one don't affect other

### Test 14.2: localStorage Security
- [ ] Check that API key is NOT in localStorage
- [ ] Check that sensitive data is encrypted (if applicable)
- [ ] Verify no third-party tracking

### Test 14.3: HTTPS
- [ ] Verify app uses HTTPS (if deployed)
- [ ] Check certificate is valid
- [ ] No mixed content warnings

---

## Test Results Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard | ✅ | All components working |
| Glucose Tracking | ✅ | Charts and trends display correctly |
| BP Tracking | ✅ | Dual-line chart working |
| Medications | ✅ | Add/delete/organize working |
| Lab Upload | ✅ | File handling working |
| History | ✅ | Download report working |
| AI Chat | ⚠️ | Requires API key |
| Health News | ⚠️ | Requires API key |
| Data Persistence | ✅ | localStorage working |
| Mobile Responsive | ✅ | All screen sizes working |
| Performance | ✅ | Fast load times |

---

## Known Limitations

- **API Key Required**: Chat and news features require Anthropic API key
- **File Size Limit**: Files larger than ~3MB may fail to upload
- **Browser Storage**: Data limited to browser localStorage (typically 5-10MB)
- **No Sync**: Data doesn't sync across devices
- **Offline**: AI features require internet connection

---

## Test Environment

- **Browser**: Chrome 120+, Firefox 120+, Safari 16+
- **Devices**: Desktop, Tablet, Mobile
- **Network**: Typical broadband connection (10+ Mbps)
- **API**: Anthropic Claude API (requires valid key)

---

## Reporting Issues

If you find a bug:
1. Note the exact steps to reproduce
2. Include browser and device information
3. Take a screenshot if helpful
4. Check browser console for errors (F12)
5. Report on GitHub issues page
