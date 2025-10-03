import Head from "next/head"
import Link from "next/link"

export default function Home() {
	return (
		<>
			<Head>
				<title>Fundraise Hackathon 2</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>
			<main style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
				<h1 style={{ fontSize: 48, fontWeight: "bold", marginBottom: 16 }}>
					Fundraise Hackathon 2
				</h1>
				<p style={{ fontSize: 18, color: "#666", marginBottom: 32 }}>
					Nylas Notetaker Integration for Zoom Meetings
				</p>

				<div
					style={{
						backgroundColor: "white",
						padding: 32,
						borderRadius: 8,
						boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
					</ul>

					<Link href="/notetaker">
						<button
							style={{
								padding: "16px 32px",
								backgroundColor: "#0070f3",
								color: "white",
								border: "none",
								borderRadius: 8,
								fontSize: 18,
								fontWeight: "bold",
								cursor: "pointer",
								width: "100%",
							}}
						>
							Go to Notetaker Dashboard →
						</button>
					</Link>
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
