import { promises as fs } from 'fs';
import { MCPTool, MCPContext } from '../types';
import { mcpToolRegistry } from '../registry';

export const filesystemTool: MCPTool = {
  name: 'filesystem',
  description: 'Read, write, and manage files on the filesystem',
  inputSchema: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['read', 'write', 'list', 'delete', 'exists'],
        description: 'Operation to perform',
      },
      path: {
        type: 'string',
        description: 'File or directory path',
      },
      content: {
        type: 'string',
        description: 'Content to write (for write operation)',
      },
    },
    required: ['operation', 'path'],
  },
};

export const filesystemToolHandler = {
  execute: async (args: any, _context: MCPContext): Promise<any> => {
    const { operation, path, content } = args;

    switch (operation) {
      case 'read':
        return await fs.readFile(path, 'utf-8');
      case 'write':
        if (!content) {
          throw new Error('Content is required for write operation');
        }
        await fs.writeFile(path, content, 'utf-8');
        return { success: true, message: 'File written successfully' };
      case 'list':
        return await fs.readdir(path);
      case 'delete':
        await fs.unlink(path);
        return { success: true, message: 'File deleted successfully' };
      case 'exists':
        try {
          await fs.access(path);
          return { exists: true };
        } catch {
          return { exists: false };
        }
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  },
};

// Register tool
mcpToolRegistry.register(filesystemTool);

