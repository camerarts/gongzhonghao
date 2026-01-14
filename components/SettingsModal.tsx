import React from 'react';
import { ImageGenerationSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ImageGenerationSettings;
  onSave: (newSettings: ImageGenerationSettings) => void;
}

const PRESET_STYLES = [
  { 
    id: 'tech_finance', 
    label: '科技金融 (Tech & Finance)', 
    value: 'Professional financial tech aesthetic, cool color palette (deep blue, graphite gray), metallic and glass textures, geometric composition, data visualization elements, rational and restrained atmosphere, 8k resolution' 
  },
  { id: 'cinematic', label: '电影质感 (Cinematic)', value: 'Cinematic shot, wide angle, dramatic lighting, high detail, 8k resolution' },
  { id: 'illustration', label: '扁平插画 (Flat Illustration)', value: 'Modern flat illustration, vector art, vibrant colors, clean lines, minimalist' },
  { id: 'watercolor', label: '水彩艺术 (Watercolor)', value: 'Watercolor painting, soft edges, artistic, bleeding colors, textured paper' },
  { id: 'anime', label: '日系动漫 (Anime Style)', value: 'Anime style, Makoto Shinkai style, vibrant background, emotional atmosphere' },
  { id: 'oil', label: '油画风格 (Oil Painting)', value: 'Oil painting, textured brushstrokes, classical art style, rich colors' },
  { id: 'photography', label: '写实摄影 (Realistic Photo)', value: 'Photorealistic, 35mm photography, depth of field, natural lighting' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState<ImageGenerationSettings>(settings);

  // Sync props to state when modal opens
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleStyleSelect = (styleValue: string) => {
    setLocalSettings(prev => ({ ...prev, style: styleValue }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/50 bg-white/40 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            生图设置
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Style Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              1. 艺术风格 (Art Style)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PRESET_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleSelect(style.value)}
                  className={`
                    p-3 rounded-xl border text-left text-sm transition-all
                    ${localSettings.style === style.value 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' 
                      : 'bg-white/50 border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-white'}
                  `}
                >
                  <div className="font-semibold mb-0.5">{style.label.split('(')[0]}</div>
                  <div className="text-[10px] opacity-70 truncate">{style.value}</div>
                </button>
              ))}
            </div>
            {/* Custom Style Input */}
            <div className="mt-3">
               <input 
                 type="text" 
                 value={localSettings.style}
                 onChange={(e) => setLocalSettings(p => ({ ...p, style: e.target.value }))}
                 placeholder="或输入自定义风格 Prompt..."
                 className="w-full p-3 bg-white/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
               />
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              2. 生图系统指令 (System Prompt)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              此处设置的指令将应用于所有图片。可用于统一色调、人物特征或排除特定元素。
            </p>
            <textarea 
              value={localSettings.systemPrompt}
              onChange={(e) => setLocalSettings(p => ({ ...p, systemPrompt: e.target.value }))}
              placeholder="例如：所有图片都必须是暖色调。不要出现文字。保持极简风格。"
              className="w-full h-32 p-3 bg-white/50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none resize-none leading-relaxed"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 pt-2 bg-white/40 border-t border-white/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-white/50 font-medium transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 hover:shadow-indigo-500/20 transition-all active:scale-95"
          >
            保存设置
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;