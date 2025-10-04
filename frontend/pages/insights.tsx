import Head from 'next/head'
import { Navigation } from '@/components/navigation'
import InsightsPage from '@/components/insights-page'

export default function Insights() {
  return (
    <>
      <Head>
        <title>Insights - Fundraise Hackathon 2</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <InsightsPage />
    </>
  )
}

