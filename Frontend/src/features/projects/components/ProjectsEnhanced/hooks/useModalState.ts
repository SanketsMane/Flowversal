import { useState } from 'react';
export interface ModalState {
  showCreateProject: boolean;
  showCreateBoard: boolean;
  showTeamManagement: boolean;
  showTemplateGallery: boolean;
  showProjectSettings: boolean;
  showSetupWizard: boolean;
  showEditProject: boolean;
  showEditBoard: boolean;
  selectedProjectForSettings: string | null;
  selectedBoardForWizard: string | null;
  selectedProjectForEdit: string | null;
  selectedBoardForEdit: string | null;
  isInitialBoardSetup: boolean;
}
export function useModalState() {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showTeamManagement, setShowTeamManagement] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showEditBoard, setShowEditBoard] = useState(false);
  const [selectedProjectForSettings, setSelectedProjectForSettings] = useState<string | null>(null);
  const [selectedBoardForWizard, setSelectedBoardForWizard] = useState<string | null>(null);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<string | null>(null);
  const [selectedBoardForEdit, setSelectedBoardForEdit] = useState<string | null>(null);
  const [isInitialBoardSetup, setIsInitialBoardSetup] = useState(false);
  const modalState: ModalState = {
    showCreateProject,
    showCreateBoard,
    showTeamManagement,
    showTemplateGallery,
    showProjectSettings,
    showSetupWizard,
    showEditProject,
    showEditBoard,
    selectedProjectForSettings,
    selectedBoardForWizard,
    selectedProjectForEdit,
    selectedBoardForEdit,
    isInitialBoardSetup,
  };
  const modalHandlers = {
    setShowCreateProject,
    setShowCreateBoard,
    setShowTeamManagement,
    setShowTemplateGallery,
    setShowProjectSettings,
    setShowSetupWizard,
    setShowEditProject,
    setShowEditBoard,
    setSelectedProjectForSettings,
    setSelectedBoardForWizard,
    setSelectedProjectForEdit,
    setSelectedBoardForEdit,
    setIsInitialBoardSetup,
    // Convenience handlers
    openCreateProject: () => setShowCreateProject(true),
    openCreateBoard: () => setShowCreateBoard(true),
    openTeamManagement: () => setShowTeamManagement(true),
    openTemplateGallery: () => setShowTemplateGallery(true),
    openProjectSettings: (projectId: string) => {
      setSelectedProjectForSettings(projectId);
      setShowProjectSettings(true);
    },
    openSetupWizard: (boardId: string, isInitial = false) => {
      setSelectedBoardForWizard(boardId);
      setIsInitialBoardSetup(isInitial);
      setShowSetupWizard(true);
    },
    openEditProject: (projectId: string) => {
      setSelectedProjectForEdit(projectId);
      setShowEditProject(true);
    },
    openEditBoard: (boardId: string) => {
      setSelectedBoardForEdit(boardId);
      setShowEditBoard(true);
    },
    closeAllModals: () => {
      setShowCreateProject(false);
      setShowCreateBoard(false);
      setShowTeamManagement(false);
      setShowTemplateGallery(false);
      setShowProjectSettings(false);
      setShowSetupWizard(false);
      setShowEditProject(false);
      setShowEditBoard(false);
      setSelectedProjectForSettings(null);
      setSelectedBoardForWizard(null);
      setSelectedProjectForEdit(null);
      setSelectedBoardForEdit(null);
      setIsInitialBoardSetup(false);
    },
    closeEditProject: () => {
      setShowEditProject(false);
      setSelectedProjectForEdit(null);
    },
    closeEditBoard: () => {
      setShowEditBoard(false);
      setSelectedBoardForEdit(null);
    },
    closeProjectSettings: () => {
      setShowProjectSettings(false);
      setSelectedProjectForSettings(null);
    },
    closeSetupWizard: () => {
      setShowSetupWizard(false);
      setSelectedBoardForWizard(null);
      setIsInitialBoardSetup(false);
    },
  };
  return { modalState, modalHandlers };
}
