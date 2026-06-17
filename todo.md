# Health Command Center v2 - TODO

## Database & Backend
- [ ] Create Drizzle schema for glucose readings
- [ ] Create Drizzle schema for blood pressure readings
- [ ] Create Drizzle schema for medications
- [ ] Create Drizzle schema for medication doses (tracking taken doses)
- [ ] Create Drizzle schema for lab uploads and extracted data
- [ ] Create Drizzle schema for chat messages
- [ ] Create Drizzle schema for health news articles
- [ ] Generate and apply database migrations via webdev_execute_sql
- [ ] Create tRPC procedures for glucose CRUD operations
- [ ] Create tRPC procedures for blood pressure CRUD operations
- [ ] Create tRPC procedures for medication CRUD operations
- [ ] Create tRPC procedures for medication dose tracking
- [ ] Create tRPC procedures for lab file uploads and extraction
- [ ] Create tRPC procedures for chat message history and LLM integration
- [ ] Create tRPC procedures for health news feed

## Frontend - Layout & Navigation
- [ ] Customize DashboardLayout sidebar with health-specific navigation
- [ ] Add user profile section to sidebar
- [ ] Create logout functionality
- [ ] Set up routing for all pages (Home, Glucose, BloodPressure, Medications, Labs, Chat, News)

## Frontend - Dashboard Home Page
- [ ] Create summary cards for today's glucose, blood pressure, and medication schedule
- [ ] Build 7-day trend charts for glucose and blood pressure
- [ ] Display quick stats (average, min, max)
- [ ] Show upcoming medication reminders

## Frontend - Glucose Tracker
- [ ] Create form to log glucose readings (value, date, time)
- [ ] Build history table with sorting and filtering
- [ ] Create line chart for glucose trends
- [ ] Create bar chart for glucose distribution
- [ ] Display statistics (average, min, max, standard deviation)

## Frontend - Blood Pressure Tracker
- [ ] Create form to log BP readings (systolic, diastolic, pulse, date, time)
- [ ] Build history table with sorting and filtering
- [ ] Create trend chart for systolic/diastolic over time
- [ ] Display statistics (average, min, max for each metric)

## Frontend - Medication Manager
- [ ] Create form to add medications (name, dosage, frequency)
- [ ] Organize medications into Day and Night categories
- [ ] Build UI to mark doses as taken/not taken
- [ ] Display medication schedule for today
- [ ] Show medication history and adherence stats

## Frontend - Upload Labs Section
- [ ] Create file upload interface (PDF, JPG, PNG support)
- [ ] Simulate AI extraction of health data from files
- [ ] Display extracted results in a readable format
- [ ] Store upload history with extracted data

## Frontend - AI Doctor Chat
- [ ] Create chat message interface with message history
- [ ] Build message input form
- [ ] Integrate LLM with user health context (glucose, BP, meds)
- [ ] Render responses with markdown support (using Streamdown)
- [ ] Display loading states during LLM processing
- [ ] Persist chat history in database

## Frontend - Health News Feed
- [ ] Create news feed display with article cards
- [ ] Add category filter functionality
- [ ] Show source and publish date for each article
- [ ] Implement article link navigation

## Design & Styling
- [ ] Choose professional color palette for health app
- [ ] Apply consistent spacing and typography
- [ ] Ensure responsive design for mobile and desktop
- [ ] Add smooth transitions and micro-interactions
- [ ] Test accessibility and keyboard navigation

## Testing & Deployment
- [ ] Write vitest tests for database procedures
- [ ] Write vitest tests for tRPC mutations and queries
- [ ] Test all CRUD operations locally
- [ ] Verify charts render correctly with sample data
- [ ] Test LLM integration with health context
- [ ] Create initial checkpoint
- [ ] Verify deployment to Vercel works without errors
