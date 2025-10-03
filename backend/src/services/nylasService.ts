import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

interface InviteNotetakerParams {
	meetingLink: string
	joinTime?: number
	name?: string
}

interface NotetakerResponse {
	id: string
	name: string
	join_time?: number
	meeting_link: string
	meeting_provider: string
	state: string
	meeting_settings: {
		audio_recording: boolean
		video_recording: boolean
		transcription: boolean
		summary: boolean
		action_items: boolean
	}
}

class NylasService {
	private apiKey: string
	private apiUri: string

	constructor() {
		const apiKey = process.env.NYLAS_API_KEY
		const apiUri = "https://api.us.nylas.com"

		if (!apiKey) {
			throw new Error("NYLAS_API_KEY is not defined in environment variables")
		}

		this.apiKey = apiKey
		this.apiUri = apiUri
	}

	/**
	 * Invite notetaker to join a meeting
	 */
	async inviteNotetaker(
		params: InviteNotetakerParams
	): Promise<NotetakerResponse> {
		try {
			const requestBody: any = {
				meeting_link: params.meetingLink,
				name: params.name || "Nylas Notetaker",
				meeting_settings: {
					audio_recording: true,
					video_recording: false,
					transcription: true,
					summary: false,
					action_items: false,
				},
			}

			// Add join_time if provided
			if (params.joinTime) {
				requestBody.join_time = params.joinTime
			}

			// Use standalone notetaker endpoint (no grant ID required)
			const response = await axios.post(
				`${this.apiUri}/v3/notetakers`,
				requestBody,
				{
					headers: {
						Authorization: `Bearer ${this.apiKey}`,
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				}
			)

			return response.data.data
		} catch (error: any) {
			console.error(
				"Error inviting notetaker:",
				error.response?.data || error.message
			)
			throw this.handleNylasError(error)
		}
	}

	/**
	 * Get list of scheduled notetakers
	 */
	async listNotetakers(): Promise<NotetakerResponse[]> {
		try {
			const response = await axios.get(`${this.apiUri}/v3/notetakers`, {
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					Accept: "application/json",
				},
			})

			return response.data.data || []
		} catch (error: any) {
			console.error(
				"Error listing notetakers:",
				error.response?.data || error.message
			)
			throw this.handleNylasError(error)
		}
	}

	/**
	 * Get specific notetaker details
	 */
	async getNotetaker(notetakerId: string): Promise<NotetakerResponse> {
		try {
			const response = await axios.get(
				`${this.apiUri}/v3/notetakers/${notetakerId}`,
				{
					headers: {
						Authorization: `Bearer ${this.apiKey}`,
						Accept: "application/json",
					},
				}
			)

			return response.data.data
		} catch (error: any) {
			console.error(
				"Error getting notetaker:",
				error.response?.data || error.message
			)
			throw this.handleNylasError(error)
		}
	}

	/**
	 * Cancel a scheduled notetaker
	 */
	async cancelNotetaker(notetakerId: string): Promise<void> {
		try {
			await axios.delete(`${this.apiUri}/v3/notetakers/${notetakerId}`, {
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					Accept: "application/json",
				},
			})
		} catch (error: any) {
			console.error(
				"Error cancelling notetaker:",
				error.response?.data || error.message
			)
			throw this.handleNylasError(error)
		}
	}

	/**
	 * Remove notetaker from active meeting
	 */
	async removeNotetaker(notetakerId: string): Promise<void> {
		try {
			await axios.patch(
				`${this.apiUri}/v3/notetakers/${notetakerId}`,
				{ state: "leave" },
				{
					headers: {
						Authorization: `Bearer ${this.apiKey}`,
						Accept: "application/json",
						"Content-Type": "application/json",
					},
				}
			)
		} catch (error: any) {
			console.error(
				"Error removing notetaker:",
				error.response?.data || error.message
			)
			throw this.handleNylasError(error)
		}
	}

	/**
	 * Download media file from Nylas URL
	 */
	async downloadMediaFile(fileUrl: string): Promise<Buffer> {
		try {
			const response = await axios.get(fileUrl, {
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
				},
				responseType: "arraybuffer",
			})

			return Buffer.from(response.data)
		} catch (error: any) {
			console.error(
				"Error downloading media file:",
				error.response?.data || error.message
			)
			throw this.handleNylasError(error)
		}
	}

	/**
	 * Download and parse text content from URL (for transcripts, summaries, action items)
	 */
	async downloadTextFile(fileUrl: string): Promise<string> {
		try {
			console.log(`🔗 Downloading file from URL: ${fileUrl}`);
			const response = await axios.get(fileUrl, {
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
				},
				// Remove responseType to let axios auto-detect JSON vs text
			})

			console.log(`📥 Downloaded response type:`, typeof response.data);
			console.log(`📥 Downloaded response content:`, response.data);

			// If response is an object, convert to JSON string
			if (typeof response.data === 'object') {
				console.log(`🔄 Converting object response to JSON string`);
				return JSON.stringify(response.data);
			}

			// If response is already a string, return as-is
			return String(response.data);
		} catch (error: any) {
			console.error(
				"Error downloading text file:",
				error.response?.data || error.message
			)
			throw this.handleNylasError(error)
		}
	}

	/**
	 * Handle Nylas API errors
	 */
	private handleNylasError(error: any): Error {
		if (error.response) {
			const status = error.response.status
			const message =
				error.response.data?.message ||
				error.response.data?.error ||
				error.message

			if (status === 401) {
				return new Error(`Nylas authentication failed: ${message}`)
			} else if (status === 400) {
				return new Error(`Invalid request: ${message}`)
			} else if (status === 404) {
				return new Error(`Resource not found: ${message}`)
			} else if (status === 429) {
				return new Error(`Rate limit exceeded: ${message}`)
			} else {
				return new Error(`Nylas API error (${status}): ${message}`)
			}
		}

		return new Error(`Nylas service error: ${error.message}`)
	}
}

export default new NylasService()
