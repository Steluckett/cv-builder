import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { personal, experience, education, skills, achievements } = req.body;

    // Validate required data
    if (!personal || !personal.name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Create HTML template for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${personal.name} - CV</title>
        <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .page {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            background: white;
            position: relative;
          }
          .header {
            background: #005994;
            color: white;
            padding: 25px;
            margin: -20mm -20mm 30px -20mm;
            text-align: left;
          }
          .name {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          .contact-info {
            font-size: 14px;
            opacity: 0.9;
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
          }
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #005994;
            border-bottom: 2px solid #005994;
            padding-bottom: 5px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .summary {
            background: #f8fafc;
            padding: 20px;
            border-left: 4px solid #005994;
            font-style: italic;
            margin-bottom: 20px;
            border-radius: 0 8px 8px 0;
          }
          .experience-item, .education-item, .achievement-item {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e2e8f0;
          }
          .experience-item:last-child, .education-item:last-child, .achievement-item:last-child {
            border-bottom: none;
          }
          .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
          }
          .item-title {
            font-weight: 600;
            color: #1e293b;
            font-size: 14px;
          }
          .item-company {
            color: #005994;
            font-weight: 500;
            font-size: 13px;
          }
          .item-duration {
            color: #64748b;
            font-style: italic;
            font-size: 12px;
            white-space: nowrap;
          }
          .item-description {
            white-space: pre-line;
            color: #475569;
            font-size: 12px;
            margin-top: 8px;
            line-height: 1.5;
          }
          .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .skill-item {
            background: #f1f5f9;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            border: 1px solid #e2e8f0;
          }
          .skill-name {
            font-weight: 500;
            color: #1e293b;
          }
          .skill-level {
            color: #64748b;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="name">${personal.name}</div>
            <div class="contact-info">
              ${personal.email ? `<span>📧 ${personal.email}</span>` : ''}
              ${personal.phone ? `<span>📞 ${personal.phone}</span>` : ''}
              ${personal.location ? `<span>📍 ${personal.location}</span>` : ''}
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
                <div class="experience-item">
                  <div class="item-header">
                    <div>
                      <div class="item-title">${exp.title || 'Job Title'}</div>
                      <div class="item-company">${exp.company || 'Company Name'}</div>
                    </div>
                    <div class="item-duration">${exp.duration || 'Duration'}</div>
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
                <div class="education-item">
                  <div class="item-header">
                    <div>
                      <div class="item-title">${edu.degree || 'Degree'}</div>
                      <div class="item-company">${edu.institution || 'Institution'}</div>
                    </div>
                    <div class="item-duration">${edu.year || 'Year'}</div>
                  </div>
                  ${edu.details ? `<div class="item-description">${edu.details}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${skills && skills.length > 0 ? `
            <div class="section">
              <div class="section-title">Skills</div>
              <div class="skills-container">
                ${skills.map(skill => `
                  <div class="skill-item">
                    <span class="skill-name">${skill.name || 'Skill'}</span>
                    <span class="skill-level"> - ${skill.level || 'Level'}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${achievements && achievements.length > 0 ? `
            <div class="section">
              <div class="section-title">Achievements</div>
              ${achievements.map(achievement => `
                <div class="achievement-item">
                  <div class="item-title">${achievement.title || 'Achievement'}</div>
                  ${achievement.description ? `<div class="item-description">${achievement.description}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;

    // Launch Puppeteer with Vercel-optimized settings
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 }
    });

    await browser.close();

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${personal.name.replace(/[^a-zA-Z0-9]/g, '_')}_CV.pdf"`);
    
    return res.send(pdf);

  } catch (error) {
    console.error('PDF generation error:', error);
    return res.status(500).json({ error: 'Failed to generate PDF' });
  }
}
