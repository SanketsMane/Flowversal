import { LayoutGrid, LayoutList, BarChart3 } from 'lucide-react';
import { BoardColumn } from './BoardColumn';
import { Task } from '@/core/stores/projectStore';

interface BoardTabsProps {
  filteredTasks: Task[];
  columns: { status: string; title: string; color: string }[];
  statusColors: Record<string, string>;
  priorityColors: Record<string, string>;
  statusCounts: { status: string; count: number; color: string }[];
  maxCount: number;
  view: 'kanban' | 'list' | 'chart';
  activeTab: 'active' | 'backlogs' | 'archive';
  setView: (view: 'kanban' | 'list' | 'chart') => void;
  setActiveTab: (tab: 'active' | 'backlogs' | 'archive') => void;
  handleDrop: (taskId: string, newStatus: string, targetIndex?: number) => void;
  setSelectedTask: (task: Task) => void;
  onAddTask: (status: string) => void;
  archiveTasksByMonth: Record<string, Task[]>;
  archiveFilter: 'all' | 'Done' | 'Cancelled';
  setArchiveFilter: (filter: 'all' | 'Done' | 'Cancelled') => void;
  bgCard: string;
  bgPanel: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
  hoverBg: string;
}

export function BoardTabs({
  filteredTasks,
  columns,
  statusColors,
  priorityColors,
  statusCounts,
  maxCount,
  view,
  activeTab,
  setView,
  setActiveTab,
  handleDrop,
  setSelectedTask,
  onAddTask,
  archiveTasksByMonth,
  archiveFilter,
  setArchiveFilter,
  bgCard,
  bgPanel,
  textPrimary,
  textSecondary,
  borderColor,
  hoverBg,
}: BoardTabsProps) {

  return (
    <>
      <div className="flex items-center gap-4 border-b border-white/5 mt-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-2 px-1 transition-all text-sm ${
            activeTab === 'active'
              ? 'text-[#00C6FF] border-b-2 border-[#00C6FF]'
              : `${textSecondary} hover:text-[#00C6FF]`
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab('backlogs')}
          className={`pb-2 px-1 transition-all text-sm ${
            activeTab === 'backlogs'
              ? 'text-[#00C6FF] border-b-2 border-[#00C6FF]'
              : `${textSecondary} hover:text-[#00C6FF]`
          }`}
        >
          Backlogs
        </button>
        <button
          onClick={() => setActiveTab('archive')}
          className={`pb-2 px-1 transition-all text-sm ${
            activeTab === 'archive'
              ? 'text-[#00C6FF] border-b-2 border-[#00C6FF]'
              : `${textSecondary} hover:text-[#00C6FF]`
          }`}
        >
          Archive
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setView('kanban')}
            className={`p-1.5 rounded-lg ${view === 'kanban' ? 'bg-[#00C6FF]/20 text-[#00C6FF]' : textSecondary} ${hoverBg}`}
            title="Kanban View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded-lg ${view === 'list' ? 'bg-[#00C6FF]/20 text-[#00C6FF]' : textSecondary} ${hoverBg}`}
            title="List View"
          >
            <LayoutList className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setView('chart')}
            className={`p-1.5 rounded-lg ${view === 'chart' ? 'bg-[#00C6FF]/20 text-[#00C6FF]' : textSecondary} ${hoverBg}`}
            title="Chart View"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto px-8 py-6">
        {activeTab === 'active' && view === 'kanban' && (
          <div className="inline-flex gap-4 min-w-full h-full">
                {columns
                  .filter((col) => col.status !== 'Backlog')
                  .map((column) => {
                let columnTasks = filteredTasks.filter((task) => task.status === column.status);
                if (column.status === 'Done') {
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  columnTasks = columnTasks.filter((task) => new Date(task.updatedAt) >= thirtyDaysAgo);
                }
                columnTasks = columnTasks.sort((a, b) => {
                  if (a.order !== undefined && b.order !== undefined) {
                    return a.order - b.order;
                  }
                  return 0;
                });
                return (
                    <div key={column.status} className="w-80 flex-shrink-0 h-full">
                    <BoardColumn
                      status={column.status}
                      title={column.status === 'Done' ? 'Done (30d)' : column.title}
                      tasks={columnTasks}
                      color={column.color}
                      onDrop={handleDrop}
                      onTaskClick={setSelectedTask}
                        onAddTask={
                          ['Done', 'Cancelled'].includes(column.status)
                            ? undefined
                            : onAddTask
                        }
                    />
                  </div>
                );
              })}
          </div>
        )}

        {activeTab === 'active' && view === 'list' && (
          <div className={`${bgCard} rounded-xl border ${borderColor} overflow-hidden`}>
            <table className="w-full">
              <thead className={`${bgPanel} border-b ${borderColor}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Task ID</th>
                  <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Name</th>
                  <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Priority</th>
                  <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Members</th>
                  <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Labels</th>
                  <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Workflow</th>
                  <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`border-b ${borderColor} ${hoverBg} cursor-pointer transition-colors`}
                  >
                    <td className={`px-6 py-4 text-sm ${textSecondary}`}>{task.taskId}</td>
                    <td className={`px-6 py-4 text-sm ${textPrimary}`}>{task.name}</td>
                    <td className={`px-6 py-4 text-sm ${priorityColors[task.priority]}`}>{task.priority}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center -space-x-2">
                        {task.assignedTo.slice(0, 3).map((assignee) => (
                          <div
                            key={assignee.id}
                            className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs border-2 border-[#1A1A2E]"
                            title={assignee.name}
                          >
                            {assignee.avatar}
                          </div>
                        ))}
                        {task.assignedTo.length > 3 && (
                          <div className={`w-8 h-8 rounded-full ${bgPanel} flex items-center justify-center ${textSecondary} text-xs border-2 border-[#1A1A2E]`}>
                            +{task.assignedTo.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {task.labels.slice(0, 2).map((label) => (
                          <span key={label.id} className={`${label.color} text-white px-2 py-1 rounded text-xs`}>
                            {label.name}
                          </span>
                        ))}
                        {task.labels.length > 2 && (
                          <span className={`${bgPanel} ${textSecondary} px-2 py-1 rounded text-xs`}>
                            +{task.labels.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {task.hasWorkflow && (
                        <div className="w-7 h-7 rounded bg-green-500 flex items-center justify-center">
                          <span className="text-white text-xs">WF</span>
                        </div>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-sm ${textSecondary}`}>
                      {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'backlogs' && (
          <div className="inline-flex gap-4 min-w-full h-full">
          <BoardColumn
            status="Backlog"
            title="Backlog"
            tasks={filteredTasks.filter((task) => task.status === 'Backlog')}
            color={statusColors['Backlog']}
            onDrop={handleDrop}
            onTaskClick={setSelectedTask}
            onAddTask={onAddTask}
          />
          </div>
        )}

        {activeTab === 'backlogs' && view === 'chart' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${bgCard} rounded-xl border ${borderColor} p-6`}>
              <h3 className={`${textPrimary} text-xl mb-6`}>Backlog by Priority</h3>
              <div className="space-y-4">
                {['Critical', 'High', 'Medium', 'Low'].map((priority) => {
                  const count = filteredTasks.filter((t) => t.priority === priority).length;
                  const priorityColor =
                    priority === 'Critical'
                      ? '#EF4444'
                      : priority === 'High'
                        ? '#F59E0B'
                        : priority === 'Medium'
                          ? '#FCD34D'
                          : '#9CA3AF';
                  return (
                    <div key={priority}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${textPrimary}`}>{priority}</span>
                        <span className={`text-sm ${textSecondary}`}>{count}</span>
                      </div>
                      <div className={`w-full h-8 rounded-lg ${bgPanel} overflow-hidden`}>
                        <div
                          className={`h-full transition-all`}
                          style={{
                            width: `${count > 0 ? (count / filteredTasks.length) * 100 : 0}%`,
                            backgroundColor: priorityColor,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`${bgCard} rounded-xl border ${borderColor} p-6`}>
              <h3 className={`${textPrimary} text-xl mb-6`}>Backlog Summary</h3>
              <div className="space-y-4">
                <div className={`${bgPanel} rounded-lg p-4`}>
                  <p className={`text-sm ${textSecondary} mb-1`}>Total Backlog Items</p>
                  <p className={`text-3xl ${textPrimary}`}>{filteredTasks.length}</p>
                </div>
                <div className={`${bgPanel} rounded-lg p-4`}>
                  <p className={`text-sm ${textSecondary} mb-1`}>High Priority</p>
                  <p className={`text-3xl text-orange-500`}>
                    {filteredTasks.filter((t) => t.priority === 'Critical' || t.priority === 'High').length}
                  </p>
                </div>
                <div className={`${bgPanel} rounded-lg p-4`}>
                  <p className={`text-sm ${textSecondary} mb-1`}>With Workflows</p>
                  <p className={`text-3xl text-green-500`}>
                    {filteredTasks.filter((t) => t.hasWorkflow).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'archive' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              {['all', 'Done', 'Cancelled'].map((option) => (
                <button
                  key={option}
                  onClick={() =>
                    setArchiveFilter(option === 'all' ? 'all' : (option as 'Done' | 'Cancelled'))
                  }
                  className={`px-3 py-1 rounded-full text-xs ${
                    archiveFilter === option
                      ? 'bg-[#00C6FF]/10 text-[#00C6FF]'
                      : `${textSecondary} border border-transparent hover:border-white/20`
                  }`}
                >
                  {option === 'all' ? 'All' : option}
                </button>
              ))}
            </div>
            {Object.entries(archiveTasksByMonth)
              .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
              .map(([month, tasks]) => {
                const visibleTasks =
                  archiveFilter === 'all' ? tasks : tasks.filter((task) => task.status === archiveFilter);
                if (visibleTasks.length === 0) return null;
                return (
                  <div key={month}>
                    <h3 className={`${textPrimary} text-xl mb-4`}>{month}</h3>
                    <div className={`${bgCard} rounded-xl border ${borderColor} overflow-hidden`}>
                      <table className="w-full">
                        <thead className={`${bgPanel} border-b ${borderColor}`}>
                          <tr>
                            <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Task ID</th>
                            <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Name</th>
                            <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Priority</th>
                            <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Status</th>
                            <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Members</th>
                            <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Labels</th>
                            <th className={`px-6 py-4 text-left text-sm ${textSecondary}`}>Completed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleTasks.map((task) => (
                            <tr
                              key={task.id}
                              onClick={() => setSelectedTask(task)}
                              className={`border-b ${borderColor} ${hoverBg} cursor-pointer transition-colors`}
                            >
                              <td className={`px-6 py-4 text-sm ${textSecondary}`}>{task.taskId}</td>
                              <td className={`px-6 py-4 text-sm ${textPrimary}`}>{task.name}</td>
                              <td className={`px-6 py-4 text-sm ${priorityColors[task.priority]}`}>{task.priority}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[task.status] }} />
                                  <span className={`text-sm ${textPrimary}`}>{task.status}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center -space-x-2">
                                  {task.assignedTo.slice(0, 3).map((assignee) => (
                                    <div
                                      key={assignee.id}
                                      className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs border-2 border-[#1A1A2E]"
                                      title={assignee.name}
                                    >
                                      {assignee.avatar}
                                    </div>
                                  ))}
                                  {task.assignedTo.length > 3 && (
                                    <div className={`w-8 h-8 rounded-full ${bgPanel} flex items-center justify-center ${textSecondary} text-xs border-2 border-[#1A1A2E]`}>
                                      +{task.assignedTo.length - 3}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-1 flex-wrap">
                                  {task.labels.slice(0, 2).map((label) => (
                                    <span key={label.id} className={`${label.color} text-white px-2 py-1 rounded text-xs`}>
                                      {label.name}
                                    </span>
                                  ))}
                                  {task.labels.length > 2 && (
                                    <span className={`${bgPanel} ${textSecondary} px-2 py-1 rounded text-xs`}>
                                      +{task.labels.length - 2}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className={`px-6 py-4 text-sm ${textSecondary}`}>
                                {new Date(task.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </>
  );
}

