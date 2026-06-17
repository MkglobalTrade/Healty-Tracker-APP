export interface AIResponse {
  content: string
}

/**
 * Dr. AI engine.
 *
 * This app ships as a static export (`output: 'export'`), so there is no server
 * and no safe place to use an API key — calling an LLM directly from the browser
 * would expose your key. Therefore Dr. AI runs on a deterministic, offline
 * knowledge base below (no key required, works fully offline).
 *
 * To enable a real LLM later: remove `output: 'export'` from next.config.js,
 * add an App Router API route (e.g. src/app/api/ask/route.ts) that calls the
 * provider server-side, and have askDoctor() fetch that route. The key stays
 * on the server and is never shipped to the client.
 */
export async function askDoctor(question: string, _context: string): Promise<AIResponse> {
  return fallbackResponse(question)
}

function fallbackResponse(question: string): AIResponse {
  const q = question.toLowerCase()

  if (q.includes('glucose') || q.includes('sugar')) {
    return {
      content: `**Glucose Management**

• Fasting: 70-100 mg/dL
• After meals: under 140 mg/dL
• Monitor regularly with your Stelo CGM
• Stay hydrated and exercise regularly
• Contact your doctor if consistently over 180 or under 70`,
    }
  }

  if (q.includes('blood pressure') || q.includes('bp') || q.includes('hypertension')) {
    return {
      content: `**Blood Pressure Guidelines**

• Normal: under 120/80
• Elevated: 120-129/under 80
• Stage 1: 130-139 or 80-89
• Stage 2: 140+ or 90+
• Reduce sodium, exercise 150min/week, manage stress`,
    }
  }

  if (q.includes('medication') || q.includes('pill')) {
    return {
      content: `**Medication Safety**

• Take at the same time daily
• Never stop without consulting your doctor
• Report side effects promptly
• Check for interactions with new supplements`,
    }
  }

  if (q.includes('lab') || q.includes('blood work')) {
    return {
      content: `**Understanding Lab Results**

• CBC: blood cells, infection, anemia
• CMP: electrolytes, kidney, liver
• Lipid panel: cholesterol, heart risk
• HbA1c: 3-month glucose average
• Track trends over time, not single values`,
    }
  }

  if (q.includes('longevity') || q.includes('anti-aging')) {
    return {
      content: `**Longevity & Healthspan**

• Nutrition: Mediterranean diet, protein adequacy
• Exercise: Zone 2 cardio + resistance training
• Sleep: 7-9 hours, consistent schedule
• Metabolic health: glucose control, insulin sensitivity
• Preventive care: regular screenings`,
    }
  }

  return {
    content: 'Hello! I am Dr. AI. I can help you with lab results, glucose management, blood pressure, medications, and longevity topics. I can also analyze your uploaded health data. What would you like to know?',
  }
}

export async function fetchHealthNews() {
  const now = new Date().toISOString()
  return [
    { id: '1', title: 'GLP-1 Drugs Show Promise Beyond Diabetes', content: 'New research suggests semaglutide may reduce cardiovascular risk and impact longevity pathways.', category: 'Breakthrough', sourceUrl: 'https://www.nejm.org', publishedAt: now },
    { id: '2', title: 'Exercise Mimetics: The Future of Fitness?', content: 'Scientists are developing compounds that could simulate exercise benefits at the cellular level.', category: 'Research', sourceUrl: 'https://www.nature.com', publishedAt: now },
    { id: '3', title: 'CGM for Non-Diabetics', content: 'CGM devices like Stelo are increasingly used by healthy individuals to optimize metabolic health.', category: 'Technology', sourceUrl: 'https://www.dexcom.com', publishedAt: now },
    { id: '4', title: 'Sleep Quality Linked to Alzheimer Risk', content: 'Poor sleep quality in middle age may increase amyloid buildup. Sleep hygiene interventions show promise.', category: 'Neuroscience', sourceUrl: 'https://www.alz.org', publishedAt: now },
    { id: '5', title: 'Rapamycin Trials for Aging', content: 'PEARL trial interim results show promising safety profile for low-dose rapamycin in healthy aging.', category: 'Longevity', sourceUrl: 'https://www.aging.org', publishedAt: now },
  ]
}
