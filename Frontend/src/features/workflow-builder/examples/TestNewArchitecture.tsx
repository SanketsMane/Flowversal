/**
 * Test Component - Demonstrating New Architecture
 * Phase 1 Refactor
 * 
 * This component demonstrates how to use the new architecture.
 * You can add this anywhere in your app to test the new features.
 */
import { useWorkflow, useSelection, TriggerRegistry, NodeRegistry, ToolRegistry } from '../index';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
export function TestNewArchitecture() {
  const { 
    triggers, 
    containers, 
    addTriggerFromTemplate,
    addNodeFromTemplate,
    validateWorkflow,
    exportWorkflow,
  } = useWorkflow();
  const { selection, selectTrigger, clearSelection } = useSelection();
  const handleAddWebhookTrigger = () => {
    addTriggerFromTemplate('webhook');
  };
  const handleAddPromptBuilderNode = () => {
    if (containers.length > 0) {
      addNodeFromTemplate(containers[0].id, 'prompt_builder');
    }
  };
  const handleValidate = () => {
    const { valid, errors } = validateWorkflow();
    alert(valid ? 'Workflow is valid!' : `Errors: ${errors.join(', ')}`);
  };
  const handleExport = () => {
    const data = exportWorkflow();
    alert('Workflow exported to console');
  };
  const handleShowRegistries = () => {
    alert('Registry data logged to console');
  };
  return (
    <Card className="p-6 m-4 bg-[#1A1A2E] border-[#2A2A3E]">
      <h2 className="text-xl text-white mb-4">🧪 Test New Architecture</h2>
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-white">
          <div className="bg-[#0E0E1F] p-3 rounded">
            <div className="text-sm text-gray-400">Triggers</div>
            <div className="text-2xl font-bold">{triggers.length}</div>
          </div>
          <div className="bg-[#0E0E1F] p-3 rounded">
            <div className="text-sm text-gray-400">Containers</div>
            <div className="text-2xl font-bold">{containers.length}</div>
          </div>
          <div className="bg-[#0E0E1F] p-3 rounded">
            <div className="text-sm text-gray-400">Selected</div>
            <div className="text-2xl font-bold">{selection ? '✓' : '✗'}</div>
          </div>
        </div>
        {/* Registry Tests */}
        <div>
          <h3 className="text-white mb-2 font-semibold">Registry System</h3>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleShowRegistries} variant="outline" size="sm">
              Show Registries
            </Button>
            <Button onClick={() => {
              const results = NodeRegistry.search('prompt');
              alert(`Found ${results.length} nodes matching "prompt"`);
            }} variant="outline" size="sm">
              Search Nodes
            </Button>
            <Button onClick={() => {
              const categories = NodeRegistry.getCategories();
              alert(`Categories: ${categories.join(', ')}`);
            }} variant="outline" size="sm">
              Get Categories
            </Button>
          </div>
        </div>
        {/* Add Items */}
        <div>
          <h3 className="text-white mb-2 font-semibold">Add Items</h3>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAddWebhookTrigger} size="sm">
              Add Webhook Trigger
            </Button>
            <Button onClick={handleAddPromptBuilderNode} size="sm">
              Add Prompt Builder Node
            </Button>
          </div>
        </div>
        {/* Selection Tests */}
        <div>
          <h3 className="text-white mb-2 font-semibold">Selection</h3>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => triggers.length > 0 && selectTrigger(0)} variant="outline" size="sm">
              Select First Trigger
            </Button>
            <Button onClick={clearSelection} variant="outline" size="sm">
              Clear Selection
            </Button>
          </div>
        </div>
        {/* Workflow Operations */}
        <div>
          <h3 className="text-white mb-2 font-semibold">Workflow Operations</h3>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleValidate} variant="outline" size="sm">
              Validate Workflow
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm">
              Export Workflow
            </Button>
          </div>
        </div>
        {/* Current State Display */}
        <div className="bg-[#0E0E1F] p-4 rounded">
          <h3 className="text-white mb-2 font-semibold">Current State</h3>
          <div className="text-xs text-gray-400 space-y-1 font-mono">
            <div>Triggers: {JSON.stringify(triggers.map(t => t.type), null, 2)}</div>
            <div>Selection: {JSON.stringify(selection, null, 2)}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
