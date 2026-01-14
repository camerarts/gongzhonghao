import React from 'react';

interface SidebarProps {
  onNewProject: () => void;
  onOpenProjectManager: () => void;
  onOpenSettings: () => void;
  activeView?: 'editor' | 'manager';
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onNewProject, 
  onOpenProjectManager, 
  onOpenSettings,
  activeView = 'editor'
}) => {
  return (
    <div className="w-16 md:w-20 h-full bg-slate-900 flex flex-col items-center py-6 shadow-2xl z-50 flex-shrink-0 border-r border-slate-800">
      
      {/* Brand Icon */}
      <div className="mb-8 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg shadow-indigo-500/30">
        W
      </div>

      {/* Main Actions */}
      <div className="flex flex-col gap-4 w-full px-2">
        
        {/* New Project */}
        <button 
          onClick={onNewProject}
          className="group relative w-full aspect-square rounded-xl bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center shadow-lg border border-slate-700 hover:border-indigo-500"
          title="新建项目"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          
          {/* Tooltip */}
          <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-slate-700 shadow-xl transition-opacity z-50">
            新建项目
          </span>
        </button>

        {/* Project Manager */}
        <button 
          onClick={onOpenProjectManager}
          className={`
            group relative w-full aspect-square rounded-xl transition-all flex items-center justify-center border
            ${activeView === 'manager' 
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/30' 
              : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-800 hover:text-white'}
          `}
          title="项目管理"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          
          <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-slate-700 shadow-xl transition-opacity z-50">
            项目管理
          </span>
        </button>

      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Bottom Actions */}
      <div className="w-full px-2 flex flex-col gap-4">
        {/* Settings */}
        <button 
          onClick={onOpenSettings}
          className="group relative w-full aspect-square rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center"
          title="设置"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-slate-700 shadow-xl transition-opacity z-50">
            系统设置
          </span>
        </button>
      </div>

    </div>
  );
};

export default Sidebar;