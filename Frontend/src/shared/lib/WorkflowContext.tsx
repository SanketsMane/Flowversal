import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

export interface WorkflowData {
  id: string;
  name: string;
  description: string;
  category: string | string[];
  icon: string;
  coverImage?: string;
  triggers: any[];
  containers: any[];
  triggerLogic: string[];
  formTitle: string;
  formDescription: string;
  createdAt: string;
  views: string;
  likes: string;
  isPro?: boolean;
  isFavorite?: boolean;
}

interface WorkflowContextType {
  workflows: WorkflowData[];
  addWorkflow: (workflow: WorkflowData) => void;
  updateWorkflow: (id: string, updates: Partial<WorkflowData>) => void;
  deleteWorkflow: (id: string) => void;
  toggleFavorite: (id: string) => void;
  getWorkflow: (id: string) => WorkflowData | undefined;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider(props: { children: ReactNode }) {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);

  const addWorkflow = useCallback(
    function (workflow: WorkflowData) {
      setWorkflows(function (prev: WorkflowData[]) {
        const newWorkflows = prev.slice();
        newWorkflows.push(workflow);
        return newWorkflows;
      });
    },
    [setWorkflows]
  );

  const updateWorkflow = useCallback(
    function (id: string, updates: Partial<WorkflowData>) {
      setWorkflows(function (prev: WorkflowData[]) {
        const updated = [];
        for (let i = 0; i < prev.length; i++) {
          if (prev[i].id === id) {
            const merged = Object.assign({}, prev[i], updates);
            updated.push(merged);
          } else {
            updated.push(prev[i]);
          }
        }
        return updated;
      });
    },
    [setWorkflows]
  );

  const deleteWorkflow = useCallback(
    function (id: string) {
      setWorkflows(function (prev: WorkflowData[]) {
        const filtered = [];
        for (let i = 0; i < prev.length; i++) {
          if (prev[i].id !== id) {
            filtered.push(prev[i]);
          }
        }
        return filtered;
      });
    },
    [setWorkflows]
  );

  const toggleFavorite = useCallback(
    function (id: string) {
      setWorkflows(function (prev: WorkflowData[]) {
        const toggled = [];
        for (let i = 0; i < prev.length; i++) {
          if (prev[i].id === id) {
            const updated = Object.assign({}, prev[i], {
              isFavorite: !prev[i].isFavorite,
            });
            toggled.push(updated);
          } else {
            toggled.push(prev[i]);
          }
        }
        return toggled;
      });
    },
    [setWorkflows]
  );

  const getWorkflow = useCallback(
    function (id: string) {
      for (let i = 0; i < workflows.length; i++) {
        if (workflows[i].id === id) {
          return workflows[i];
        }
      }
      return undefined;
    },
    [workflows]
  );

  const contextValue = useMemo(
    function () {
      return {
        workflows: workflows,
        addWorkflow: addWorkflow,
        updateWorkflow: updateWorkflow,
        deleteWorkflow: deleteWorkflow,
        toggleFavorite: toggleFavorite,
        getWorkflow: getWorkflow,
      };
    },
    [workflows, addWorkflow, updateWorkflow, deleteWorkflow, toggleFavorite, getWorkflow]
  );

  return (
    <WorkflowContext.Provider value={contextValue}>
      {props.children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflows() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflows must be used within WorkflowProvider');
  }
  return context;
}