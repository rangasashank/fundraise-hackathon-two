import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import { Box, Typography, Collapse, IconButton } from '@mui/material'
import { styled } from '@mui/material/styles'
import { 
  TrendingUp, 
  AlertCircle, 
  BarChart3, 
  Lightbulb, 
  ChevronRight, 
  ChevronDown,
  Users,
  Calendar,
  Target,
  Clock,
  ExternalLink
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Meeting } from '@/lib/mock-data'

interface Task {
  id: string
  title: string
  description: string
  assignee: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  status: 'todo' | 'in-progress' | 'completed'
  meetingId?: string
  meetingTitle?: string
}

interface RecurringIssue {
  theme: string
  count: number
  meetings: string[]
  relatedTasks: Task[]
  lastMentioned: Date
  urgencyScore: number
  suggestions: string[]
  keywords: string[]
}

interface TaskPattern {
  type: string
  count: number
  examples: string[]
}

interface InsightAgentSidebarProps {
  meetings: Meeting[]
  tasks: Task[]
  isOpen: boolean
  onToggle: () => void
}

// Styled components
const SidebarContainer = styled(Box)<{ isOpen: boolean }>(({ isOpen }) => ({
  position: 'fixed',
  top: 64, // Below navigation
  right: 0,
  width: isOpen ? 400 : 48,
  height: 'calc(100vh - 64px)',
  backgroundColor: 'var(--surface)',
  borderLeft: '1px solid var(--grey-200)',
  boxShadow: isOpen ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
  transition: 'all var(--transition-normal)',
  zIndex: 1000,
  // Removed overflow: 'hidden' to allow toggle button to be visible
  '@media (max-width: 768px)': {
    width: isOpen ? '100vw' : 48,
    top: 64,
  },
}))

const SidebarHeader = styled(Box)(() => ({
  padding: 'var(--space-3)',
  borderBottom: '1px solid var(--grey-200)',
  backgroundColor: 'var(--brand-primary-50)',
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-2)',
}))

const SidebarContent = styled(Box)(() => ({
  padding: 'var(--space-3)',
  height: 'calc(100% - 60px)',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: 6,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'var(--grey-100)',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'var(--brand-primary-300)',
    borderRadius: 3,
  },
}))

const InsightCard = styled(Card)(() => ({
  marginBottom: 'var(--space-3)',
  border: '1px solid var(--grey-200)',
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, var(--surface) 0%, var(--brand-primary-50) 100%)',
  '&:hover': {
    boxShadow: 'var(--shadow-md)',
    transform: 'translateY(-1px)',
  },
  transition: 'all var(--transition-fast)',
}))

const ToggleButton = styled(IconButton)<{ isOpen: boolean }>(({ isOpen }) => ({
  position: 'fixed', // Fixed positioning relative to viewport
  top: '50%',
  right: isOpen ? 400 + 22 : 48 + 22, // Position 22px to the left of sidebar edge (22px = half button width + border)
  transform: 'translateY(-50%)',
  width: 40,
  height: 40,
  backgroundColor: 'var(--brand-primary)',
  color: 'white',
  boxShadow: 'var(--shadow-md)',
  borderRadius: '50%',
  border: '2px solid white', // White border for better visibility
  '&:hover': {
    backgroundColor: 'var(--brand-primary-600)',
    boxShadow: 'var(--shadow-lg)',
    transform: 'translateY(-50%) scale(1.05)', // Slight scale on hover
  },
  transition: 'all var(--transition-normal)', // Match sidebar transition timing
  zIndex: 1002, // Higher than sidebar to ensure visibility
  '@media (max-width: 768px)': {
    right: isOpen ? 'calc(50vw + 22px)' : 48 + 22, // Adjust for mobile full-width sidebar
  },
}))

// Nonprofit-specific keywords for issue detection
const NONPROFIT_KEYWORDS = {
  'Volunteer Management': ['volunteer', 'volunteers', 'recruitment', 'retention', 'staffing', 'workforce'],
  'Funding & Resources': ['funding', 'budget', 'grant', 'donation', 'fundraising', 'financial', 'resources', 'money'],
  'Transportation & Logistics': ['transport', 'transportation', 'logistics', 'delivery', 'pickup', 'vehicle', 'travel'],
  'Communication Issues': ['communication', 'outreach', 'messaging', 'contact', 'follow-up', 'coordination'],
  'Program Delivery': ['program', 'service', 'delivery', 'implementation', 'execution', 'operations'],
  'Community Engagement': ['community', 'engagement', 'participation', 'involvement', 'outreach', 'awareness'],
  'Compliance & Reporting': ['compliance', 'reporting', 'documentation', 'audit', 'regulation', 'legal'],
  'Technology & Systems': ['technology', 'system', 'software', 'digital', 'online', 'platform', 'website'],
}

export function InsightAgentSidebar({ meetings, tasks, isOpen, onToggle }: InsightAgentSidebarProps) {
  const router = useRouter()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['issues', 'patterns']))

  // Analysis logic
  const insights = useMemo(() => {
    return analyzeInsights(meetings, tasks)
  }, [meetings, tasks])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  const handleNavigateToTasks = (meetingId?: string) => {
    if (meetingId) {
      router.push(`/tasks?meeting=${meetingId}`)
    } else {
      router.push('/tasks')
    }
  }

  const handleNavigateToMeeting = (meetingId: string) => {
    router.push(`/meetings?meeting=${meetingId}`)
  }

  return (
    <>
      {/* Toggle Button - positioned outside container to avoid overflow clipping */}
      <ToggleButton isOpen={isOpen} onClick={onToggle}>
        {isOpen ? <ChevronRight size={20} /> : <Lightbulb size={20} />}
      </ToggleButton>

      {/* Sidebar Container */}
      <SidebarContainer isOpen={isOpen}>
        {!isOpen && (
          // Empty container when closed - button is now external
          <Box />
        )}

        {isOpen && (
          <>
            <SidebarHeader>
              <Lightbulb size={20} color="var(--brand-primary)" />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--brand-primary-700)' }}>
                AI Insights
              </Typography>
            </SidebarHeader>

            <SidebarContent>
        {/* Recurring Issues Section */}
        <Box sx={{ mb: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 2, 
              cursor: 'pointer',
              p: 1,
              borderRadius: 'var(--radius-md)',
              '&:hover': { backgroundColor: 'var(--grey-100)' }
            }}
            onClick={() => toggleSection('issues')}
          >
            {expandedSections.has('issues') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <AlertCircle size={16} color="var(--priority-high)" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Recurring Issues ({insights.recurringIssues.length})
            </Typography>
          </Box>
          
          <Collapse in={expandedSections.has('issues')}>
            {insights.recurringIssues.slice(0, 3).map((issue, index) => (
              <InsightCard key={issue.theme}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {issue.theme}
                    </Typography>
                    <Badge 
                      variant={issue.urgencyScore > 80 ? "destructive" : issue.urgencyScore > 60 ? "secondary" : "outline"}
                    >
                      Score: {issue.urgencyScore}
                    </Badge>
                  </Box>
                  
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mb: 1, display: 'block' }}>
                    Mentioned in {issue.count} meetings • {issue.relatedTasks.length} related tasks
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: 'var(--text-primary)', mb: 2, fontSize: '0.8rem' }}>
                    {issue.suggestions[0]}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {issue.meetings.slice(0, 2).map(meetingId => (
                      <Button
                        key={meetingId}
                        size="sm"
                        variant="outline"
                        onClick={() => handleNavigateToMeeting(meetingId)}
                        sx={{ fontSize: '0.7rem', py: 0.5, px: 1 }}
                      >
                        <ExternalLink size={10} style={{ marginRight: 4 }} />
                        View Meeting
                      </Button>
                    ))}
                    {issue.relatedTasks.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleNavigateToTasks(issue.meetings[0])}
                        sx={{ fontSize: '0.7rem', py: 0.5, px: 1 }}
                      >
                        <Target size={10} style={{ marginRight: 4 }} />
                        {issue.relatedTasks.length} Tasks
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </InsightCard>
            ))}
          </Collapse>
        </Box>

        {/* Task Patterns Section */}
        <Box sx={{ mb: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 2, 
              cursor: 'pointer',
              p: 1,
              borderRadius: 'var(--radius-md)',
              '&:hover': { backgroundColor: 'var(--grey-100)' }
            }}
            onClick={() => toggleSection('patterns')}
          >
            {expandedSections.has('patterns') ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <BarChart3 size={16} color="var(--brand-accent)" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Task Patterns
            </Typography>
          </Box>
          
          <Collapse in={expandedSections.has('patterns')}>
            <InsightCard>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  📊 Most Common Task Types
                </Typography>
                {insights.taskPatterns.slice(0, 3).map((pattern, index) => (
                  <Box key={pattern.type} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {pattern.type}
                      </Typography>
                      <Badge variant="secondary">{pattern.count}</Badge>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </InsightCard>

            <InsightCard>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  👥 Workload Distribution
                </Typography>
                {insights.assigneeWorkload.slice(0, 3).map((assignee, index) => (
                  <Box key={assignee.name} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {assignee.name}
                      </Typography>
                      <Badge variant={assignee.pendingTasks > 5 ? "destructive" : "secondary"}>
                        {assignee.pendingTasks} pending
                      </Badge>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </InsightCard>
          </Collapse>
            </Box>
            </SidebarContent>
          </>
        )}
      </SidebarContainer>
    </>
  )
}

// Analysis helper functions
function analyzeInsights(meetings: Meeting[], tasks: Task[]) {
  const recurringIssues = detectRecurringIssues(meetings, tasks)
  const taskPatterns = analyzeTaskPatterns(tasks)
  const assigneeWorkload = analyzeAssigneeWorkload(tasks)

  return {
    recurringIssues: recurringIssues.sort((a, b) => b.urgencyScore - a.urgencyScore),
    taskPatterns: taskPatterns.sort((a, b) => b.count - a.count),
    assigneeWorkload: assigneeWorkload.sort((a, b) => b.pendingTasks - a.pendingTasks)
  }
}

function detectRecurringIssues(meetings: Meeting[], tasks: Task[]): RecurringIssue[] {
  const issues: RecurringIssue[] = []

  // Analyze each theme
  Object.entries(NONPROFIT_KEYWORDS).forEach(([theme, keywords]) => {
    const matchingMeetings: string[] = []
    const relatedTasks: Task[] = []
    let totalMentions = 0
    let lastMentioned = new Date(0)

    // Check meetings for keyword matches (more flexible matching)
    meetings.forEach(meeting => {
      const content = `${meeting.title} ${meeting.description || ''} ${meeting.notes || ''} ${meeting.transcript || ''}`.toLowerCase()
      const mentions = keywords.filter(keyword => {
        const keywordLower = keyword.toLowerCase()
        // Check for exact match or partial word match
        return content.includes(keywordLower) ||
               content.includes(keywordLower.slice(0, -1)) || // Handle plurals
               (keywordLower.includes('volunteer') && (content.includes('staff') || content.includes('worker')))
      }).length

      if (mentions > 0) {
        matchingMeetings.push(meeting.id)
        totalMentions += mentions
        if (meeting.date > lastMentioned) {
          lastMentioned = meeting.date
        }
      }
    })

    // Find related tasks
    tasks.forEach(task => {
      const taskContent = `${task.title} ${task.description}`.toLowerCase()
      const hasKeyword = keywords.some(keyword => taskContent.includes(keyword.toLowerCase()))

      if (hasKeyword || matchingMeetings.includes(task.meetingId || '')) {
        relatedTasks.push(task)
      }
    })

    // Include issues mentioned in at least one meeting (lowered threshold for better visibility)
    if (matchingMeetings.length >= 1) {
      const urgencyScore = calculateUrgencyScore(matchingMeetings.length, lastMentioned, relatedTasks)
      const suggestions = generateSuggestions(theme, matchingMeetings.length, relatedTasks)

      issues.push({
        theme,
        count: matchingMeetings.length,
        meetings: matchingMeetings,
        relatedTasks,
        lastMentioned,
        urgencyScore,
        suggestions,
        keywords
      })
    }
  })

  return issues
}

function calculateUrgencyScore(meetingCount: number, lastMentioned: Date, relatedTasks: Task[]): number {
  const now = new Date()
  const daysSinceLastMention = Math.floor((now.getTime() - lastMentioned.getTime()) / (1000 * 60 * 60 * 24))

  // Base score from frequency (0-40 points)
  const frequencyScore = Math.min(meetingCount * 8, 40)

  // Recency score (0-30 points, higher for more recent)
  const recencyScore = Math.max(30 - daysSinceLastMention, 0)

  // Task impact score (0-30 points)
  const pendingTasks = relatedTasks.filter(t => t.status !== 'completed').length
  const highPriorityTasks = relatedTasks.filter(t => t.priority === 'high').length
  const taskScore = Math.min(pendingTasks * 3 + highPriorityTasks * 5, 30)

  return Math.min(frequencyScore + recencyScore + taskScore, 100)
}

function generateSuggestions(theme: string, meetingCount: number, relatedTasks: Task[]): string[] {
  const pendingTasks = relatedTasks.filter(t => t.status !== 'completed').length
  const suggestions: string[] = []

  switch (theme) {
    case 'Volunteer Management':
      if (meetingCount >= 4) {
        suggestions.push('Consider hosting a volunteer recruitment drive or improving retention strategies.')
      } else {
        suggestions.push('Schedule a dedicated volunteer planning session to address recurring concerns.')
      }
      break
    case 'Funding & Resources':
      suggestions.push('Review budget allocation and explore additional funding opportunities.')
      if (pendingTasks > 3) {
        suggestions.push('Prioritize funding-related tasks to prevent resource bottlenecks.')
      }
      break
    case 'Transportation & Logistics':
      suggestions.push('Evaluate transportation partnerships or logistics optimization opportunities.')
      break
    case 'Communication Issues':
      suggestions.push('Implement improved communication protocols or tools.')
      break
    case 'Program Delivery':
      suggestions.push('Review program implementation processes and identify improvement areas.')
      break
    case 'Community Engagement':
      suggestions.push('Develop enhanced community outreach strategies.')
      break
    case 'Compliance & Reporting':
      suggestions.push('Streamline compliance processes and ensure documentation is up-to-date.')
      break
    case 'Technology & Systems':
      suggestions.push('Assess technology needs and consider system upgrades or training.')
      break
    default:
      suggestions.push(`Address recurring ${theme.toLowerCase()} concerns with dedicated planning.`)
  }

  if (pendingTasks > 5) {
    suggestions.push(`${pendingTasks} related tasks are pending - consider task prioritization.`)
  }

  return suggestions
}

function analyzeTaskPatterns(tasks: Task[]): TaskPattern[] {
  const patterns: { [key: string]: { count: number; examples: string[] } } = {}

  tasks.forEach(task => {
    // Extract task type from title (first few words or common patterns)
    let taskType = extractTaskType(task.title)

    if (!patterns[taskType]) {
      patterns[taskType] = { count: 0, examples: [] }
    }

    patterns[taskType].count++
    if (patterns[taskType].examples.length < 3) {
      patterns[taskType].examples.push(task.title)
    }
  })

  return Object.entries(patterns).map(([type, data]) => ({
    type,
    count: data.count,
    examples: data.examples
  }))
}

function extractTaskType(title: string): string {
  const lowerTitle = title.toLowerCase()

  // Common task type patterns
  if (lowerTitle.includes('follow up') || lowerTitle.includes('follow-up')) return 'Follow-up Tasks'
  if (lowerTitle.includes('schedule') || lowerTitle.includes('meeting')) return 'Scheduling Tasks'
  if (lowerTitle.includes('review') || lowerTitle.includes('check')) return 'Review Tasks'
  if (lowerTitle.includes('update') || lowerTitle.includes('revise')) return 'Update Tasks'
  if (lowerTitle.includes('prepare') || lowerTitle.includes('create')) return 'Preparation Tasks'
  if (lowerTitle.includes('contact') || lowerTitle.includes('call') || lowerTitle.includes('email')) return 'Communication Tasks'
  if (lowerTitle.includes('research') || lowerTitle.includes('investigate')) return 'Research Tasks'
  if (lowerTitle.includes('budget') || lowerTitle.includes('financial')) return 'Financial Tasks'
  if (lowerTitle.includes('volunteer') || lowerTitle.includes('recruit')) return 'Volunteer Tasks'
  if (lowerTitle.includes('report') || lowerTitle.includes('document')) return 'Documentation Tasks'

  // Default: use first two words
  const words = title.split(' ')
  return words.slice(0, 2).join(' ') + ' Tasks'
}

function analyzeAssigneeWorkload(tasks: Task[]): Array<{ name: string; totalTasks: number; pendingTasks: number; highPriorityTasks: number }> {
  const workload: { [key: string]: { total: number; pending: number; highPriority: number } } = {}

  tasks.forEach(task => {
    if (!workload[task.assignee]) {
      workload[task.assignee] = { total: 0, pending: 0, highPriority: 0 }
    }

    workload[task.assignee].total++

    if (task.status !== 'completed') {
      workload[task.assignee].pending++
    }

    if (task.priority === 'high') {
      workload[task.assignee].highPriority++
    }
  })

  return Object.entries(workload).map(([name, data]) => ({
    name,
    totalTasks: data.total,
    pendingTasks: data.pending,
    highPriorityTasks: data.highPriority
  }))
}
