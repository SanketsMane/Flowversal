import {
  SetupConfigModel,
  ISetupConfig,
  IntegrationConfig,
  FileConfig,
  LinkConfig,
} from '../models/SetupConfig.model';
import { WorkflowModel, IWorkflow } from '../../workflows/models/Workflow.model';
import { Types } from 'mongoose';
import { encrypt, decrypt, isEncrypted, encryptObjectValues, decryptObjectValues } from '../../../shared/utils/encryption.util';
import { logger } from '../../../shared/utils/logger.util';

export interface CreateSetupConfigData {
  entityType: 'template' | 'project' | 'board';
  entityId: string;
  userId: string;
  integrations?: IntegrationConfig[];
  files?: FileConfig[];
  links?: LinkConfig[];
  variables?: Record<string, any>;
}

export interface UpdateSetupConfigData {
  integrations?: IntegrationConfig[];
  files?: FileConfig[];
  links?: LinkConfig[];
  variables?: Record<string, any>;
}

export class SetupConfigService {
  /**
   * Create or update setup configuration
   */
  async createOrUpdateSetupConfig(
    data: CreateSetupConfigData
  ): Promise<ISetupConfig> {
    // Encrypt API keys in integrations before saving
    let encryptedIntegrations = data.integrations || [];
    if (encryptedIntegrations.length > 0) {
      encryptedIntegrations = encryptedIntegrations.map((integration: IntegrationConfig) => {
        if (integration.apiKey && !isEncrypted(integration.apiKey)) {
          return {
            ...integration,
            apiKey: encrypt(integration.apiKey),
          };
        }
        return integration;
      });
    }

    // Check if config already exists
    const existing = await SetupConfigModel.findOne({
      entityType: data.entityType,
      entityId: new Types.ObjectId(data.entityId),
      userId: new Types.ObjectId(data.userId),
    });

    if (existing) {
      // Update existing config
      existing.integrations = encryptedIntegrations.length > 0 ? encryptedIntegrations : existing.integrations;
      existing.files = data.files || existing.files;
      existing.links = data.links || existing.links;
      existing.variables = { ...existing.variables, ...(data.variables || {}) };
      return existing.save();
    }

    // Create new config
    const config = new SetupConfigModel({
      entityType: data.entityType,
      entityId: new Types.ObjectId(data.entityId),
      userId: new Types.ObjectId(data.userId),
      integrations: encryptedIntegrations,
      files: data.files || [],
      links: data.links || [],
      variables: data.variables || {},
    });

    return config.save();
  }

  /**
   * Get setup configuration
   * Returns config with decrypted API keys
   */
  async getSetupConfig(
    entityType: 'template' | 'project' | 'board',
    entityId: string,
    userId: string,
    decryptKeys: boolean = true
  ): Promise<ISetupConfig | null> {
    const config = await SetupConfigModel.findOne({
      entityType,
      entityId: new Types.ObjectId(entityId),
      userId: new Types.ObjectId(userId),
    });

    if (!config || !decryptKeys) {
      return config;
    }

    // Decrypt API keys before returning
    if (config.integrations && config.integrations.length > 0) {
      config.integrations = config.integrations.map((integration) => {
        if (integration.apiKey && isEncrypted(integration.apiKey)) {
          try {
            return {
              ...integration,
              apiKey: decrypt(integration.apiKey),
            };
          } catch (error) {
            logger.error('Failed to decrypt API key', error, {
              integration: integration.name,
            });
            // Return integration without decrypted key if decryption fails
            return integration;
          }
        }
        return integration;
      });
    }

    return config;
  }

  /**
   * Update setup configuration
   */
  async updateSetupConfig(
    configId: string,
    userId: string,
    data: UpdateSetupConfigData
  ): Promise<ISetupConfig | null> {
    const config = await SetupConfigModel.findOne({
      _id: configId,
      userId: new Types.ObjectId(userId),
    });

    if (!config) {
      return null;
    }

    if (data.integrations !== undefined) {
      config.integrations = data.integrations;
    }

    if (data.files !== undefined) {
      config.files = data.files;
    }

    if (data.links !== undefined) {
      config.links = data.links;
    }

    if (data.variables !== undefined) {
      config.variables = { ...config.variables, ...data.variables };
    }

    return config.save();
  }

  /**
   * Apply setup configuration to a workflow
   * Injects API keys, files, and links into workflow nodes
   */
  async applySetupConfigToWorkflow(
    workflowId: string,
    configId: string,
    userId: string
  ): Promise<IWorkflow | null> {
    // Verify workflow ownership
    const workflow = await WorkflowModel.findOne({
      _id: workflowId,
      userId: new Types.ObjectId(userId),
    });

    if (!workflow) {
      throw new Error('Workflow not found or unauthorized');
    }

    // Get setup config
    const config = await SetupConfigModel.findOne({
      _id: configId,
      userId: new Types.ObjectId(userId),
    });

    if (!config) {
      throw new Error('Setup configuration not found');
    }

    // Apply config to workflow nodes
    const updatedContainers = (workflow.containers || []).map((container: any) => {
      if (container.nodes && Array.isArray(container.nodes)) {
        const updatedNodes = container.nodes.map((node: any) => {
          return this.injectConfigIntoNode(node, config);
        });
        return { ...container, nodes: updatedNodes };
      }
      return this.injectConfigIntoNode(container, config);
    });

    workflow.containers = updatedContainers;
    await workflow.save();

    return workflow;
  }

  /**
   * Inject configuration into a workflow node
   */
  private injectConfigIntoNode(node: any, config: ISetupConfig): any {
    const updatedNode = { ...node };
    let nodeConfig = updatedNode.config || {};

    // Inject integration API keys
    if (config.integrations && config.integrations.length > 0) {
      for (const integration of config.integrations) {
        // Check if node uses this integration
        if (
          nodeConfig.integration === integration.name ||
          nodeConfig.integrationName === integration.name ||
          node.type?.includes(integration.name.toLowerCase())
        ) {
          if (integration.apiKey) {
            nodeConfig.apiKey = integration.apiKey;
          }
          if (integration.config) {
            nodeConfig = { ...nodeConfig, ...integration.config };
          }
        }
      }
    }

    // Inject files (add to node config if node supports files)
    if (config.files && config.files.length > 0) {
      if (!nodeConfig.files) {
        nodeConfig.files = [];
      }
      nodeConfig.files = [...(nodeConfig.files || []), ...config.files];
    }

    // Inject links (add to node config if node supports links)
    if (config.links && config.links.length > 0) {
      if (!nodeConfig.links) {
        nodeConfig.links = [];
      }
      nodeConfig.links = [...(nodeConfig.links || []), ...config.links];
    }

    // Inject variables (replace {{variable}} syntax)
    if (config.variables && Object.keys(config.variables).length > 0) {
      const configString = JSON.stringify(nodeConfig);
      let updatedConfigString = configString;

      for (const [key, value] of Object.entries(config.variables)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        updatedConfigString = updatedConfigString.replace(regex, String(value));
        const dollarRegex = new RegExp(`\\$\\{${key}\\}`, 'g');
        updatedConfigString = updatedConfigString.replace(dollarRegex, String(value));
      }

      try {
        nodeConfig = JSON.parse(updatedConfigString);
      } catch (e) {
        // If parsing fails, keep original config
        logger.warn('Failed to parse config after variable substitution', {
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    updatedNode.config = nodeConfig;
    return updatedNode;
  }

  /**
   * Delete setup configuration
   */
  async deleteSetupConfig(configId: string, userId: string): Promise<boolean> {
    const result = await SetupConfigModel.findOneAndDelete({
      _id: configId,
      userId: new Types.ObjectId(userId),
    });

    return result !== null;
  }

  /**
   * Get all setup configs for a user
   */
  async getUserSetupConfigs(
    userId: string,
    entityType?: 'template' | 'project' | 'board'
  ): Promise<ISetupConfig[]> {
    const query: any = {
      userId: new Types.ObjectId(userId),
    };

    if (entityType) {
      query.entityType = entityType;
    }

    return SetupConfigModel.find(query).sort({ updatedAt: -1 });
  }
}

export const setupConfigService = new SetupConfigService();

