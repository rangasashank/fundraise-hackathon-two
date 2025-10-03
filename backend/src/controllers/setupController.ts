import { Request, Response } from 'express';
import { createWebhookManager } from '../services/webhookManager';

/**
 * Setup Controller
 * Provides endpoints for manual webhook management and setup
 */

/**
 * Register or update webhook with Nylas
 * POST /api/setup/webhook
 */
export const registerWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const webhookManager = createWebhookManager();
    
    if (!webhookManager) {
      res.status(400).json({
        success: false,
        error: 'Webhook configuration is incomplete',
        message: 'Please set NYLAS_API_KEY and WEBHOOK_BASE_URL in your .env file',
      });
      return;
    }

    await webhookManager.registerWebhook();

    res.json({
      success: true,
      message: 'Webhook registered successfully',
    });
  } catch (error: any) {
    console.error('Error registering webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to register webhook',
    });
  }
};

/**
 * List all registered webhooks
 * GET /api/setup/webhooks
 */
export const listWebhooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const webhookManager = createWebhookManager();
    
    if (!webhookManager) {
      res.status(400).json({
        success: false,
        error: 'Webhook configuration is incomplete',
      });
      return;
    }

    const webhooks = await webhookManager.listWebhooks();

    res.json({
      success: true,
      data: webhooks,
      count: webhooks.length,
    });
  } catch (error: any) {
    console.error('Error listing webhooks:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list webhooks',
    });
  }
};

/**
 * Get webhook details by ID
 * GET /api/setup/webhooks/:id
 */
export const getWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Webhook ID is required',
      });
      return;
    }

    const webhookManager = createWebhookManager();

    if (!webhookManager) {
      res.status(400).json({
        success: false,
        error: 'Webhook configuration is incomplete',
      });
      return;
    }

    const webhook = await webhookManager.getWebhook(id);

    res.json({
      success: true,
      data: webhook,
    });
  } catch (error: any) {
    console.error('Error getting webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get webhook',
    });
  }
};

/**
 * Delete a webhook by ID
 * DELETE /api/setup/webhooks/:id
 */
export const deleteWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Webhook ID is required',
      });
      return;
    }

    const webhookManager = createWebhookManager();

    if (!webhookManager) {
      res.status(400).json({
        success: false,
        error: 'Webhook configuration is incomplete',
      });
      return;
    }

    await webhookManager.deleteWebhook(id);

    res.json({
      success: true,
      message: 'Webhook deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete webhook',
    });
  }
};

/**
 * Rotate webhook secret
 * POST /api/setup/webhooks/:id/rotate-secret
 */
export const rotateWebhookSecret = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Webhook ID is required',
      });
      return;
    }

    const webhookManager = createWebhookManager();

    if (!webhookManager) {
      res.status(400).json({
        success: false,
        error: 'Webhook configuration is incomplete',
      });
      return;
    }

    const newSecret = await webhookManager.rotateWebhookSecret(id);

    res.json({
      success: true,
      message: 'Webhook secret rotated successfully',
      data: {
        webhookSecret: newSecret,
      },
      warning: 'Update NYLAS_WEBHOOK_SECRET in your .env file with the new secret',
    });
  } catch (error: any) {
    console.error('Error rotating webhook secret:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to rotate webhook secret',
    });
  }
};

/**
 * Get setup status and configuration
 * GET /api/setup/status
 */
export const getSetupStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const hasApiKey = !!process.env.NYLAS_API_KEY;
    const hasWebhookUrl = !!process.env.WEBHOOK_BASE_URL;
    const hasWebhookSecret = !!process.env.NYLAS_WEBHOOK_SECRET;
    const webhookUrl = process.env.WEBHOOK_BASE_URL 
      ? `${process.env.WEBHOOK_BASE_URL}/api/webhooks/nylas`
      : null;

    const isConfigured = hasApiKey && hasWebhookUrl;
    const webhookManager = createWebhookManager();
    
    let registeredWebhooks: any[] = [];
    if (webhookManager) {
      try {
        registeredWebhooks = await webhookManager.listWebhooks();
      } catch (error) {
        // Ignore errors when listing webhooks
      }
    }

    const currentWebhook = registeredWebhooks.find(
      (webhook: any) => webhook.webhookUrl === webhookUrl
    );

    res.json({
      success: true,
      data: {
        configured: isConfigured,
        configuration: {
          hasApiKey,
          hasWebhookUrl,
          hasWebhookSecret,
          webhookUrl,
        },
        webhook: currentWebhook ? {
          id: currentWebhook.id,
          status: currentWebhook.status,
          triggers: currentWebhook.triggerTypes,
          createdAt: currentWebhook.createdAt,
          updatedAt: currentWebhook.updatedAt,
        } : null,
        instructions: !isConfigured ? {
          message: 'Webhook configuration is incomplete',
          steps: [
            !hasApiKey && 'Set NYLAS_API_KEY in your .env file',
            !hasWebhookUrl && 'Set WEBHOOK_BASE_URL in your .env file (must be HTTPS)',
            'Restart the server to automatically register webhooks',
            'Or call POST /api/setup/webhook to register manually',
          ].filter(Boolean),
        } : null,
      },
    });
  } catch (error: any) {
    console.error('Error getting setup status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get setup status',
    });
  }
};

