import { TemplateModel, ITemplate } from '../models/Template.model';

export interface CreateTemplateData {
  name: string;
  description: string;
  category: string;
  icon: string;
  coverImage?: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  useCases: string[];
  workflowData: {
    workflowName: string;
    workflowDescription: string;
    triggers: any[];
    triggerLogic?: any[];
    containers: any[];
    formFields: any[];
  };
  author?: string;
  featured?: boolean;
  isPublic?: boolean;
}

export class TemplateService {
  /**
   * Create template
   */
  async createTemplate(data: CreateTemplateData): Promise<ITemplate> {
    const template = new TemplateModel({
      ...data,
      featured: data.featured || false,
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
      popularity: 0,
    });

    return template.save();
  }

  /**
   * Get template by ID
   */
  async getTemplateById(templateId: string): Promise<ITemplate | null> {
    return TemplateModel.findById(templateId);
  }

  /**
   * List templates with filters
   */
  async listTemplates(
    filters: {
      category?: string;
      difficulty?: string;
      featured?: boolean;
      isPublic?: boolean;
      search?: string;
    } = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{
    templates: ITemplate[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }

    if (filters.featured !== undefined) {
      query.featured = filters.featured;
    }

    if (filters.isPublic !== undefined) {
      query.isPublic = filters.isPublic;
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const [templates, total] = await Promise.all([
      TemplateModel.find(query)
        .sort({ popularity: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TemplateModel.countDocuments(query),
    ]);

    return {
      templates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Install template (create workflow from template)
   */
  async installTemplate(templateId: string, _userId: string, _userName: string): Promise<any> {
    const template = await this.getTemplateById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Return template workflow data for installation
    return {
      name: template.workflowData.workflowName,
      description: template.workflowData.workflowDescription,
      triggers: template.workflowData.triggers,
      containers: template.workflowData.containers,
      formFields: template.workflowData.formFields,
      triggerLogic: template.workflowData.triggerLogic,
      category: template.category,
      tags: template.tags,
      icon: template.icon,
      coverImage: template.coverImage,
    };
  }

  /**
   * Update template popularity
   */
  async incrementPopularity(templateId: string): Promise<void> {
    await TemplateModel.findByIdAndUpdate(templateId, {
      $inc: { popularity: 1 },
    });
  }
}

export const templateService = new TemplateService();

