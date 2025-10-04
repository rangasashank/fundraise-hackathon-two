import Head from 'next/head'
import { Navigation } from '@/components/navigation'
import TasksPage from '@/components/tasks-page'

export default function Tasks() {
  return (
    <>
      <Head>
        <title>Tasks - Fundraise Hackathon 2</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <TasksPage />
    </>
  )
}
