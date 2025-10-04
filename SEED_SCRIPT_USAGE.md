# Nonprofit Meeting Seed Script - Usage Guide

## Quick Start

```bash
cd backend
npm run build  # Compile TypeScript models
node seed-nonprofit-meetings.js
```

## What This Script Does

Generates **40-60 realistic nonprofit meeting records** spanning 2 years with:
- ✅ NotetakerSession documents (meeting metadata)
- ✅ Transcript documents (meeting content with AI-generated summaries)
- ✅ 8-10 recurring issues appearing across multiple meetings
- ✅ Realistic dialogue with nonprofit staff roles
- ✅ Action items in proper format
- ✅ Bi-weekly meeting schedule

## Data Generated

### Meeting Themes (25% each)

1. **Funding & Sustainability**
   - Grant application rejections
   - Donor retention issues
   - Partnership development challenges

2. **Volunteer & Staffing**
   - Workshop attendance problems
   - Volunteer burnout
   - Training program gaps

3. **Technology & Access**
   - Mobile app performance issues
   - Digital divide challenges
   - Platform reliability problems

4. **Community Outreach**
   - Offline materials requests
   - Language barriers
   - Parent engagement issues

### Recurring Issues Examples

- **Education Board Grant Rejections** - Appears 4 times, escalating from initial rejection to strategy revision
- **Low Volunteer Workshop Attendance** - Appears 5 times, showing progression from problem identification to solution testing
- **Mobile App Performance on Low-Bandwidth** - Appears 4 times, evolving from complaints to optimization efforts
- **Parents Requesting Offline Materials** - Appears 5 times, from initial requests to pilot program launch

## Sample Output

```
🌱 Starting nonprofit meeting data seeding...
============================================================
📦 Connecting to MongoDB...
✅ Connected to MongoDB

🗑️  Clearing existing data...
✅ Cleared existing data

📅 Generating 47 meetings over 2 years

✅ Created meeting 1/47 - 1/4/2023 (Education Board Grant Rejections)
✅ Created meeting 2/47 - 1/18/2023 (Low Volunteer Workshop Attendance)
✅ Created meeting 3/47 - 2/1/2023 (Mobile App Performance on Low-Bandwidth)
...
✅ Created meeting 47/47 - 12/27/2024 (Parent Engagement in Programs)

============================================================
✅ SEEDING COMPLETED SUCCESSFULLY!

📊 SUMMARY:
   Total Meetings: 47
   Date Range: 1/4/2023 - 12/27/2024
   Unique Recurring Issues: 10

🔄 RECURRING ISSUES DETECTED:
   - Low Volunteer Workshop Attendance: 8 occurrences
   - Parents Requesting Offline Learning Materials: 7 occurrences
   - Mobile App Performance on Low-Bandwidth: 6 occurrences
   - Education Board Grant Rejections: 5 occurrences
   - Volunteer Burnout and Turnover: 5 occurrences
   - Language and Cultural Barriers in Outreach: 4 occurrences
   - Digital Divide Affecting Beneficiaries: 4 occurrences
   - Declining Donor Retention Rates: 3 occurrences
   - Volunteer Training Program Gaps: 3 occurrences
   - Learning Platform Reliability Issues: 2 occurrences

============================================================
```

## Verify Data in MongoDB

```bash
# Connect to MongoDB
mongosh fundraise-hackathon

# Count documents
db.notetakersessions.countDocuments()
db.transcripts.countDocuments()

# View sample meeting
db.notetakersessions.findOne()
db.transcripts.findOne()

# Check date range
db.notetakersessions.aggregate([
  {
    $group: {
      _id: null,
      minDate: { $min: "$joinedAt" },
      maxDate: { $max: "$joinedAt" }
    }
  }
])

# Find meetings with specific issue
db.transcripts.find({
  transcriptText: { $regex: "Education Board Grant", $options: "i" }
}).count()
```

## Sample Transcript Format

```
Program Director Sarah Chen: Good morning everyone. Thank you for joining today's operations meeting. I wanted to start by discussing education board grant rejections. Second rejection, volunteer metrics cited as weak.

Volunteer Coordinator Mike Rodriguez: Yes, this has been ongoing for a while now. We really need to address this before it gets worse. What are our options?

Program Director Sarah Chen: We need to develop an action plan. Let me outline what I think we should do.

Tech Lead Alex Thompson: Before we move on, I wanted to bring up mobile app performance on low-bandwidth. Video training materials won't load for users with poor connectivity.

Sarah Chen: That's a good point. These issues are actually related. We need to consider how they impact each other.

Alex Thompson: I can take the lead on researching solutions. I'll have a proposal ready by next week.

Sarah Chen: Excellent. Let's make sure we document our action items clearly. We should track metrics to measure our improvement.

Sarah Chen: Thank you everyone for your input today. Let's reconvene in two weeks to review progress. Mike Rodriguez, please send out the meeting notes and action items by end of day.

Mike Rodriguez: Will do. Thanks everyone.
```

## Sample Action Items

```json
[
  "Develop action plan to address education board grant rejections (James Wilson - Two weeks)",
  "Research solutions for mobile app performance on low-bandwidth (Alex Thompson - Next Friday)",
  "Send meeting notes to all stakeholders (Maria Garcia - End of day)",
  "Update project tracking dashboard (Priya Patel - End of next week)"
]
```

## Sample Summary

```
**Key Topics Discussed:**
- Education Board Grant Rejections: Second rejection, volunteer metrics cited as weak
- Mobile App Performance on Low-Bandwidth: Video training materials won't load for users with poor connectivity

**Decisions Made:**
- Agreed to prioritize addressing education board grant rejections
- Assigned team members to research and propose solutions

**Important Points:**
- Continued monitoring needed for education board grant rejections
- Team collaboration and communication emphasized
- Identified connection between education board grant rejections and mobile app performance on low-bandwidth

**Next Steps:**
- Alex Thompson to prepare detailed proposal by next meeting
- Schedule follow-up discussions with relevant stakeholders
- Track progress metrics and report back in two weeks
```

## Staff Members in Meetings

- **Sarah Chen** - Program Director
- **Mike Rodriguez** - Volunteer Coordinator
- **Alex Thompson** - Tech Lead
- **Priya Patel** - Community Outreach Manager
- **James Wilson** - Grant Writer
- **Maria Garcia** - Operations Manager
- **David Kim** - Education Specialist
- **Lisa Anderson** - Development Director

Each meeting includes 5-8 randomly selected staff members.

## Re-running the Script

The script clears all existing data before seeding, so you can run it multiple times:

```bash
node seed-nonprofit-meetings.js
```

Each run will generate a different set of meetings with randomized:
- Meeting count (40-60)
- Issue combinations
- Attendee selections
- Meeting times
- Transcript variations

## Next Steps

After seeding, you can:

1. **View meetings in frontend**: http://localhost:3000/meetings
2. **Test Cross-Meeting Insight Agent** (when implemented)
3. **Analyze recurring patterns** in MongoDB
4. **Test search and filtering** features

## Troubleshooting

**Error: "Cannot find module './dist/models/NotetakerSession'"**
```bash
cd backend
npm run build
```

**Error: "MONGODB_URI is not defined"**
```bash
# Add to backend/.env
MONGODB_URI=mongodb://localhost:27017/fundraise-hackathon
```

**Error: "MongoServerError: E11000 duplicate key error"**
```bash
# Clear database manually
mongosh fundraise-hackathon --eval "db.notetakersessions.deleteMany({}); db.transcripts.deleteMany({})"
```

## Data Characteristics

- **Temporal Distribution**: Bi-weekly meetings over 2 years (~24 months)
- **Issue Progression**: Issues evolve from "new" → "escalating" → "critical" → "addressing" → "improving"
- **Theme Balance**: Each theme (funding, volunteers, technology, outreach) appears in ~25% of meetings
- **Realistic Patterns**: Issues recur 2-5 times with different contexts and severity levels
- **Natural Language**: Transcripts use conversational dialogue with realistic nonprofit scenarios

