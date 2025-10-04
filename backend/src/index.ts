import cors from "cors"
import express, { Request, Response, NextFunction } from "express"
import dotenv from "dotenv"
import connectDB from "./config/database"
import notetakerRoutes from "./routes/notetaker"
import webhookRoutes from "./routes/webhook"
import setupRoutes from "./routes/setup"
import sseRoutes from "./routes/sse"
import aiRoutes from "./routes/ai"
import { createWebhookManager } from "./services/webhookManager"

dotenv.config()

const app = express()

// Initialize database connection
connectDB()

// Raw body capture middleware for webhook signature verification - MUST BE FIRST
app.use('/api/webhooks', express.raw({ type: 'application/json' }), (req, res, next) => {
	// Store raw body for signature verification
	(req as any).rawBody = req.body;

	// Parse JSON manually for webhook processing
	try {
		let bodyString: string;

		if (Buffer.isBuffer(req.body)) {
			// Body is a Buffer from express.raw()
			bodyString = req.body.toString('utf8');
		} else if (typeof req.body === 'string') {
			// Body is already a string
			bodyString = req.body;
		} else if (typeof req.body === 'object' && req.body !== null) {
			// Body is already parsed as an object (shouldn't happen with express.raw, but handle it)
			console.log('✅ Body already parsed as object, skipping JSON parsing');
			next();
			return;
		} else {
			// Fallback: convert to string
			bodyString = String(req.body);
		}

		// Only parse if we have a non-empty string
		if (bodyString && bodyString.trim()) {
			req.body = JSON.parse(bodyString);
			console.log('✅ Successfully parsed webhook JSON');
		} else {
			console.warn('⚠️  Empty webhook body received');
			req.body = {};
		}
	} catch (error) {
		console.error('❌ Failed to parse webhook JSON:', error);
		console.error('Raw body type:', typeof req.body);
		console.error('Raw body length:', req.body?.length || 'undefined');
		console.error('Raw body content:', req.body);
		return res.status(400).json({ error: 'Invalid JSON' });
	}
	next();
});

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Root route
app.get("/", (req: Request, res: Response) => {
	res.json({ message: "Welcome to the API" })
})

// Health check endpoint
app.get("/health", async (req: Request, res: Response) => {
	try {
		// Check database connection
		const mongoose = require('mongoose');
		const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

		res.json({
			status: "ok",
			timestamp: new Date().toISOString(),
			database: dbStatus,
			environment: process.env.NODE_ENV || 'development',
		})
	} catch (error) {
		res.status(500).json({
			status: "error",
			timestamp: new Date().toISOString(),
			error: "Health check failed"
		})
	}
})

// API routes
app.use("/api/notetaker", notetakerRoutes)
app.use("/api/webhooks", webhookRoutes)
app.use("/api/setup", setupRoutes)
app.use("/api/sse", sseRoutes)
app.use("/api/ai", aiRoutes)

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	console.error((err as Error).stack)
	res.status(500).json({
		message: "Something went wrong!",
		error: process.env.NODE_ENV === "development" ? err.message : {},
	})
})

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000

// Start server and register webhooks
app.listen(PORT, async () => {
	console.log(`Server is running on port ${PORT}`)

	// Automatically register Nylas webhooks
	const webhookManager = createWebhookManager()
	if (webhookManager) {
		await webhookManager.registerWebhook()
	}
})
