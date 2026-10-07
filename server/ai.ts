import { GoogleGenAI } from '@google/genai';
import type { ComplaintAIAnalysis } from './db.js';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI(); // Automatically picks GEMINI_API_KEY from process.env
  }
  return aiClient;
}

function ruleBasedTriage(title: string, description: string): ComplaintAIAnalysis {
  const text = `${title} ${description}`.toLowerCase();

  // Urgent conditions: Elevator stuck, fire, sparking, gas leak, main water pipe burst
  if (
    text.includes('elevator') ||
    text.includes('lift') ||
    text.includes('stuck') ||
    text.includes('sparking') ||
    text.includes('fire') ||
    text.includes('smoke') ||
    text.includes('gas') ||
    text.includes('burst') ||
    text.includes('electric shock')
  ) {
    let category = 'General Maintenance';
    if (text.includes('elevator') || text.includes('lift')) category = 'Elevator';
    else if (text.includes('sparking') || text.includes('shock') || text.includes('wire')) category = 'Electrical';
    else if (text.includes('burst') || text.includes('flood')) category = 'Plumbing';

    return {
      category,
      priority: 'Urgent',
      reason: `High risk safety hazard identified involving ${category.toLowerCase()} and immediate resident safety.`,
      confidence: 96,
    };
  }

  // High priority conditions: Water leak, security barrier, door lock, power outage
  if (
    text.includes('leak') ||
    text.includes('water') ||
    text.includes('security') ||
    text.includes('barrier') ||
    text.includes('gate') ||
    text.includes('lock') ||
    text.includes('dark') ||
    text.includes('no power')
  ) {
    let category = 'Plumbing';
    if (text.includes('barrier') || text.includes('gate') || text.includes('cctv') || text.includes('guard')) category = 'Security';
    else if (text.includes('power') || text.includes('switch') || text.includes('light')) category = 'Electrical';

    return {
      category,
      priority: 'High',
      reason: `${category} malfunction requiring prompt intervention to prevent property damage or operational disruption.`,
      confidence: 93,
    };
  }

  // Medium priority: Drain, garbage, noise, carpenting, painting, cleaning
  if (
    text.includes('drain') ||
    text.includes('clog') ||
    text.includes('garbage') ||
    text.includes('trash') ||
    text.includes('dirty') ||
    text.includes('smell')
  ) {
    return {
      category: 'Sanitation',
      priority: 'Medium',
      reason: 'Sanitation maintenance required to preserve cleanliness and avoid hygiene inconvenience.',
      confidence: 90,
    };
  }

  if (text.includes('door') || text.includes('window') || text.includes('handle') || text.includes('hinge') || text.includes('wood')) {
    return {
      category: 'Carpentry',
      priority: 'Medium',
      reason: 'Carpentry fixture repair required for smooth resident usage.',
      confidence: 89,
    };
  }

  return {
    category: 'General Maintenance',
    priority: 'Low',
    reason: 'Routine society maintenance request logged for standard queue scheduling.',
    confidence: 86,
  };
}

export async function analyzeComplaintWithAI(
  title: string,
  description: string,
  location?: string
): Promise<ComplaintAIAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return ruleBasedTriage(title, description);
  }

  try {
    const ai = getAIClient();
    const prompt = `You are the AI triage intelligence engine for "Society", a smart society management portal.
A resident has reported the following complaint:
Title: ${title}
Description: ${description}
Location: ${location || 'Society premises'}

Classify this complaint with high precision:
1. "category": Must be one of ["Plumbing", "Electrical", "Elevator", "Sanitation", "Carpentry", "Security", "General Maintenance"].
2. "priority": Must be one of ["Urgent", "High", "Medium", "Low"].
   - "Urgent": Stoppage between elevator floors, trapped residents, active electrical sparks/fire hazard, major flooding, gas smell, physical danger.
   - "High": Significant water leaks near lobby/entrances, faulty entrance boom barrier, common area power loss, door lock failure.
   - "Medium": Blocked drains, corridor fixtures, minor seepage, gym equipment fault, sanitation clearing.
   - "Low": Minor cosmetic scratches, routine checkup, noise advisory, lawn mowing.
3. "reason": A crisp, professional 1-2 sentence explanation of why this category and priority were designated.
4. "confidence": An integer between 85 and 99.

Return ONLY a JSON object with this exact shape:
{
  "category": string,
  "priority": "Low" | "Medium" | "High" | "Urgent",
  "reason": string,
  "confidence": number
}`;

    // Add a 4.5-second timeout so API never hangs
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI request timeout')), 4500)
    );

    const callPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const response = await Promise.race([callPromise, timeoutPromise]);
    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);

    const validCategories = [
      'Plumbing',
      'Electrical',
      'Elevator',
      'Sanitation',
      'Carpentry',
      'Security',
      'General Maintenance',
    ];
    const validPriorities = ['Urgent', 'High', 'Medium', 'Low'];

    const category = validCategories.includes(parsed.category) ? parsed.category : 'General Maintenance';
    const priority = validPriorities.includes(parsed.priority) ? parsed.priority : 'Medium';
    const reason = typeof parsed.reason === 'string' && parsed.reason.length > 5
      ? parsed.reason
      : `${category} issue analyzed with ${priority.toLowerCase()} priority urgency.`;
    const confidence = typeof parsed.confidence === 'number' && parsed.confidence >= 50 && parsed.confidence <= 100
      ? parsed.confidence
      : 95;

    return {
      category,
      priority,
      reason,
      confidence,
    };
  } catch (err) {
    console.warn('Gemini API call timed out or failed, applying rule-based triage fallback:', err);
    return ruleBasedTriage(title, description);
  }
}
