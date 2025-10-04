import Head from 'next/head'
import { Navigation } from '@/components/navigation'
import MeetingsPage from '@/components/meetings-page'

export default function Meetings() {
  return (
    <>
      <Head>
        <title>Meetings - Fundraise Hackathon 2</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <MeetingsPage />
    </>
  )
}
