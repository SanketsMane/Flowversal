import { useState, useEffect } from 'react';
import { ChevronRight, ArrowLeft, Search, ChevronDown, ArrowRight, Globe } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { nodeCategories, nodeTemplates, getNodesByCategory, searchNodes } from './nodeTemplates';
import { triggerTemplates, triggerCategories, searchTriggers } from './triggerTemplates';
import { toolCategories, toolTemplates, searchTools } from './toolTemplates';
import { DraggableNodeTemplate } from './DraggableNodeTemplate';

type PanelView = 'main' | 'triggers' | 'nodes' | 'tools' | 'trigger_category';

interface HierarchicalNodePanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNodeClick: (nodeType: string) => void;
  toolsContext?: 'trigger' | 'node'; // Track where tools panel was opened from
  onToolsContextChange?: (context: 'trigger' | 'node' | null) => void;
}

export function HierarchicalNodePanel({ 
  searchQuery, 
  onSearchChange, 
  onNodeClick,
  toolsContext,
  onToolsContextChange 
}: HierarchicalNodePanelProps) {
  const { theme } = useTheme();
  const [panelView, setPanelView] = useState<PanelView>('main');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTriggerCategory, setSelectedTriggerCategory] = useState<string | null>(null);
  
  // Initialize with all tool subcategories expanded
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([
    'popular', 
    'tool_messaging', 
    'tool_email', 
    'tool_chat', 
    'tool_spreadsheets', 
    'tool_documents', 
    'tool_project_management',
    'tool_databases',
    'tool_cloud_storage'
  ]);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]); // For expandable nodes like Code

  // Automatically open tools panel when toolsContext is 'trigger'
  useEffect(() => {
    if (toolsContext === 'trigger') {
      setPanelView('tools');
    }
  }, [toolsContext]);

  // Theme colors
  const bgColor = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const bgInput = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const hoverBg = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-100';

  // Reset search when changing views
  const handleViewChange = (view: PanelView, categoryId?: string, context?: 'trigger' | 'node') => {
    onSearchChange('');
    setPanelView(view);
    setSelectedCategory(categoryId || null);
    
    // Update context when opening tools panel
    if (view === 'tools' && onToolsContextChange) {
      onToolsContextChange(context || null);
    } else if (view !== 'tools' && onToolsContextChange) {
      onToolsContextChange(null);
    }
  };

  // Filter items based on search and current view
  let filteredItems: any[] = [];
  let otherSectionResults: { triggers: any[], nodes: any[], tools: any[] } = { triggers: [], nodes: [], tools: [] };
  
  if (searchQuery) {
    // Global search - search across all sections
    const searchedTriggers = searchTriggers(searchQuery);
    const searchedNodes = searchNodes(searchQuery);
    const searchedTools = searchTools(searchQuery);
    
    if (panelView === 'triggers') {
      filteredItems = searchedTriggers;
      // Other sections
      if (searchedNodes.length > 0) otherSectionResults.nodes = searchedNodes;
      if (searchedTools.length > 0) otherSectionResults.tools = searchedTools;
    } else if (panelView === 'tools') {
      filteredItems = searchedTools;
      // Other sections
      if (searchedTriggers.length > 0) otherSectionResults.triggers = searchedTriggers;
      if (searchedNodes.length > 0) otherSectionResults.nodes = searchedNodes;
    } else if (panelView === 'nodes' || selectedCategory) {
      filteredItems = searchedNodes;
      // Other sections
      if (searchedTriggers.length > 0) otherSectionResults.triggers = searchedTriggers;
      if (searchedTools.length > 0) otherSectionResults.tools = searchedTools;
    }
  } else {
    if (panelView === 'triggers') {
      filteredItems = triggerTemplates;
    } else if (panelView === 'tools') {
      filteredItems = toolTemplates;
    } else if (panelView === 'nodes' || selectedCategory) {
      filteredItems = nodeTemplates;
    }
  }

  // Toggle subcategory expansion
  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev => 
      prev.includes(subcategoryId) 
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId]
    );
  };

  // Toggle node expansion (for nodes with children)
  const toggleNode = (nodeType: string) => {
    setExpandedNodes(prev => 
      prev.includes(nodeType) 
        ? prev.filter(id => id !== nodeType)
        : [...prev, nodeType]
    );
  };

  // Render Triggers Panel
  if (panelView === 'triggers') {
    return (
      <div className="space-y-4">
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => handleViewChange('main')}
            className={`p-2 rounded ${textSecondary} ${hoverBg} transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h3 className={`${textPrimary}`}>Triggers</h3>
            <p className={`${textSecondary} text-xs mt-1`}>
              Select how to start your workflow
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
          <input
            type="text"
            placeholder="Search triggers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm`}
          />
        </div>

        {/* Triggers List */}
        <div className="space-y-2">
          {searchQuery ? (
            // Show search results
            <>
              {filteredItems.length > 0 && (
                <div className="mb-4">
                  <h4 className={`${textPrimary} text-sm mb-2`}>Triggers</h4>
                  <div className="space-y-2">
                    {filteredItems.map((trigger: any) => (
                      <DraggableNodeTemplate
                        key={trigger.type}
                        node={{
                          type: trigger.type,
                          label: trigger.label,
                          description: trigger.description,
                          icon: trigger.icon,
                          category: 'trigger',
                        }}
                        onClick={() => onNodeClick(trigger.type)}
                        theme={theme}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Other Section Results - Nodes */}
              {otherSectionResults.nodes.length > 0 && (
                <div className="mt-6">
                  <h4 className={`${textPrimary} text-sm mb-2`}>Other Section Results - Nodes</h4>
                  <div className="space-y-2">
                    {otherSectionResults.nodes.map((node: any) => (
                      <DraggableNodeTemplate
                        key={node.type}
                        node={node}
                        onClick={() => onNodeClick(node.type)}
                        theme={theme}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Other Section Results - Tools */}
              {otherSectionResults.tools.length > 0 && (
                <div className="mt-6">
                  <h4 className={`${textPrimary} text-sm mb-2`}>Other Section Results - Tools</h4>
                  <div className="space-y-2">
                    {otherSectionResults.tools.map((tool: any) => (
                      <DraggableNodeTemplate
                        key={tool.type}
                        node={{
                          type: tool.type,
                          label: tool.label,
                          description: tool.description,
                          icon: tool.icon,
                          category: 'tool',
                        }}
                        onClick={() => onNodeClick(tool.type)}
                        theme={theme}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {filteredItems.length === 0 && otherSectionResults.nodes.length === 0 && otherSectionResults.tools.length === 0 && (
                <p className={`${textSecondary} text-sm text-center py-8`}>
                  No results found
                </p>
              )}
            </>
          ) : (
            // Show "Action by Tools" card + all regular triggers
            <>
              {/* Action by Tools Card */}
              <button
                onClick={() => handleViewChange('tools', undefined, 'trigger')}
                className={`w-full p-4 rounded-xl border ${borderColor} ${bgInput} ${hoverBg} transition-all text-left group hover:border-[#9D50BB]/50`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#4A5568] to-[#2D3748] flex items-center justify-center flex-shrink-0">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`${textPrimary} font-medium`}>Action by tools</p>
                      <ArrowRight className={`w-5 h-5 ${textSecondary} group-hover:text-[#9D50BB] transition-colors`} />
                    </div>
                    <p className={`${textSecondary} text-sm leading-relaxed`}>
                      Do something in an app or service like Google Sheets, Telegram or Notion
                    </p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${textSecondary} flex-shrink-0 group-hover:text-[#9D50BB] transition-colors`} />
                </div>
              </button>

              {/* All Regular Triggers */}
              {filteredItems.map((trigger: any) => (
                <DraggableNodeTemplate
                  key={trigger.type}
                  node={{
                    type: trigger.type,
                    label: trigger.label,
                    description: trigger.description,
                    icon: trigger.icon,
                    category: 'trigger',
                  }}
                  onClick={() => onNodeClick(trigger.type)}
                  theme={theme}
                />
              ))}
            </>
          )}
        </div>
      </div>
    );
  }

  // Render Trigger Category Detail View
  if (panelView === 'trigger_category' && selectedTriggerCategory) {
    const triggerCategory = triggerCategories.find(c => c.id === selectedTriggerCategory);
    const categoryTriggers = triggerTemplates.filter(t => t.category === selectedTriggerCategory);
    const CategoryIcon = triggerCategory?.icon;

    return (
      <div className="space-y-4">
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => {
              setSelectedTriggerCategory(null);
              setPanelView('triggers');
            }}
            className={`p-2 rounded ${textSecondary} ${hoverBg} transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            {CategoryIcon && <CategoryIcon className={`w-6 h-6 ${textSecondary} mb-1`} />}
            <h3 className={`${textPrimary}`}>{triggerCategory?.label}</h3>
            <p className={`${textSecondary} text-xs mt-1`}>
              {triggerCategory?.description}
            </p>
          </div>
        </div>

        {/* Category Triggers */}
        <div className="space-y-2">
          {categoryTriggers.length === 0 ? (
            <p className={`${textSecondary} text-sm text-center py-8`}>
              No triggers found in this category
            </p>
          ) : (
            categoryTriggers.map(trigger => (
              <DraggableNodeTemplate
                key={trigger.type}
                node={{
                  type: trigger.type,
                  label: trigger.label,
                  description: trigger.description,
                  icon: trigger.icon,
                  category: 'trigger',
                }}
                onClick={() => onNodeClick(trigger.type)}
                theme={theme}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  // Render Tools Panel
  if (panelView === 'tools') {
    return (
      <div className="space-y-4">
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => handleViewChange('main')}
            className={`p-2 rounded ${textSecondary} ${hoverBg} transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h3 className={`${textPrimary}`}>Action by tools</h3>
            <p className={`${textSecondary} text-xs mt-1`}>
              Select a tool to connect to your workflow
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm`}
          />
        </div>

        {/* Tools List - with subcategories */}
        <div className="space-y-2">
          {filteredItems.length === 0 && otherSectionResults.triggers.length === 0 && otherSectionResults.nodes.length === 0 ? (
            <p className={`${textSecondary} text-sm text-center py-8`}>
              No tools found
            </p>
          ) : (
            <>
              {/* Current Section Results - Tools */}
              {filteredItems.length > 0 && searchQuery && (
                <div className="mb-4">
                  <h4 className={`${textPrimary} text-sm mb-2`}>Tools</h4>
                </div>
              )}
              
              {searchQuery ? (
                // Show flat list when searching
                toolCategories.map(category => {
                  const categoryTools = filteredItems.filter((t: any) => t.category === category.id);
                  if (categoryTools.length === 0) return null;

                  return (
                    <div key={category.id} className="mb-4">
                      <h4 className={`${textPrimary} text-sm mb-2`}>{category.label}</h4>
                      <div className="space-y-2">
                        {categoryTools.map((tool: any) => (
                          <DraggableNodeTemplate
                            key={tool.type}
                            node={{
                              type: tool.type,
                              label: tool.label,
                              description: tool.description,
                              icon: tool.icon,
                              category: 'tool',
                            }}
                            onClick={() => onNodeClick(tool.type)}
                            theme={theme}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Show with subcategories
                toolCategories.map(category => {
                  const categoryTools = filteredItems.filter((t: any) => t.category === category.id);
                  if (categoryTools.length === 0) return null;

                  return (
                    <div key={category.id} className="mb-4">
                      <h4 className={`${textPrimary} mb-2`}>{category.label}</h4>
                      
                      {category.subcategories ? (
                        category.subcategories.map(subcategory => {
                          const subcategoryTools = categoryTools.filter((t: any) => 
                            subcategory.toolTypes.includes(t.type)
                          );
                          const isExpanded = expandedSubcategories.includes(`tool_${subcategory.id}`);

                          if (subcategoryTools.length === 0) return null;

                          return (
                            <div key={subcategory.id} className="mb-3">
                              <button
                                onClick={() => toggleSubcategory(`tool_${subcategory.id}`)}
                                className={`w-full flex items-center justify-between py-2 ${textSecondary} text-sm ${hoverBg} rounded transition-colors`}
                              >
                                <span>{subcategory.label}</span>
                                <ChevronDown 
                                  className={`w-4 h-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                                />
                              </button>

                              {isExpanded && (
                                <div className="space-y-2 mt-2">
                                  {subcategoryTools.map((tool: any) => (
                                    <DraggableNodeTemplate
                                      key={tool.type}
                                      node={{
                                        type: tool.type,
                                        label: tool.label,
                                        description: tool.description,
                                        icon: tool.icon,
                                        category: 'tool',
                                      }}
                                      onClick={() => onNodeClick(tool.type)}
                                      theme={theme}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="space-y-2">
                          {categoryTools.map((tool: any) => (
                            <DraggableNodeTemplate
                              key={tool.type}
                              node={{
                                type: tool.type,
                                label: tool.label,
                                description: tool.description,
                                icon: tool.icon,
                                category: 'tool',
                              }}
                              onClick={() => onNodeClick(tool.type)}
                              theme={theme}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // If a category is selected, show nodes within that category
  if (selectedCategory) {
    const category = nodeCategories.find(c => c.id === selectedCategory);
    const categoryNodes = filteredItems.filter((n: any) => n.category === selectedCategory);
    const CategoryIcon = category?.icon;

    return (
      <div className="space-y-4">
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => handleViewChange('main')}
            className={`p-2 rounded ${textSecondary} ${hoverBg} transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            {CategoryIcon && <CategoryIcon className={`w-6 h-6 ${textSecondary} mb-1`} />}
            <h3 className={`${textPrimary}`}>{category?.label}</h3>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
          <input
            type="text"
            placeholder={`Search ${category?.label.toLowerCase()} nodes...`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm`}
          />
        </div>

        {/* Category Nodes - with subcategories if available */}
        <div className="space-y-2">
          {categoryNodes.length === 0 ? (
            <p className={`${textSecondary} text-sm text-center py-8`}>
              No nodes found
            </p>
          ) : category?.subcategories ? (
            // Render with subcategories
            category.subcategories.map(subcategory => {
              const subcategoryNodes = categoryNodes.filter(n => 
                subcategory.nodeTypes.includes(n.type)
              );
              const isExpanded = expandedSubcategories.includes(subcategory.id);

              if (subcategoryNodes.length === 0) return null;

              return (
                <div key={subcategory.id} className="mb-4">
                  {/* Subcategory header */}
                  <button
                    onClick={() => toggleSubcategory(subcategory.id)}
                    className={`w-full flex items-center justify-between py-2 ${textSecondary} text-sm ${hoverBg} rounded transition-colors`}
                  >
                    <span>{subcategory.label}</span>
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                    />
                  </button>

                  {/* Subcategory nodes */}
                  {isExpanded && (
                    <div className="space-y-2 mt-2">
                      {subcategoryNodes.map(node => {
                        const isNodeExpanded = expandedNodes.includes(node.type);
                        const hasChildren = node.childNodes && node.childNodes.length > 0;

                        return (
                          <div key={node.type}>
                            {hasChildren ? (
                              <>
                                {/* Parent node with expansion */}
                                <div
                                  onClick={() => toggleNode(node.type)}
                                  className="cursor-pointer"
                                >
                                  <DraggableNodeTemplate
                                    node={node}
                                    onClick={() => {}}
                                    theme={theme}
                                    showRecommended={node.isRecommended}
                                    showExpandIcon={true}
                                    isExpanded={isNodeExpanded}
                                  />
                                </div>

                                {/* Child nodes */}
                                {isNodeExpanded && node.childNodes && (
                                  <div className="ml-6 space-y-2 mt-2 border-l-2 border-gray-700 pl-3">
                                    {node.childNodes.map(childNode => (
                                      <DraggableNodeTemplate
                                        key={childNode.type}
                                        node={childNode}
                                        onClick={() => onNodeClick(childNode.type)}
                                        theme={theme}
                                      />
                                    ))}
                                  </div>
                                )}
                              </>
                            ) : (
                              <DraggableNodeTemplate
                                node={node}
                                onClick={() => onNodeClick(node.type)}
                                theme={theme}
                                showRecommended={node.isRecommended}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            // Render without subcategories (flat list)
            categoryNodes.map(node => (
              <DraggableNodeTemplate
                key={node.type}
                node={node}
                onClick={() => onNodeClick(node.type)}
                theme={theme}
                showRecommended={node.isRecommended}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  // Main category view
  return (
    <div className="space-y-4">
      {/* Header */}
      <h3 className={`${textPrimary} text-lg`}>What happens next?</h3>

      {/* Search */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`w-full pl-9 pr-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm`}
        />
      </div>

      {/* Category List */}
      <div className="space-y-2">
        {searchQuery ? (
          // If searching, show filtered nodes grouped by category
          nodeCategories.map(category => {
            const categoryNodes = filteredItems.filter((n: any) => n.category === category.id);
            if (categoryNodes.length === 0) return null;
            
            return (
              <div key={category.id} className="mb-4">
                <h4 className={`${textPrimary} text-sm mb-2`}>{category.label}</h4>
                <div className="space-y-2">
                  {categoryNodes.map(node => (
                    <DraggableNodeTemplate
                      key={node.type}
                      node={node}
                      onClick={() => onNodeClick(node.type)}
                      theme={theme}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          // Show category buttons
          nodeCategories.map(category => {
            const CategoryIcon = category.icon;
            const categoryNodeCount = nodeTemplates.filter(n => n.category === category.id).length;
            
            // Handle special categories that open different panels
            const handleCategoryClick = () => {
              if (category.id === 'action' && category.hasMoreOptions) {
                handleViewChange('tools', undefined, 'node');
              } else if (category.id === 'add_trigger' && category.hasMoreOptions) {
                handleViewChange('triggers');
              } else {
                setSelectedCategory(category.id);
              }
            };
            
            return (
              <button
                key={category.id}
                onClick={handleCategoryClick}
                className={`w-full p-4 rounded-lg border ${borderColor} ${bgInput} ${hoverBg} transition-all text-left group`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0">
                    <CategoryIcon className="w-5 h-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`${textPrimary} mb-1`}>{category.label}</h4>
                      {category.hasMoreOptions && (
                        <ArrowRight className={`w-4 h-4 ${textSecondary}`} />
                      )}
                    </div>
                    <p className={`${textSecondary} text-sm`}>{category.description}</p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className={`w-5 h-5 ${textSecondary} flex-shrink-0 group-hover:translate-x-1 transition-transform`} />
                </div>
              </button>
            );
          })
        )}
      </div>

      {searchQuery && filteredItems.length === 0 && (
        <p className={`${textSecondary} text-sm text-center py-8`}>
          No nodes found matching "{searchQuery}"
        </p>
      )}
    </div>
  );
}