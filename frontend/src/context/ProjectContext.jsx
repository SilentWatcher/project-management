import { createContext, useContext, useState, useCallback } from 'react';
import { projectService } from '../services/projectService';

const ProjectContext = createContext();

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await projectService.getProjects();
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addProject = useCallback((project) => {
    setProjects((prev) => [project, ...prev]);
  }, []);

  const value = {
    projects,
    loading,
    loadProjects,
    addProject,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};
