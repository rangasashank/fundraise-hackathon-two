import Head from "next/head"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

export default function Home() {
	return (
		<>
			<Head>
				<title>Fundraise Hackathon 2</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>
			<Navigation />
			<main style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
				<h1 style={{ fontSize: 48, fontWeight: "bold", marginBottom: 16 }}>
					Fundraise Hackathon 2
				</h1>
				<p style={{ fontSize: 18, color: "#666", marginBottom: 32 }}>
					Nylas Notetaker Integration with Meeting Management
				</p>

				<div
					style={{
						backgroundColor: "white",
						padding: 32,
						borderRadius: 8,
						boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
						marginBottom: 32,
					}}
				>
					<h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
						Features
					</h2>
					<ul style={{ lineHeight: 2, marginBottom: 32 }}>
						<li>✅ Invite Nylas Notetaker to Zoom meetings</li>
						<li>✅ Automatic meeting transcription</li>
						<li>✅ Audio recording</li>
						<li>✅ Real-time webhook notifications</li>
						<li>✅ Meeting management and calendar view</li>
						<li>✅ AI-powered action items extraction</li>
						<li>✅ Task management and tracking</li>
					</ul>

					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
						<Link href="/meetings">
							<button
								style={{
									padding: "16px 24px",
									backgroundColor: "#343434",
									color: "white",
									border: "none",
									borderRadius: 8,
									fontSize: 16,
									fontWeight: "bold",
									cursor: "pointer",
									width: "100%",
								}}
							>
								📅 Meetings
							</button>
						</Link>
						<Link href="/tasks">
							<button
								style={{
									padding: "16px 24px",
									backgroundColor: "#343434",
									color: "white",
									border: "none",
									borderRadius: 8,
									fontSize: 16,
									fontWeight: "bold",
									cursor: "pointer",
									width: "100%",
								}}
							>
								✅ Tasks
							</button>
						</Link>
						<Link href="/notetaker">
							<button
								style={{
									padding: "16px 24px",
									backgroundColor: "#0070f3",
									color: "white",
									border: "none",
									borderRadius: 8,
									fontSize: 16,
									fontWeight: "bold",
									cursor: "pointer",
									width: "100%",
								}}
							>
								🎙️ Notetaker
							</button>
						</Link>
					</div>
				</div>

				<div
					style={{
						marginTop: 32,
						padding: 24,
						backgroundColor: "#f8f9fa",
						borderRadius: 8,
					}}
				>
					<h3 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
						Quick Start
					</h3>
					<ol style={{ lineHeight: 2, paddingLeft: 24 }}>
						<li>Configure your Nylas API credentials in backend/.env</li>
						<li>
							Start the backend server: <code>cd backend && npm run dev</code>
						</li>
						<li>Click the button above to access the Notetaker Dashboard</li>
						<li>Enter a Zoom meeting link and invite the notetaker</li>
						<li>View transcripts after the meeting ends</li>
					</ol>
				</div>
			</main>
		</>
	)
}
