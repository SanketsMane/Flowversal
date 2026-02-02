/**
 * Agent Persistence Service
 * Enhanced persistence with state resumption, versioning, and cleanup policies
 */

import { logger } from '../../../../shared/utils/logger.util';
import { AgentStateModel, agentStateService, IAgentState } from './agent-state.service';

export interface AgentStateSnapshot {
  agentId: string;
  executionId: string;
  nodeId?: string;
  userId: string;
  state: IAgentState;
  version: number;
  timestamp: Date;
  checkpoint?: boolean;
}

export interface AgentStateVersion {
  version: number;
  timestamp: Date;
  state: Partial<IAgentState>;
  description?: string;
}

export class AgentPersistenceService {
  /**
   * Save agent state checkpoint for resumption
   */
  async saveCheckpoint(
    agentId: string,
    executionId: string,
    userId: string,
    description?: string
  ): Promise<AgentStateSnapshot | null> {
    try {
      const agentState = await agentStateService.getAgentState(agentId, executionId);
      if (!agentState) {
        logger.warn('Cannot save checkpoint: agent state not found', { agentId, executionId });
        return null;
      }

      // Get current version
      const version = await this.getLatestVersion(agentId, executionId);
      const nextVersion = version + 1;

      // Create snapshot
      const snapshot: AgentStateSnapshot = {
        agentId,
        executionId,
        nodeId: agentState.nodeId,
        userId,
        state: agentState.toObject() as IAgentState,
        version: nextVersion,
        timestamp: new Date(),
        checkpoint: true,
      };

      // Save version metadata in agent state metadata
      const versions = agentState.metadata?.versions || [];
      versions.push({
        version: nextVersion,
        timestamp: new Date(),
        state: {
          thoughts: agentState.thoughts,
          toolCalls: agentState.toolCalls,
          decisions: agentState.decisions,
          currentState: agentState.currentState,
        },
        description,
      });

      await agentStateService.updateState(agentId, executionId, {
        metadata: {
          ...agentState.metadata,
          versions,
          lastCheckpoint: snapshot.timestamp,
        },
      });

      logger.info('Agent checkpoint saved', { agentId, executionId, version: nextVersion });
      return snapshot;
    } catch (error: any) {
      logger.error('Failed to save agent checkpoint', { error: error.message, agentId, executionId });
      return null;
    }
  }

  /**
   * Resume agent state from checkpoint
   */
  async resumeFromCheckpoint(
    agentId: string,
    executionId: string,
    version?: number
  ): Promise<IAgentState | null> {
    try {
      const agentState = await agentStateService.getAgentState(agentId, executionId);
      if (!agentState) {
        logger.warn('Cannot resume: agent state not found', { agentId, executionId });
        return null;
      }

      const targetVersion = version || this.getLatestVersion(agentId, executionId);
      const versions = agentState.metadata?.versions || [];

      if (versions.length === 0) {
        logger.warn('No versions available for resumption', { agentId, executionId });
        return agentState;
      }

      // Find version to restore
      const versionToRestore = versions.find((v: AgentStateVersion) => v.version === targetVersion);
      if (!versionToRestore) {
        logger.warn('Version not found, using latest', { agentId, executionId, targetVersion });
        return agentState;
      }

      // Restore state from version
      const restoredState = {
        ...agentState.toObject(),
        thoughts: versionToRestore.state.thoughts || agentState.thoughts,
        toolCalls: versionToRestore.state.toolCalls || agentState.toolCalls,
        decisions: versionToRestore.state.decisions || agentState.decisions,
        currentState: versionToRestore.state.currentState || agentState.currentState,
        metadata: {
          ...agentState.metadata,
          resumedFromVersion: targetVersion,
          resumedAt: new Date(),
        },
      };

      // Update agent state
      await AgentStateModel.updateOne(
        { agentId, executionId },
        {
          $set: restoredState,
        }
      );

      logger.info('Agent state resumed from checkpoint', {
        agentId,
        executionId,
        version: targetVersion,
      });

      return await agentStateService.getAgentState(agentId, executionId);
    } catch (error: any) {
      logger.error('Failed to resume agent state', { error: error.message, agentId, executionId });
      return null;
    }
  }

  /**
   * Get latest version number for agent
   */
  private async getLatestVersion(agentId: string, executionId: string): Promise<number> {
    try {
      const agentState = await agentStateService.getAgentState(agentId, executionId);
      if (!agentState || !agentState.metadata?.versions) {
        return 0;
      }

      const versions = agentState.metadata.versions as AgentStateVersion[];
      return versions.length > 0 ? Math.max(...versions.map((v) => v.version)) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get version history for agent
   */
  async getVersionHistory(
    agentId: string,
    executionId: string
  ): Promise<AgentStateVersion[]> {
    try {
      const agentState = await agentStateService.getAgentState(agentId, executionId);
      if (!agentState || !agentState.metadata?.versions) {
        return [];
      }

      return (agentState.metadata.versions as AgentStateVersion[]).sort(
        (a, b) => b.version - a.version
      );
    } catch (error: any) {
      logger.error('Failed to get version history', { error: error.message, agentId, executionId });
      return [];
    }
  }

  /**
   * Cleanup old agent states based on retention policy
   */
  async cleanupOldStates(
    retentionDays: number = 30,
    maxVersionsPerAgent: number = 10
  ): Promise<{ deleted: number; archived: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Delete old agent states
      const deleteResult = await AgentStateModel.deleteMany({
        createdAt: { $lt: cutoffDate },
      });

      // Archive old versions (keep only recent versions)
      const agents = await AgentStateModel.find({
        'metadata.versions': { $exists: true, $ne: [] },
      });

      let archivedCount = 0;
      for (const agent of agents) {
        const versions = (agent.metadata?.versions || []) as AgentStateVersion[];
        if (versions.length > maxVersionsPerAgent) {
          const versionsToKeep = versions
            .sort((a, b) => b.version - a.version)
            .slice(0, maxVersionsPerAgent);

          await AgentStateModel.updateOne(
            { _id: agent._id },
            {
              $set: {
                'metadata.versions': versionsToKeep,
                'metadata.archivedVersions': versions.length - versionsToKeep.length,
              },
            }
          );

          archivedCount += versions.length - versionsToKeep.length;
        }
      }

      logger.info('Agent state cleanup completed', {
        deleted: deleteResult.deletedCount || 0,
        archived: archivedCount,
        retentionDays,
      });

      return {
        deleted: deleteResult.deletedCount || 0,
        archived: archivedCount,
      };
    } catch (error: any) {
      logger.error('Failed to cleanup old agent states', { error: error.message });
      return { deleted: 0, archived: 0 };
    }
  }

  /**
   * Export agent state for backup
   */
  async exportAgentState(
    agentId: string,
    executionId: string
  ): Promise<AgentStateSnapshot | null> {
    try {
      const agentState = await agentStateService.getAgentState(agentId, executionId);
      if (!agentState) {
        return null;
      }

      const version = await this.getLatestVersion(agentId, executionId);

      return {
        agentId,
        executionId,
        nodeId: agentState.nodeId,
        userId: agentState.userId,
        state: agentState.toObject() as IAgentState,
        version,
        timestamp: new Date(),
        checkpoint: false,
      };
    } catch (error: any) {
      logger.error('Failed to export agent state', { error: error.message, agentId, executionId });
      return null;
    }
  }

  /**
   * Import agent state from backup
   */
  async importAgentState(snapshot: AgentStateSnapshot): Promise<boolean> {
    try {
      await agentStateService.createOrUpdateAgentState(
        snapshot.agentId,
        snapshot.executionId,
        snapshot.userId,
        snapshot.nodeId,
        snapshot.state.currentState
      );

      // Restore thoughts, tool calls, and decisions
      const agentState = await agentStateService.getAgentState(
        snapshot.agentId,
        snapshot.executionId
      );
      if (agentState) {
        // Note: This would require additional methods in agentStateService
        // For now, we'll update the metadata to track the import
        await AgentStateModel.updateOne(
          { agentId: snapshot.agentId, executionId: snapshot.executionId },
          {
            $set: {
              metadata: {
                ...agentState.metadata,
                importedFrom: snapshot.version,
                importedAt: new Date(),
              },
            },
          }
        );
      }

      logger.info('Agent state imported', {
        agentId: snapshot.agentId,
        executionId: snapshot.executionId,
        version: snapshot.version,
      });

      return true;
    } catch (error: any) {
      logger.error('Failed to import agent state', { error: error.message });
      return false;
    }
  }
}

export const agentPersistenceService = new AgentPersistenceService();
