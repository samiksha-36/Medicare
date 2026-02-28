const Groq = require('groq-sdk');

// Initialize Groq client
const getGroq = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Groq API key not configured');
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

// Helper: call Groq with error handling
const callGroq = async (systemPrompt, userPrompt, maxTokens = 800) => {
  try {
    const groq = getGroq();

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',  // FREE - fast & powerful
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.7
    });

    return response.choices[0].message.content;

  } catch (err) {
    console.error('=== GROQ ERROR ===');
    console.error('Message:', err.message);
    console.error('=================');
    throw err;
  }
};

// @desc    AI Symptom Checker
// @route   POST /api/ai/symptom-check
// @access  Private/Patient
const symptomCheck = async (req, res) => {
  try {
    const { symptoms, age, gender } = req.body;

    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ message: 'Symptoms are required' });
    }

    const symptomList = Array.isArray(symptoms) ? symptoms.join(', ') : symptoms;

    const systemPrompt = `You are a medical AI assistant. Analyze symptoms and provide a response.
IMPORTANT: Respond with ONLY a valid JSON object. No markdown, no backticks, no extra text.
The JSON must have exactly these keys:
- conditions: array of strings (3-5 possible conditions ranked by likelihood)
- specialist: string (recommended doctor type)
- urgency: string (must be exactly "low", "medium", or "high")
- advice: string (general health advice)
- disclaimer: string (note that this is not a real diagnosis)`;

    const userPrompt = `Patient Age: ${age || 'unknown'}, Gender: ${gender || 'unknown'}
Symptoms: ${symptomList}
Respond with ONLY the JSON object, no other text.`;

    const result = await callGroq(systemPrompt, userPrompt, 600);

    console.log('Groq raw response:', result);

    // Clean and parse JSON
    let parsed;
    try {
      const cleaned = result
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('JSON parse failed, using raw response');
      parsed = { rawResponse: result };
    }

    res.json({ success: true, analysis: parsed });

  } catch (err) {
    console.error('symptomCheck error:', err.message);
    if (err.message === 'Groq API key not configured') {
      return res.status(503).json({ message: 'AI service not configured. Please add Groq API key.' });
    }
    res.status(500).json({ message: 'AI service error', error: err.message });
  }
};

// @desc    AI Prescription Explanation
// @route   POST /api/ai/explain-prescription
// @access  Private
const explainPrescription = async (req, res) => {
  try {
    const { medicines, diagnosis } = req.body;

    if (!medicines || medicines.length === 0) {
      return res.status(400).json({ message: 'Medicines list is required' });
    }

    const medicineList = medicines
      .map(m => `${m.name} - ${m.dosage}, ${m.frequency} for ${m.duration}`)
      .join('\n');

    const systemPrompt = `You are a medical AI that explains prescriptions in simple, patient-friendly language.
For each medicine explain:
- What it does (purpose)
- How to take it
- Common side effects to watch for
- Important warnings
Keep it clear, simple, and reassuring. Avoid medical jargon.`;

    const userPrompt = `Diagnosis: ${diagnosis}
Prescribed medicines:
${medicineList}
Please explain this prescription in simple language the patient can understand.`;

    const explanation = await callGroq(systemPrompt, userPrompt, 800);
    res.json({ success: true, explanation });

  } catch (err) {
    console.error('explainPrescription error:', err.message);
    if (err.message === 'Groq API key not configured') {
      return res.status(503).json({ message: 'AI service not configured.' });
    }
    res.status(500).json({ message: 'AI service error', error: err.message });
  }
};

// @desc    AI Health Chatbot
// @route   POST /api/ai/chat
// @access  Private
const healthChat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) return res.status(400).json({ message: 'Message is required' });

    const groq = getGroq();

    const systemPrompt = `You are a helpful hospital health assistant chatbot. You can:
- Answer general health FAQs
- Explain medical terms in simple language
- Give general wellness advice
- Help navigate hospital services

RULES:
- Never diagnose specific conditions
- Always recommend consulting a doctor for medical concerns
- Be empathetic and supportive
- Keep responses concise (under 150 words)
- If someone seems in crisis, direct them to emergency services`;

    // Build messages array with history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      })),
      { role: 'user', content: message }
    ];

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 400,
      temperature: 0.7
    });

    const reply = response.choices[0].message.content;
    res.json({ success: true, reply });

  } catch (err) {
    console.error('healthChat error:', err.message);
    if (err.message === 'Groq API key not configured') {
      return res.status(503).json({ message: 'AI service not configured.' });
    }
    res.status(500).json({ message: 'AI service error', error: err.message });
  }
};

// @desc    AI Report Summarizer
// @route   POST /api/ai/summarize-report
// @access  Private
const summarizeReport = async (req, res) => {
  try {
    const { reportText, reportType = 'medical report' } = req.body;

    if (!reportText) return res.status(400).json({ message: 'Report text is required' });

    const truncated = reportText.slice(0, 4000);

    const systemPrompt = `You are a medical AI that summarizes medical reports for patients.
Provide:
1. Key Findings (bullet points)
2. What it Means (simple explanation)
3. Recommended Next Steps
4. Red Flags to watch (if any)
Use simple, non-technical language. Be reassuring but honest.`;

    const userPrompt = `Please summarize this ${reportType}:\n\n${truncated}`;

    const summary = await callGroq(systemPrompt, userPrompt, 700);
    res.json({ success: true, summary });

  } catch (err) {
    console.error('summarizeReport error:', err.message);
    if (err.message === 'Groq API key not configured') {
      return res.status(503).json({ message: 'AI service not configured.' });
    }
    res.status(500).json({ message: 'AI service error', error: err.message });
  }
};

module.exports = { symptomCheck, explainPrescription, healthChat, summarizeReport };