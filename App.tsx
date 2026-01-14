import React, { useState, useEffect } from 'react';
import ArticleInput from './components/ArticleInput';
import ResultView from './components/ResultView';
import SettingsModal from './components/SettingsModal';
import Sidebar from './components/Sidebar';
import ProjectManager from './components/ProjectManager';
import { analyzeArticle, generateSegmentImage, ensureApiKey } from './services/geminiService';
import { ProcessedSegment, AppStatus, ImageGenerationSettings, Project } from './types';

const STORAGE_KEY = 'wechat_illustrator_projects';
const SETTINGS_KEY = 'wechat_illustrator_settings';

const App: React.FC = () => {
  // --- State ---
  // Project State
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
  const [projectManagerMode, setProjectManagerMode] = useState<'list' | 'create'>('list');

  // App Content State (derived from current project, but kept in state for React reactivity)
  const [status, setStatus] = useState<AppStatus>('idle');
  const [segments, setSegments] = useState<ProcessedSegment[]>([]);
  
  // UI & Config State
  const [keyError, setKeyError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [genSettings, setGenSettings] = useState<ImageGenerationSettings>({
    style: 'Professional financial tech aesthetic, cool color palette (deep blue, graphite gray), metallic and glass textures, geometric composition, data visualization elements, rational and restrained atmosphere, 8k resolution',
    systemPrompt: 'Strictly adhere to a professional, rational, and objective visual tone suitable for top-tier financial/tech research reports. Main colors must be cool tones (deep blue, cool grey). Avoid high saturation warm colors. NO TEXT, NO NUMBERS, NO CHARTS with legible data, NO LOGOS. Do not show specific human faces; use silhouettes or abstract figures if necessary. Composition should use geometric structures, grids, and depth.'
  });

  // --- Effects ---

  // 1. Load Data on Mount
  useEffect(() => {
    // Load Settings
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        setGenSettings(JSON.parse(savedSettings));
      } catch (e) { console.error("Failed to load settings", e); }
    }

    // Load Projects
    const savedProjects = localStorage.getItem(STORAGE_KEY);
    if (savedProjects) {
      try {
        const parsed: Project[] = JSON.parse(savedProjects);
        setProjects(parsed);
        if (parsed.length > 0) {
          // Load the most recently modified project
          const sorted = [...parsed].sort((a, b) => b.lastModified - a.lastModified);
          loadProjectIntoState(sorted[0]);
        } else {
            // Create a default project if none exist
            createDefaultProject();
        }
      } catch (e) {
        console.error("Failed to load projects", e);
        createDefaultProject();
      }
    } else {
      createDefaultProject();
    }

    // Check API Key
    const initKey = async () => {
       const hasKey = await ensureApiKey();
       if (!hasKey) setKeyError("API Key 验证失败或未配置。");
    };
    initKey();
  }, []);

  // 2. Auto-save Projects when state changes
  useEffect(() => {
    if (!currentProjectId) return;

    setProjects(prev => {
      const updated = prev.map(p => {
        if (p.id === currentProjectId) {
          return {
            ...p,
            segments: segments,
            status: status,
            lastModified: Date.now()
          };
        }
        return p;
      });
      // Save to local storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [segments, status, currentProjectId]);

  // 3. Save Settings when changed
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(genSettings));
  }, [genSettings]);


  // --- Logic Helpers ---

  const createDefaultProject = () => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: '未命名项目',
      createdAt: Date.now(),
      lastModified: Date.now(),
      segments: [],
      status: 'idle'
    };
    setProjects([newProject]);
    loadProjectIntoState(newProject);
  };

  const loadProjectIntoState = (project: Project) => {
    setCurrentProjectId(project.id);
    setSegments(project.segments);
    setStatus(project.status || 'idle');
  };

  // --- Handlers ---

  const handleNewProjectRequest = () => {
    setProjectManagerMode('create');
    setIsProjectManagerOpen(true);
  };

  const handleOpenManager = () => {
    setProjectManagerMode('list');
    setIsProjectManagerOpen(true);
  };

  const handleCreateProject = (name: string) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: name,
      createdAt: Date.now(),
      lastModified: Date.now(),
      segments: [],
      status: 'idle'
    };
    
    setProjects(prev => [newProject, ...prev]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newProject, ...projects]));
    
    loadProjectIntoState(newProject);
    setIsProjectManagerOpen(false);
  };

  const handleSelectProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      loadProjectIntoState(project);
      setIsProjectManagerOpen(false);
    }
  };

  const handleDeleteProject = (id: string) => {
    const updatedProjects = projects.filter(p => p.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));

    if (id === currentProjectId) {
      if (updatedProjects.length > 0) {
        loadProjectIntoState(updatedProjects[0]);
      } else {
        // Don't leave app empty, create new default
        createDefaultProject();
      }
    }
  };

  const handleManualConfigure = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (hasKey) setKeyError(null);
      } catch (e) { console.error("Error selecting key:", e); }
    } else {
      alert("当前环境不支持手动配置，请检查环境变量设置。");
    }
  };

  // Step 1: Segmentation
  const handleAnalyze = async (text: string) => {
    const hasKey = await ensureApiKey();
    if (!hasKey) {
        setKeyError("需要 API Key 才能继续使用。");
        return;
    }
    setKeyError(null);
    setStatus('analyzing');
    setSegments([]); 

    try {
      const analysisResults = await analyzeArticle(text);
      const newSegments: ProcessedSegment[] = analysisResults.map((item, index) => ({
        id: `seg-${index}-${Date.now()}`,
        originalText: item.content,
        cleanedText: item.content,
        summary: item.visualSummary,
        mood: item.mood,
        imagePrompt: item.imagePrompt,
        imageStatus: 'idle' 
      }));

      setSegments(newSegments);
      setStatus('analyzed');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  // Step 2: Generation
  const handleGenerateImages = async () => {
    if (segments.length === 0) return;
    setStatus('generating_images');
    
    const segmentsToProcess = segments.map(s => ({ ...s, imageStatus: 'loading' as const }));
    setSegments(segmentsToProcess);

    await Promise.all(segmentsToProcess.map(async (segment) => {
      try {
        const imageUrl = await generateSegmentImage(segment.imagePrompt, genSettings);
        setSegments(prev => prev.map(s => 
          s.id === segment.id ? { ...s, imageUrl, imageStatus: 'success' } : s
        ));
      } catch (error) {
        console.error(`Failed to generate image for segment ${segment.id}`, error);
        setSegments(prev => prev.map(s => 
          s.id === segment.id ? { ...s, imageStatus: 'error' } : s
        ));
      }
    }));
    setStatus('complete');
  };

  if (keyError) {
      // (Keep existing error UI)
      return (
          <div className="min-h-screen glass-bg flex items-center justify-center p-4">
               {/* Same error UI as before, omitted for brevity but logic implies it's the same block */}
              <div className="glass-panel p-10 rounded-3xl shadow-xl text-center max-w-md">
                  <h2 className="text-xl font-bold text-rose-600 mb-4">API Key 未配置</h2>
                  <div className="flex flex-col gap-3">
                    <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg font-medium">刷新页面重试</button>
                    <button onClick={handleManualConfigure} className="bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm">手动输入 Key</button>
                  </div>
              </div>
          </div>
      )
  }

  const activeProjectName = projects.find(p => p.id === currentProjectId)?.name || '未命名项目';

  return (
    <div className="h-screen w-full flex overflow-hidden glass-bg font-sans text-slate-900">
      
      {/* Modals */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        settings={genSettings}
        onSave={setGenSettings}
      />
      
      <ProjectManager 
        isOpen={isProjectManagerOpen}
        mode={projectManagerMode}
        projects={projects}
        currentProjectId={currentProjectId}
        onClose={() => setIsProjectManagerOpen(false)}
        onCreateProject={handleCreateProject}
        onSelectProject={handleSelectProject}
        onDeleteProject={handleDeleteProject}
      />

      {/* NEW: Left Sidebar */}
      <Sidebar 
        onNewProject={handleNewProjectRequest}
        onOpenProjectManager={handleOpenManager}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Main Content Container (Flex Row of Old Columns) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Column: Input (1/3 width) */}
        <div className="w-1/3 h-full border-r border-white/50 bg-white/30 backdrop-blur-xl flex flex-col shadow-xl z-10 relative">
          <div className="p-6 border-b border-white/50 bg-white/40">
             <div className="flex flex-col gap-1">
                <h1 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                   {activeProjectName}
                   <button onClick={handleOpenManager} className="text-slate-400 hover:text-indigo-600">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                   </button>
                </h1>
                <p className="text-xs text-slate-500">公众号配图助手</p>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-0 scrollbar-hide">
             {/* Key props: Reset input if segments empty (new project) */}
             <ArticleInput 
               key={currentProjectId} // Force re-mount on project switch to clear internal state if needed
               onAnalyze={handleAnalyze} 
               isAnalyzing={status === 'analyzing'} 
             />
          </div>
        </div>

        {/* Right Column: Results (2/3 width) */}
        <div className="w-2/3 h-full flex flex-col bg-slate-50/50 relative">
          <header className="h-16 flex items-center justify-between px-8 border-b border-white/50 bg-white/20 backdrop-blur-md">
             <div className="flex items-center gap-4">
                <h2 className="font-bold text-slate-700">生成预览</h2>
                {status === 'analyzed' && (
                   <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full border border-amber-200 animate-pulse">
                     已完成分段，请确认提示词并生图
                   </span>
                )}
             </div>
             
             <div className="flex items-center gap-3">
                 {(status === 'analyzed' || status === 'generating_images' || status === 'complete') && (
                    <button 
                      onClick={handleGenerateImages}
                      disabled={status !== 'analyzed'}
                      className={`
                        flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95
                        ${status === 'analyzed' 
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-200' 
                          : 'bg-slate-300 cursor-not-allowed'}
                      `}
                    >
                      {status === 'generating_images' ? (
                         <>
                           <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           正在绘图...
                         </>
                      ) : (
                         <>
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                           开始生图
                         </>
                      )}
                    </button>
                 )}
             </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-200">
             {segments.length > 0 ? (
               <ResultView segments={segments} />
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400">
                 <div className="w-24 h-24 rounded-3xl bg-white border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                 </div>
                 <p>请在左侧输入文章并点击“智能分段”</p>
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;