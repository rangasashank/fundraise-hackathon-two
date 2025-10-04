import React, { useState, useEffect } from 'react'
import { Box, Typography, Container, CircularProgress, Alert, LinearProgress, Chip } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Lightbulb, TrendingUp, Calendar, RefreshCw, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import * as api from '@/lib/api'
import type { Insight, Solution } from '@/lib/types'

const MainContainer = styled(Container)(() => ({
  maxWidth: '1200px',
  padding: 'var(--space-8) var(--space-6)',
  background: 'linear-gradient(135deg, var(--surface-alt) 0%, var(--brand-primary-50) 50%, var(--brand-accent-50) 100%)',
  minHeight: '100vh',
}))

const InsightCard = styled(Card)(() => ({
  marginBottom: 'var(--space-4)',
  border: '1px solid var(--grey-200)',
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
  background: 'var(--surface)',
  boxShadow: 'var(--shadow-md)',
  transition: 'all var(--transition-normal)',
  '&:hover': {
    boxShadow: 'var(--shadow-lg)',
    transform: 'translateY(-2px)',
  },
}))

const SolutionCard = styled(Box)(() => ({
  backgroundColor: 'var(--brand-primary-50)',
  border: '1px solid var(--brand-primary-200)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-4)',
  marginTop: 'var(--space-3)',
}))

const ScoreBar = styled(LinearProgress)<{ score: number }>(({ score }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: 'var(--grey-200)',
  '& .MuiLinearProgress-bar': {
    backgroundColor:
      score >= 80
        ? 'var(--status-error)'
        : score >= 60
        ? 'var(--status-warning)'
        : 'var(--status-success)',
  },
}))

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [solutions, setSolutions] = useState<Record<string, Solution[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingSolutions, setLoadingSolutions] = useState<Record<string, boolean>>({})
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      setError(null)
      const response = await api.getInsights()
      if (response.success) {
        setInsights(response.data)
      } else {
        throw new Error('Failed to fetch insights')
      }
    } catch (err: any) {
      console.error('Error fetching insights:', err)
      setError(err.message || 'Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeAll = async () => {
    try {
      setAnalyzing(true)
      setError(null)
      const response = await api.analyzeAllMeetings()
      if (response.success) {
        await fetchInsights()
      } else {
        throw new Error(response.error || 'Failed to analyze meetings')
      }
    } catch (err: any) {
      console.error('Error analyzing meetings:', err)
      setError(err.message || 'Failed to analyze meetings')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleGenerateSolutions = async (insightId: string) => {
    try {
      setLoadingSolutions((prev) => ({ ...prev, [insightId]: true }))
      setError(null)

      const response = await api.brainstormSolutions(insightId)
      if (response.success && response.data) {
        setSolutions((prev) => ({ ...prev, [insightId]: response.data || [] }))
      } else {
        throw new Error('Failed to generate solutions')
      }
    } catch (err: any) {
      console.error('Error generating solutions:', err)
      setError(err.message || 'Failed to generate solutions')
    } finally {
      setLoadingSolutions((prev) => ({ ...prev, [insightId]: false }))
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'error'
    if (score >= 60) return 'warning'
    return 'success'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <MainContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </MainContainer>
    )
  }

  return (
    <MainContainer>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <TrendingUp size={32} color="var(--brand-primary)" />
            <Typography variant="h4" fontWeight="bold" color="var(--text-primary)">
              Cross-Meeting Insights
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button onClick={fetchInsights} variant="outline" size="sm">
              <RefreshCw size={16} style={{ marginRight: 8 }} />
              Refresh
            </Button>
            <Button onClick={handleAnalyzeAll} disabled={analyzing} size="sm">
              {analyzing ? (
                <>
                  <CircularProgress size={16} style={{ marginRight: 8 }} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={16} style={{ marginRight: 8 }} />
                  Analyze All Meetings
                </>
              )}
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" color="var(--text-secondary)">
          AI-powered analysis of recurring issues and challenges across all meetings
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {insights.length === 0 && !loading && (
        <Card>
          <CardContent>
            <Box textAlign="center" py={6}>
              <TrendingUp size={64} color="var(--grey-400)" style={{ marginBottom: 16 }} />
              <Typography variant="h6" color="var(--text-secondary)" mb={2}>
                No insights yet
              </Typography>
              <Typography variant="body2" color="var(--text-secondary)" mb={3}>
                Click "Analyze All Meetings" to generate insights from your meeting transcripts
              </Typography>
              <Button onClick={handleAnalyzeAll} disabled={analyzing}>
                {analyzing ? 'Analyzing...' : 'Analyze All Meetings'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Insights List */}
      {insights.map((insight) => (
        <InsightCard key={insight._id}>
          <CardHeader>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box flex={1}>
                <CardTitle>{insight.issueTitle}</CardTitle>
                <Box display="flex" alignItems="center" gap={2} mt={1}>
                  <Chip
                    label={`Score: ${insight.score}/100`}
                    color={getScoreColor(insight.score) as any}
                    size="small"
                  />
                  <Chip
                    label={`${insight.occurrenceCount} meetings`}
                    variant="outlined"
                    size="small"
                  />
                  <Box display="flex" alignItems="center" gap={0.5} color="var(--text-secondary)">
                    <Calendar size={14} />
                    <Typography variant="caption">
                      {formatDate(insight.firstSeenDate)} - {formatDate(insight.lastSeenDate)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </CardHeader>

          <CardContent>
            {/* Score Bar */}
            <Box mb={3}>
              <ScoreBar variant="determinate" value={insight.score} score={insight.score} />
            </Box>

            {/* Rationale */}
            <Typography variant="body2" color="var(--text-secondary)" mb={3}>
              {insight.rationale}
            </Typography>

            {/* Generate Solutions Button */}
            {!solutions[insight._id] && (
              <Button
                onClick={() => handleGenerateSolutions(insight._id)}
                disabled={loadingSolutions[insight._id]}
                variant="default"
                size="sm"
              >
                {loadingSolutions[insight._id] ? (
                  <>
                    <CircularProgress size={16} style={{ marginRight: 8 }} />
                    Generating Solutions...
                  </>
                ) : (
                  <>
                    <Lightbulb size={16} style={{ marginRight: 8 }} />
                    💡 Generate Solutions
                  </>
                )}
              </Button>
            )}

            {/* Solutions */}
            {solutions[insight._id] && solutions[insight._id].length > 0 && (
              <Box mt={3}>
                <Typography variant="h6" mb={2} display="flex" alignItems="center" gap={1}>
                  <Lightbulb size={20} color="var(--brand-primary)" />
                  Recommended Solutions
                </Typography>
                {solutions[insight._id].map((solution, idx) => (
                  <SolutionCard key={solution._id}>
                    <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                      {idx + 1}. {solution.title}
                    </Typography>
                    <Typography variant="body2" color="var(--text-secondary)" mb={2}>
                      {solution.description}
                    </Typography>
                    <Box mb={2}>
                      <Typography variant="subtitle2" fontWeight="bold" mb={0.5}>
                        Expected Impact:
                      </Typography>
                      <Typography variant="body2" color="var(--text-secondary)">
                        {solution.expectedImpact}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" mb={0.5}>
                        Next Steps:
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        {solution.nextSteps.map((step, stepIdx) => (
                          <Typography
                            key={stepIdx}
                            component="li"
                            variant="body2"
                            color="var(--text-secondary)"
                          >
                            {step}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  </SolutionCard>
                ))}
              </Box>
            )}
          </CardContent>
        </InsightCard>
      ))}
    </MainContainer>
  )
}

