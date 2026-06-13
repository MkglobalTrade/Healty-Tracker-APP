// Local storage utility for the Diabetes Tracker App

const STORAGE_KEYS = {
  GLUCOSE_READINGS: 'dt_glucose_readings',
  LAB_RESULTS: 'dt_lab_results',
  MEDICATIONS: 'dt_medications',
  CHAT_HISTORY: 'dt_chat_history',
  USER_PROFILE: 'dt_user_profile',
  AI_API_KEY: 'dt_ai_api_key',
};

// Generic storage functions
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

// Glucose Readings
export function getGlucoseReadings() {
  return getItem(STORAGE_KEYS.GLUCOSE_READINGS, []);
}

export function saveGlucoseReading(reading: any) {
  const readings = getGlucoseReadings();
  readings.push(reading);
  setItem(STORAGE_KEYS.GLUCOSE_READINGS, readings);
}

export function deleteGlucoseReading(id: string) {
  const readings = getGlucoseReadings().filter((r: any) => r.id !== id);
  setItem(STORAGE_KEYS.GLUCOSE_READINGS, readings);
}

// Lab Results
export function getLabResults() {
  return getItem(STORAGE_KEYS.LAB_RESULTS, []);
}

export function saveLabResult(result: any) {
  const results = getLabResults();
  results.push(result);
  setItem(STORAGE_KEYS.LAB_RESULTS, results);
}

export function deleteLabResult(id: string) {
  const results = getLabResults().filter((r: any) => r.id !== id);
  setItem(STORAGE_KEYS.LAB_RESULTS, results);
}

// Medications
export function getMedications() {
  return getItem(STORAGE_KEYS.MEDICATIONS, []);
}

export function saveMedication(med: any) {
  const meds = getMedications();
  meds.push(med);
  setItem(STORAGE_KEYS.MEDICATIONS, meds);
}

export function updateMedication(id: string, updates: any) {
  const meds = getMedications().map((m: any) =>
    m.id === id ? { ...m, ...updates } : m
  );
  setItem(STORAGE_KEYS.MEDICATIONS, meds);
}

export function deleteMedication(id: string) {
  const meds = getMedications().filter((m: any) => m.id !== id);
  setItem(STORAGE_KEYS.MEDICATIONS, meds);
}

// Chat History
export function getChatHistory() {
  return getItem(STORAGE_KEYS.CHAT_HISTORY, []);
}

export function saveChatMessage(message: any) {
  const history = getChatHistory();
  history.push(message);
  setItem(STORAGE_KEYS.CHAT_HISTORY, history);
}

export function clearChatHistory() {
  setItem(STORAGE_KEYS.CHAT_HISTORY, []);
}

// User Profile
export function getUserProfile() {
  return getItem(STORAGE_KEYS.USER_PROFILE, {
    name: 'Mikail KOCAK',
    birthDate: '1979-07-23',
    photoUrl: '',
  });
}

export function saveUserProfile(profile: any) {
  setItem(STORAGE_KEYS.USER_PROFILE, profile);
}

// API Key
export function getApiKey() {
  return getItem(STORAGE_KEYS.AI_API_KEY, '');
}

export function saveApiKey(key: string) {
  setItem(STORAGE_KEYS.AI_API_KEY, key);
}

// HbA1c Calculation
// Formula: HbA1c (%) = (Average BG in mg/dL + 46.7) / 28.7
export function calculateHbA1c(averageGlucose: number): number {
  if (averageGlucose <= 0) return 0;
  return Math.round(((averageGlucose + 46.7) / 28.7) * 10) / 10;
}

// Get daily stats from readings
export function getDailyStats(date: string) {
  const readings = getGlucoseReadings();
  const dayReadings = readings.filter((r: any) => r.timestamp.startsWith(date));
  
  if (dayReadings.length === 0) return null;
  
  const values = dayReadings.map((r: any) => r.value);
  const average = values.reduce((a: number, b: number) => a + b, 0) / values.length;
  
  return {
    date,
    readings: dayReadings,
    average: Math.round(average),
    min: Math.min(...values),
    max: Math.max(...values),
    hbA1cEstimate: calculateHbA1c(average),
    count: values.length,
  };
}

// Get stats for a period
export function getPeriodStats(period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly') {
  const readings = getGlucoseReadings();
  if (readings.length === 0) return null;
  
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'daily':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case 'quarterly':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    case 'yearly':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
  }
  
  const filtered = readings.filter((r: any) => new Date(r.timestamp) >= startDate);
  
  if (filtered.length === 0) return null;
  
  const values = filtered.map((r: any) => r.value);
  const average = values.reduce((a: number, b: number) => a + b, 0) / values.length;
  
  return {
    period,
    readings: filtered,
    average: Math.round(average),
    min: Math.min(...values),
    max: Math.max(...values),
    hbA1cEstimate: calculateHbA1c(average),
    count: values.length,
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
  };
}
