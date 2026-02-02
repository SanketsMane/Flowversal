import { ChevronDown } from 'lucide-react';
import { Project, Board } from '@/core/stores/projectStore';
import { RenderIconByName } from '@/shared/components/ui/SimpleIconPicker';

interface ProjectBoardSelectorProps {
  projects: Project[];
  boards: Board[];
  selectedProjectId: string;
  selectedBoardId: string;
  showProjectDropdown: boolean;
  showBoardDropdown: boolean;
  projectDropdownRef: React.RefObject<HTMLDivElement>;
  boardDropdownRef: React.RefObject<HTMLDivElement>;
  onProjectSelect: (projectId: string) => void;
  onBoardSelect: (boardId: string) => void;
  onToggleProjectDropdown: () => void;
  onToggleBoardDropdown: () => void;
  onCreateProject: () => void;
  onCreateBoard: () => void;
  textPrimary: string;
  textSecondary: string;
  bgPanel: string;
  borderColor: string;
  hoverBg: string;
}

export function ProjectBoardSelector({
  projects,
  boards,
  selectedProjectId,
  selectedBoardId,
  showProjectDropdown,
  showBoardDropdown,
  projectDropdownRef,
  boardDropdownRef,
  onProjectSelect,
  onBoardSelect,
  onToggleProjectDropdown,
  onToggleBoardDropdown,
  onCreateProject,
  onCreateBoard,
  textPrimary,
  textSecondary,
  bgPanel,
  borderColor,
  hoverBg,
}: ProjectBoardSelectorProps) {
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedBoard = boards.find(b => b.id === selectedBoardId);

  return (
    <div className="flex items-center gap-3 mb-6">
      {/* Project Selector */}
      <div className="relative" ref={projectDropdownRef}>
        <button
          onClick={onToggleProjectDropdown}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${borderColor} ${bgPanel} ${hoverBg} transition-colors min-w-[200px]`}
        >
          {selectedProject ? (
            <>
              <div
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{ backgroundColor: selectedProject.iconColor + '20' }}
              >
                <RenderIconByName
                  name={selectedProject.icon}
                  className="w-4 h-4"
                  style={{ color: selectedProject.iconColor }}
                />
              </div>
              <span
                className={`${textPrimary} truncate`}
                title={selectedProject.name}
              >
                {selectedProject.name.length > 20 ? `${selectedProject.name.substring(0, 20)}...` : selectedProject.name}
              </span>
            </>
          ) : (
            <span className={`${textSecondary}`}>Select Project</span>
          )}
          <ChevronDown className={`w-4 h-4 ${textSecondary} ml-auto`} />
        </button>

        {showProjectDropdown && (
          <div className={`absolute top-full left-0 mt-2 w-full min-w-[240px] ${bgPanel} rounded-lg border ${borderColor} shadow-xl z-10`}>
            <div className="max-h-64 overflow-y-auto">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`flex items-center justify-between px-4 py-3 ${hoverBg} cursor-pointer`}
                  onClick={() => onProjectSelect(project.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: project.iconColor + '20' }}
                    >
                      <RenderIconByName
                        name={project.icon}
                        className="w-5 h-5"
                        style={{ color: project.iconColor }}
                      />
                    </div>
                    <span className={`${textPrimary} truncate`} title={project.name}>
                      {project.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className={`border-t ${borderColor}`}>
              <button
                onClick={() => {
                  onCreateProject();
                  onToggleProjectDropdown();
                }}
                className={`w-full px-4 py-3 text-left ${hoverBg} ${textPrimary} flex items-center gap-2`}
              >
                <span className="text-lg">+</span>
                <span>Create project</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Board Selector */}
      {selectedProject && (
        <div className="relative" ref={boardDropdownRef}>
          <button
            onClick={onToggleBoardDropdown}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${borderColor} ${bgPanel} ${hoverBg} transition-colors min-w-[200px]`}
          >
            {selectedBoard ? (
              <>
                <div
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ backgroundColor: selectedBoard.iconColor + '20' }}
                >
                  <RenderIconByName
                    name={selectedBoard.icon}
                    className="w-4 h-4"
                    style={{ color: selectedBoard.iconColor }}
                  />
                </div>
                <span className={`${textPrimary} truncate`}>{selectedBoard.name}</span>
              </>
            ) : (
              <span className={`${textSecondary}`}>Select Board</span>
            )}
            <ChevronDown className={`w-4 h-4 ${textSecondary} ml-auto`} />
          </button>

          {showBoardDropdown && (
            <div className={`absolute top-full left-0 mt-2 w-full min-w-[240px] ${bgPanel} rounded-lg border ${borderColor} shadow-xl z-10`}>
              <div className="max-h-64 overflow-y-auto">
                {boards
                  .filter(board => board.projectId === selectedProjectId)
                  .map((board) => (
                    <div
                      key={board.id}
                      className={`flex items-center justify-between px-4 py-3 ${hoverBg} cursor-pointer`}
                      onClick={() => onBoardSelect(board.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: board.iconColor + '20' }}
                        >
                          <RenderIconByName
                            name={board.icon}
                            className="w-5 h-5"
                            style={{ color: board.iconColor }}
                          />
                        </div>
                        <span className={`${textPrimary} truncate`} title={board.name}>
                          {board.name}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
              <div className={`border-t ${borderColor}`}>
                <button
                  onClick={() => {
                    onCreateBoard();
                    onToggleBoardDropdown();
                  }}
                  className={`w-full px-4 py-3 text-left ${hoverBg} ${textPrimary} flex items-center gap-2`}
                >
                  <span className="text-lg">+</span>
                  <span>Create board</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
