/**
 * Execution Panel Component
 * Phase 4 Part 2 - Workflow Execution Engine
 * 
 * Main panel combining all execution UI components
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { Bug, History, Terminal } from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { ExecutionConsole } from './ExecutionConsole';
import { ExecutionControls } from './ExecutionControls';
import { ExecutionDebug } from './ExecutionDebug';
import { ExecutionHistory } from './ExecutionHistory';
import { ExecutionStatusBar } from './ExecutionStatusBar';

interface ExecutionPanelProps {
  onStart?: () => void;
  onConfigChange?: () => void;
}

export function ExecutionPanel({ 
  onStart,
  onConfigChange,
}: ExecutionPanelProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('console');

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Controls */}
      <ExecutionControls
        onStart={onStart}
        onConfigChange={onConfigChange}
      />

      {/* Status Bar */}
      <ExecutionStatusBar />

      {/* Tabs for Console/History */}
      <div className={`${bgCard} rounded-lg border ${borderColor} flex-1 flex flex-col min-h-0`}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList className="w-full justify-start border-b rounded-none">
            <TabsTrigger value="console" className="gap-2">
              <Terminal className="h-4 w-4" />
              Console
            </TabsTrigger>
            <TabsTrigger value="debug" className="gap-2">
              <Bug className="h-4 w-4" />
              Debug
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="console" className="flex-1 min-h-0 p-0 m-0">
            <ExecutionConsole />
          </TabsContent>

          <TabsContent value="debug" className="flex-1 min-h-0 p-0 m-0">
            <ExecutionDebug />
          </TabsContent>

          <TabsContent value="history" className="flex-1 min-h-0 p-0 m-0">
            <ExecutionHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
