/**
 * Seed Script: Nonprofit Meeting Data Generator
 * 
 * Generates 40-60 realistic meeting records for a nonprofit organization
 * spanning 2 years with recurring operational challenges.
 * 
 * Usage: node seed-nonprofit-meetings.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fundraise-hackathon';

// Helper: Generate random Nylas notetaker ID
function generateNotetakerId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'grant_';
  for (let i = 0; i < 20; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Helper: Generate meeting link
function generateMeetingLink() {
  const providers = [
    () => `https://zoom.us/j/${Math.floor(Math.random() * 900000000) + 100000000}`,
    () => `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}`,
  ];
  return providers[Math.floor(Math.random() * providers.length)]();
}

// Helper: Generate date (bi-weekly over 2 years)
function generateMeetingDates(count) {
  const dates = [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 2);
  
  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (i * 14)); // Bi-weekly
    date.setHours(10 + Math.floor(Math.random() * 6), 0, 0, 0); // 10 AM - 4 PM
    dates.push(date);
  }
  
  return dates;
}

// Helper: Random selection
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper: Random sample
function randomSample(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper: Generate realistic meeting title based on theme and date
function generateMeetingTitle(theme, meetingDate, meetingIndex) {
  const month = meetingDate.toLocaleString('en-US', { month: 'long' });
  const year = meetingDate.getFullYear();

  // Meeting title templates by theme
  const titleTemplates = {
    funding: [
      'Development & Fundraising Strategy Meeting',
      'Grant Planning Session',
      'Donor Relations Review',
      'Partnership Development Discussion',
      `${month} Funding Review`,
      'Revenue Strategy Meeting',
      'Sustainability Planning Session',
    ],
    volunteers: [
      'Volunteer Coordination Meeting',
      'Volunteer Program Review',
      'Training & Development Session',
      'Volunteer Engagement Strategy',
      `${month} Volunteer Check-in`,
      'Volunteer Operations Meeting',
      'Volunteer Retention Discussion',
    ],
    technology: [
      'Technology & Infrastructure Meeting',
      'Digital Platform Review',
      'Tech Operations Discussion',
      'Systems & Tools Planning',
      `${month} Technology Update`,
      'Digital Strategy Session',
      'Platform Performance Review',
    ],
    outreach: [
      'Community Outreach Meeting',
      'Program Engagement Review',
      'Community Relations Discussion',
      'Outreach Strategy Session',
      `${month} Community Update`,
      'Parent & Community Engagement Meeting',
      'Accessibility Planning Session',
    ],
  };

  // General meeting titles (used occasionally)
  const generalTitles = [
    'Operations Team Sync',
    `${month} ${year} Team Meeting`,
    'Quarterly Planning Session',
    'All-Hands Operations Meeting',
    'Program Review & Planning',
    'Strategic Planning Discussion',
  ];

  // Use theme-specific title 80% of the time, general title 20% of the time
  if (Math.random() < 0.8 && titleTemplates[theme]) {
    return randomChoice(titleTemplates[theme]);
  } else {
    return randomChoice(generalTitles);
  }
}

// Nonprofit staff members
const staffMembers = [
  { name: 'Sarah Chen', role: 'Program Director' },
  { name: 'Mike Rodriguez', role: 'Volunteer Coordinator' },
  { name: 'Alex Thompson', role: 'Tech Lead' },
  { name: 'Priya Patel', role: 'Community Outreach Manager' },
  { name: 'James Wilson', role: 'Grant Writer' },
  { name: 'Maria Garcia', role: 'Operations Manager' },
  { name: 'David Kim', role: 'Education Specialist' },
  { name: 'Lisa Anderson', role: 'Development Director' },
];

// Recurring issues database
const recurringIssues = {
  funding: [
    {
      id: 'grant_rejection_education_board',
      title: 'Education Board Grant Rejections',
      occurrences: [
        { severity: 'new', detail: 'Initial rejection received, unclear feedback' },
        { severity: 'escalating', detail: 'Second rejection, volunteer metrics cited as weak' },
        { severity: 'critical', detail: 'Third rejection, need to revamp entire approach' },
        { severity: 'addressing', detail: 'Working on improved metrics and reapplication strategy' },
      ]
    },
    {
      id: 'donor_retention_decline',
      title: 'Declining Donor Retention Rates',
      occurrences: [
        { severity: 'new', detail: '15% drop in recurring donors this quarter' },
        { severity: 'escalating', detail: 'Donor survey shows lack of impact visibility' },
        { severity: 'addressing', detail: 'Implementing monthly impact reports for donors' },
      ]
    },
    {
      id: 'corporate_partnership_challenges',
      title: 'Corporate Partnership Development Struggles',
      occurrences: [
        { severity: 'new', detail: 'Three potential corporate partners went silent' },
        { severity: 'escalating', detail: 'Partners want more measurable outcomes data' },
        { severity: 'addressing', detail: 'Creating partnership impact dashboard' },
      ]
    },
  ],
  volunteers: [
    {
      id: 'workshop_attendance_low',
      title: 'Low Volunteer Workshop Attendance',
      occurrences: [
        { severity: 'new', detail: 'Only 12 volunteers attended last workshop, expected 30' },
        { severity: 'escalating', detail: 'Attendance dropped to 8, volunteers cite scheduling conflicts' },
        { severity: 'critical', detail: 'Had to cancel workshop due to only 5 sign-ups' },
        { severity: 'addressing', detail: 'Testing evening and weekend workshop times' },
        { severity: 'improving', detail: 'New schedule showing 20% improvement in attendance' },
      ]
    },
    {
      id: 'volunteer_burnout',
      title: 'Volunteer Burnout and Turnover',
      occurrences: [
        { severity: 'new', detail: 'Three long-term volunteers stepped back this month' },
        { severity: 'escalating', detail: 'Exit surveys mention feeling overwhelmed and unsupported' },
        { severity: 'addressing', detail: 'Implementing volunteer appreciation program and workload limits' },
      ]
    },
    {
      id: 'training_gaps',
      title: 'Volunteer Training Program Gaps',
      occurrences: [
        { severity: 'new', detail: 'Volunteers report feeling unprepared for community interactions' },
        { severity: 'escalating', detail: 'Two incidents where volunteers gave incorrect information' },
        { severity: 'addressing', detail: 'Developing comprehensive training modules with role-play scenarios' },
      ]
    },
  ],
  technology: [
    {
      id: 'mobile_app_performance',
      title: 'Mobile App Performance on Low-Bandwidth',
      occurrences: [
        { severity: 'new', detail: 'Volunteers complaining app is slow on mobile data' },
        { severity: 'escalating', detail: 'Video training materials won\'t load for users with poor connectivity' },
        { severity: 'critical', detail: 'App crashes reported by 40% of mobile users' },
        { severity: 'addressing', detail: 'Optimizing assets and implementing progressive loading' },
      ]
    },
    {
      id: 'digital_divide_beneficiaries',
      title: 'Digital Divide Affecting Beneficiaries',
      occurrences: [
        { severity: 'new', detail: 'Many families lack devices to access online resources' },
        { severity: 'escalating', detail: 'Program participation down 30% due to tech barriers' },
        { severity: 'addressing', detail: 'Exploring device lending program and offline alternatives' },
      ]
    },
    {
      id: 'platform_reliability',
      title: 'Learning Platform Reliability Issues',
      occurrences: [
        { severity: 'new', detail: 'Platform went down during peak usage hours' },
        { severity: 'escalating', detail: 'Third outage this month, users losing trust' },
        { severity: 'addressing', detail: 'Migrating to more reliable hosting provider' },
      ]
    },
  ],
  outreach: [
    {
      id: 'offline_materials_requests',
      title: 'Parents Requesting Offline Learning Materials',
      occurrences: [
        { severity: 'new', detail: 'Five parents asked for printed materials at community event' },
        { severity: 'escalating', detail: 'Survey shows 60% of families prefer offline options' },
        { severity: 'critical', detail: 'Losing participants who can\'t access digital content' },
        { severity: 'addressing', detail: 'Creating print-friendly versions and distribution plan' },
        { severity: 'improving', detail: 'Pilot offline materials program launched in two communities' },
      ]
    },
    {
      id: 'language_barriers',
      title: 'Language and Cultural Barriers in Outreach',
      occurrences: [
        { severity: 'new', detail: 'Spanish-speaking families report difficulty understanding materials' },
        { severity: 'escalating', detail: 'Missing out on entire immigrant communities due to language gap' },
        { severity: 'addressing', detail: 'Hiring bilingual staff and translating key materials' },
      ]
    },
    {
      id: 'parent_engagement_low',
      title: 'Low Parent Engagement in Programs',
      occurrences: [
        { severity: 'new', detail: 'Parent attendance at orientation sessions only 30%' },
        { severity: 'escalating', detail: 'Parents cite work schedules and lack of childcare as barriers' },
        { severity: 'addressing', detail: 'Offering flexible meeting times and providing childcare' },
      ]
    },
  ],
};

// Get random issues for a meeting
function selectIssuesForMeeting(meetingIndex, totalMeetings) {
  const themes = Object.keys(recurringIssues);
  const selectedTheme = randomChoice(themes);
  const themeIssues = recurringIssues[selectedTheme];
  
  // Select 1-2 issues from the theme
  const numIssues = Math.random() < 0.6 ? 1 : 2;
  const issues = randomSample(themeIssues, numIssues);
  
  // Determine which occurrence to use based on meeting progression
  const progressRatio = meetingIndex / totalMeetings;
  
  return issues.map(issue => {
    const occurrenceIndex = Math.min(
      Math.floor(progressRatio * issue.occurrences.length + Math.random() * 2),
      issue.occurrences.length - 1
    );
    return {
      ...issue,
      currentOccurrence: issue.occurrences[occurrenceIndex],
      theme: selectedTheme
    };
  });
}

// Generate realistic meeting transcript
function generateTranscript(meetingIndex, totalMeetings, attendees, issues) {
  const speakers = randomSample(attendees, Math.min(4, attendees.length));
  const lead = speakers[0];
  const others = speakers.slice(1);
  
  let transcript = `${lead.role} ${lead.name}: Good morning everyone. Thank you for joining today's operations meeting. `;
  
  // Introduce first issue
  const issue1 = issues[0];
  transcript += `I wanted to start by discussing ${issue1.title.toLowerCase()}. ${issue1.currentOccurrence.detail}.\n\n`;
  
  // Other speakers respond
  if (others.length > 0) {
    const responder1 = others[0];
    transcript += `${responder1.role} ${responder1.name}: `;
    
    if (issue1.currentOccurrence.severity === 'new') {
      transcript += `This is concerning. When did we first notice this issue? `;
    } else if (issue1.currentOccurrence.severity === 'escalating') {
      transcript += `Yes, this has been ongoing for a while now. We really need to address this before it gets worse. `;
    } else if (issue1.currentOccurrence.severity === 'critical') {
      transcript += `This is becoming critical. We can't continue operating like this. `;
    } else {
      transcript += `I'm glad we're taking action on this. `;
    }
    
    transcript += `What are our options?\n\n`;
  }
  
  // Lead discusses solutions or next steps
  transcript += `${lead.name}: `;
  if (issue1.currentOccurrence.severity === 'addressing' || issue1.currentOccurrence.severity === 'improving') {
    transcript += `We've started implementing some solutions. `;
  } else {
    transcript += `We need to develop an action plan. `;
  }
  transcript += `Let me outline what I think we should do.\n\n`;
  
  // Introduce second issue if exists
  if (issues.length > 1) {
    const issue2 = issues[1];
    const responder2 = others[Math.min(1, others.length - 1)];
    
    transcript += `${responder2.role} ${responder2.name}: Before we move on, I wanted to bring up ${issue2.title.toLowerCase()}. ${issue2.currentOccurrence.detail}.\n\n`;
    
    transcript += `${lead.name}: That's a good point. These issues are actually related. `;
    
    if (issue1.theme === issue2.theme) {
      transcript += `They both stem from similar root causes. `;
    } else {
      transcript += `We need to consider how they impact each other. `;
    }
    transcript += `\n\n`;
  }
  
  // Discussion and action items
  if (others.length > 1) {
    const responder3 = others[others.length - 1];
    transcript += `${responder3.role} ${responder3.name}: I can take the lead on researching solutions. I'll have a proposal ready by next week.\n\n`;
  }
  
  transcript += `${lead.name}: Excellent. Let's make sure we document our action items clearly. `;
  
  // Add some operational details
  const operationalDetails = [
    `We also need to update our stakeholders on the progress we're making.`,
    `I'll schedule follow-up meetings with the relevant teams.`,
    `Let's set up a working group to tackle this systematically.`,
    `We should track metrics to measure our improvement.`,
  ];
  transcript += randomChoice(operationalDetails) + `\n\n`;
  
  // Closing
  transcript += `${lead.name}: Thank you everyone for your input today. Let's reconvene in two weeks to review progress. `;
  
  if (others.length > 0) {
    transcript += `${others[0].name}, please send out the meeting notes and action items by end of day.\n\n`;
    transcript += `${others[0].name}: Will do. Thanks everyone.`;
  }
  
  return transcript;
}

// Generate summary
function generateSummary(issues, attendees) {
  let summary = `**Key Topics Discussed:**\n`;
  issues.forEach(issue => {
    summary += `- ${issue.title}: ${issue.currentOccurrence.detail}\n`;
  });
  
  summary += `\n**Decisions Made:**\n`;
  summary += `- Agreed to prioritize addressing ${issues[0].title.toLowerCase()}\n`;
  summary += `- Assigned team members to research and propose solutions\n`;
  
  if (issues[0].currentOccurrence.severity === 'addressing') {
    summary += `- Approved implementation plan for proposed solutions\n`;
  }
  
  summary += `\n**Important Points:**\n`;
  summary += `- ${issues[0].currentOccurrence.severity === 'critical' ? 'Urgent action required' : 'Continued monitoring needed'} for ${issues[0].title.toLowerCase()}\n`;
  summary += `- Team collaboration and communication emphasized\n`;
  
  if (issues.length > 1) {
    summary += `- Identified connection between ${issues[0].title.toLowerCase()} and ${issues[1].title.toLowerCase()}\n`;
  }
  
  summary += `\n**Next Steps:**\n`;
  summary += `- ${randomChoice(attendees).name} to prepare detailed proposal by next meeting\n`;
  summary += `- Schedule follow-up discussions with relevant stakeholders\n`;
  summary += `- Track progress metrics and report back in two weeks\n`;
  
  return summary;
}

// Generate action items with proper ISO date strings
function generateActionItems(issues, attendees, meetingDate) {
  const actionItems = [];

  // Helper to generate actual dates relative to meeting date
  const getActualDueDate = (daysFromMeeting) => {
    const date = new Date(meetingDate);
    date.setDate(date.getDate() + daysFromMeeting);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const dueDates = [
    getActualDueDate(7),   // 1 week from meeting
    getActualDueDate(14),  // 2 weeks from meeting
    getActualDueDate(21),  // 3 weeks from meeting
    getActualDueDate(30),  // 1 month from meeting
  ];

  // Action items based on issues
  issues.forEach((issue, idx) => {
    const assignee = randomChoice(attendees);

    if (issue.currentOccurrence.severity === 'new') {
      actionItems.push(`Research solutions for ${issue.title.toLowerCase()} (${assignee.name} - ${randomChoice(dueDates)})`);
    } else if (issue.currentOccurrence.severity === 'escalating') {
      actionItems.push(`Develop action plan to address ${issue.title.toLowerCase()} (${assignee.name} - ${randomChoice(dueDates)})`);
    } else if (issue.currentOccurrence.severity === 'critical') {
      actionItems.push(`Implement emergency measures for ${issue.title.toLowerCase()} (${assignee.name} - ${getActualDueDate(5)})`);
    } else {
      actionItems.push(`Monitor progress on ${issue.title.toLowerCase()} initiatives (${assignee.name} - ${randomChoice(dueDates)})`);
    }
  });

  // General action items
  const generalActions = [
    `Send meeting notes to all stakeholders (${randomChoice(attendees).name} - ${getActualDueDate(1)})`,
    `Schedule follow-up meeting with working group (${randomChoice(attendees).name} - ${randomChoice(dueDates)})`,
    `Update project tracking dashboard (${randomChoice(attendees).name} - ${randomChoice(dueDates)})`,
  ];

  actionItems.push(...randomSample(generalActions, Math.min(2, generalActions.length)));

  return actionItems;
}

// Main seeding function
async function seedMeetings() {
  try {
    console.log('🌱 Starting nonprofit meeting data seeding...\n');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Import models
    const NotetakerSession = require('./dist/models/NotetakerSession').default;
    const Transcript = require('./dist/models/Transcript').default;
    const Task = require('./dist/models/Task').default;

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await NotetakerSession.deleteMany({});
    await Transcript.deleteMany({});
    await Task.deleteMany({});
    console.log('✅ Cleared existing data\n');
    
    // Generate meeting count (40-60)
    const meetingCount = Math.floor(Math.random() * 21) + 40;
    console.log(`📅 Generating ${meetingCount} meetings over 2 years\n`);
    
    // Generate dates
    const meetingDates = generateMeetingDates(meetingCount);
    
    // Track recurring issues
    const issueTracker = {};
    
    // Generate meetings
    for (let i = 0; i < meetingCount; i++) {
      const meetingDate = meetingDates[i];
      const notetakerId = generateNotetakerId();
      const meetingLink = generateMeetingLink();
      
      // Select attendees (5-8 people)
      const attendeeCount = Math.floor(Math.random() * 4) + 5;
      const attendees = randomSample(staffMembers, attendeeCount);
      const attendeeNames = attendees.map(a => a.name);
      
      // Select issues for this meeting
      const issues = selectIssuesForMeeting(i, meetingCount);

      // Track issues
      issues.forEach(issue => {
        if (!issueTracker[issue.id]) {
          issueTracker[issue.id] = { count: 0, title: issue.title };
        }
        issueTracker[issue.id].count++;
      });

      // Get the theme from the first issue
      const meetingTheme = issues[0].theme;

      // Generate meeting title based on theme
      const meetingTitle = generateMeetingTitle(meetingTheme, meetingDate, i);

      // Generate transcript
      const transcriptText = generateTranscript(i, meetingCount, attendees, issues);
      const summaryText = generateSummary(issues, attendees);
      const actionItems = generateActionItems(issues, attendees, meetingDate);

      // Calculate duration (30-90 minutes)
      const duration = (Math.floor(Math.random() * 7) + 3) * 10;

      // Create NotetakerSession
      const session = await NotetakerSession.create({
        notetakerId,
        meetingLink,
        meetingProvider: meetingLink.includes('zoom') ? 'zoom' : 'google_meet',
        name: 'Nylas Notetaker',
        meetingTitle,
        state: 'completed',
        meetingState: 'meeting_ended',
        meetingSettings: {
          audioRecording: true,
          videoRecording: false,
          transcription: true,
          summary: false,
          actionItems: false,
        },
        createdAt: new Date(meetingDate.getTime() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(meetingDate.getTime() + duration * 60 * 1000 + 60000),
      });
      
      // Create Transcript
      const transcript = await Transcript.create({
        notetakerId,
        sessionId: session._id,
        transcriptText,
        summaryText,
        actionItems,
        duration,
        participants: attendeeNames,
        status: 'completed',
        createdAt: new Date(meetingDate.getTime() + duration * 60 * 1000),
        updatedAt: new Date(meetingDate.getTime() + duration * 60 * 1000 + 120000),
      });

      // Create Task documents from action items
      const tasksToInsert = actionItems.map((item, idx) => {
        const match = item.match(/^(.+?)\s*\(([^)]+?)(?:\s*-\s*([^)]+))?\)\s*$/);
        let title = item.trim();
        let assignee;
        let dueDate;
        if (match) {
          title = match[1].trim();
          assignee = match[2]?.trim();
          const dueStr = match[3]?.trim();
          if (dueStr) {
            const parsed = new Date(dueStr);
            if (!isNaN(parsed.getTime())) dueDate = parsed.toISOString();
          }
        }
        // Status distribution: some completed, some in-progress, some todo
        const status = idx % 5 === 0 ? 'completed' : idx % 3 === 0 ? 'in-progress' : 'todo';
        const completedAt = status === 'completed' ? new Date(meetingDate.getTime() + (idx + 1) * 3600000) : undefined;
        return {
          title,
          description: `From ${meetingTitle}`,
          status,
          priority: idx === 0 ? 'high' : idx === 1 ? 'medium' : 'low',
          assignee,
          dueDate,
          meetingId: session._id,
          transcriptId: transcript._id,
          completedAt,
          createdAt: new Date(meetingDate.getTime() + duration * 60 * 1000),
          updatedAt: new Date(meetingDate.getTime() + duration * 60 * 1000 + 120000),
        };
      });
      if (tasksToInsert.length) {
        await Task.insertMany(tasksToInsert);
      }

      console.log(`✅ Created meeting ${i + 1}/${meetingCount} - ${meetingDate.toLocaleDateString()} (${issues.map(iss => iss.title).join(', ')})`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ SEEDING COMPLETED SUCCESSFULLY!\n');
    
    // Print summary
    console.log('📊 SUMMARY:');
    console.log(`   Total Meetings: ${meetingCount}`);
    console.log(`   Date Range: ${meetingDates[0].toLocaleDateString()} - ${meetingDates[meetingDates.length - 1].toLocaleDateString()}`);
    console.log(`   Unique Recurring Issues: ${Object.keys(issueTracker).length}\n`);
    
    console.log('🔄 RECURRING ISSUES DETECTED:');
    Object.entries(issueTracker)
      .sort((a, b) => b[1].count - a[1].count)
      .forEach(([id, data]) => {
        console.log(`   - ${data.title}: ${data.count} occurrences`);
      });
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n📦 Disconnected from MongoDB');
  }
}

// Run the seeding
seedMeetings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

