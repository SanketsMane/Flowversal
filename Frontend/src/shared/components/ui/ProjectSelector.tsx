/**
 * Project Selector Dropdown
 * Allows switching between projects
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { Project } from '@/core/stores/projectStore';
import { RenderIcon } from './IconLibrary';

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
}

export function ProjectSelector({ projects, selectedProjectId, onSelectProject }: ProjectSelectorProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${borderColor} ${hoverBg} ${textPrimary} max-w-md`}
      >
        {selectedProject && (
          <>
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: selectedProject.iconColor + '20' }}
            >
              <RenderIcon 
                name={selectedProject.icon} 
                className="w-5 h-5"
                style={{ color: selectedProject.iconColor }}
              />
            </div>
            <span className="mr-2 truncate min-w-0">{selectedProject.name}</span>
          </>
        )}
        <ChevronDown className="w-4 h-4 flex-shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className={`absolute top-full left-0 mt-2 w-80 ${bgCard} border ${borderColor} rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto`}>
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  onSelectProject(project.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 ${hoverBg} text-left ${
                  selectedProjectId === project.id ? 'bg-[#00C6FF]/10' : ''
                }`}
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: project.iconColor + '20' }}
                >
                  <RenderIcon 
                    name={project.icon} 
                    className="w-6 h-6"
                    style={{ color: project.iconColor }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`${textPrimary} truncate`}>{project.name}</p>
                  {project.description && (
                    <p className={`text-xs ${textSecondary} truncate`}>{project.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
