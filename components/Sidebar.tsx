import React, { useState } from 'react';

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
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper for menu items
  const MenuItem = ({ 
    icon, 
    label, 
    onClick, 
    isActive = false, 
    shortcut = null,
    isPrimary = false
  }: { 
    icon: React.ReactNode, 
    label: string, 
    onClick: () => void, 
    isActive?: boolean,
    shortcut?: string | null,
    isPrimary?: boolean
  }) => (
    <button 
      onClick={onClick}
      className={`
        group relative flex items-center gap-3 px-3 py-3 w-full rounded-xl transition-all duration-200
        ${isActive 
          ? 'bg-indigo-600/10 text-indigo-400' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
        ${isPrimary && !isActive ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:text-white shadow-lg shadow-indigo-900/20' : ''}
      `}
      title={!isExpanded ? label : ''}
    >
      <div className={`flex-shrink-0 flex items-center justify-center w-6 h-6 ${isActive ? 'text-indigo-400' : ''}`}>
        {icon}
      </div>
      
      <div className={`flex-1 text-left whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
        <span className="font-medium text-sm">{label}</span>
      </div>

      {/* Expanded Shortcut Hint */}
      {shortcut && isExpanded && (
        <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
          {shortcut}
        </span>
      )}

      {/* Collapsed Tooltip */}
      {!isExpanded && (
        <span className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-slate-700 shadow-xl transition-all z-50">
          {label} {shortcut && <span className="opacity-50 ml-1">({shortcut})</span>}
          {/* Tooltip Arrow */}
          <span className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700"></span>
        </span>
      )}
    </button>
  );

  return (
    <div 
      className={`
        h-full bg-slate-900 flex flex-col border-r border-slate-800 shadow-2xl z-50 transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-64' : 'w-20'}
      `}
    >
      {/* 1. Header / Brand */}
      <div className="h-20 flex items-center justify-center border-b border-slate-800/50">
         <div className={`flex items-center gap-3 transition-all duration-300 ${isExpanded ? 'px-6 w-full' : 'justify-center'}`}>
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-serif font-bold text-lg shadow-lg shadow-indigo-500/20 flex-shrink-0">
              W
            </div>
            {isExpanded && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-slate-100 text-sm whitespace-nowrap">公众号配图助手</span>
                <span className="text-[10px] text-slate-500 whitespace-nowrap">AI Visual Assistant</span>
              </div>
            )}
         </div>
      </div>

      {/* 2. Core Actions (Top) */}
      <div className="p-3 space-y-2 flex flex-col">
        <MenuItem 
          label="新建项目"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>}
          onClick={onNewProject}
          isPrimary={true}
          shortcut="Ctrl+N"
        />
        
        <div className="h-px bg-slate-800 my-2 mx-1" />

        <MenuItem 
          label="项目管理"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>}
          onClick={onOpenProjectManager}
          isActive={activeView === 'manager'}
        />

        <MenuItem 
          label="搜索项目"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>}
          onClick={onOpenProjectManager} // Reusing manager for now, ideally opens with search focus
          shortcut="Ctrl+F"
        />
      </div>

      {/* 3. Auxiliary / Placeholders (Middle) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
         <div className={`px-3 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
            资源库
         </div>
         
         <MenuItem 
           label="风格模板 (开发中)"
           icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>}
           onClick={() => {}} 
         />
         <MenuItem 
           label="历史记录 (开发中)"
           icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
           onClick={() => {}} 
         />
      </div>

      {/* 4. Bottom Actions (Fixed) */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
         <MenuItem 
          label="系统设置"
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>}
          onClick={onOpenSettings}
        />
        
        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          title={isExpanded ? "收起侧边栏" : "展开侧边栏"}
        >
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          )}
        </button>
      </div>

    </div>
  );
};

export default Sidebar;