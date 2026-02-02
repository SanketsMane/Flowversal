/**
 * Execution Results Modal
 * Shows detailed execution results after workflow runs
 */

import React from 'react';
import { X, CheckCircle, XCircle, Clock, Zap, Activity } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

interface ExecutionResult {
  success: boolean;
  executionId: string;
  duration: number;
  stepsExecuted: number;
  aiTokensUsed: number;
}

interface ExecutionResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ExecutionResult | null;
}

export function ExecutionResultsModal({ isOpen, onClose, result }: ExecutionResultsModalProps) {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[#1A1A2E] border border-[#2A2A3E] rounded-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Execution Results</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2A2A3E] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#CFCFE8]" />
          </button>
        </div>

        {/* Status */}
        <div className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${
          result.success
            ? 'bg-green-500/10 border border-green-500/20'
            : 'bg-red-500/10 border border-red-500/20'
        }`}>
          {result.success ? (
            <CheckCircle className="w-8 h-8 text-green-400" />
          ) : (
            <XCircle className="w-8 h-8 text-red-400" />
          )}
          <div>
            <p className={`font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
              {result.success ? 'Execution Successful' : 'Execution Failed'}
            </p>
            <p className="text-sm text-[#CFCFE8]">
              {result.success ? 'All steps completed successfully' : 'An error occurred during execution'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-6">
          <StatRow
            icon={Clock}
            label="Duration"
            value={`${(result.duration / 1000).toFixed(2)}s`}
            color="blue"
          />
          <StatRow
            icon={Activity}
            label="Steps Executed"
            value={result.stepsExecuted.toString()}
            color="cyan"
          />
          <StatRow
            icon={Zap}
            label="AI Tokens Used"
            value={result.aiTokensUsed.toLocaleString()}
            color="yellow"
          />
        </div>

        {/* Execution ID */}
        <div className="p-3 bg-[#0E0E1F] rounded-lg mb-6">
          <p className="text-xs text-[#CFCFE8] mb-1">Execution ID</p>
          <p className="text-sm text-white font-mono">{result.executionId}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB]"
          >
            Close
          </Button>
          <Button
            onClick={() => {
              window.location.href = '/admin';
            }}
            variant="outline"
            className="flex-1"
          >
            View in Admin
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'blue' | 'cyan' | 'yellow';
}) {
  const colorMap = {
    blue: 'text-blue-400',
    cyan: 'text-cyan-400',
    yellow: 'text-yellow-400',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-[#0E0E1F] rounded-lg">
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${colorMap[color]}`} />
        <span className="text-[#CFCFE8]">{label}</span>
      </div>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
}
