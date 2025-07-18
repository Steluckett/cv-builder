import { chromium } from 'playwright-aws-lambda';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { personal, experience, education, skills, achievements } = req.body;

    if (!personal || !personal.name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${personal.name} - CV</title>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4; margin: 15mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Figtree', Arial, sans-serif; 
      line-height: 1.5; 
      color: #333; 
      font-size: 12px;
    }
    .header { 
      background: #005994; 
      color: white; 
      padding: 20px; 
      margin: -15mm -15mm 20px -15mm;
      text-align: center;
    }
    .name { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
    .contact { font-size: 14px; opacity: 0.9; }
    .section { margin-bottom: 20px; page-break-inside: avoid; }
    .section-title { 
      font-size: 16px; 
      font-weight: 700; 
      color: #005994; 
      border-bottom: 2px solid #005994; 
      padding-bottom: 4px; 
      margin-bottom: 12px;
      text-transform: uppercase;
    }
    .summary { 
      background: #f8fafc; 
      padding: 15px; 
      border-left: 4px solid #005994; 
      font-style: italic; 
      margin-bottom: 15px;
    }
    .item { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
    .item:last-child { border-bottom: none; }
    .item-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .item-title { font-weight: 600; color: #1e293b; }
    .item-company { color: #005994; font-weight: 500; }
    .item-duration { color: #64748b; font-style: italic; font-size: 11px; }
    .item-description { color: #475569; margin-top: 6px; white-space: pre-line; }
    .skills { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill { 
      background: #f1f5f9; 
      padding: 4px 8px; 
      border-radius: 12px; 
      font-size: 11px; 
      border: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${personal.name}</div>
    <div class="contact">
      ${[personal.email, personal.phone, personal.location].filter(Boolean).join(' • ')}
    </div>
  </div>

  ${personal.summary ? `
    <div class="section">
      <div class="section-title">Professional Summary</div>
      <div class="summary">${personal.summary}</div>
    </div>
  ` : ''}

  ${experience && experience.length > 0 ? `
    <div class="section">
      <div class="section-title">Work Experience</div>
      ${experience.map(exp => `
        <div class="item">
          <div class="item-header">
            <div>
              <div class="item-title">${exp.title || 'Job Title'}</div>
              <div class="item-company">${exp.company || 'Company'}</div>
            </div>
            <div class="item-duration">${exp.duration || ''}</div>
          </div>
          ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${education && education.length > 0 ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${education.map(edu => `
        <div class="item">
          <div class="item-header">
            <div>
              <div class="item-title">${edu.degree || 'Degree'}</div>
              <div class="item-company">${edu.institution || 'Institution'}</div>
            </div>
            <div class="item-duration">${edu.year || ''}</div>
          </div>
          ${edu.details ? `<div class="item-description">${edu.details}</div>` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}

  ${skills && skills.length > 0 ? `
    <div class="section">
      <div class="section-title">Skills</div>
      <div class="skills">
        ${skills.map(skill => `
          <div class="skill">${skill.name || 'Skill'} - ${skill.level || 'Level'}</div>
        `).join('')}
      </div>
    </div>
  ` : ''}

  ${achievements && achievements.length > 0 ? `
    <div class="section">
      <div class="section-title">Achievements</div>
      ${achievements.map(achievement => `
        <div class="item">
          <div class="item-title">${achievement.title || 'Achievement'}</div>
          ${achievement.description ? `<div class="item-description">${achievement.description}</div>` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''}
</body>
</html>`;

    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' }
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${personal.name.replace(/[^a-zA-Z0-9]/g, '_')}_CV.pdf"`);
    
    return res.send(pdf);

  } catch (error) {
    console.error('PDF generation error:', error);
    return res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
}
