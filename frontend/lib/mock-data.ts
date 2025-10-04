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
    title: "Community Outreach Planning",
    date: new Date(),
    time: "9:00 AM - 10:30 AM",
    attendees: ["Sarah Chen", "Michael Rodriguez", "Emily Watson", "David Kim"],
    description: "Quarterly planning session to discuss community programs, volunteer recruitment, and resource allocation for Q1.",
    hasTranscript: true,
    transcript: `Sarah Chen: Good morning everyone. Let's start with our Q1 community outreach planning. We need to address our ongoing volunteer shortage and transportation challenges.

Michael Rodriguez: Thanks Sarah. Our biggest issue is volunteer recruitment. We're down 30% from last quarter and it's affecting our food distribution program. We desperately need more volunteers for weekend shifts.

Emily Watson: I agree. The volunteer retention is also concerning. We've had several long-term volunteers leave due to transportation issues getting to our warehouse location. Maybe we need to consider providing transportation assistance or finding volunteers closer to the site.

David Kim: The transportation logistics are definitely a problem. Our delivery van broke down twice last month, and we had to cancel three food deliveries to senior centers. We need budget allocation for vehicle maintenance and possibly a backup vehicle.

Sarah Chen: These are critical issues. Michael, can you prepare a volunteer recruitment strategy by next week? We need to focus on both attracting new volunteers and improving retention.

Emily Watson: I can help with outreach. We should leverage social media and partner with local colleges for student volunteers.

Michael Rodriguez: Good idea. We should also discuss volunteer training. Many new volunteers feel overwhelmed and quit after their first shift. Better training and mentorship could improve retention.

David Kim: For transportation, I propose we allocate emergency funding for van repairs and explore partnerships with local transportation services for volunteer shuttles.

Sarah Chen: Excellent points. Let's also address our funding situation. The grant application for the community kitchen was rejected, and we need alternative funding sources.

Emily Watson: I've been researching corporate sponsorship opportunities. Several local businesses have expressed interest in supporting our programs.

Michael Rodriguez: We should also consider a fundraising event. The annual gala was successful last year, but we need more volunteers to organize it.

Sarah Chen: Let's schedule weekly check-ins every Monday at 10 AM to track our progress on these issues.`,
    notes: `Key Issues Discussed:
- Volunteer shortage: Down 30% from last quarter
- Volunteer retention problems due to transportation barriers
- Vehicle maintenance issues affecting food delivery program
- Rejected grant application for community kitchen
- Need for improved volunteer training and mentorship

Action Items:
- Prepare volunteer recruitment strategy (Michael - Due next Wednesday)
- Research corporate sponsorship opportunities (Emily - Ongoing)
- Allocate emergency funding for van repairs (David - Due Friday)
- Schedule weekly progress check-ins (Sarah - This week)
- Explore volunteer transportation assistance options (Emily - Due next week)`,
  },
  {
    id: "2",
    title: "Emergency Response Team Meeting",
    date: new Date(),
    time: "2:00 PM - 3:00 PM",
    attendees: ["Alex Thompson", "Jessica Lee", "Ryan Martinez"],
    description: "Emergency meeting to address transportation crisis and volunteer coordination issues.",
    hasTranscript: true,
    transcript: `Alex Thompson: Thanks for joining on short notice. We have a transportation crisis that needs immediate attention. Our main delivery truck is out of service and we have 200 food boxes that need to be delivered to families today.

Jessica Lee: This is the third transportation issue this month. We really need to address our vehicle reliability problems. The constant breakdowns are affecting our ability to serve the community consistently.

Ryan Martinez: I've been in touch with local volunteer drivers, but we're short-staffed. Many of our regular volunteer drivers are unavailable today, and we don't have enough backup volunteers trained for delivery routes.

Jessica Lee: The volunteer shortage is becoming critical. We've lost several experienced volunteers recently, and our recruitment efforts aren't keeping pace with the demand for services.

Alex Thompson: What about our partnership with the local church? Can they provide transportation support?

Ryan Martinez: I reached out, but their van is also being repaired. However, they offered to help with volunteer recruitment for next week's food distribution.

Jessica Lee: We need a systematic approach to this. The transportation issues and volunteer shortages are interconnected. When we can't deliver reliably, volunteers get frustrated and leave.

Alex Thompson: You're right. Let's develop a comprehensive plan. We need backup transportation options and a stronger volunteer recruitment and retention strategy.

Ryan Martinez: I suggest we create an emergency transportation fund and establish partnerships with local delivery services for backup support.

Jessica Lee: And we should implement a volunteer mentorship program to improve retention. New volunteers need better support and training.

Alex Thompson: Excellent ideas. Let's also improve our communication with volunteers about schedule changes and transportation issues.`,
    notes: `Critical Issues:
- Main delivery truck out of service (third breakdown this month)
- 200 food boxes need emergency delivery today
- Severe volunteer shortage affecting delivery capacity
- Lost several experienced volunteers recently
- Transportation reliability issues causing volunteer frustration

Action Items:
- Coordinate emergency delivery with available volunteers (Ryan - Today)
- Establish emergency transportation fund (Alex - Due this week)
- Research partnerships with local delivery services (Jessica - Due Friday)
- Develop volunteer mentorship program proposal (Jessica - Due next week)
- Improve volunteer communication protocols (Ryan - Due next week)`,
  },
  {
    id: "3",
    title: "Budget Crisis & Funding Strategy",
    date: new Date(Date.now() + 86400000),
    time: "10:00 AM - 11:00 AM",
    attendees: ["Chris Anderson", "Maria Garcia", "Tom Wilson", "Lisa Brown"],
    description: "Emergency budget meeting to address funding shortfall and develop fundraising strategy.",
    hasTranscript: true,
    transcript: `Chris Anderson: Thank you all for coming. We're facing a serious budget crisis. Our main grant funding has been cut by 40%, and we need to make some difficult decisions about our programs.

Maria Garcia: This is devastating news. The funding cut will directly impact our ability to serve families in need. We're already struggling with volunteer recruitment, and now we have to cut services too?

Tom Wilson: What programs are at risk? The food pantry and transportation services are our core offerings. We can't afford to reduce those.

Lisa Brown: I've been reviewing our expenses. The biggest costs are transportation - fuel, vehicle maintenance, and insurance. If we can't secure additional funding, we might have to reduce delivery frequency.

Chris Anderson: That's exactly what I'm worried about. Reduced services will hurt the families who depend on us, and it might also affect volunteer morale. People volunteer because they want to make a difference.

Maria Garcia: Have we explored all funding options? What about corporate sponsorships or individual donor campaigns?

Tom Wilson: I've reached out to several local businesses, but the economic climate is tough. Many companies are cutting their charitable giving budgets.

Lisa Brown: We should consider a community fundraising event. The volunteer appreciation dinner last year raised some funds, but we need something bigger.

Chris Anderson: Good idea. But organizing a major fundraising event requires significant volunteer coordination, and we're already short-staffed.

Maria Garcia: Maybe we can partner with other local nonprofits? Share resources and volunteers for a joint fundraising effort?

Tom Wilson: That could work. The homeless shelter and the senior center face similar funding challenges. A collaborative approach might be more effective.

Lisa Brown: We also need to look at our operational efficiency. Are there ways to reduce transportation costs while maintaining service levels?

Chris Anderson: Absolutely. Let's explore route optimization and volunteer carpooling options. Every dollar saved can go toward serving more families.`,
    notes: `Budget Crisis Details:
- Main grant funding cut by 40%
- Transportation costs are highest expense category
- Risk of reducing delivery frequency and service levels
- Volunteer morale concerns due to service cuts
- Need for emergency fundraising initiatives

Action Items:
- Research collaborative fundraising with other nonprofits (Maria - Due next week)
- Develop major fundraising event proposal (Lisa - Due Friday)
- Analyze transportation cost reduction options (Tom - Due next week)
- Continue corporate sponsorship outreach (Tom - Ongoing)
- Create emergency budget scenarios (Chris - Due this week)`,
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
    title: "Volunteer Appreciation & Retention Review",
    date: new Date(Date.now() - 86400000 * 2),
    time: "11:00 AM - 12:00 PM",
    attendees: ["Sarah Chen", "Michael Rodriguez", "Tom Wilson"],
    description: "Review of volunteer retention issues and appreciation program effectiveness.",
    hasTranscript: true,
    transcript: `Sarah Chen: Let's review our volunteer retention challenges. We've lost 15 volunteers in the past month, and I want to understand why.

Michael Rodriguez: I've been conducting exit interviews. The main issues are transportation difficulties getting to our site, lack of proper training, and feeling overwhelmed during busy shifts.

Tom Wilson: The transportation issue keeps coming up. Many volunteers don't have reliable cars, and our location isn't easily accessible by public transit.

Sarah Chen: That's a significant barrier. What solutions have we considered?

Michael Rodriguez: We could provide transportation vouchers or organize volunteer carpools. Some nonprofits offer shuttle services from central locations.

Tom Wilson: The training issue is also critical. New volunteers often quit after their first shift because they feel unprepared. We need a better onboarding process.

Sarah Chen: I agree. What about volunteer recognition? Are we doing enough to show appreciation?

Michael Rodriguez: Our volunteer appreciation events are well-received, but we need more frequent recognition. Maybe monthly volunteer spotlights or small thank-you gifts.

Tom Wilson: We should also address the communication issues. Volunteers often complain about last-minute schedule changes and poor coordination.

Sarah Chen: These are all actionable items. Let's prioritize transportation assistance and improved training. Better volunteer retention will help with our staffing shortages.`,
    notes: `Key Retention Issues:
- Lost 15 volunteers in past month
- Transportation barriers to volunteer site
- Inadequate volunteer training and onboarding
- Poor communication and coordination
- Need for more frequent volunteer recognition

Action Items:
- Research transportation assistance options (Michael - Next week)
- Develop improved volunteer training program (Tom - This week)
- Implement monthly volunteer recognition system (Sarah - This week)
- Improve volunteer communication protocols (Michael - Next week)`,
  },
  {
    id: "past-2",
    title: "Funding Crisis Response Meeting",
    date: new Date(Date.now() - 86400000 * 3),
    time: "2:00 PM - 3:00 PM",
    attendees: ["Emily Watson", "Jessica Lee", "Amanda White"],
    description: "Emergency meeting to address recent grant rejection and funding shortfall.",
    hasTranscript: true,
    transcript: `Emily Watson: Thanks for joining on short notice. We received word that our largest grant application was rejected. This creates a $50,000 funding gap for our programs.

Jessica Lee: This is a major setback. That grant was supposed to fund our volunteer coordinator position and transportation costs for the next year.

Amanda White: Without that funding, we'll have to make some difficult decisions. The volunteer coordination role is critical - we're already struggling with volunteer recruitment and retention.

Emily Watson: What are our options? Can we apply for emergency funding elsewhere?

Jessica Lee: I've been researching alternative grants, but most have long application processes. We need immediate solutions to keep our programs running.

Amanda White: We could launch an emergency fundraising campaign, but that requires significant volunteer effort to organize and promote.

Emily Watson: The irony is that we need volunteers to raise funds to support volunteers. It's a challenging cycle.

Jessica Lee: Maybe we should focus on corporate sponsorships? Local businesses might be more responsive than grant foundations.

Amanda White: Good idea. We should also consider reducing our transportation costs. Maybe partner with other nonprofits to share delivery routes and vehicle expenses.

Emily Watson: These are all viable options. The key is acting quickly before the funding gap affects our service delivery. Our community depends on us.`,
    notes: `Funding Crisis:
- Major grant application rejected ($50,000 shortfall)
- Volunteer coordinator position at risk
- Transportation funding threatened
- Need immediate alternative funding sources
- Risk of service delivery disruption

Action Items:
- Research emergency grant opportunities (Jessica - This week)
- Launch corporate sponsorship outreach (Amanda - Next week)
- Explore nonprofit partnerships for cost sharing (Emily - Next week)
- Develop emergency fundraising campaign plan (Jessica - This week)`,
  },
  {
    id: "past-3",
    title: "Program Delivery & Communication Issues",
    date: new Date(Date.now() - 86400000 * 5),
    time: "10:00 AM - 11:00 AM",
    attendees: ["David Kim", "Chris Anderson", "Ryan Martinez", "Kevin Park", "Rachel Green"],
    description: "Meeting to address program delivery delays and communication breakdowns.",
    hasTranscript: true,
    transcript: `David Kim: We need to address the communication issues that have been affecting our program delivery. Last week, three families didn't receive their scheduled food deliveries due to coordination problems.

Chris Anderson: The communication breakdown between our volunteer coordinators and delivery teams is becoming a serious problem. Volunteers are showing up at the wrong times, and families are left waiting.

Ryan Martinez: Part of the issue is our outdated communication system. We're still using phone calls and text messages, which leads to missed messages and confusion.

Kevin Park: The volunteer scheduling is also problematic. We don't have a centralized system, so different coordinators are giving conflicting information to volunteers.

Rachel Green: This affects volunteer retention too. When volunteers show up and there's confusion about their assignments, they get frustrated and don't come back.

David Kim: We need better technology solutions, but that requires funding. In the meantime, we need to improve our manual processes.

Chris Anderson: What about implementing a simple shared calendar system? Even a basic Google Calendar could help with coordination.

Ryan Martinez: That's a good start. We also need clearer communication protocols - who contacts whom, when, and how.

Kevin Park: The program delivery delays are also affecting our reputation in the community. Word spreads quickly when families can't rely on our services.

Rachel Green: We should also improve our follow-up communication with families. When there are delays, we need to notify them promptly rather than leaving them wondering.

David Kim: These are all critical points. Better communication will improve both volunteer experience and program reliability.`,
    notes: `Communication & Delivery Issues:
- Three families missed scheduled food deliveries due to coordination problems
- Communication breakdown between volunteer coordinators and delivery teams
- Outdated communication systems causing missed messages
- Lack of centralized volunteer scheduling system
- Communication issues affecting volunteer retention and community reputation

Action Items:
- Implement shared calendar system for volunteer coordination (Chris - This week)
- Develop clear communication protocols (Ryan - Next week)
- Improve family notification system for delivery delays (Rachel - This week)
- Research technology solutions for volunteer management (Kevin - Next week)`,
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
