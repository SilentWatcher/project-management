import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  Settings,
  X,
  Plus,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, loading, loadProjects } = useProjects();

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'My Tasks', href: '/my-tasks', icon: CheckSquare },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
  ];

  const handleCreateProject = () => {
    navigate('/projects/new');
    onClose();
  };

  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <FolderKanban className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">TaskFlow</span>
          </NavLink>
          <button
            type="button"
            className="lg:hidden -m-2.5 p-2.5 text-gray-700"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col overflow-y-auto py-4 px-3">
          {/* Main navigation */}
          <ul role="list" className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  end={item.href === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Projects section */}
          <div className="mt-8">
            <button
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold text-gray-900"
            >
              <span>Projects</span>
              {projectsExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {projectsExpanded && (
              <ul role="list" className="mt-1 space-y-1">
                {loading ? (
                  <li className="px-3 py-2 text-sm text-gray-500">Loading...</li>
                ) : (
                  <>
                    {projects.map((project) => (
                      <li key={project._id}>
                        <NavLink
                          to={`/projects/${project._id}`}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-primary-50 text-primary-600'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }`
                          }
                        >
                          <span className="h-2 w-2 rounded-full bg-primary-400" />
                          <span className="truncate">{project.name}</span>
                        </NavLink>
                      </li>
                    ))}
                    <li>
                      <button
                        onClick={handleCreateProject}
                        className="flex w-full items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      >
                        <Plus className="h-4 w-4" />
                        <span>New Project</span>
                      </button>
                    </li>
                  </>
                )}
              </ul>
            )}
          </div>
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-x-3">
            {user?.avatar ? (
              <img
                className="h-8 w-8 rounded-full bg-gray-50"
                src={user.avatar}
                alt={user.name}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
