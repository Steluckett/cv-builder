import React, { useState } from 'react';
import { User, Briefcase, GraduationCap, Award, FileText, Download, Sparkles, ChevronLeft, ChevronRight, X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const CVBuilderApp = () => {
  // Add Figtree font
  React.useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    // Apply font to body
    document.body.style.fontFamily = 'Figtree, system-ui, -apple-system, sans-serif';
    
    return () => {
      document.head.removeChild(link);
      document.body.style.fontFamily = '';
    };
  }, []);

  const [activeSection, setActiveSection] = useState(0);
  const [cvData, setCvData] = useState({
    personal: {
      name: '',
      email: '',
      phone: '',
      location: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: [],
    achievements: [],
    colors: {
      headerBackground: '#005994',
      headerText: '#FFFFFF',
      sectionTitles: '#005994'
    }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [notifications, setNotifications] = useState([]);

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User, title: 'Personal Information' },
    { id: 'experience', label: 'Experience', icon: Briefcase, title: 'Work Experience' },
    { id: 'education', label: 'Education', icon: GraduationCap, title: 'Education' },
    { id: 'skills', label: 'Skills', icon: Award, title: 'Skills' },
    { id: 'achievements', label: 'Achievements', icon: FileText, title: 'Achievements' },
    { id: 'customization', label: 'Customization', icon: Sparkles, title: 'CV Customization' }
  ];

  // Move updatePersonalInfo AFTER useState hooks
  const updatePersonalInfo = (field, value) => {
    setCvData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
  };

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const updateColors = (field, value) => {
    setCvData(prev => ({
      ...prev,
      colors: { ...prev.colors, [field]: value }
    }));
  };

  const addExperience = () => {
    setCvData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now(),
        title: '',
        company: '',
        duration: '',
        description: ''
      }]
    }));
  };

  const updateExperience = (id, field, value) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now(),
        degree: '',
        institution: '',
        year: '',
        details: ''
      }]
    }));
  };

  const updateEducation = (id, field, value) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkill = () => {
    setCvData(prev => ({
      ...prev,
      skills: [...prev.skills, { id: Date.now(), name: '', level: 'Intermediate' }]
    }));
  };

  const updateSkill = (id, field, value) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.map(skill =>
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const removeSkill = (id) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }));
  };

  const addAchievement = () => {
    setCvData(prev => ({
      ...prev,
      achievements: [...prev.achievements, { id: Date.now(), title: '', description: '' }]
    }));
  };

  const updateAchievement = (id, field, value) => {
    setCvData(prev => ({
      ...prev,
      achievements: prev.achievements.map(achievement =>
        achievement.id === id ? { ...achievement, [field]: value } : achievement
      )
    }));
  };

  const removeAchievement = (id) => {
    setCvData(prev => ({
      ...prev,
      achievements: prev.achievements.filter(achievement => achievement.id !== id)
    }));
  };

  const generateAISuggestions = async () => {
    if (!targetRole.trim()) {
      addNotification('Please specify a target role to get personalised suggestions.', 'error');
      return;
    }

    setIsGenerating(true);
    setSuggestions('');
    addNotification('Generating AI suggestions...', 'info');

    try {
      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personal: cvData.personal,
          experience: cvData.experience,
          education: cvData.education,
          skills: cvData.skills,
          achievements: cvData.achievements,
          targetRole: targetRole
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
      addNotification('AI suggestions generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating suggestions:', error);
      addNotification('Sorry, I encountered an error whilst generating suggestions. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSummary = async () => {
    if (!targetRole.trim()) {
      addNotification('Please specify a target role first.', 'error');
      return;
    }

    setIsGenerating(true);
    addNotification('Generating professional summary...', 'info');

    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          experience: cvData.experience,
          education: cvData.education,
          skills: cvData.skills,
          achievements: cvData.achievements,
          targetRole: targetRole
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      updatePersonalInfo('summary', data.summary);
      addNotification('Professional summary generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating summary:', error);
      addNotification('Error generating summary. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDF = async () => {
    if (!cvData.personal.name.trim()) {
      addNotification('Please enter your name before downloading your CV.', 'error');
      return;
    }

    try {
      addNotification('Generating PDF...', 'info');
      
      // Dynamically import jsPDF
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      
      // Set up styling
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;
      
      // Helper function to add text with word wrapping
      const addWrappedText = (text, fontSize, isBold = false, color = '#000000') => {
        if (!text) return;
        
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(color);
        
        const lines = doc.splitTextToSize(text, contentWidth);
        
        // Check if we need a new page
        if (yPosition + (lines.length * fontSize * 0.6) > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.text(lines, margin, yPosition);
        yPosition += lines.length * fontSize * 0.6 + 5;
      };
      
      // Add header section with custom colors
      const headerBgColor = cvData.colors.headerBackground.replace('#', '');
      const headerR = parseInt(headerBgColor.substr(0, 2), 16);
      const headerG = parseInt(headerBgColor.substr(2, 2), 16);
      const headerB = parseInt(headerBgColor.substr(4, 2), 16);
      
      doc.setFillColor(headerR, headerG, headerB);
      doc.rect(0, 0, pageWidth, 50, 'F');
      
      doc.setTextColor(cvData.colors.headerText);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(cvData.personal.name || 'Your Name', margin, 25);
      
      // Contact info
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const contactInfo = [
        cvData.personal.email && `${cvData.personal.email}`,
        cvData.personal.phone && `${cvData.personal.phone}`,
        cvData.personal.location && `${cvData.personal.location}`
      ].filter(Boolean).join(' • ');
      
      if (contactInfo) {
        doc.text(contactInfo, margin, 40);
      }
      
      yPosition = 70;
      
      // Professional Summary
      if (cvData.personal.summary) {
        doc.setTextColor(cvData.colors.sectionTitles);
        addWrappedText('PROFESSIONAL SUMMARY', 14, true, cvData.colors.sectionTitles);
        yPosition -= 5;
        addWrappedText(cvData.personal.summary, 11, false, '#333333');
        yPosition += 10;
      }
      
      // Work Experience
      if (cvData.experience.length > 0) {
        addWrappedText('WORK EXPERIENCE', 14, true, cvData.colors.sectionTitles);
        yPosition -= 5;
        
        cvData.experience.forEach((exp, index) => {
          if (index > 0) yPosition += 5;
          
          // Job title and company
          const jobTitle = `${exp.title || 'Job Title'} • ${exp.company || 'Company'}`;
          addWrappedText(jobTitle, 12, true, '#000000');
          yPosition -= 5;
          
          // Duration
          if (exp.duration) {
            addWrappedText(exp.duration, 10, false, '#666666');
            yPosition -= 5;
          }
          
          // Description
          if (exp.description) {
            addWrappedText(exp.description, 10, false, '#333333');
          }
        });
        yPosition += 10;
      }
      
      // Education
      if (cvData.education.length > 0) {
        addWrappedText('EDUCATION', 14, true, cvData.colors.sectionTitles);
        yPosition -= 5;
        
        cvData.education.forEach((edu, index) => {
          if (index > 0) yPosition += 5;
          
          const degree = `${edu.degree || 'Qualification'} • ${edu.institution || 'Institution'}`;
          addWrappedText(degree, 12, true, '#000000');
          yPosition -= 5;
          
          if (edu.year) {
            addWrappedText(edu.year, 10, false, '#666666');
            yPosition -= 5;
          }
          
          if (edu.details) {
            addWrappedText(edu.details, 10, false, '#333333');
          }
        });
        yPosition += 10;
      }
      
      // Skills
      if (cvData.skills.length > 0) {
        addWrappedText('SKILLS', 14, true, cvData.colors.sectionTitles);
        yPosition -= 5;
        
        const skillsList = cvData.skills.map(skill => 
          `${skill.name || 'Skill'} (${skill.level || 'Level'})`
        ).join(' • ');
        
        addWrappedText(skillsList, 11, false, '#333333');
        yPosition += 10;
      }
      
      // Achievements
      if (cvData.achievements.length > 0) {
        addWrappedText('ACHIEVEMENTS', 14, true, cvData.colors.sectionTitles);
        yPosition -= 5;
        
        cvData.achievements.forEach((achievement, index) => {
          if (index > 0) yPosition += 5;
          
          if (achievement.title) {
            addWrappedText(achievement.title, 12, true, '#000000');
            yPosition -= 5;
          }
          
          if (achievement.description) {
            addWrappedText(achievement.description, 10, false, '#333333');
          }
        });
      }
      
      // Save the PDF
      const fileName = `${cvData.personal.name.replace(/[^a-zA-Z0-9]/g, '_') || 'CV'}.pdf`;
      doc.save(fileName);
      
      addNotification('PDF downloaded successfully!', 'success');
      
    } catch (error) {
      console.error('PDF generation error:', error);
      addNotification('Error generating PDF. Please try again.', 'error');
    }
  };

  const renderNotifications = () => {
    if (notifications.length === 0) return null;

    return (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => {
          const Icon = notification.type === 'success' ? CheckCircle : 
                      notification.type === 'error' ? AlertCircle : Info;
          const bgColor = notification.type === 'success' ? 'rgba(240, 249, 232, 0.9)' : 
                         notification.type === 'error' ? 'rgba(254, 242, 242, 0.9)' :
                         'rgba(230, 243, 255, 0.9)';
          const textColor = notification.type === 'success' ? '#2D5016' :
                           notification.type === 'error' ? '#991B1B' :
                           '#003D6B';
          const iconColor = notification.type === 'success' ? '#BFD12F' :
                           notification.type === 'error' ? '#DC2626' :
                           '#005994';
          const borderColor = notification.type === 'success' ? 'rgba(191, 209, 47, 0.3)' :
                             notification.type === 'error' ? 'rgba(239, 68, 68, 0.3)' :
                             'rgba(0, 89, 148, 0.3)';

          return (
            <div
              key={notification.id}
              className="border rounded-lg p-4 shadow-lg max-w-sm flex items-start gap-3 animate-in slide-in-from-right-5 duration-300 backdrop-blur-sm"
              style={{ 
                backgroundColor: bgColor,
                color: textColor,
                borderColor: borderColor
              }}
            >
              <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: iconColor }} />
              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="hover:opacity-70 flex-shrink-0"
                style={{ color: iconColor }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPersonalSection = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Target Role</label>
        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
          style={{ focusRingColor: '#005994' }}
          placeholder="e.g., Senior Nurse, Practice Manager, Clinical Lead"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={cvData.personal.name}
            onChange={(e) => updatePersonalInfo('name', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
            style={{ focusRingColor: '#005994' }}
            placeholder="Dr Sarah Johnson"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={cvData.personal.email}
            onChange={(e) => updatePersonalInfo('email', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
            style={{ focusRingColor: '#005994' }}
            placeholder="sarah.johnson@nhs.net"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={cvData.personal.phone}
            onChange={(e) => updatePersonalInfo('phone', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
            style={{ focusRingColor: '#005994' }}
            placeholder="07123 456789"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={cvData.personal.location}
            onChange={(e) => updatePersonalInfo('location', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
            style={{ focusRingColor: '#005994' }}
            placeholder="Manchester, UK"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Professional Summary</label>
          <button
            onClick={generateSummary}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3 py-1 text-white rounded-lg hover:opacity-90 disabled:opacity-50 text-sm"
            style={{ backgroundColor: '#682E57' }}
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'AI Generate'}
          </button>
        </div>
        <textarea
          value={cvData.personal.summary}
          onChange={(e) => updatePersonalInfo('summary', e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
          style={{ focusRingColor: '#005994' }}
          placeholder="A brief professional summary highlighting your key qualifications and career objectives..."
        />
      </div>
    </div>
  );

  const renderExperienceSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Work Experience</h3>
          <p className="text-sm text-gray-600">Add your work experience, starting with the most recent</p>
        </div>
        <button
          onClick={addExperience}
          className="px-4 py-2 text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: '#005994' }}
        >
          Add Experience
        </button>
      </div>

      {cvData.experience.map((exp) => (
        <div key={exp.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
              <input
                type="text"
                value={exp.title}
                onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ focusRingColor: '#005994' }}
                placeholder="Senior Staff Nurse"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ focusRingColor: '#005994' }}
                placeholder="Royal Manchester Hospital"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
            <input
              type="text"
              value={exp.duration}
              onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ focusRingColor: '#005994' }}
              placeholder="Jan 2020 - Present"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={exp.description}
              onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ focusRingColor: '#005994' }}
              placeholder="• Provided high-quality patient care to 20+ patients daily
• Led medication administration training for 5 junior nurses
• Collaborated with multidisciplinary teams to improve patient outcomes"
            />
          </div>

          <button
            onClick={() => removeExperience(exp.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Remove Experience
          </button>
        </div>
      ))}

      {cvData.experience.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No work experience added yet.</p>
          <p className="text-sm">Click "Add Experience" to get started.</p>
        </div>
      )}
    </div>
  );

  const renderEducationSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Education</h3>
          <p className="text-sm text-gray-600">Add your educational background</p>
        </div>
        <button
          onClick={addEducation}
          className="px-4 py-2 text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: '#005994' }}
        >
          Add Education
        </button>
      </div>

      {cvData.education.map((edu) => (
        <div key={edu.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ focusRingColor: '#005994' }}
                placeholder="BSc Nursing (Adult)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ focusRingColor: '#005994' }}
                placeholder="University of Manchester Faculty of Health"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <input
              type="text"
              value={edu.year}
              onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ focusRingColor: '#005994' }}
              placeholder="2020"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details</label>
            <textarea
              value={edu.details}
              onChange={(e) => updateEducation(edu.id, 'details', e.target.value)}
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ focusRingColor: '#005994' }}
              placeholder="First Class Honours, Relevant Modules: Adult Health, Mental Health, Pharmacology..."
            />
          </div>

          <button
            onClick={() => removeEducation(edu.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Remove Education
          </button>
        </div>
      ))}

      {cvData.education.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No education added yet.</p>
          <p className="text-sm">Click "Add Education" to get started.</p>
        </div>
      )}
    </div>
  );

  const renderSkillsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Skills</h3>
          <p className="text-sm text-gray-600">Add your technical and soft skills</p>
        </div>
        <button
          onClick={addSkill}
          className="px-4 py-2 text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: '#005994' }}
        >
          Add Skill
        </button>
      </div>

      {cvData.skills.map((skill) => (
        <div key={skill.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skill</label>
              <input
                type="text"
                value={skill.name}
                onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ focusRingColor: '#005994' }}
                placeholder="Patient Care, Medication Administration, Clinical Assessment..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <select
                value={skill.level}
                onChange={(e) => updateSkill(skill.id, 'level', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ focusRingColor: '#005994' }}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => removeSkill(skill.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Remove Skill
          </button>
        </div>
      ))}

      {cvData.skills.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No skills added yet.</p>
          <p className="text-sm">Click "Add Skill" to get started.</p>
        </div>
      )}
    </div>
  );

  const renderAchievementsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Achievements</h3>
          <p className="text-sm text-gray-600">Highlight your key accomplishments</p>
        </div>
        <button
          onClick={addAchievement}
          className="px-4 py-2 text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: '#005994' }}
        >
          Add Achievement
        </button>
      </div>

      {cvData.achievements.map((achievement) => (
        <div key={achievement.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Achievement Title</label>
            <input
              type="text"
              value={achievement.title}
              onChange={(e) => updateAchievement(achievement.id, 'title', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ focusRingColor: '#005994' }}
              placeholder="Improved patient satisfaction scores by 25% in stroke unit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={achievement.description}
              onChange={(e) => updateAchievement(achievement.id, 'description', e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ focusRingColor: '#005994' }}
              placeholder="Detailed description of the achievement, including context, actions taken, and measurable results..."
            />
          </div>

          <button
            onClick={() => removeAchievement(achievement.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Remove Achievement
          </button>
        </div>
      ))}

      {cvData.achievements.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No achievements added yet.</p>
          <p className="text-sm">Click "Add Achievement" to get started.</p>
        </div>
      )}
    </div>
  );

  const renderCustomizationSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Header Background</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={cvData.colors.headerBackground}
              onChange={(e) => updateColors('headerBackground', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={cvData.colors.headerBackground}
              onChange={(e) => updateColors('headerBackground', e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
              placeholder="#005994"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Header Text</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={cvData.colors.headerText}
              onChange={(e) => updateColors('headerText', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={cvData.colors.headerText}
              onChange={(e) => updateColors('headerText', e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
              placeholder="#FFFFFF"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Section Titles</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={cvData.colors.sectionTitles}
              onChange={(e) => updateColors('sectionTitles', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={cvData.colors.sectionTitles}
              onChange={(e) => updateColors('sectionTitles', e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
              placeholder="#005994"
            />
          </div>
        </div>
      </div>
      
      {/* Color Preview */}
      <div className="mt-4 p-4 border rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
        <div 
          className="p-4 rounded-lg text-center"
          style={{ 
            backgroundColor: cvData.colors.headerBackground,
            color: cvData.colors.headerText 
          }}
        >
          <div className="font-bold text-lg">{cvData.personal.name || 'Your Name'}</div>
          <div className="text-sm opacity-90">Header Preview</div>
        </div>
        <div className="mt-2">
          <div 
            className="font-bold text-sm border-b-2 pb-1"
            style={{ 
              color: cvData.colors.sectionTitles,
              borderColor: cvData.colors.sectionTitles 
            }}
          >
            SECTION TITLE PREVIEW
          </div>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 0:
        return renderPersonalSection();
      case 1:
        return renderExperienceSection();
      case 2:
        return renderEducationSection();
      case 3:
        return renderSkillsSection();
      case 4:
        return renderAchievementsSection();
      case 5:
        return renderCustomizationSection();
      default:
        return renderPersonalSection();
    }
  };

  const nextSection = () => {
    if (activeSection < sections.length - 1) {
      setActiveSection(activeSection + 1);
    }
  };

  const prevSection = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
    }
  };

  const goToSection = (index) => {
    setActiveSection(index);
  };

  return (
    <div className="min-h-screen bg-transparent" style={{ fontFamily: 'Figtree, system-ui, -apple-system, sans-serif' }}>
      {renderNotifications()}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          <div className="lg:col-span-4">
            {/* Progress Navigation */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4 flex-wrap gap-2">
                  {sections.map((section, index) => {
                    const Icon = section.icon;
                    const isActive = index === activeSection;
                    const isCompleted = index < activeSection;
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => goToSection(index)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                          isActive 
                            ? 'text-white' 
                            : isCompleted 
                              ? 'text-gray-700 hover:bg-gray-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        style={isActive ? { backgroundColor: '#005994' } : isCompleted ? { backgroundColor: '#BFD12F' } : {}}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline text-sm">{section.label}</span>
                      </button>
                    );
                  })}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevSection}
                    disabled={activeSection === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={nextSection}
                    disabled={activeSection === sections.length - 1}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#005994' }}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((activeSection + 1) / sections.length) * 100}%`,
                    backgroundColor: '#005994'
                  }}
                />
              </div>
            </div>

            {/* Main Content Area with Side-by-Side Layout */}
            <div className="flex gap-8 min-h-screen">
              {/* Left Column - Main Content Card */}
              <div className="w-2/3">
                <div className="bg-white rounded-lg shadow-sm border p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {sections[activeSection].title}
                    </h2>
                    <div className="text-sm text-gray-500">
                      Step {activeSection + 1} of {sections.length}
                    </div>
                  </div>
                  
                  {renderSection()}
                </div>
              </div>

              {/* Right Column - AI Suggestions */}
              <div className="w-1/3 space-y-4">
                <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8 flex flex-col max-h-[70vh]">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 flex-shrink-0">
                    <Sparkles className="w-5 h-5" style={{ color: '#682E57' }} />
                    AI Suggestions
                  </h2>
                  
                  <div className="flex-1 overflow-y-auto mb-4 min-h-0">
                    {suggestions ? (
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                          {suggestions}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">
                        <p className="mb-3">Get personalised AI suggestions to improve your CV.</p>
                        <p className="text-xs mb-2">Make sure to:</p>
                        <ul className="text-xs space-y-1 mb-4">
                          <li>• Specify your target role</li>
                          <li>• Fill in your basic information</li>
                          <li>• Add at least one experience</li>
                          <li>• Click "Get AI Suggestions"</li>
                        </ul>
                        <div className="rounded-lg p-3" style={{ backgroundColor: '#E6F3FF' }}>
                          <p className="text-xs" style={{ color: '#003D6B' }}>
                            💡 AI suggestions update based on your current section and overall CV content.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                
                  {/* Action Buttons - Always visible at bottom */}
                  <div className="space-y-3 flex-shrink-0">
                    <button
                      onClick={generateAISuggestions}
                      disabled={isGenerating}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: '#682E57' }}
                    >
                      <Sparkles className="w-5 h-5" />
                      {isGenerating ? 'Generating...' : 'Get AI Suggestions'}
                    </button>
                    <button
                      onClick={generatePDF}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90"
                      style={{ backgroundColor: '#BFD12F' }}
                    >
                      <Download className="w-5 h-5" />
                      Download CV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVBuilderApp;
