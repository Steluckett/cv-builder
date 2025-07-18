import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { personal, experience, education, skills, achievements, targetRole } = req.body;

    if (!targetRole) {
      return res.status(400).json({ error: 'Target role is required' });
    }

    const prompt = `I'm helping someone create a CV for a ${targetRole} position in the UK healthcare sector. Based on their current information, provide specific, actionable suggestions to improve their CV using UK English throughout.

Current CV Data:
- Personal Info: ${JSON.stringify(personal)}
- Experience: ${JSON.stringify(experience)}
- Education: ${JSON.stringify(education)}
- Skills: ${JSON.stringify(skills)}
- Achievements: ${JSON.stringify(achievements)}

Target Role: ${targetRole}

Please provide specific, UK healthcare-focused suggestions for:
1. Specific improvements for their professional summary
2. Suggestions for better job descriptions using action verbs and quantifiable results relevant to healthcare
3. Recommended skills to add or emphasise for this healthcare role
4. Ways to better highlight relevant achievements in healthcare

Use UK English spelling throughout (e.g., "emphasise" not "emphasize", "organised" not "organized", "centre" not "center"). Focus on healthcare terminology and examples. Format your response as clear, actionable bullet points. Be specific and practical for UK healthcare professionals.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert CV writer specialising in UK healthcare recruitment. You understand NHS structures, healthcare terminology, and UK professional standards. Use UK English spelling and healthcare-specific examples throughout. Provide specific, actionable advice for healthcare professionals."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const suggestions = completion.choices[0].message.content;
    return res.status(200).json({ suggestions });

  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ error: 'Failed to generate suggestions' });
  }
}
