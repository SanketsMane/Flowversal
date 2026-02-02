import { TaskDetailModal } from '@/features/tasks/components/TaskDetailModal';
import { TeamManagement } from '@/shared/components/ui/TeamManagement';
import { SimpleCreateProjectModal } from '@/shared/components/ui/SimpleCreateProjectModal';
import { SimpleCreateBoardModal } from '@/shared/components/ui/SimpleCreateBoardModal';
import { ProjectTemplateGallery } from '@/features/project-templates';
import { ProjectSettings } from '@/shared/components/ui/ProjectSettings';
import { BoardSetupWizard } from '@/shared/components/ui/BoardSetupWizard';
import { EditProjectModal } from '@/shared/components/ui/EditProjectModal';
import { EditBoardModal } from '@/shared/components/ui/EditBoardModal';
import { Task } from '@/core/stores/projectStore';

interface ModalRendererProps {
  // Task modal
  selectedTask: Task | null;
  isCreatingTask: boolean;
  newTaskStatus: string;
  onTaskModalClose: () => void;
  onTaskUpdate: (taskId: string, updates: any) => void;
  onTaskDelete: (taskId: string) => void;

  // Modal states
  showTeamManagement: boolean;
  showTemplateGallery: boolean;
  showProjectSettings: boolean;
  showSetupWizard: boolean;
  showEditProject: boolean;
  showEditBoard: boolean;
  showCreateProject: boolean;
  showCreateBoard: boolean;

  // Modal data
  selectedProjectForSettings: string | null;
  selectedBoardForWizard: string | null;
  selectedProjectForEdit: string | null;
  selectedBoardForEdit: string | null;
  selectedProjectId: string;
  selectedBoardId: string;
  isInitialBoardSetup: boolean;

  // Modal handlers
  onCloseTeamManagement: () => void;
  onCloseTemplateGallery: () => void;
  onCloseProjectSettings: () => void;
  onCloseSetupWizard: () => void;
  onCloseEditProject: () => void;
  onCloseEditBoard: () => void;
  onCloseCreateProject: () => void;
  onCloseCreateBoard: () => void;

  // Additional handlers for create modals
  onCreateProject: (projectData: { name: string; description: string; icon: string; iconColor: string }) => void;
  onCreateBoard: (boardData: { name: string; icon: string; iconColor: string }) => void;
}

interface ModalRendererProps {
  // Task modal
  selectedTask: Task | null;
  isCreatingTask: boolean;
  newTaskStatus: string;
  onTaskModalClose: () => void;
  onTaskUpdate: (taskId: string, updates: any) => void;
  onTaskDelete: (taskId: string) => void;

  // Modal states
  showTeamManagement: boolean;
  showTemplateGallery: boolean;
  showProjectSettings: boolean;
  showSetupWizard: boolean;
  showEditProject: boolean;
  showEditBoard: boolean;
  showCreateProject: boolean;
  showCreateBoard: boolean;

  // Modal data
  selectedProjectForSettings: string | null;
  selectedBoardForWizard: string | null;
  selectedProjectForEdit: string | null;
  selectedBoardForEdit: string | null;
  selectedProjectId: string;
  selectedBoardId: string;
  isInitialBoardSetup: boolean;

  // Modal handlers
  onCloseTeamManagement: () => void;
  onCloseTemplateGallery: () => void;
  onCloseProjectSettings: () => void;
  onCloseSetupWizard: () => void;
  onCloseEditProject: () => void;
  onCloseEditBoard: () => void;
  onCloseCreateProject: () => void;
  onCloseCreateBoard: () => void;

  // Additional handlers for create modals
  onCreateProject: (projectData: { name: string; description: string; icon: string; iconColor: string }) => void;
  onCreateBoard: (boardData: { name: string; icon: string; iconColor: string }) => void;
}

export function ModalRenderer({
  selectedTask,
  isCreatingTask,
  newTaskStatus,
  onTaskModalClose,
  onTaskUpdate,
  onTaskDelete,
  showTeamManagement,
  showTemplateGallery,
  showProjectSettings,
  showSetupWizard,
  showEditProject,
  showEditBoard,
  showCreateProject,
  showCreateBoard,
  selectedProjectForSettings,
  selectedBoardForWizard,
  selectedProjectForEdit,
  selectedBoardForEdit,
  selectedProjectId,
  selectedBoardId,
  isInitialBoardSetup,
  onCloseTeamManagement,
  onCloseTemplateGallery,
  onCloseProjectSettings,
  onCloseSetupWizard,
  onCloseEditProject,
  onCloseEditBoard,
  onCloseCreateProject,
  onCloseCreateBoard,
  onCreateProject,
  onCreateBoard,
}: ModalRendererProps) {
  return (
    <>
      {/* Task Detail Modal */}
      {(selectedTask || isCreatingTask) && (
        <TaskDetailModal
          task={selectedTask}
          isCreating={isCreatingTask}
          initialStatus={newTaskStatus}
          onClose={onTaskModalClose}
          onUpdate={onTaskUpdate}
          onDelete={onTaskDelete}
          projectId={selectedProjectId}
          boardId={selectedBoardId}
        />
      )}

      {/* Create Project Modal */}
      {showCreateProject && (
        <SimpleCreateProjectModal
          isOpen={showCreateProject}
          onClose={onCloseCreateProject}
          onSave={onCreateProject}
        />
      )}

      {/* Create Board Modal */}
      {showCreateBoard && (
        <SimpleCreateBoardModal
          isOpen={showCreateBoard}
          onClose={onCloseCreateBoard}
          onSave={onCreateBoard}
          projectId={selectedProjectId}
        />
      )}

      {/* Team Management Modal */}
      {showTeamManagement && (
        <TeamManagement
          isOpen={showTeamManagement}
          onClose={onCloseTeamManagement}
        />
      )}

      {/* Template Gallery Modal */}
      {showTemplateGallery && (
        <ProjectTemplateGallery
          onClose={onCloseTemplateGallery}
        />
      )}

      {/* Project Settings Modal */}
      {showProjectSettings && selectedProjectForSettings && (
        <ProjectSettings
          projectId={selectedProjectForSettings}
          isOpen={showProjectSettings}
          onClose={onCloseProjectSettings}
        />
      )}

      {/* Setup Wizard Modal */}
      {showSetupWizard && selectedBoardForWizard && (
        <BoardSetupWizard
          boardId={selectedBoardForWizard}
          isOpen={showSetupWizard}
          isInitialSetup={isInitialBoardSetup}
          onClose={onCloseSetupWizard}
        />
      )}

      {/* Edit Project Modal */}
      {showEditProject && selectedProjectForEdit && (
        <>
          {console.log('[ModalRenderer] Rendering EditProjectModal for:', selectedProjectForEdit)}
          <EditProjectModal
            projectId={selectedProjectForEdit}
            onClose={onCloseEditProject}
          />
        </>
      )}

      {/* Edit Board Modal */}
      {showEditBoard && selectedBoardForEdit && (
        <EditBoardModal
          boardId={selectedBoardForEdit}
          onClose={onCloseEditBoard}
        />
      )}
    </>
  );
}
