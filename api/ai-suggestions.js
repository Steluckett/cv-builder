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

    const prompt = `
I'm helping someone create a CV for a ${targetRole} position. Based on their current information, provide specific, actionable suggestions to improve their CV.

Current CV Data:
- Personal Info: ${JSON.stringify(personal)}
- Experience: ${JSON.stringify(experience)}
- Education: ${JSON.stringify(education)}
- Skills: ${JSON.stringify(skills)}
- Achievements: ${JSON.stringify(achievements)}

Target Role: ${targetRole}

Please provide:
1. Specific improvements for their professional summary
2. Suggestions for better job descriptions using action verbs and quantifiable results
3. Recommended skills to add or emphasize for this role
4. Ways to better highlight relevant achievements
5. Overall CV structure and formatting tips

Format your response as clear, actionable bullet points. Be specific and practical.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert CV/resume writer and career coach. Provide specific, actionable advice to help people improve their CVs for their target roles."
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
