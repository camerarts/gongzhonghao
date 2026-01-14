import React, { useState } from 'react';

interface ArticleInputProps {
  onAnalyze: (text: string) => void;
  isAnalyzing: boolean;
}

const ArticleInput: React.FC<ArticleInputProps> = ({ onAnalyze, isAnalyzing }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length > 50) {
      onAnalyze(text);
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-900 mb-2">
          文章输入
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          AI 将自动识别语义节点，为您生成 2.35:1 电影感配图。
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
        <div className="relative group flex-1">
          <textarea
            className="w-full h-full p-4 bg-white/60 backdrop-blur-sm border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none resize-none article-text text-base leading-relaxed text-slate-700 placeholder:text-slate-400 transition-all shadow-inner"
            placeholder="请在此粘贴文章正文..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isAnalyzing}
          />
        </div>
        
        <button
          type="submit"
          disabled={isAnalyzing || text.trim().length < 50}
          className={`
            w-full py-4 rounded-xl font-bold text-white text-base transition-all duration-300 transform active:scale-95 shadow-lg
            ${isAnalyzing || text.trim().length < 50 
              ? 'bg-slate-400 cursor-not-allowed opacity-70' 
              : 'bg-slate-900 hover:bg-slate-800 hover:shadow-indigo-500/30'}
          `}
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在智能分段...
            </span>
          ) : '智能分段 & 提取 Prompt'}
        </button>
      </form>
    </div>
  );
};

export default ArticleInput;