import { AdminApp } from '@/apps/admin/AdminApp';
import { DocsApp } from '@/apps/docs';
import { MarketingApp } from '@/apps/marketing/MarketingApp';
import { AuthProvider, useAuth } from '@/core/auth/AuthContext';
import { I18nProvider } from '@/core/i18n';
import { detectDomain } from '@/core/routing/domainDetector';
import { ModalProvider } from '@/core/stores/ModalContext';
import { useProjectStore } from '@/core/stores/projectStore';
import { SubscriptionProvider } from '@/core/stores/SubscriptionContext';
import { ThemeProvider } from '@/core/theme/ThemeContext';
import { AIApps } from '@/features/ai/components/AIApps';
import { Chat } from '@/features/ai/components/Chat';
import { AuthRequired } from '@/features/auth/components/AuthRequired';
import { ResetPassword } from '@/features/auth/components/ResetPassword';
import { Categories } from '@/features/dashboard/components/Categories';
import { Dashboard } from '@/features/dashboard/components/Dashboard';
import { Drive } from '@/features/dashboard/components/Drive';
import { Favorites } from '@/features/dashboard/components/Favorites';
import { MyWorkflows } from '@/features/dashboard/components/MyWorkflows';
import { Projects } from '@/features/projects/components/ProjectsEnhanced';
import { AttachToTaskModal } from '@/features/tasks/components/AttachToTaskModal';
import { TaskDetailModal } from '@/features/tasks/components/TaskDetailModal';
import { TemplateLibrary } from '@/features/templates/components/TemplateLibrary';
import { DeleteConfirmationModal } from '@/features/workflow-builder/components/modals/DeleteConfirmationModal';
import { CreateWorkflowModal } from '@/features/workflows/components/CreateWorkflowModal';
import { Onboarding } from '@/pages/Onboarding';
import { CategoryPanel } from '@/shared/components/layout/CategoryPanel';
import { DataInitializer } from '@/shared/components/layout/DataInitializer';
import { MobileNav } from '@/shared/components/layout/MobileNav';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { Support } from '@/shared/components/layout/Support';
import { TopNavBar } from '@/shared/components/layout/TopNavBar';
import { ChangePasswordModal } from '@/shared/components/ui/ChangePasswordModal';
import { ConfirmationPopup } from '@/shared/components/ui/ConfirmationPopup';
import { GlobalModal } from '@/shared/components/ui/GlobalModal';
import { SettingsDropdown } from '@/shared/components/ui/SettingsDropdown';
import { Subscription } from '@/shared/components/ui/Subscription';
import { UpdateProfileModal } from '@/shared/components/ui/UpdateProfileModal';
import { UserGuide } from '@/shared/components/ui/UserGuide';
import { Toaster } from '@/shared/lib/ui/sonner';
import { WorkflowProvider } from '@/shared/lib/WorkflowContext';
import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// Lazy load the heavy WorkflowBuilder component
const WorkflowBuilder = lazy(() => import('@/features/workflow-builder/components/WorkflowBuilder').then(module => ({ default: module.WorkflowBuilder })));
// Loading fallback for WorkflowBuilder
const WorkflowBuilderLoadingFallback = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl">
      <div className="flex items-center space-x-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading Workflow Builder</h3>
          <p className="text-gray-600 dark:text-gray-300">Please wait while we prepare your workspace...</p>
        </div>
      </div>
    </div>
  </div>
);
// Separate component for authenticated dashboard to avoid hook ordering issues
function AuthenticatedDashboard() {
  const auth = useAuth();
  // Dashboard state
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('ai-apps');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  // Modals and dropdowns
  const [showSubscription, setShowSubscription] = useState(false);
  const [subscriptionTab, setSubscriptionTab] = useState<'plans' | 'overview'>('plans');
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [showAttachToTask, setShowAttachToTask] = useState(false);
  const [showCreateTaskWithWorkflow, setShowCreateTaskWithWorkflow] = useState(false);
  const [selectedWorkflowForAttach, setSelectedWorkflowForAttach] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [templateGalleryTrigger, setTemplateGalleryTrigger] = useState(0);
  const [deepLinkTarget, setDeepLinkTarget] = useState<{
    projectName: string;
    boardName: string;
    taskId: string;
  } | null>(null);
  const [lastAppPath, setLastAppPath] = useState<string | null>(null);
  const isWorkflowBuilderRoute =
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/workflow-builder');
  // Get project store data for task management (safe to call here - no conditional returns)
  const projectStoreData = useProjectStore();
  const workflowBuilderElement = useMemo(() => (
    <Suspense fallback={<WorkflowBuilderLoadingFallback />}>
      <WorkflowBuilder
        isOpen={showWorkflowBuilder}
        onClose={() => setShowWorkflowBuilder(false)}
        workflowData={workflowData}
        onNavigate={(page) => setCurrentPage(page)}
      />
    </Suspense>
  ), [showWorkflowBuilder, workflowData]);
  // Auth handlers
  const handleLogin = () => {
    // Auth is handled by the login component using auth context
    // Just needs to trigger re-render
  };
  const handleLogout = async () => {
    await auth.logout();
    setCurrentPage('ai-apps');
    setSelectedWorkflow(null);
  };
  // Handler functions
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedWorkflow(null);
    if (page !== 'categories') {
      setIsCategoryPanelOpen(false);
      setSelectedCategory(null);
    }
  };
  const handleWorkflowClick = (name: string) => {
    // If this is a template from the library, open the workflow builder
    // The template data has already been loaded into stores by TemplateLibrary
    if (name === '__TEMPLATE_FROM_LIBRARY__') {
      setShowWorkflowBuilder(true);
    }
    // If this is an edit action, open the workflow builder
    // The workflow data has already been loaded into stores by handleEdit
    else if (name === '__EDIT_WORKFLOW__') {
      setShowWorkflowBuilder(true);
    }
  };
  // Listen for workflow builder open events from chat
  useEffect(() => {
    const handleOpenWorkflowBuilder = (event: CustomEvent) => {
      const { workflowData, workflowName } = event.detail;
      if (workflowData) {
        navigateToWorkflowBuilder(workflowData);
      }
    };
    window.addEventListener('openWorkflowBuilder', handleOpenWorkflowBuilder as EventListener);
    return () => {
      window.removeEventListener('openWorkflowBuilder', handleOpenWorkflowBuilder as EventListener);
    };
  }, []);
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage('categories');
    setIsCategoryPanelOpen(false);
  };
  const handleCategoryPanelToggle = (isOpen: boolean) => {
    setIsCategoryPanelOpen(isOpen);
  };
  const handleSidebarCollapseChange = (isCollapsed: boolean) => {
    setIsSidebarCollapsed(isCollapsed);
  };
  const handleAppsClick = () => {
    setCurrentPage('ai-apps');
    setSelectedWorkflow(null);
    setIsCategoryPanelOpen(false);
    setSelectedCategory(null);
  };
  const handleWorkflowPlusClick = (workflow: any, action: 'create' | 'attach') => {
    setSelectedWorkflowForAttach(workflow);
    if (action === 'create') {
      // Open TaskDetailModal to create a new task with the workflow attached
      setShowCreateTaskWithWorkflow(true);
    } else if (action === 'attach') {
      // Open AttachToTaskModal to attach workflow to existing task
      setShowAttachToTask(true);
    }
  };
  const handleChatClick = () => {
    setCurrentPage('chat');
    setSelectedWorkflow(null);
    setIsCategoryPanelOpen(false);
    setSelectedCategory(null);
  };
  const handleUpgradeClick = () => {
    setSubscriptionTab('plans');
    setShowSubscription(true);
  };
  const handleSubscriptionClick = () => {
    setSubscriptionTab('overview');
    setShowSubscription(true);
  };
  const handleSettingsClick = () => {
    setShowSettingsDropdown(!showSettingsDropdown);
  };
  const handleProfileClick = () => {
    setShowUpdateProfile(true);
  };
  const handleUserGuideClick = () => {
    setShowUserGuide(true);
  };
  const handleSupportClick = () => {
    setCurrentPage('support');
  };
  const handleOpenProjectTemplates = () => {
    setCurrentPage('projects');
    setSelectedWorkflow(null);
    setIsCategoryPanelOpen(false);
    setSelectedCategory(null);
    // Trigger the template gallery modal
    setTemplateGalleryTrigger(prev => prev + 1);
  };
  const closeTemplateLibraryIfOpen = () => {
    const templateStore = require('./features/templates/store/templateStore').useTemplateStore.getState();
    templateStore.closeTemplateLibrary();
  };
  const navigateToWorkflowBuilder = (data?: any) => {
    if (data) setWorkflowData(data);
    const currentPath = window.location.pathname || '/';
    if (currentPath !== '/workflow-builder') {
      setLastAppPath(currentPath);
    }
    window.history.pushState({}, '', '/workflow-builder');
    setCurrentPage('workflow-builder');
    setShowWorkflowBuilder(true);
  };
  const handleCreateClick = () => {
    setShowCreateWorkflow(true);
  };
  const handleCreateWorkflow = (data: any) => {
    setWorkflowData(data);
    setShowCreateWorkflow(false);
    navigateToWorkflowBuilder(data);
  };
  const handleStartWorkflow = (data: any) => {
    setWorkflowData(data);
    setShowCreateWorkflow(false);
    navigateToWorkflowBuilder(data);
  };
  const handleOpenTemplateLibraryFromDashboard = () => {
    // Set the template install callback before opening the library
    const { setInstallCallback, openTemplateLibrary } = require('./features/templates/store/templateStore').useTemplateStore.getState();
    setInstallCallback((templateData: any) => {
      closeTemplateLibraryIfOpen();
      setWorkflowData(templateData);
      navigateToWorkflowBuilder(templateData);
    });
    openTemplateLibrary();
  };
  // Detect deep links shaped as /Project Name/Board Name/Task ID
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (parts.length < 3) return;
    const [projectSlug, boardSlug, taskSlug] = parts;
    setDeepLinkTarget({
      projectName: decodeURIComponent(projectSlug),
      boardName: decodeURIComponent(boardSlug),
      taskId: decodeURIComponent(taskSlug),
    });
    setCurrentPage('projects');
  }, []);
  const handleCloseWorkflowBuilder = () => {
    setShowWorkflowBuilder(false);
    setWorkflowData(null);
    const targetPath = lastAppPath || '/';
    window.history.pushState({}, '', targetPath);
    setCurrentPage('ai-apps');
  };
  if (isWorkflowBuilderRoute) {
    return (
      <>
        <TopNavBar
          onChatClick={handleChatClick}
          onSubscriptionClick={handleSubscriptionClick}
          onMobileMenuClick={() => setShowMobileNav(true)}
        />
        <Suspense fallback={<WorkflowBuilderLoadingFallback />}>
          <WorkflowBuilder
            isOpen={true}
            onClose={handleCloseWorkflowBuilder}
            workflowData={workflowData}
            onNavigate={(page) => setCurrentPage(page)}
          />
        </Suspense>
      </>
    );
  }
  const getMainContentMargin = () => {
    if (isCategoryPanelOpen && isSidebarCollapsed) return 'ml-0 lg:ml-[360px]';
    if (isCategoryPanelOpen && !isSidebarCollapsed) return 'ml-0 lg:ml-[500px]';
    if (isSidebarCollapsed) return 'ml-0 lg:ml-[140px]';
    return 'ml-0 lg:ml-[220px]';
  };
  // Prepare all tasks for the attach modal (uses data from useProjectStore hook above)
  const allTasks = Object.values(projectStoreData.tasks).map(task => ({
    id: task.taskId || task.id,
    name: task.name,
    projectName: projectStoreData.projects.find(p => p.id === task.projectId)?.name,
    boardName: projectStoreData.boards.find(b => b.id === task.boardId)?.name
  }));
  const handleAttachWorkflowToTask = (taskId: string) => {
    // Find the task and update it with the workflow
    const task = Object.values(projectStoreData.tasks).find(t => 
      (t.taskId === taskId || t.id === taskId)
    );
    if (task && selectedWorkflowForAttach) {
      const updatedTask = {
        ...task,
        workflows: [
          ...(task.workflows || []),
          {
            id: Date.now().toString(),
            workflowId: `WF-${Date.now()}`,
            name: selectedWorkflowForAttach.name,
            category: selectedWorkflowForAttach.category || 'General',
            description: selectedWorkflowForAttach.description
          }
        ],
        hasWorkflow: true
      };
      // Update task in store
      useProjectStore.getState().updateTask(task.id, updatedTask);
      setConfirmationMessage(`Workflow "${selectedWorkflowForAttach.name}" attached to task successfully!`);
      setShowConfirmation(true);
    } else {
      setConfirmationMessage('Task not found. Please check the Task ID and try again.');
      setShowConfirmation(true);
    }
  };
  const handleCreateTaskWithWorkflow = (taskId: string, taskData: any) => {
    // This is handled by TaskDetailModal's onUpdate
    setShowCreateTaskWithWorkflow(false);
  };
  const GlobalModals = () => (
    <>
      <MobileNav
        isOpen={showMobileNav}
        onClose={() => setShowMobileNav(false)}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        onAppsClick={handleAppsClick}
        onUpgradeClick={handleUpgradeClick}
        onSettingsClick={handleSettingsClick}
        onLogoutClick={handleLogout}
        onCreateClick={handleCreateClick}
      />
      <CreateWorkflowModal
        isOpen={showCreateWorkflow}
        onClose={() => setShowCreateWorkflow(false)}
        onCreateWorkflow={handleCreateWorkflow}
        onStartWorkflow={handleStartWorkflow}
      />
      <UserGuide isOpen={showUserGuide} onClose={() => setShowUserGuide(false)} />
      <SettingsDropdown
        isOpen={showSettingsDropdown}
        onClose={() => setShowSettingsDropdown(false)}
        onProfileClick={handleProfileClick}
        onSubscriptionClick={handleSubscriptionClick}
        onUserGuideClick={handleUserGuideClick}
        onSupportClick={handleSupportClick}
      />
      <UpdateProfileModal isOpen={showUpdateProfile} onClose={() => setShowUpdateProfile(false)} />
      <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
      <Subscription 
        isOpen={showSubscription} 
        onClose={() => setShowSubscription(false)} 
        initialTab={subscriptionTab}
      />
      <TemplateLibrary />
      <DeleteConfirmationModal />
      {/* Attach Workflow to Task Modal */}
      <AttachToTaskModal
        isOpen={showAttachToTask}
        onClose={() => {
          setShowAttachToTask(false);
          setSelectedWorkflowForAttach(null);
        }}
        workflowName={selectedWorkflowForAttach?.name || ''}
        onAttach={handleAttachWorkflowToTask}
        availableTasks={allTasks}
      />
      {/* Create Task with Workflow Modal */}
      {showCreateTaskWithWorkflow && selectedWorkflowForAttach && (
        <TaskDetailModal
          task={{
            id: `new-${Date.now()}`,
            name: '',
            status: 'To do',
            assignee: '',
            avatar: '',
            projectId: projectStoreData.projects[0]?.id || '',
            boardId: projectStoreData.boards[0]?.id || ''
          }}
          onClose={() => {
            setShowCreateTaskWithWorkflow(false);
            setSelectedWorkflowForAttach(null);
          }}
          onUpdate={(taskId, taskData) => {
            // Create new task with workflow attached
            const newTask = {
              id: taskId,
              taskId: `TSK-${taskId.slice(0, 6).toUpperCase()}`,
              ...taskData,
              workflows: [
                {
                  id: Date.now().toString(),
                  workflowId: `WF-${Date.now()}`,
                  name: selectedWorkflowForAttach.name,
                  category: selectedWorkflowForAttach.category || 'General',
                  description: selectedWorkflowForAttach.description
                }
              ],
              hasWorkflow: true
            };
            // Add task to store
            useProjectStore.getState().addTask(newTask.boardId, newTask);
            setShowCreateTaskWithWorkflow(false);
            setSelectedWorkflowForAttach(null);
            setConfirmationMessage(`Task created with workflow "${selectedWorkflowForAttach.name}" attached!`);
            setShowConfirmation(true);
          }}
          onDelete={() => {}}
          preAttachedWorkflow={{
            name: selectedWorkflowForAttach.name,
            category: selectedWorkflowForAttach.category || 'General',
            description: selectedWorkflowForAttach.description
          }}
        />
      )}
      {/* Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        message={confirmationMessage}
      />
    </>
  );
  if (currentPage === 'support') {
    return (
      <>
        <TopNavBar onChatClick={handleChatClick} onSubscriptionClick={handleSubscriptionClick} onMobileMenuClick={() => setShowMobileNav(true)} />
        <div className="hidden lg:block">
          <Sidebar onNavigate={handleNavigate} currentPage={currentPage} onCategoryPanelToggle={handleCategoryPanelToggle} onCollapseChange={handleSidebarCollapseChange} onAppsClick={handleAppsClick} onUpgradeClick={handleUpgradeClick} onSettingsClick={handleSettingsClick} onLogoutClick={handleLogout} onCreateClick={handleCreateClick} />
        </div>
        <GlobalModals />
        {workflowBuilderElement}
        <div className={`ml-0 lg:${isSidebarCollapsed ? 'ml-[140px]' : 'ml-[220px]'} transition-all duration-300`}>
          <Support />
        </div>
      </>
    );
  }
  if (currentPage === 'chat') {
    return (
      <>
        <TopNavBar onChatClick={handleChatClick} onSubscriptionClick={handleSubscriptionClick} onMobileMenuClick={() => setShowMobileNav(true)} />
        <div className="hidden lg:block">
          <Sidebar onNavigate={handleNavigate} currentPage={currentPage} onCategoryPanelToggle={handleCategoryPanelToggle} onCollapseChange={handleSidebarCollapseChange} onAppsClick={handleAppsClick} onUpgradeClick={handleUpgradeClick} onSettingsClick={handleSettingsClick} onLogoutClick={handleLogout} onCreateClick={handleCreateClick} />
        </div>
        <GlobalModals />
        {workflowBuilderElement}
        <CategoryPanel isOpen={isCategoryPanelOpen} onClose={() => setIsCategoryPanelOpen(false)} onCategoryClick={handleCategoryClick} isSidebarCollapsed={isSidebarCollapsed} />
        <div className={`${getMainContentMargin()} mt-16 transition-all duration-300 h-[calc(100vh-4rem)]`}>
          <Chat />
        </div>
      </>
    );
  }
  if (currentPage === 'favorites') {
    return (
      <>
        <TopNavBar onChatClick={handleChatClick} onSubscriptionClick={handleSubscriptionClick} onMobileMenuClick={() => setShowMobileNav(true)} />
        <div className="hidden lg:block">
          <Sidebar onNavigate={handleNavigate} currentPage={currentPage} onCategoryPanelToggle={handleCategoryPanelToggle} onCollapseChange={handleSidebarCollapseChange} onAppsClick={handleAppsClick} onUpgradeClick={handleUpgradeClick} onSettingsClick={handleSettingsClick} onLogoutClick={handleLogout} onCreateClick={handleCreateClick} />
        </div>
        <GlobalModals />
        {workflowBuilderElement}
        <CategoryPanel isOpen={isCategoryPanelOpen} onClose={() => setIsCategoryPanelOpen(false)} onCategoryClick={handleCategoryClick} isSidebarCollapsed={isSidebarCollapsed} />
        <div className={`${getMainContentMargin()} transition-all duration-300`}>
          <Favorites onWorkflowClick={handleWorkflowClick} onWorkflowPlusClick={handleWorkflowPlusClick} />
        </div>
      </>
    );
  }
  if (currentPage === 'my-workflows') {
    return (
      <>
        <TopNavBar onChatClick={handleChatClick} onSubscriptionClick={handleSubscriptionClick} onMobileMenuClick={() => setShowMobileNav(true)} />
        <div className="hidden lg:block">
          <Sidebar onNavigate={handleNavigate} currentPage={currentPage} onCategoryPanelToggle={handleCategoryPanelToggle} onCollapseChange={handleSidebarCollapseChange} onAppsClick={handleAppsClick} onUpgradeClick={handleUpgradeClick} onSettingsClick={handleSettingsClick} onLogoutClick={handleLogout} onCreateClick={handleCreateClick} />
        </div>
        <GlobalModals />
        {workflowBuilderElement}
        <CategoryPanel isOpen={isCategoryPanelOpen} onClose={() => setIsCategoryPanelOpen(false)} onCategoryClick={handleCategoryClick} isSidebarCollapsed={isSidebarCollapsed} />
        <div className={`${getMainContentMargin()} transition-all duration-300`}>
          <MyWorkflows onWorkflowClick={handleWorkflowClick} onWorkflowPlusClick={handleWorkflowPlusClick} onCreateClick={handleCreateClick} />
        </div>
      </>
    );
  }
  if (currentPage === 'drive') {
    return (
      <>
        <TopNavBar onChatClick={handleChatClick} onSubscriptionClick={handleSubscriptionClick} onMobileMenuClick={() => setShowMobileNav(true)} />
        <div className="hidden lg:block">
          <Sidebar onNavigate={handleNavigate} currentPage={currentPage} onCategoryPanelToggle={handleCategoryPanelToggle} onCollapseChange={handleSidebarCollapseChange} onAppsClick={handleAppsClick} onUpgradeClick={handleUpgradeClick} onSettingsClick={handleSettingsClick} onLogoutClick={handleLogout} onCreateClick={handleCreateClick} />
        </div>
        <GlobalModals />
        {workflowBuilderElement}
        <div className={`ml-0 lg:${isSidebarCollapsed ? 'ml-[140px]' : 'ml-[220px]'} mt-16 transition-all duration-300`}>
          <Drive />
        </div>
      </>
    );
  }
  if (currentPage === 'projects') {
    return (
      <>
        <TopNavBar onChatClick={handleChatClick} onSubscriptionClick={handleSubscriptionClick} onMobileMenuClick={() => setShowMobileNav(true)} />
        <div className="hidden lg:block">
          <Sidebar onNavigate={handleNavigate} currentPage={currentPage} onCategoryPanelToggle={handleCategoryPanelToggle} onCollapseChange={handleSidebarCollapseChange} onAppsClick={handleAppsClick} onUpgradeClick={handleUpgradeClick} onSettingsClick={handleSettingsClick} onLogoutClick={handleLogout} onCreateClick={handleCreateClick} />
        </div>
        <GlobalModals />
        {workflowBuilderElement}
        <div className={`ml-0 lg:${isSidebarCollapsed ? 'ml-[140px]' : 'ml-[220px]'} mt-16 transition-all duration-300`}>
          <Projects
            externalTemplateGalleryTrigger={templateGalleryTrigger}
            deepLinkTarget={deepLinkTarget || undefined}
          />
        </div>
      </>
    );
  }
  if (currentPage === 'ai-apps') {
    return (
      <>
        <TopNavBar onChatClick={handleChatClick} onSubscriptionClick={handleSubscriptionClick} onMobileMenuClick={() => setShowMobileNav(true)} />
        <div className="hidden lg:block">
          <Sidebar onNavigate={handleNavigate} currentPage={currentPage} onCategoryPanelToggle={handleCategoryPanelToggle} onCollapseChange={handleSidebarCollapseChange} onAppsClick={handleAppsClick} onUpgradeClick={handleUpgradeClick} onSettingsClick={handleSettingsClick} onLogoutClick={handleLogout} onCreateClick={handleCreateClick} />
        </div>
        <GlobalModals />
        {workflowBuilderElement}
        <AIApps 
          onWorkflowClick={handleWorkflowClick} 
          onWorkflowPlusClick={handleWorkflowPlusClick}
          isSidebarCollapsed={isSidebarCollapsed}
          onCreateClick={() => setShowCreateWorkflow(true)}
        />
      </>
    );
  }
  if (currentPage === 'categories') {
    return (
      <>
        <TopNavBar onChatClick={handleChatClick} onSubscriptionClick={handleSubscriptionClick} onMobileMenuClick={() => setShowMobileNav(true)} />
        <div className="hidden lg:block">
          <Sidebar onNavigate={handleNavigate} currentPage={currentPage} onCategoryPanelToggle={handleCategoryPanelToggle} onCollapseChange={handleSidebarCollapseChange} onAppsClick={handleAppsClick} onUpgradeClick={handleUpgradeClick} onSettingsClick={handleSettingsClick} onLogoutClick={handleLogout} onCreateClick={handleCreateClick} />
        </div>
        <GlobalModals />
        {workflowBuilderElement}
        <CategoryPanel isOpen={isCategoryPanelOpen} onClose={() => setIsCategoryPanelOpen(false)} onCategoryClick={handleCategoryClick} isSidebarCollapsed={isSidebarCollapsed} />
        <div className={`${getMainContentMargin()} transition-all duration-300`}>
          <Categories selectedCategory={selectedCategory || undefined} onWorkflowClick={handleWorkflowClick} />
        </div>
      </>
    );
  }
  return (
    <>
      <TopNavBar onChatClick={handleChatClick} onSubscriptionClick={handleSubscriptionClick} onMobileMenuClick={() => setShowMobileNav(true)} />
      <div className="hidden lg:block">
        <Sidebar onNavigate={handleNavigate} currentPage={currentPage} onCategoryPanelToggle={handleCategoryPanelToggle} onCollapseChange={handleSidebarCollapseChange} onAppsClick={handleAppsClick} onUpgradeClick={handleUpgradeClick} onSettingsClick={handleSettingsClick} onLogoutClick={handleLogout} onCreateClick={handleCreateClick} />
      </div>
      <GlobalModals />
      {workflowBuilderElement}
      <CategoryPanel isOpen={isCategoryPanelOpen} onClose={() => setIsCategoryPanelOpen(false)} onCategoryClick={handleCategoryClick} isSidebarCollapsed={isSidebarCollapsed} />
      <div className={`${getMainContentMargin()} transition-all duration-300`}>
        <Dashboard 
          onCreateWorkflow={handleCreateClick}
          onOpenTemplateLibrary={handleOpenTemplateLibraryFromDashboard}
          onOpenProjectTemplates={handleOpenProjectTemplates}
        />
      </div>
    </>
  );
}
// App domain component - requires authentication
function AppDomain() {
  const auth = useAuth();

  // Show loading while auth is initializing
  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  // 🚨 CRITICAL: Check for recovery flow AFTER auth loads (so we can override authenticated state)
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const isRecoveryFlow = hashParams.get('access_token') && hashParams.get('type') === 'recovery';
  // If recovery flow detected, show reset password (OVERRIDES auth state)
  if (isRecoveryFlow) {
    return <ResetPassword />;
  }
  // Normal authentication flow
  if (!auth.isAuthenticated) {
    return <AuthRequired />;
  }
  // Check onboarding status
  if (auth.user && !auth.user.onboardingCompleted) {
    return <Onboarding onComplete={() => {
      window.location.reload();
    }} />;
  }
  return <AuthenticatedDashboard />;
}
// Root router - handles domain-based routing WITHOUT using hooks
function DomainRouter() {
  const domain = detectDomain();
  // Route to appropriate app based on domain
  if (domain === 'admin') {
    return (
      <ThemeProvider>
        <AdminApp />
      </ThemeProvider>
    );
  }
  if (domain === 'marketing') {
    return (
      <ThemeProvider>
        <MarketingApp />
      </ThemeProvider>
    );
  }
  if (domain === 'docs') {
    return (
      <ThemeProvider>
        <DocsApp />
      </ThemeProvider>
    );
  }
  // Default to app domain (requires auth)
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <WorkflowProvider>
            <ModalProvider>
              <DndProvider backend={HTML5Backend}>
                <DataInitializer>
                  <AppDomain />
                  <TemplateLibrary />
                  <GlobalModal />
                  <Toaster />
                </DataInitializer>
              </DndProvider>
            </ModalProvider>
          </WorkflowProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
export default function App() {
  return (
    <I18nProvider>
      <DomainRouter />
    </I18nProvider>
  );
}