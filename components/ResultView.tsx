import React from 'react';
import { ProcessedSegment } from '../types';

interface ResultViewProps {
  segments: ProcessedSegment[];
}

const ResultView: React.FC<ResultViewProps> = ({ segments }) => {

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `wechat-illustration-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('已复制');
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-12 pb-32">
      {segments.map((segment, index) => (
        <div key={segment.id} className="relative">
          
          {/* Text Section */}
          <div className="glass-panel rounded-2xl p-8 mb-6 hover:shadow-lg transition-shadow bg-white/80">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">片段 {index + 1}</span>
              <div className="flex gap-2">
                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                  {segment.mood}
                </span>
                <button 
                  onClick={() => copyToClipboard(segment.cleanedText)}
                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                  title="复制文本"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            </div>
            <p className="article-text text-lg text-slate-800 leading-8 whitespace-pre-wrap">
              {segment.cleanedText}
            </p>
          </div>

          {/* Visual Divider / Connector */}
          <div className="flex justify-center mb-6">
            <div className="h-8 w-px bg-indigo-200"></div>
          </div>

          {/* Prompt/Image Section */}
          <div className="bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner">
            <div className="bg-slate-200/50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
               <span className="text-xs font-semibold text-slate-600">AI 绘画提示词 (Prompt)</span>
            </div>
            
            {/* Display Prompt Code Block */}
            <div className="p-4 bg-slate-50 relative group">
                <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap break-words leading-relaxed">
                  <code>{segment.imagePrompt}</code>
                </pre>
                <button 
                   onClick={() => copyToClipboard(segment.imagePrompt)}
                   className="absolute top-2 right-2 p-1.5 bg-white border border-slate-200 rounded text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
            </div>

            {/* Image Area - Only show if not idle */}
            {segment.imageStatus !== 'idle' && (
              <div className="border-t border-slate-200 bg-white p-4">
                 {/* Aspect Ratio Container: 2.35:1 approx ~ 21/9. 
                     Using tailwind arbitrary value aspect-[2.35/1] 
                  */}
                 <div className="w-full relative rounded-lg overflow-hidden bg-slate-100 shadow-sm aspect-[2.35/1] flex items-center justify-center group">
                    
                    {segment.imageStatus === 'loading' && (
                        <div className="flex flex-col items-center gap-2 animate-pulse">
                           <div className="w-10 h-10 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                           <span className="text-xs font-medium text-slate-400">正在绘制 900x383 宽幅配图...</span>
                        </div>
                    )}

                    {segment.imageStatus === 'error' && (
                        <div className="text-rose-500 text-sm font-medium flex items-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                           生成失败
                        </div>
                    )}

                    {segment.imageStatus === 'success' && segment.imageUrl && (
                        <>
                           <img 
                             src={segment.imageUrl} 
                             alt={segment.summary} 
                             className="w-full h-full object-cover"
                           />
                           {/* Overlay Actions */}
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                              <button 
                                onClick={() => handleDownload(segment.imageUrl!, index)}
                                className="bg-white/90 hover:bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
                              >
                                下载
                              </button>
                           </div>
                           <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded text-[10px] text-white/80 font-mono">
                             900 × 383
                           </div>
                        </>
                    )}
                 </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center mt-6">
            <div className="h-8 w-px bg-indigo-200"></div>
          </div>

        </div>
      ))}
    </div>
  );
};

export default ResultView;