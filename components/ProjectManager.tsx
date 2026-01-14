import React, { useState } from 'react';
import { Project } from '../types';

interface ProjectManagerProps {
  isOpen: boolean;
  mode: 'list' | 'create';
  projects: Project[];
  currentProjectId: string | null;
  onClose: () => void;
  onCreateProject: (name: string) => void;
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  isOpen,
  mode: initialMode,
  projects,
  currentProjectId,
  onClose,
  onCreateProject,
  onSelectProject,
  onDeleteProject
}) => {
  const [mode, setMode] = useState<'list' | 'create'>(initialMode);
  const [newProjectName, setNewProjectName] = useState('');

  // Sync internal mode if prop changes when opening
  React.useEffect(() => {
    if (isOpen) {
        setMode(initialMode);
        setNewProjectName('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onCreateProject(newProjectName.trim());
    setNewProjectName('');
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('zh-CN', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/50 bg-white/40 flex justify-between items-center">
          <div className="flex gap-4">
            <h3 className={`font-bold text-lg cursor-pointer transition-colors ${mode === 'list' ? 'text-slate-800' : 'text-slate-400'}`} onClick={() => setMode('list')}>
              项目管理
            </h3>
            <div className="w-px h-6 bg-slate-300"></div>
            <h3 className={`font-bold text-lg cursor-pointer transition-colors ${mode === 'create' ? 'text-indigo-600' : 'text-slate-400'}`} onClick={() => setMode('create')}>
              新建项目
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {mode === 'create' ? (
            <div className="flex flex-col items-center justify-center h-full py-10">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">创建一个新项目</h2>
              <p className="text-slate-500 mb-8 text-center max-w-xs">新项目将清空当前画布，为您提供一个全新的创作空间。</p>
              
              <form onSubmit={handleCreateSubmit} className="w-full max-w-md">
                <input
                  autoFocus
                  type="text"
                  placeholder="请输入项目名称 (例如: 2024 AI趋势分析)"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white text-lg shadow-sm mb-4"
                />
                <button
                  type="submit"
                  disabled={!newProjectName.trim()}
                  className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  立即创建
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.length === 0 ? (
                 <div className="text-center py-12 text-slate-400">
                    <p>暂无项目，点击右上角“新建”开始创作。</p>
                 </div>
              ) : (
                projects.map(project => (
                  <div 
                    key={project.id}
                    onClick={() => onSelectProject(project.id)}
                    className={`
                      group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md
                      ${currentProjectId === project.id 
                        ? 'bg-white border-indigo-500 ring-1 ring-indigo-500 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-indigo-300'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentProjectId === project.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                      </div>
                      <div>
                        <h4 className={`font-bold ${currentProjectId === project.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                          {project.name}
                        </h4>
                        <div className="flex gap-3 text-xs text-slate-400 mt-1">
                          <span>{project.segments.length} 个片段</span>
                          <span>•</span>
                          <span>{formatDate(project.lastModified)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Delete Button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if(confirm('确定要删除这个项目吗？无法恢复。')) {
                            onDeleteProject(project.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="删除项目"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectManager;