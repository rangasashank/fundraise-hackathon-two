export interface Meeting {
  id: string
  title: string
  date: Date
  time: string
  attendees: string[]
  description?: string
  hasTranscript: boolean
  transcript?: string
  notes?: string
}

export const mockMeetings: Meeting[] = [
  {
    id: "1",
    title: "Q1 Planning Session",
    date: new Date(),
    time: "9:00 AM - 10:30 AM",
    attendees: ["Sarah Chen", "Michael Rodriguez", "Emily Watson", "David Kim"],
    description: "Quarterly planning session to discuss goals, priorities, and resource allocation for Q1.",
    hasTranscript: true,
    transcript: `Sarah Chen: Good morning everyone. Let's start with our Q1 planning. I'd like to begin by reviewing our key objectives for the quarter.

Michael Rodriguez: Thanks Sarah. I think our main focus should be on launching the new product feature by end of February. We've been working on this for months and it's critical we hit that deadline.

Emily Watson: Agreed. From a marketing perspective, we need at least two weeks lead time before launch to prepare our campaigns. So we're looking at a February 15th code freeze at the latest.

David Kim: That's tight but doable. My team can commit to that timeline if we prioritize this over the smaller feature requests. We'll need to defer some of the nice-to-have items to Q2.

Sarah Chen: Okay, so we're aligned on the February 15th code freeze and end of month launch. Emily, can you prepare a detailed marketing timeline by next week?

Emily Watson: Absolutely. I'll have that ready by Wednesday.

Michael Rodriguez: We should also discuss the budget allocation. I'm proposing we increase our infrastructure spend by 20% to handle the expected user growth.

David Kim: That makes sense. We've been seeing performance issues during peak times. The additional capacity will be necessary.

Sarah Chen: I'll review the budget proposal and get back to you by Friday. Let's also schedule a weekly check-in every Monday at 10 AM to track our progress.

Emily Watson: Sounds good. I'll send out calendar invites.

Michael Rodriguez: One more thing - we need to finalize the pricing strategy. Can we schedule a separate meeting for that?

Sarah Chen: Yes, let's do that next Tuesday at 2 PM. I'll invite the finance team as well.`,
    notes: `Key Decisions:
- Product launch target: End of February
- Code freeze: February 15th
- Marketing timeline due: Next Wednesday
- Weekly check-ins: Mondays at 10 AM
- Budget review: Due Friday
- Pricing strategy meeting: Next Tuesday at 2 PM

Action Items:
- Prepare marketing timeline (Emily - Due Wednesday)
- Review budget proposal (Sarah - Due Friday)
- Schedule weekly check-ins (Emily - This week)
- Schedule pricing strategy meeting (Sarah - Next Tuesday)`,
  },
  {
    id: "2",
    title: "Design Review",
    date: new Date(),
    time: "2:00 PM - 3:00 PM",
    attendees: ["Alex Thompson", "Jessica Lee", "Ryan Martinez"],
    description: "Review of new dashboard designs and user interface updates.",
    hasTranscript: true,
    transcript: `Alex Thompson: Thanks for joining. Let's review the new dashboard designs. Jessica, can you walk us through the changes?

Jessica Lee: Sure. We've simplified the navigation and made the key metrics more prominent. The new design reduces clicks by 40% for common tasks.

Ryan Martinez: I like the direction. The color scheme is much cleaner. One concern - the mobile view seems cramped. Can we adjust the spacing?

Jessica Lee: Good catch. I'll increase the padding on mobile and reduce the font size slightly for better readability.

Alex Thompson: What about accessibility? Have we tested with screen readers?

Jessica Lee: Yes, we've done initial testing. All interactive elements have proper ARIA labels. We should do a full audit before launch though.

Ryan Martinez: I can coordinate with the QA team for comprehensive accessibility testing. Let's aim to complete that by next Friday.

Alex Thompson: Perfect. Jessica, can you have the mobile adjustments ready by Thursday so we can review again?

Jessica Lee: Absolutely. I'll also prepare some alternative color schemes for the data visualizations to improve contrast.`,
    notes: `Action Items:
- Adjust mobile spacing and fonts (Jessica - Due Thursday)
- Coordinate accessibility testing with QA (Ryan - Due next Friday)
- Prepare alternative color schemes (Jessica - Due Thursday)
- Schedule follow-up review (Alex - This week)`,
  },
  {
    id: "3",
    title: "Sprint Retrospective",
    date: new Date(Date.now() + 86400000),
    time: "10:00 AM - 11:00 AM",
    attendees: ["Chris Anderson", "Maria Garcia", "Tom Wilson", "Lisa Brown"],
    description: "Retrospective meeting to discuss what went well and areas for improvement.",
    hasTranscript: false,
  },
  {
    id: "4",
    title: "Client Presentation",
    date: new Date(Date.now() + 86400000),
    time: "3:00 PM - 4:30 PM",
    attendees: ["Jennifer Taylor", "Mark Johnson", "Amanda White"],
    description: "Quarterly business review presentation for key client.",
    hasTranscript: false,
  },
  {
    id: "5",
    title: "Team Standup",
    date: new Date(Date.now() + 172800000),
    time: "9:30 AM - 10:00 AM",
    attendees: ["Kevin Park", "Rachel Green", "Steven Clark", "Nicole Adams"],
    description: "Daily standup to sync on progress and blockers.",
    hasTranscript: false,
  },
]

export const pastMeetings: Meeting[] = [
  {
    id: "past-1",
    title: "Product Roadmap Review",
    date: new Date(Date.now() - 86400000 * 2),
    time: "11:00 AM - 12:00 PM",
    attendees: ["Sarah Chen", "Michael Rodriguez", "Tom Wilson"],
    description: "Review of product roadmap and upcoming feature priorities.",
    hasTranscript: true,
    transcript: `Sarah Chen: Let's review our product roadmap for the next quarter. Michael, can you walk us through the priorities?

Michael Rodriguez: Sure. We have three major initiatives: the mobile app redesign, API v2 launch, and the analytics dashboard. I think we should prioritize the API launch first.

Tom Wilson: I agree. Many of our enterprise clients have been asking for the new API features. It's becoming a blocker for some deals.

Sarah Chen: Okay, let's make API v2 our top priority. What's the timeline looking like?

Michael Rodriguez: If we start next week, we can have a beta ready in 6 weeks and production release in 10 weeks.

Tom Wilson: That works. I'll coordinate with the sales team to identify beta testers from our enterprise clients.

Sarah Chen: Perfect. Let's schedule weekly syncs to track progress.`,
    notes: `Decisions:
- API v2 is top priority
- Beta in 6 weeks, production in 10 weeks
- Tom to coordinate beta testers
- Weekly syncs scheduled

Action Items:
- Start API v2 development (Michael - Next week)
- Identify beta testers (Tom - This week)
- Schedule weekly syncs (Sarah - This week)`,
  },
  {
    id: "past-2",
    title: "Marketing Campaign Debrief",
    date: new Date(Date.now() - 86400000 * 3),
    time: "2:00 PM - 3:00 PM",
    attendees: ["Emily Watson", "Jessica Lee", "Amanda White"],
    description: "Debrief on recent marketing campaign performance.",
    hasTranscript: true,
    transcript: `Emily Watson: Thanks for joining. Let's review the performance of our recent campaign. Overall, we exceeded our targets by 25%.

Jessica Lee: That's fantastic! The new creative assets really resonated with our audience. Click-through rates were up 40%.

Amanda White: The email sequence performed particularly well. We saw a 15% conversion rate, which is double our usual.

Emily Watson: What do you think made the difference?

Jessica Lee: I think the personalization and the focus on customer pain points really helped. We also timed it well with the product launch.

Amanda White: Should we replicate this approach for the next campaign?

Emily Watson: Absolutely. Let's document what worked and create a playbook for future campaigns.`,
    notes: `Results:
- Exceeded targets by 25%
- CTR up 40%
- Email conversion rate: 15%
- Create playbook for future campaigns

Action Items:
- Document successful strategies (Emily - This week)
- Create campaign playbook (Jessica - Next week)
- Plan next campaign using new approach (Amanda - Next week)`,
  },
  {
    id: "past-3",
    title: "Engineering All-Hands",
    date: new Date(Date.now() - 86400000 * 5),
    time: "10:00 AM - 11:00 AM",
    attendees: ["David Kim", "Chris Anderson", "Ryan Martinez", "Kevin Park", "Rachel Green"],
    description: "Monthly engineering all-hands meeting.",
    hasTranscript: false,
  },
  {
    id: "past-4",
    title: "Customer Success Review",
    date: new Date(Date.now() - 86400000 * 7),
    time: "1:00 PM - 2:00 PM",
    attendees: ["Jennifer Taylor", "Lisa Brown", "Nicole Adams"],
    description: "Review of customer success metrics and support tickets.",
    hasTranscript: true,
    transcript: `Jennifer Taylor: Let's review our customer success metrics for last month. Overall satisfaction score is at 4.6 out of 5.

Lisa Brown: That's great! We've been focusing on faster response times and it's paying off. Average response time is down to 2 hours.

Nicole Adams: The new knowledge base has also helped. We're seeing 30% fewer repeat questions.

Jennifer Taylor: Excellent work. Any areas of concern?

Lisa Brown: We're still getting complaints about the onboarding process. It's too complex for some users.

Nicole Adams: I agree. We should create more video tutorials and simplify the initial setup.

Jennifer Taylor: Good idea. Let's prioritize that for next month.`,
    notes: `Metrics:
- Satisfaction: 4.6/5
- Response time: 2 hours
- Repeat questions down 30%

Action Items:
- Improve onboarding with video tutorials (Lisa - Next month)
- Simplify initial setup process (Nicole - Next month)`,
  },
]
