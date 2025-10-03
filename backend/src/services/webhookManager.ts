import Nylas from 'nylas';

/**
 * Webhook Manager Service
 * Automatically registers and manages Nylas webhooks for the application
 */

// Notetaker webhook triggers (not yet in the Nylas SDK enum)
type NotetakerWebhookTrigger =
  | 'notetaker.created'
  | 'notetaker.updated'
  | 'notetaker.meeting_state'
  | 'notetaker.media'
  | 'notetaker.deleted';

interface WebhookConfig {
  apiKey: string;
  apiUri: string;
  webhookUrl: string;
  webhookSecret?: string;
  notificationEmail?: string;
}

class WebhookManager {
  private nylas: Nylas;
  private config: WebhookConfig;

  constructor(config: WebhookConfig) {
    this.config = config;
    this.nylas = new Nylas({
      apiKey: config.apiKey,
      apiUri: config.apiUri,
    });
  }

  /**
   * Register or update webhook with Nylas
   * This is called automatically when the server starts
   */
  async registerWebhook(): Promise<void> {
    try {
      console.log('🔗 Registering Nylas webhook...');
      console.log(`   Webhook URL: ${this.config.webhookUrl}`);

      // Define all notetaker event triggers
      const triggerTypes: NotetakerWebhookTrigger[] = [
        'notetaker.created',
        'notetaker.updated',
        'notetaker.meeting_state',
        'notetaker.media',
        'notetaker.deleted',
      ];

      // Check if webhook already exists for this URL
      const existingWebhook = await this.findExistingWebhook();

      if (existingWebhook) {
        console.log(`   Found existing webhook (ID: ${existingWebhook.id})`);
        
        // Update existing webhook to ensure it has all required triggers
        await this.updateWebhook(existingWebhook.id, triggerTypes);
        console.log('✅ Webhook updated successfully');
      } else {
        // Create new webhook
        await this.createWebhook(triggerTypes);
        console.log('✅ Webhook created successfully');
      }

      console.log('   Subscribed to events:');
      triggerTypes.forEach(trigger => {
        console.log(`     - ${trigger}`);
      });

    } catch (error: any) {
      console.error('❌ Failed to register webhook:', error.message);

      // Don't throw error - allow server to start even if webhook registration fails
      // This is important for development environments
      if (error.statusCode === 401) {
        console.error('   Check that NYLAS_API_KEY is valid');
      } else if (error.statusCode === 400) {
        console.error('   Check that WEBHOOK_BASE_URL is a valid HTTPS URL');
        console.error('   Current WEBHOOK_BASE_URL:', this.config.webhookUrl);
      } else if (error.message?.includes('unable.verify.webhook_url')) {
        console.error('   Webhook URL verification failed');
        console.error('   Make sure your webhook URL is publicly accessible');
        console.error('   Current webhook URL:', this.config.webhookUrl);
        console.error('   For development, use ngrok or VS Code port forwarding');
      }

      console.warn('⚠️  Server will continue without webhook registration');
      console.warn('   You can manually register webhooks in the Nylas Dashboard');
    }
  }

  /**
   * Find existing webhook for the configured URL
   */
  private async findExistingWebhook(): Promise<any> {
    try {
      const response = await this.nylas.webhooks.list();
      const webhooks = response.data;

      // Find webhook matching our URL
      return webhooks.find((webhook: any) => 
        webhook.webhookUrl === this.config.webhookUrl
      );
    } catch (error: any) {
      console.error('Error listing webhooks:', error.message);
      return null;
    }
  }

  /**
   * Create a new webhook
   */
  private async createWebhook(triggerTypes: NotetakerWebhookTrigger[]): Promise<void> {
    const requestBody: any = {
      triggerTypes,
      webhookUrl: this.config.webhookUrl,
      description: 'Notetaker Events Webhook (Auto-registered)',
    };

    // Add notification email if provided
    if (this.config.notificationEmail) {
      requestBody.notificationEmailAddress = this.config.notificationEmail;
    }

    await this.nylas.webhooks.create({
      requestBody,
    });
  }

  /**
   * Update an existing webhook
   */
  private async updateWebhook(webhookId: string, triggerTypes: NotetakerWebhookTrigger[]): Promise<void> {
    const requestBody: any = {
      triggerTypes,
      webhookUrl: this.config.webhookUrl,
      description: 'Notetaker Events Webhook (Auto-registered)',
    };

    // Add notification email if provided
    if (this.config.notificationEmail) {
      requestBody.notificationEmailAddress = this.config.notificationEmail;
    }

    await this.nylas.webhooks.update({
      webhookId,
      requestBody,
    });
  }

  /**
   * List all registered webhooks (for debugging)
   */
  async listWebhooks(): Promise<any[]> {
    try {
      const response = await this.nylas.webhooks.list();
      return response.data;
    } catch (error: any) {
      console.error('Error listing webhooks:', error.message);
      return [];
    }
  }

  /**
   * Delete a webhook by ID
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    try {
      await this.nylas.webhooks.destroy({
        webhookId,
      });
      console.log(`Webhook ${webhookId} deleted successfully`);
    } catch (error: any) {
      console.error('Error deleting webhook:', error.message);
      throw error;
    }
  }

  /**
   * Get webhook details by ID
   */
  async getWebhook(webhookId: string): Promise<any> {
    try {
      const response = await this.nylas.webhooks.find({
        webhookId,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting webhook:', error.message);
      throw error;
    }
  }

  /**
   * Rotate webhook secret
   */
  async rotateWebhookSecret(webhookId: string): Promise<string> {
    try {
      const response = await this.nylas.webhooks.rotateSecret({
        webhookId,
      });
      console.log('Webhook secret rotated successfully');
      console.log('⚠️  Update NYLAS_WEBHOOK_SECRET in your .env file with the new secret');
      return response.data.webhookSecret;
    } catch (error: any) {
      console.error('Error rotating webhook secret:', error.message);
      throw error;
    }
  }
}

/**
 * Initialize webhook manager from environment variables
 */
export function createWebhookManager(): WebhookManager | null {
  const apiKey = process.env.NYLAS_API_KEY;
  const apiUri = process.env.NYLAS_API_URI || 'https://api.us.nylas.com';
  const webhookBaseUrl = process.env.WEBHOOK_BASE_URL;
  const notificationEmail = process.env.WEBHOOK_NOTIFICATION_EMAIL;

  // Validate required configuration
  if (!apiKey) {
    console.warn('⚠️  NYLAS_API_KEY not set - skipping webhook registration');
    return null;
  }

  if (!webhookBaseUrl) {
    console.warn('⚠️  WEBHOOK_BASE_URL not set - skipping webhook registration');
    console.warn('   Set WEBHOOK_BASE_URL to your public webhook endpoint');
    console.warn('   Example: WEBHOOK_BASE_URL=https://your-domain.com');
    return null;
  }

  // Construct full webhook URL
  const webhookUrl = `${webhookBaseUrl}/api/webhooks/nylas`;

  // Validate webhook URL is HTTPS (required by Nylas)
  if (!webhookUrl.startsWith('https://')) {
    console.warn('⚠️  WEBHOOK_BASE_URL must use HTTPS - skipping webhook registration');
    console.warn('   Nylas requires webhook URLs to use HTTPS');
    return null;
  }

  return new WebhookManager({
    apiKey,
    apiUri,
    webhookUrl,
    notificationEmail,
  });
}

export default WebhookManager;

