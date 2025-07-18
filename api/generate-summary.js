import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { experience, education, skills, achievements, targetRole } = req.body;

    if (!targetRole) {
      return res.status(400).json({ error: 'Target role is required' });
    }

    const prompt = `Create a compelling professional summary for a ${targetRole} position in the UK healthcare sector based on this information:

Experience: ${JSON.stringify(experience)}
Education: ${JSON.stringify(education)}
Skills: ${JSON.stringify(skills)}
Achievements: ${JSON.stringify(achievements)}

Write a 3-4 line professional summary that:
- Highlights key qualifications for the ${targetRole} role in UK healthcare
- Mentions years of experience if applicable
- Includes 2-3 most relevant skills or achievements for healthcare
- Uses dynamic action words appropriate for healthcare professionals
- Sounds professional but engaging
- Uses UK English spelling throughout (e.g., "specialised", "organised", "centre")
- Includes healthcare-specific terminology where appropriate

Respond with ONLY the summary text, no additional formatting or explanation.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert CV writer specialising in UK healthcare recruitment. Create compelling professional summaries for healthcare professionals using UK English spelling and healthcare terminology. Focus on NHS experience, patient care, clinical skills, and professional healthcare achievements."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const summary = completion.choices[0].message.content.trim();
    return res.status(200).json({ summary });

  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
}
