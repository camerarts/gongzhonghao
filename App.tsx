import React, { useState, useEffect } from 'react';
import ArticleInput from './components/ArticleInput';
import ResultView from './components/ResultView';
import { analyzeArticle, generateSegmentImage, ensureApiKey } from './services/geminiService';
import { ProcessedSegment, AppStatus } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [segments, setSegments] = useState<ProcessedSegment[]>([]);
  const [keyError, setKeyError] = useState<string | null>(null);

  // Check API Key on mount
  useEffect(() => {
    const init = async () => {
       const hasKey = await ensureApiKey();
       if (!hasKey) {
           setKeyError("API Key 验证失败或未配置。");
       }
    };
    init();
  }, []);

  const handleManualConfigure = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (hasKey) {
          setKeyError(null);
        }
      } catch (e) {
        console.error("Error selecting key:", e);
      }
    } else {
      alert("当前环境不支持手动配置，请检查环境变量设置。");
    }
  };

  // Step 1: Segmentation and Prompt Extraction
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
      setStatus('analyzed'); // Ready for user review

    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  // Step 2: Generate Images based on confirmed segments
  const handleGenerateImages = async () => {
    if (segments.length === 0) return;
    
    setStatus('generating_images');
    
    // Create a copy to update state safely
    const segmentsToProcess = segments.map(s => ({ ...s, imageStatus: 'loading' as const }));
    setSegments(segmentsToProcess);

    // Process all images
    await Promise.all(segmentsToProcess.map(async (segment) => {
      try {
        const imageUrl = await generateSegmentImage(segment.imagePrompt);
        
        setSegments(prev => prev.map(s => 
          s.id === segment.id 
            ? { ...s, imageUrl, imageStatus: 'success' }
            : s
        ));
      } catch (error) {
        console.error(`Failed to generate image for segment ${segment.id}`, error);
        setSegments(prev => prev.map(s => 
          s.id === segment.id 
            ? { ...s, imageStatus: 'error' }
            : s
        ));
      }
    }));

    setStatus('complete');
  };

  if (keyError) {
      return (
          <div className="min-h-screen glass-bg flex items-center justify-center p-4">
              <div className="glass-panel p-10 rounded-3xl shadow-xl text-center max-w-md">
                  <h2 className="text-xl font-bold text-rose-600 mb-4">API Key 未配置</h2>
                  
                  <div className="text-left bg-slate-100 p-4 rounded-xl mb-6 text-sm text-slate-700 space-y-2">
                    <p className="font-semibold">无法读取环境变量，请尝试以下方案：</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>检查 Cloudflare 变量名是否为 <code>API_KEY</code></li>
                      <li>尝试将变量名改为 <code>VITE_API_KEY</code> (推荐)</li>
                      <li>配置后请<strong>重新部署</strong> (Retry Deployment)</li>
                    </ul>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg font-medium"
                    >
                        刷新页面重试
                    </button>
                    
                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-slate-300"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">或者</span>
                        <div className="flex-grow border-t border-slate-300"></div>
                    </div>

                    <button 
                        onClick={handleManualConfigure}
                        className="bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        手动输入 Key (临时)
                    </button>
                  </div>

                  <p className="mt-8 text-xs text-slate-400">
                      <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-indigo-500">
                          查看 Gemini API 计费说明
                      </a>
                  </p>
              </div>
          </div>
      )
  }

  return (
    <div className="h-screen w-full flex overflow-hidden glass-bg font-sans text-slate-900">
      
      {/* Left Column: Input (1/3 width) */}
      <div className="w-1/3 h-full border-r border-white/50 bg-white/30 backdrop-blur-xl flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-white/50 bg-white/40">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-serif font-bold text-lg shadow-md">W</div>
              <h1 className="font-bold text-lg text-slate-800">公众号配图助手</h1>
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-0 scrollbar-hide">
           <ArticleInput 
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
                 <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
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
               
               <button 
                 onClick={handleManualConfigure}
                 className="p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-white/60 transition-all border border-transparent hover:border-white/50"
                 title="API Key 设置"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
               </button>
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
  );
};

export default App;