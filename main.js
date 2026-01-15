// === EchoScript v2.2: 完整修復版 (包含分類顯示與防白畫面) ===
const { useState, useEffect, useRef, useCallback, useMemo } = React;
const { createRoot } = ReactDOM;

// [新增] 主題配色定義
const THEMES = {
    light: { 
        id: 'light', name: '簡約淺色', hex: '#fafaf9', // bg-stone-50
        bg: 'bg-stone-50', text: 'text-stone-800', 
        card: 'bg-white', border: 'border-stone-200', 
        accent: 'bg-[#2c3e50]', accentText: 'text-stone-50',
        subtext: 'text-stone-400', activeTab: 'bg-[#2c3e50] text-white'
    },
    dark: { 
        id: 'dark', name: '都市夜空', hex: '#020617', // bg-slate-950
        bg: 'bg-slate-950', text: 'text-slate-400', 
        card: 'bg-slate-900', border: 'border-slate-800', 
        // [修改] 按鈕改為低調的都市灰藍色 (Slate-600)
        accent: 'bg-slate-600', accentText: 'text-white',
        subtext: 'text-slate-500', activeTab: 'bg-slate-600 text-white'
    },
    morandi: { 
        id: 'morandi', name: '莫蘭迪花園', hex: '#F2E6D8',
        bg: 'bg-[#F2E6D8]', text: 'text-[#5E503F]', 
        card: 'bg-[#FFFBF0]', border: 'border-[#E6DCC8]', 
        accent: 'bg-[#B5838D]', accentText: 'text-white', // 乾燥玫瑰粉
        subtext: 'text-[#9A8C98]', activeTab: 'bg-[#B5838D] text-white'
    },
    // 修改主題 1: 綠色 (按鈕顏色調深，增強對比)
    morandiGreen: {
        id: 'morandiGreen', name: '莫蘭迪綠', hex: '#D9E0D6',
        bg: 'bg-[#D9E0D6]', text: 'text-[#4A5D4F]',
        card: 'bg-[#F7FAF7]', border: 'border-[#C8D6CA]',
        accent: 'bg-[#6A8D73]', accentText: 'text-white', // 深鼠尾草綠
        subtext: 'text-[#8EA394]', activeTab: 'bg-[#6A8D73] text-white'
    },
    // 修改主題 2: 紫色 (按鈕顏色調深，增強對比)
    morandiPurple: {
        id: 'morandiPurple', name: '莫蘭迪紫', hex: '#E2D6E2',
        bg: 'bg-[#E2D6E2]', text: 'text-[#5D4F5D]',
        card: 'bg-[#FCF8FC]', border: 'border-[#DBC8DB]',
        accent: 'bg-[#8E6F8E]', accentText: 'text-white', // 深煙燻紫
        subtext: 'text-[#A38EA3]', activeTab: 'bg-[#8E6F8E] text-white'
    },
    // 修改主題 3: 藍色 (按鈕顏色調深，增強對比)
    morandiBlue: {
        id: 'morandiBlue', name: '莫蘭迪藍', hex: '#D3DFE6',
        bg: 'bg-[#D3DFE6]', text: 'text-[#4A5D6B]',
        card: 'bg-[#F6FAFC]', border: 'border-[#C8D9E3]',
        accent: 'bg-[#64818D]', accentText: 'text-white', // 深岩石藍
        subtext: 'text-[#8E9FA3]', activeTab: 'bg-[#64818D] text-white'
    },
    // 修改主題 4: 橘色 (按鈕顏色調深，增強對比)
    morandiOrange: {
        id: 'morandiOrange', name: '莫蘭迪橘', hex: '#EBD4CC',
        bg: 'bg-[#EBD4CC]', text: 'text-[#6B4F45]',
        card: 'bg-[#FDF6F4]', border: 'border-[#E3C8C0]',
        accent: 'bg-[#B08474]', accentText: 'text-white', // 深陶土色
        subtext: 'text-[#A38E86]', activeTab: 'bg-[#B08474] text-white'
    },
    // 維持主題 5: 溫暖黃 (保持不變)
    morandiYellow: {
        id: 'morandiYellow', name: '莫蘭迪暖黃', hex: '#F5F2E6',
        bg: 'bg-[#F5F2E6]', text: 'text-[#6B6345]',
        card: 'bg-[#FAF9F0]', border: 'border-[#E6E1CC]',
        accent: 'bg-[#CFC599]', accentText: 'text-white',
        subtext: 'text-[#A39E86]', activeTab: 'bg-[#CFC599] text-white'
    }
};

// === 1. 圖示組件庫 ===
const IconBase = ({ d, className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
    </svg>
);

const Heart = (props) => <IconBase d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" {...props} />;
const Copy = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const BookOpen = (props) => <IconBase d={["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z", "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"]} {...props} />;
const X = (props) => <IconBase d={["M18 6 6 18", "M6 6 18 18"]} {...props} />;
const Trash2 = (props) => <IconBase d={["M3 6h18", "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", "M10 11v6", "M14 11v6"]} {...props} />;
const History = (props) => <IconBase d={["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z", "M12 6v6l4 2"]} {...props} />;
const Clock = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const PenLine = (props) => <IconBase d={["M12 20h9", "M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"]} {...props} />;
const Save = (props) => <IconBase d={["M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z", "M17 21v-8H7v8", "M7 3v5h8"]} {...props} />;
const Home = (props) => <IconBase d={["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"]} {...props} />;
const RefreshCw = (props) => <IconBase d={["M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", "M21 3v5h-5", "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", "M8 16H3v5"]} {...props} />;
const Edit = (props) => <IconBase d={["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"]} {...props} />;
const Download = (props) => <IconBase d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"]} {...props} />;
const Upload = (props) => <IconBase d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"]} {...props} />;
const FileText = (props) => <IconBase d={["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M16 13H8", "M16 17H8", "M10 9H8"]} {...props} />;
const Plus = (props) => <IconBase d={["M12 5v14", "M5 12h14"]} {...props} />;
const List = (props) => <IconBase d={["M8 6h13", "M8 12h13", "M8 18h13", "M3 6h.01", "M3 12h.01", "M3 18h.01"]} {...props} />;
const Bold = (props) => <IconBase d={["M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z", "M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"]} {...props} />;
// 新增清晰的 H1, H2, 與內文(T) 圖示
const Heading1 = (props) => <IconBase d={["M4 12h8", "M4 18V6", "M12 18V6", "M15 13L17 11V18"]} {...props} />;
const Heading2 = (props) => <IconBase d={["M4 12h8", "M4 18V6", "M12 18V6", "M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"]} {...props} />;
// [新增] 核取方塊圖示
const CheckSquare = (props) => <IconBase d={["M9 11l3 3L22 4", "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"]} {...props} />;
const Type = (props) => <IconBase d={["M4 7V4h16v3", "M9 20h6", "M12 4v16"]} {...props} />;
const Quote = (props) => <IconBase d={["M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z", "M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"]} {...props} />;
const Italic = (props) => <IconBase d={["M19 4h-9", "M14 20H5", "M15 4L9 20"]} {...props} />;
const Underline = (props) => <IconBase d={["M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3", "M4 21h16"]} {...props} />;
const Calendar = (props) => <IconBase d={["M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z", "M16 2v4", "M8 2v4", "M3 10h18"]} {...props} />;
const GripVertical = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>;
const Pin = (props) => <IconBase d={["M2 12h10", "M9 4v16", "M3 7l3 3", "M3 17l3-3", "M12 2l3 3", "M12 22l3-3"]} d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" {...props} d={["M12 17v5", "M9 2h6v2l-1 1v8l4 4H6l4-4V5l-1-1V2z"]} />; // 使用 Pushpin 樣式
const MoveRight = (props) => <IconBase d={["M13 5l7 7-7 7", "M5 12h14"]} {...props} />;
// [新增] 隨機翻頁圖示
const Shuffle = (props) => <IconBase d={["M16 3h5v5", "M4 20L21 3", "M21 16v5h-5", "M15 15l6 6", "M4 4l5 5"]} {...props} />;
// [修改] 抽卡圖示 (改為三張扇形無花色卡牌，中間在最上層)
const Cards = (props) => <IconBase d={[
    "M7 4 L3 5.5 a 1 1 0 0 0 -.5 1.5 l 2.5 9 a 1 1 0 0 0 1.5 .5 L 9 16", // 左邊傾斜卡片
    "M17 4 L21 5.5 a 1 1 0 0 1 .5 1.5 l -2.5 9 a 1 1 0 0 1 -1.5 .5 L 15 16", // 右邊傾斜卡片
    "M9 2 h6 a2 2 0 0 1 2 2 v14 a2 2 0 0 1-2 2 h-6 a2 2 0 0 1-2-2 v-14 a2 2 0 0 1 2-2 z" // 中間卡片 (最上層)
]} {...props} />;
const ImageIcon = (props) => <IconBase d={["M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z", "M4 14l4-4 4 4", "M14 12l2-2 4 4", "M14 7h.01"]} {...props} />;

// [新增] 圖片處理設定
const IMG_CONFIG = {
    maxWidth: 800, // 限制最大寬度 800px
    quality: 0.7   // 壓縮品質 70%
};

// [新增] 圖片壓縮工具函式
const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > IMG_CONFIG.maxWidth) {
                    height = (IMG_CONFIG.maxWidth / width) * height;
                    width = IMG_CONFIG.maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', IMG_CONFIG.quality));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};


// === 2. 初始筆記資料庫 (確保有完整分類) ===
const INITIAL_NOTES = [
    { id: 1, superCategory: "總分類", category: "大分類", subcategory: "次分類", title: "空白筆記", content: "" },
];

// === 3. 錯誤邊界組件 ===
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) return <div className="p-8 text-center text-red-600">發生錯誤，請重新整理頁面。</div>;
    return this.props.children; 
  }
}

// === 4. Markdown 編輯器組件 ===
// 修改 1: 加入 existingNotes 參數
// === 新增：Combobox 合體輸入元件 (解決分類被過濾問題) ===
// === 新增：Markdown 渲染器元件 (顯示預覽用) ===
const MarkdownRenderer = ({ content, onCheckboxChange }) => { // [修改] 接收 onCheckboxChange
    const parseInline = (text) => {
        // [新增] 同時支援 Markdown 語法與 URL 自動偵測
        const parts = text.split(/(\*\*.*?\*\*|~~.*?~~|\*.*?\*|<u>.*?<\/u>|(https?:\/\/[^\s]+))/g);
        return parts.map((part, index) => {
            if (!part) return null;
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-extrabold">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('~~') && part.endsWith('~~')) {
                return <del key={index} className="opacity-50">{part.slice(2, -2)}</del>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={index} className="italic opacity-80">{part.slice(1, -1)}</em>;
            }
            if (part.startsWith('<u>') && part.endsWith('</u>')) {
                return <u key={index} className="underline decoration-current underline-offset-4">{part.slice(3, -4)}</u>;
            }
            // [新增] 偵測並渲染可點擊的連結，使用 break-all 避免裁切
            if (part.startsWith('http')) {
                return (
                    <a 
                        key={index} 
                        href={part} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-500 underline break-all hover:text-blue-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    return (
        // [修改] 加入 break-words 確保長網址或連續字元不會撐破容器
        <div className="text-base leading-loose font-sans text-justify whitespace-pre-wrap break-words">
            {content.split('\n').map((line, i) => {
                // [修正] 標題與引用移除寫死顏色，改用 opacity 區分層次
                if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold mt-5 mb-3">{parseInline(line.slice(2))}</h1>;
                if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold mt-4 mb-2 opacity-90">{parseInline(line.slice(3))}</h2>;
                if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-current pl-4 italic opacity-70 my-2">{parseInline(line.slice(2))}</blockquote>;
                
                // [新增] 處理待辦清單 (Checkboxes) - 必須放在一般清單判定之前
                if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
                    const isChecked = line.startsWith('- [x] ');
                    return (
                        <div key={i} className="flex items-start gap-2 ml-4 mb-1 relative">
                            {/* [修改] 加入 z-10 與 stopPropagation 確保點擊絕對有效 */}
                            <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={() => onCheckboxChange && onCheckboxChange(i, !isChecked)}
                                onClick={(e) => e.stopPropagation()} 
                                className="mt-[0.45em] accent-stone-600 cursor-pointer relative z-10 w-4 h-4 shrink-0" 
                            />
                            {/* [修改] 移除文字點擊觸發，僅保留 checkbox 觸發，防止誤觸 */}
                            <span 
                                className={`flex-1 ${isChecked ? 'line-through opacity-50' : ''}`}
                            >
                                {parseInline(line.slice(6))}
                            </span>
                        </div>
                    );
                }

                // [新增] 處理清單符號：將 "- " 轉換為縮排 + 圓點
                if (line.startsWith('- ')) {
                    return (
                        <div key={i} className="flex items-start gap-2 ml-4 mb-1">
                            {/* [修改] 項目符號往下移至文字中間 (mt-[0.1em] -> mt-[0.3em]) */}
                            <span className="text-stone-800 font-bold mt-[0.3em] text-xl leading-none">•</span>
                            <span className="flex-1">{parseInline(line.slice(2))}</span>
                        </div>
                    );
                }
                return <p key={i} className="mb-2 min-h-[1em]">{parseInline(line)}</p>;
            })}
        </div>
    );
};

// === Combobox 合體輸入元件 ===
const Combobox = ({ value, onChange, options, placeholder, theme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <input 
                    className={`w-full border ${theme.border} ${theme.card} ${theme.text} rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 pr-8`}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsOpen(true)} 
                />
                <button 
                    className="absolute right-0 top-0 h-full px-3 text-stone-400 hover:text-stone-600 flex items-center justify-center"
                    onClick={() => setIsOpen(!isOpen)}
                    tabIndex="-1"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
            </div>
            
            {isOpen && options.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white border border-stone-200 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50 mt-1 animate-in fade-in duration-100">
                    {options.map(opt => (
                        <div 
                            key={opt} 
                            className="px-4 py-2 hover:bg-stone-100 cursor-pointer text-sm text-stone-700 border-b border-stone-50 last:border-0"
                            onClick={() => {
                                onChange(opt);
                                setIsOpen(false);
                            }}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// === 新增：HighlightingEditor (支援編輯時高亮的編輯器) ===
// === 修改後：HighlightingEditor (修復游標錯位版) ===
const HighlightingEditor = ({ value, onChange, textareaRef, theme }) => {
    // 這個函式負責把 markdown 語法轉成有顏色的 HTML (僅供顯示用)
    const renderHighlights = (text) => {
        // 防止最後一行換行失效，強制補一個空白
        const textToRender = text.endsWith('\n') ? text + ' ' : text;
        
        return textToRender.split('\n').map((line, i) => {
            // 關鍵修改：確保每一行的基礎高度一致，不要隨意改變 text size
            let className = "min-h-[1.5em] ";
            let content = line;

            // 處理標題：改為「變色 + 加粗」，但保持「字體大小一致」以維持游標對齊
            if (line.startsWith('# ')) {
                className += "font-black text-stone-900 bg-stone-100/50"; // 使用極粗體和底色來強調
            } else if (line.startsWith('## ')) {
                className += "font-bold text-stone-800 bg-stone-50/50"; // 使用粗體來強調
            } else if (line.startsWith('> ')) {
                className += "italic text-stone-400 border-l-4 border-stone-300 pl-2";
            } else {
                // [修正] 改用 theme.text 以適應深色模式 (原本寫死 text-gray-800)
                className += ` ${theme.text}`;
            }

            // 處理行內樣式：粗體、刪除線、斜體、底線
            const parts = content.split(/(\*\*.*?\*\*|~~.*?~~|\*.*?\*|<u>.*?<\/u>)/g);
            const renderedLine = parts.map((part, idx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <span key={idx} className="font-bold text-stone-900 bg-yellow-100/50 rounded px-0.5">{part}</span>;
                }
                if (part.startsWith('~~') && part.endsWith('~~')) {
                    return <span key={idx} className="line-through text-stone-400">{part}</span>;
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                    return <span key={idx} className="italic text-stone-600 bg-stone-100/50">{part}</span>;
                }
                if (part.startsWith('<u>') && part.endsWith('</u>')) {
                    return <span key={idx} className="underline decoration-stone-300">{part}</span>;
                }
                return part;
            });

            return <div key={i} className={className}>{renderedLine}</div>;
        });
    };

    const syncScroll = (e) => {
        const backdrop = e.target.previousSibling;
        if(backdrop) backdrop.scrollTop = e.target.scrollTop;
    };

    return (
        <div className={`relative flex-1 w-full border ${theme.border} rounded-lg overflow-hidden ${theme.card} h-full`}>
            {/* 底層：負責顯示樣式 (Backdrop) */}
            <div 
                className="absolute inset-0 p-3 pointer-events-none whitespace-pre-wrap break-words overflow-hidden"
                style={{ fontFamily: 'inherit', lineHeight: '1.6', fontSize: '1rem' }}
            >
                {renderHighlights(value)}
            </div>

            {/* 上層：負責輸入 (Transparent Textarea) */}
            {/* [修正] Caret 顏色隨主題變換，確保深色模式下可見 */}
            <textarea
                ref={textareaRef}
                className={`absolute inset-0 w-full h-full p-3 bg-transparent text-transparent resize-none outline-none whitespace-pre-wrap break-words overflow-y-auto ${theme.id === 'dark' ? 'caret-white' : 'caret-stone-800'}`}
                style={{ fontFamily: 'inherit', lineHeight: '1.6', fontSize: '1rem' }}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onScroll={syncScroll}
                placeholder="在此輸入內容... 支援 Markdown"
                spellCheck="false" 
            />
        </div>
    );
};;

// === 4. Markdown 編輯器組件 (整合高亮編輯器) ===
// 修改：加入 setHasUnsavedChanges 參數，並監聽內容變更
const MarkdownEditorModal = ({ note, existingNotes = [], isNew = false, onClose, onSave, onDelete, setHasUnsavedChanges, theme, triggerUnsavedAlert }) => {
    // [新增] 使用 Ref 鎖定 ID，確保它在編輯過程中絕對不會遺失或改變
    const originalIdRef = useRef(note?.id);

    const [formData, setFormData] = useState({
        superCategory: note?.superCategory || "其他", // [新增] 總分類 (預設為其他)
        category: note?.category || "",
        subcategory: note?.subcategory || "",
        title: note?.title || "",
        content: note?.content || "",
        image: note?.image || null // [新增] 圖片欄位
    });
    const fileInputRef = useRef(null); // [新增] 檔案選擇參照

    const [activeTab, setActiveTab] = useState('write'); 

    // 新增：監聽內容變更，同步狀態給主程式 (給手機返回鍵使用)
    useEffect(() => {
        const initialSuper = note?.superCategory || "其他";
        const initialCategory = note?.category || "";
        const initialSubcategory = note?.subcategory || "";
        const initialTitle = note?.title || "";
        const initialContent = note?.content || "";
        const initialImage = note?.image || null;

        const hasChanges = 
            formData.superCategory !== initialSuper ||
            formData.category !== initialCategory ||
            formData.subcategory !== initialSubcategory ||
            formData.title !== initialTitle ||
            formData.content !== initialContent ||
            formData.image !== initialImage;
            
        // 如果 setHasUnsavedChanges 存在才執行 (防止報錯)
        if (setHasUnsavedChanges) setHasUnsavedChanges(hasChanges);

        // 卸載時重置狀態
        return () => { if (setHasUnsavedChanges) setHasUnsavedChanges(false); };
    }, [formData, note, setHasUnsavedChanges]);

    // [新增] 圖片處理函式
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const compressedBase64 = await compressImage(file);
            setFormData(prev => ({ ...prev, image: compressedBase64 }));
        } catch (error) {
            console.error("圖片壓縮失敗", error);
            alert("圖片處理失敗，請重試");
        }
    };

    const handleRemoveImage = () => {
        if(confirm("確定要移除這張圖片嗎？")) {
            setFormData(prev => ({ ...prev, image: null }));
        }
    };

    // [新增] 總分類列表 (從現有筆記中提取，並加入預設值)
    const existingSuperCategories = useMemo(() => {
        // [修正] 移除寫死的範例分類("敘事技巧", "智慧")，避免不同帳號誤以為資料殘留
        // 只保留最基礎的 "其他"，其餘分類將根據使用者現有的筆記動態生成
        const defaults = ["其他"];
        const fromNotes = existingNotes.map(n => n.superCategory).filter(Boolean);
        return [...new Set([...defaults, ...fromNotes])];
    }, [existingNotes]);

    const existingCategories = useMemo(() => {
        // [修改] 根據目前選的總分類，篩選出對應的大分類
        // (如果筆記沒設定總分類，歸類為 "其他")
        if (!formData.superCategory) return [];
        return [...new Set(existingNotes
            .filter(n => (n.superCategory || "其他") === formData.superCategory)
            .map(n => n.category)
            .filter(Boolean))];
    }, [existingNotes, formData.superCategory]);

    const existingSubcategories = useMemo(() => {
        if (!formData.category) return []; 
        return [...new Set(existingNotes
            .filter(n => n.category === formData.category)
            .map(n => n.subcategory)
            .filter(Boolean)
        )];
    }, [existingNotes, formData.category]);

    const contentRef = useRef(null);

    const insertMarkdown = (syntax) => {
        const textarea = contentRef.current;
        if (!textarea) return;

        const text = formData.content;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        let newText = "";
        let newCursorPos = 0;

        // 處理包圍型語法 (粗體、斜體、底線)
        if (["bold", "italic", "underline"].includes(syntax)) {
            const selectedText = text.substring(start, end);
            let symbol = "";
            let offset = 0;

            if (syntax === "bold") { symbol = "**"; offset = 2; }
            if (syntax === "italic") { symbol = "*"; offset = 1; }
            if (syntax === "underline") { symbol = "<u>"; offset = 3; } // 結束符號需另外處理

            const endSymbol = syntax === "underline" ? "</u>" : symbol;
            
            newText = text.substring(0, start) + symbol + selectedText + endSymbol + text.substring(end);
            newCursorPos = end + symbol.length + endSymbol.length; 
            if (selectedText.length === 0) newCursorPos -= endSymbol.length; // 如果沒選字，游標停在中間
        } 
        // 處理行首前綴語法 (標題、引用、清單)
        else {
            const lineStart = text.lastIndexOf('\n', start - 1) + 1;
            let lineEnd = text.indexOf('\n', start);
            if (lineEnd === -1) lineEnd = text.length; 

            const lineContent = text.substring(lineStart, lineEnd);
            // 移除舊的前綴 (包含清單符號)
            const cleanContent = lineContent.replace(/^(\#+\s|>\s|-\s)/, '');

            let prefix = "";
            if (syntax === "h1") prefix = "# ";
            if (syntax === "h2") prefix = "## ";
            if (syntax === "quote") prefix = "> ";
            if (syntax === "list") prefix = "- ";
            if (syntax === "todo") prefix = "- [ ] "; // [新增] 待辦語法

            newText = text.substring(0, lineStart) + prefix + cleanContent + text.substring(lineEnd);
            newCursorPos = lineStart + prefix.length + cleanContent.length;
        }

        setFormData({ ...formData, content: newText });
        setTimeout(() => { 
            textarea.focus(); 
            textarea.setSelectionRange(newCursorPos, newCursorPos); 
        }, 10);
    };

    const handleSave = () => {
        if (!formData.title || !formData.content) { alert("請至少填寫標題和內容"); return; }
        
        // [修正] 從 Ref 讀取最原始的 ID，而不是依賴可能變動的 props
        // 如果是編輯舊筆記，originalIdRef.current 一定會有值，絕不會掉
        let finalId = originalIdRef.current;

        // [修復] 僅回傳 formData (編輯的內容) 與 ID，絕對不要展開 ...note
        // 這防止了當背景列表更新導致 props.note 被替換成別張卡片時，
        // 錯誤地將別張卡片的 createdDate 或 responses 寫入當前筆記
        onSave({ ...formData, id: finalId });
    };

    // 內部的關閉按鈕邏輯 (備用，主要依賴主程式的攔截)
    const handleClose = () => {
        const initialCategory = note?.category || "";
        const initialSubcategory = note?.subcategory || "";
        const initialTitle = note?.title || "";
        const initialContent = note?.content || "";

        const hasChanges = 
            formData.category !== initialCategory ||
            formData.subcategory !== initialSubcategory ||
            formData.title !== initialTitle ||
            formData.content !== initialContent;

        if (hasChanges) {
            // [修改] 改用 triggerUnsavedAlert 呼叫統一的未存檔提示框
            if (triggerUnsavedAlert) {
                triggerUnsavedAlert();
            } else {
                // Fallback (保留以防萬一)
                if (confirm("編輯內容還未存檔，是否離開？")) {
                    onClose();
                }
            }
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => { if(e.target === e.currentTarget) handleClose(); }}>
            <div className={`absolute top-6 bottom-6 left-4 right-4 mx-auto max-w-lg ${theme.bg} rounded-2xl shadow-2xl flex flex-col overflow-hidden`}>
                <nav className={`flex justify-between items-center p-4 border-b ${theme.border} ${theme.card}`}>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-800 px-2">取消</button>
                    <h3 className={`font-bold ${theme.text}`}>{isNew ? "新增筆記" : "修改筆記"}</h3>
                    <button onClick={handleSave} className={`${theme.accent} ${theme.accentText} px-4 py-1.5 rounded-full text-sm font-bold`}>儲存</button>
                </nav>
                
                {/* 主內容區：鎖定捲動 (Overflow Hidden) */}
                <div className="flex flex-col flex-1 overflow-hidden">
                    
                    {/* 上方區塊：分類與標題 (固定不捲動) */}
                    <div className="p-4 pb-2 shrink-0 flex flex-col gap-3">
                        {/* [修改] 改為三欄式佈局，加入總分類選單 */}
                        <div className="grid grid-cols-3 gap-2">
                            <Combobox 
                                placeholder="總分類"
                                value={formData.superCategory}
                                onChange={(val) => setFormData(prev => ({...prev, superCategory: val}))}
                                options={existingSuperCategories}
                                theme={theme}
                            />
                            <Combobox 
                                placeholder="大分類"
                                value={formData.category}
                                onChange={(val) => setFormData(prev => ({...prev, category: val}))}
                                options={existingCategories}
                                theme={theme}
                            />
                            <Combobox 
                                placeholder="次分類"
                                value={formData.subcategory}
                                onChange={(val) => setFormData(prev => ({...prev, subcategory: val}))}
                                options={existingSubcategories}
                                theme={theme}
                            />
                        </div>

                        {/* [修改] 標題區域加入圖片預覽 */}
                        <div className="flex items-center gap-3">
                            {formData.image && (
                                <div className="relative group shrink-0">
                                    <img src={formData.image} className="w-12 h-12 object-cover rounded-lg border border-stone-200 shadow-sm" />
                                    <button onClick={handleRemoveImage} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                            <input 
                                placeholder="主旨語 (必填，如：先讓英雄救貓咪)"
                                className={`flex-1 ${theme.card} border ${theme.border} rounded-lg p-3 font-bold ${theme.text} focus:outline-none focus:ring-2 focus:ring-stone-400`}
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* 中間區塊：工具列 (固定不捲動) */}
                    <div className={`px-4 py-2 shrink-0 border-b ${theme.border} flex justify-between items-center ${theme.card}`}>
                        <div className="flex gap-1 overflow-x-auto no-scrollbar items-center">
                            {/* [新增] 圖片上傳按鈕 */}
                            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                            <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-stone-100 rounded text-stone-600 flex items-center gap-1 text-xs font-bold min-w-fit" title="插入圖片">
                                <ImageIcon className="w-4 h-4"/> 圖片
                            </button>
                            
                            {/* [修改] 按鈕順序：內文 -> 大標 -> 小標 -> 引用 -> 項目 -> 粗體 -> 斜體 -> 底線 */}
                            <button onClick={() => insertMarkdown('normal')} className="p-2 hover:bg-stone-100 rounded text-stone-600 flex items-center gap-1 text-xs font-bold min-w-fit" title="內文"><Type className="w-4 h-4"/> 內文</button>
                            <button onClick={() => insertMarkdown('h1')} className="p-2 hover:bg-stone-100 rounded text-stone-600 flex items-center gap-1 text-xs font-bold min-w-fit" title="大標"><Heading1 className="w-5 h-5"/> 大標</button>
                            <button onClick={() => insertMarkdown('h2')} className="p-2 hover:bg-stone-100 rounded text-stone-600 flex items-center gap-1 text-xs font-bold min-w-fit" title="小標"><Heading2 className="w-5 h-5"/> 小標</button>
                            <button onClick={() => insertMarkdown('quote')} className="p-2 hover:bg-stone-100 rounded text-stone-600 flex items-center gap-1 text-xs font-bold min-w-fit" title="引用"><Quote className="w-4 h-4"/> 引用</button>
                            <button onClick={() => insertMarkdown('list')} className="p-2 hover:bg-stone-100 rounded text-stone-600 flex items-center gap-1 text-xs font-bold min-w-fit" title="項目"><List className="w-4 h-4"/> 項目</button>
                            {/* [新增] 待辦清單按鈕，介於項目與粗體之間 */}
                            <button onClick={() => insertMarkdown('todo')} className="p-2 hover:bg-stone-100 rounded text-stone-600 flex items-center gap-1 text-xs font-bold min-w-fit" title="核取方塊"><CheckSquare className="w-4 h-4"/> 待辦</button>
                            <button onClick={() => insertMarkdown('bold')} className="p-2 hover:bg-stone-100 rounded text-stone-600 flex items-center gap-1 text-xs font-bold min-w-fit" title="粗體"><Bold className="w-4 h-4"/> 粗體</button>
                            <button onClick={() => insertMarkdown('italic')} className="p-2 hover:bg-stone-100 rounded text-stone-600 flex items-center gap-1 text-xs font-bold min-w-fit" title="斜體"><Italic className="w-4 h-4"/> 斜體</button>
                            <button onClick={() => insertMarkdown('underline')} className="p-2 hover:bg-stone-100 rounded text-stone-600 flex items-center gap-1 text-xs font-bold min-w-fit" title="底線"><Underline className="w-4 h-4"/> 底線</button>
                        </div>
                        <div className="flex gap-1 text-xs font-bold shrink-0 ml-2">
                             <button onClick={() => setActiveTab('write')} className={`px-2 py-1 rounded ${activeTab === 'write' ? 'bg-stone-200 text-stone-800' : 'text-stone-400'}`}>編輯</button>
                             <button onClick={() => setActiveTab('preview')} className={`px-2 py-1 rounded ${activeTab === 'preview' ? 'bg-stone-200 text-stone-800' : 'text-stone-400'}`}>預覽</button>
                        </div>
                    </div>

                    {/* 下方區塊：編輯器 (唯一可捲動區域) */}
                    <div className="flex-1 overflow-hidden px-4 pb-4 flex flex-col">
                        {activeTab === 'write' ? (
                            <HighlightingEditor 
                                value={formData.content} 
                                onChange={(val) => setFormData({...formData, content: val})} 
                                textareaRef={contentRef}
                                theme={theme}
                            />
                        ) : (
                            <div className={`flex-1 w-full ${theme.card} p-4 rounded-lg border ${theme.border} overflow-y-auto`}>
                                <MarkdownRenderer content={formData.content || "（尚未輸入內容）"} />
                            </div>
                        )}
                    </div>
                </div>

                {/* 底部刪除按鈕區 (僅在修改模式顯示) */}
                {!isNew && (
                    <div className={`p-4 border-t ${theme.border} flex justify-end ${theme.bg} rounded-b-2xl`}>
                        <button onClick={onDelete} className="text-stone-400 hover:text-stone-600 flex items-center gap-2 text-xs font-bold transition-colors">
                            <Trash2 className="w-4 h-4" /> 刪除筆記
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// === 5. 回應編輯視窗 ===
// 修改：接收 viewMode 與 setHasUnsavedChanges
const ResponseModal = ({ note, responses = [], onClose, onSave, onDelete, viewMode, setViewMode, setHasUnsavedChanges, theme }) => {
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");
    const [originalText, setOriginalText] = useState("");

    // [新增] 自定義提示框狀態與暫存動作
    const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    // 新增：監聽內容變更，回報給主程式
    useEffect(() => {
        const isDirty = viewMode === 'edit' && editText !== originalText;
        if (setHasUnsavedChanges) setHasUnsavedChanges(isDirty);
        return () => { if (setHasUnsavedChanges) setHasUnsavedChanges(false); };
    }, [editText, originalText, viewMode, setHasUnsavedChanges]);

    const handleEdit = (responseItem) => {
        setEditingId(responseItem.id);
        setEditText(responseItem.text);
        setOriginalText(responseItem.text); 
        if (setViewMode) setViewMode('edit');
    };

    const handleNew = () => {
        setEditingId(null);
        setEditText("");
        setOriginalText(""); 
        if (setViewMode) setViewMode('edit');
    };

    const handleSaveCurrent = () => {
        if (!editText.trim()) return;
        onSave(editText, editingId);
        // 儲存後自動切回列表
        if (setViewMode) setViewMode('list');
    };

    // 內部的檢查邏輯 (點擊背景或按鈕時使用)
    const handleCheckUnsaved = (action) => {
        if (viewMode === 'edit' && editText !== originalText) {
            // [修改] 改為觸發自定義提示框，而非原生 confirm
            setPendingAction(() => action);
            setShowUnsavedAlert(true);
        } else {
            action();
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 animate-in fade-in duration-200" onClick={(e) => { if(e.target === e.currentTarget) handleCheckUnsaved(onClose); }}>
            <div className={`${theme.bg} w-full max-w-lg h-[70%] sm:h-auto rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden`}>
                <nav className={`flex justify-between items-center p-4 border-b ${theme.border} ${theme.card} shrink-0`}>
                    {viewMode === 'list' ? (
                        <>
                            <button onClick={() => handleCheckUnsaved(onClose)} className="text-gray-500 hover:text-gray-800 px-2">關閉</button>
                            <h3 className={`font-bold ${theme.text}`}>回應列表 ({responses.length})</h3>
                            <div className="w-8"></div>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleCheckUnsaved(() => setViewMode('list'))} className="text-gray-500 hover:text-gray-800 px-2">返回</button>
                            <h3 className={`font-bold ${theme.text}`}>{editingId ? "修改回應" : "新增回應"}</h3>
                            <button onClick={handleSaveCurrent} className={`${theme.accent} ${theme.accentText} px-4 py-1.5 rounded-full text-sm font-bold`}>儲存</button>
                        </>
                    )}
                </nav>

                <div className="p-4 flex flex-col flex-1 overflow-y-auto custom-scrollbar">
                    {viewMode === 'list' ? (
                        <>
                            <div className={`mb-4 p-3 ${theme.card} rounded-lg border ${theme.border}`}>
                                <p className={`text-xs ${theme.subtext} mb-1`}>關於：{note.title}</p>
                                <p className={`text-sm ${theme.text} line-clamp-2`}>{note.content}</p>
                            </div>
                            
                            <div className="space-y-3 mb-4">
                                {responses.length > 0 ? responses.map(r => (
                                    <div key={r.id} className="relative group">
                                        <div onClick={() => handleEdit(r)} className={`${theme.card} p-3 rounded-lg border ${theme.border} hover:border-stone-400 cursor-pointer active:scale-[0.99] transition-all shadow-sm`}>
                                            <div className={`${theme.text} whitespace-pre-wrap leading-relaxed break-words pr-6`} style={{ whiteSpace: 'pre-wrap' }}>{r.text}</div>
                                            <div className="mt-2 flex justify-between items-center">
                                                <span className="text-[10px] text-gray-400">{new Date(r.timestamp).toLocaleString()}</span>
                                                <span className="text-[10px] text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity">點擊修改</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDelete(r.id); }} 
                                            className="absolute right-3 top-3 p-1 text-stone-300 hover:text-red-500 transition-colors z-10"
                                            title="刪除回應"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )) : (
                                    <div className="text-center text-gray-400 py-8">尚無回應，寫下第一筆靈感吧！</div>
                                )}
                            </div>

                            <button onClick={handleNew} className={`mt-auto w-full py-3 ${theme.card} hover:bg-stone-200 ${theme.text} rounded-xl font-bold flex items-center justify-center gap-2 transition-colors sticky bottom-0 shadow-sm border ${theme.border}`}>
                                <Plus className="w-5 h-5"/> 新增回應
                            </button>
                        </>
                    ) : (
                        <textarea 
                            className={`flex-1 w-full ${theme.card} p-4 ${theme.text} text-lg leading-relaxed outline-none resize-none placeholder-gray-400 rounded-xl border ${theme.border} focus:border-stone-400 transition-colors`}
                            placeholder="在這裡寫下你的想法..."
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            autoFocus
                        />
                    )}
                </div>
            </div>

            {/* [新增] 尚未存檔提示框 (完全採用與 App 一致的樣式) */}
            {showUnsavedAlert && (
                <div className="fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => { if(e.target === e.currentTarget) setShowUnsavedAlert(false); }}>
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-xs w-full animate-in zoom-in-95">
                        <h3 className="font-bold text-lg mb-2 text-stone-800">尚未存檔</h3>
                        <p className="text-sm text-stone-600 mb-6">您有變更尚未儲存，確定要直接離開嗎？</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setShowUnsavedAlert(false);
                                    setPendingAction(null);
                                }}
                                className="flex-1 px-4 py-2 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg font-bold transition-colors"
                            >
                                繼續編輯
                            </button>
                            <button 
                                onClick={() => {
                                    setShowUnsavedAlert(false);
                                    if (pendingAction) pendingAction();
                                }} 
                                className="flex-1 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg font-bold transition-colors"
                            >
                                確定離開
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// === 6. 所有筆記列表 Modal (支援分類顯示) ===
// [修正] 搜尋樣式優化：筆記使用底色，分類使用卡片色；搜尋返回強制回總分類
const AllNotesModal = ({ 
    user, // [Isolation]
    notes, setNotes, onClose, onItemClick, onDelete, 
    viewLevel, setViewLevel, 
    selectedSuper, setSelectedSuper,       
    selectedCategory, setSelectedCategory, 
    selectedSubcategory, setSelectedSubcategory, 
    categorySearchTerm, setCategorySearchTerm, 
    categoryMap, setCategoryMap, superCategoryMap, setSuperCategoryMap, 
    setHasDataChangedInSession, theme,
    onAddNote, // [新增] 接收新增筆記的 callback
    onDeleteCategory // [新增] 接收分類刪除功能
}) => {
    
    // [新增] 處理新增分類或筆記的邏輯
    const handleAdd = async () => {
        if (viewLevel === 'notes') {
            // 新增筆記：呼叫主程式開啟編輯器，並預填當前分類路徑
            onAddNote({
                superCategory: selectedSuper,
                category: selectedCategory,
                subcategory: selectedSubcategory
            });
            return;
        }

        const typeName = viewLevel === 'superCategories' ? '總分類' : 
                         viewLevel === 'categories' ? '大分類' : '次分類';
        
        // [修改] 改用自定義視窗取代 prompt
        setInputValue(""); // 清空輸入框
        setInputConfig({
            title: `新增${typeName}`,
            placeholder: `請輸入${typeName}名稱 (最多16字)`,
            callback: async (newName) => {
                const name = newName.trim();
                const updates = [];

                if (viewLevel === 'superCategories') {
                    if (superCategoryMap[name]) { alert("該總分類已存在"); return; }
                    
                    const newMap = { ...superCategoryMap, [name]: [] };
                    setSuperCategoryMap(newMap);
                    
                    if (window.fs && window.db && user) {
                        updates.push(window.fs.setDoc(window.fs.doc(window.db, "settings", `layout_${user.uid}`), 
                            { superCategoryMapJSON: JSON.stringify(newMap) }, { merge: true }));
                    }
                } 
                else if (viewLevel === 'categories') {
                    if (categoryMap[name]) { alert("該大分類已存在"); return; }
                    
                    // 1. 更新大分類地圖 (建立空陣列)
                    const newCatMap = { ...categoryMap, [name]: [] };
                    setCategoryMap(newCatMap);

                    // 2. 更新總分類地圖 (將新大分類加入目前選定的總分類中)
                    const newSuperMap = { ...superCategoryMap };
                    if (!newSuperMap[selectedSuper]) newSuperMap[selectedSuper] = [];
                    if (!newSuperMap[selectedSuper].includes(name)) newSuperMap[selectedSuper].push(name);
                    setSuperCategoryMap(newSuperMap);

                    if (window.fs && window.db && user) {
                        updates.push(window.fs.setDoc(window.fs.doc(window.db, "settings", `layout_${user.uid}`), 
                            { 
                                categoryMapJSON: JSON.stringify(newCatMap),
                                superCategoryMapJSON: JSON.stringify(newSuperMap)
                            }, { merge: true }));
                    }
                } 
                else if (viewLevel === 'subcategories') {
                    const currentSubs = categoryMap[selectedCategory] || [];
                    if (currentSubs.includes(name)) { alert("該次分類已存在"); return; }

                    // 更新大分類地圖 (將新次分類加入目前選定的大分類中)
                    const newCatMap = { ...categoryMap };
                    if (!newCatMap[selectedCategory]) newCatMap[selectedCategory] = [];
                    newCatMap[selectedCategory].push(name);
                    setCategoryMap(newCatMap);

                    if (window.fs && window.db && user) {
                        updates.push(window.fs.setDoc(window.fs.doc(window.db, "settings", `layout_${user.uid}`), 
                            { categoryMapJSON: JSON.stringify(newCatMap) }, { merge: true }));
                    }
                }

                if (updates.length > 0) try { await Promise.all(updates); } catch(e) { console.error(e); }
                if (setHasDataChangedInSession) setHasDataChangedInSession(true);
            }
        });
        setShowInputModal(true);
    };

    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);
    
    const [contextMenu, setContextMenu] = useState(null);
    const [moveConfig, setMoveConfig] = useState(null);

    // [新增] 自定義輸入視窗狀態 (取代 prompt)
    const [showInputModal, setShowInputModal] = useState(false);
    const [inputConfig, setInputConfig] = useState(null); 
    const [inputValue, setInputValue] = useState("");

    // [新增] 筆記編輯提示窗狀態
    const [showNoteEditAlert, setShowNoteEditAlert] = useState(false);

    // [新增] 處理長按選單的歷史紀錄與返回鍵 (確保按返回是關閉選單而不是跳轉頁面)
    useEffect(() => {
        if (contextMenu) {
            // 1. 開啟選單時，推入一筆歷史紀錄
            window.history.pushState({ page: 'modal_context', id: Date.now() }, '', '');

            // 2. 定義返回鍵處理函式
            const handlePopState = () => {
                // 當使用者按返回鍵時，關閉選單
                setContextMenu(null);
            };

            window.addEventListener('popstate', handlePopState);
            return () => window.removeEventListener('popstate', handlePopState);
        }
    }, [contextMenu]);

    // [新增] 處理移動視窗的歷史紀錄與返回鍵
    useEffect(() => {
        if (moveConfig) {
            // 1. 開啟移動視窗時，推入一筆歷史紀錄
            window.history.pushState({ page: 'modal_move', id: Date.now() }, '', '');

            // 2. 定義返回鍵處理函式
            const handlePopState = () => {
                // 當使用者按返回鍵 (觸發 popstate) 時，關閉移動視窗
                // 此時瀏覽器已經退回上一頁 (即原本的列表頁面)，我們只需更新 UI 狀態
                setMoveConfig(null);
            };

            window.addEventListener('popstate', handlePopState);
            return () => window.removeEventListener('popstate', handlePopState);
        }
    }, [moveConfig]);

    const viewLevelToType = {
        'superCategories': 'superCategory',
        'categories': 'category',
        'subcategories': 'subcategory',
        'notes': 'note'
    };

    // [新增] 混合搜尋邏輯
    const searchResults = useMemo(() => {
        if (!categorySearchTerm) return [];
        const term = categorySearchTerm.toLowerCase();
        const results = [];

        // [關鍵修正] 改為「階層式搜尋」，只搜尋掛在現有總分類下的結構
        // 這樣如果分類被刪除(斷開連結)，底下的資料就不會被搜出來
        
        Object.entries(superCategoryMap).forEach(([sup, cats]) => {
            // 1. 檢查總分類
            if (sup.toLowerCase().includes(term)) {
                results.push({ type: 'superCategory', id: sup, name: sup });
            }

            // 遍歷該總分類下的大分類
            if (Array.isArray(cats)) {
                cats.forEach(cat => {
                    // 2. 檢查大分類
                    if (cat.toLowerCase().includes(term)) {
                        results.push({ type: 'category', id: cat, name: cat, parent: sup });
                    }

                    // 遍歷該大分類下的次分類
                    const subs = categoryMap[cat] || [];
                    subs.forEach(sub => {
                        // 3. 檢查次分類
                        if (sub.toLowerCase().includes(term)) {
                            results.push({ type: 'subcategory', id: `${cat}-${sub}`, name: sub, parent: cat, superParent: sup });
                        }
                    });
                });
            }
        });

        // 4. 搜尋筆記 (notes 狀態本身已經過濾掉被刪除的筆記，所以這裡不用改)
        notes.filter(n => 
            n.title.toLowerCase().includes(term) || 
            n.content.toLowerCase().includes(term)
        ).forEach(n => {
            results.push({ type: 'note', data: n });
        });

        return results;
    }, [categorySearchTerm, notes, superCategoryMap, categoryMap]);

    const handleSearchResultClick = (item) => {
        if (item.type === 'note') {
            onItemClick(item.data);
        } else if (item.type === 'superCategory') {
            setSelectedSuper(item.name);
            setViewLevel('categories');
            window.history.pushState({ page: 'modal', level: 'categories', time: Date.now() }, '', '');
            setCategorySearchTerm(""); 
        } else if (item.type === 'category') {
            setSelectedSuper(item.parent);
            setSelectedCategory(item.name);
            setViewLevel('subcategories');
            window.history.pushState({ page: 'modal', level: 'subcategories', time: Date.now() }, '', '');
            setCategorySearchTerm("");
        } else if (item.type === 'subcategory') {
            setSelectedSuper(item.superParent);
            setSelectedCategory(item.parent);
            setSelectedSubcategory(item.name);
            setViewLevel('notes');
            window.history.pushState({ page: 'modal', level: 'notes', time: Date.now() }, '', '');
            setCategorySearchTerm("");
        }
    };

    // [新增] 處理搜尋返回：清空搜尋並回到總分類
    const handleSearchBack = () => {
        setCategorySearchTerm("");
        setViewLevel('superCategories');
        setSelectedSuper(null);
        setSelectedCategory(null);
        setSelectedSubcategory(null);
    };

    const currentList = useMemo(() => {
        if (viewLevel === 'superCategories') return Object.keys(superCategoryMap || {});
        if (viewLevel === 'categories') return superCategoryMap[selectedSuper] || [];
        if (viewLevel === 'subcategories') return categoryMap[selectedCategory] || [];
        if (viewLevel === 'notes') {
            return notes.filter(n => 
                (n.superCategory || "其他") === selectedSuper &&
                (n.category || "未分類") === selectedCategory && 
                (n.subcategory || "一般") === selectedSubcategory
            );
        }
        return [];
    }, [viewLevel, superCategoryMap, categoryMap, notes, selectedSuper, selectedCategory, selectedSubcategory]);

    const handleSort = () => {
        if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
            resetDrag(); return;
        }
        const list = [...currentList];
        const draggedContent = list[dragItem.current];
        
        if (viewLevel === 'notes') {
            // 筆記排序 (略)
        } else {
            list.splice(dragItem.current, 1);
            list.splice(dragOverItem.current, 0, draggedContent);
            
            if (viewLevel === 'superCategories') {
                const newMap = {};
                list.forEach(key => { newMap[key] = superCategoryMap[key]; });
                setSuperCategoryMap(newMap);
                syncToCloud(`layout_${user.uid}`, { superCategoryMapJSON: JSON.stringify(newMap) });
            } 
            else if (viewLevel === 'categories') {
                const newMap = { ...superCategoryMap };
                newMap[selectedSuper] = list;
                setSuperCategoryMap(newMap);
                syncToCloud(`layout_${user.uid}`, { superCategoryMapJSON: JSON.stringify(newMap) });
            }
            else if (viewLevel === 'subcategories') {
                const newMap = { ...categoryMap };
                newMap[selectedCategory] = list;
                setCategoryMap(newMap);
                syncToCloud(`layout_${user.uid}`, { categoryMapJSON: JSON.stringify(newMap) });
            }
        }
        resetDrag();
        if (setHasDataChangedInSession) setHasDataChangedInSession(true);
    };

    const resetDrag = () => { dragItem.current = null; dragOverItem.current = null; setDraggingIndex(null); setDragOverIndex(null); };
    const syncToCloud = (docName, data) => { if (window.fs && window.db && user) window.fs.setDoc(window.fs.doc(window.db, "settings", docName), data, { merge: true }); };

    // [修改] 啟動移動流程：初始化狀態，不再預先計算目標
    const handleMove = () => {
        if (!contextMenu) return;
        const { type, item } = contextMenu;
        
        // 初始化移動設定，統一從「選擇總分類」開始，確保邏輯一致
        setMoveConfig({ 
            type, 
            item, 
            step: 'super', 
            targetSuper: null, 
            targetCategory: null 
        });
        setContextMenu(null);
    };

    // [新增] 分階段移動邏輯
    const handleMoveSelect = async (selection) => {
        if (!moveConfig) return;
        const { type, item, step, targetSuper, targetCategory } = moveConfig;
        const updates = [];

        // === 階段 1: 選擇總分類 ===
        if (step === 'super') {
            const nextSuper = selection;

            if (type === 'category') {
                // [終點] 移動「大分類」
                if (superCategoryMap[nextSuper]?.includes(item)) {
                    alert(`總分類「${nextSuper}」下已存在相同名稱的大分類`);
                    return;
                }

                // 1. 更新結構 (從舊移除，加入新)
                const newSuperMap = { ...superCategoryMap };
                newSuperMap[selectedSuper] = newSuperMap[selectedSuper].filter(c => c !== item);
                if (!newSuperMap[nextSuper]) newSuperMap[nextSuper] = [];
                newSuperMap[nextSuper].push(item);
                setSuperCategoryMap(newSuperMap);

                // 2. 寫入資料庫 (Layout)
                if (window.fs && window.db && user) {
                    updates.push(window.fs.setDoc(window.fs.doc(window.db, "settings", `layout_${user.uid}`), 
                        { superCategoryMapJSON: JSON.stringify(newSuperMap) }, { merge: true }));
                }

                // 3. 更新旗下所有筆記
                const newNotes = notes.map(n => {
                    if ((n.category || "未分類") === item && (n.superCategory || "其他") === selectedSuper) {
                        const updatedNote = { ...n, superCategory: nextSuper };
                        if (window.fs && window.db) {
                            updates.push(window.fs.setDoc(window.fs.doc(window.db, "notes", String(n.id)), 
                                { superCategory: nextSuper }, { merge: true }));
                        }
                        return updatedNote;
                    }
                    return n;
                });
                setNotes(newNotes);

                // 4. 完成與跳轉
                try { await Promise.all(updates); } catch(e) {}
                setSelectedSuper(nextSuper); // 跳轉到新總分類
                // setSelectedCategory(item); // 保持選中該大分類
                // setViewLevel('categories'); 
                setMoveConfig(null);
                if (setHasDataChangedInSession) setHasDataChangedInSession(true);

            } else {
                // [過場] 移動次分類或筆記 -> 下一步：選擇大分類
                const cats = superCategoryMap[nextSuper] || [];
                if (cats.length === 0) {
                    alert(`總分類「${nextSuper}」下沒有大分類，無法移動至此。`);
                    return;
                }
                setMoveConfig({ ...moveConfig, step: 'category', targetSuper: nextSuper });
            }
        }
        
        // === 階段 2: 選擇大分類 ===
        else if (step === 'category') {
            const nextCategory = selection;

            if (type === 'subcategory') {
                // [終點] 移動「次分類」
                const currentSubs = categoryMap[nextCategory] || [];
                if (currentSubs.includes(item)) {
                    alert(`大分類「${nextCategory}」下已存在相同名稱的次分類`);
                    return;
                }

                // 1. 更新結構
                const newCatMap = { ...categoryMap };
                newCatMap[selectedCategory] = newCatMap[selectedCategory].filter(s => s !== item);
                if (!newCatMap[nextCategory]) newCatMap[nextCategory] = [];
                newCatMap[nextCategory].push(item);
                setCategoryMap(newCatMap);

                // 2. 寫入資料庫
                if (window.fs && window.db && user) {
                    updates.push(window.fs.setDoc(window.fs.doc(window.db, "settings", `layout_${user.uid}`), 
                        { categoryMapJSON: JSON.stringify(newCatMap) }, { merge: true }));
                }

                // 3. 更新旗下所有筆記 (同時更新 superCategory 與 category)
                const newNotes = notes.map(n => {
                    if ((n.subcategory || "一般") === item && (n.category || "未分類") === selectedCategory) {
                        const updatedNote = { ...n, superCategory: targetSuper, category: nextCategory };
                        if (window.fs && window.db) {
                            updates.push(window.fs.setDoc(window.fs.doc(window.db, "notes", String(n.id)), 
                                { superCategory: targetSuper, category: nextCategory }, { merge: true }));
                        }
                        return updatedNote;
                    }
                    return n;
                });
                setNotes(newNotes);

                // 4. 完成與跳轉
                try { await Promise.all(updates); } catch(e) {}
                setSelectedSuper(targetSuper);
                setSelectedCategory(nextCategory);
                setViewLevel('subcategories'); // 跳轉到新地點的次分類列表
                
                setMoveConfig(null);
                if (setHasDataChangedInSession) setHasDataChangedInSession(true);

            } else {
                // [過場] 移動筆記 -> 下一步：選擇次分類
                // 若該大分類無次分類，系統稍後會自動提供「一般」或允許移動
                setMoveConfig({ ...moveConfig, step: 'subcategory', targetCategory: nextCategory });
            }
        }

        // === 階段 3: 選擇次分類 ===
        else if (step === 'subcategory') {
            const nextSubcategory = selection;
            
            // [終點] 移動「筆記」
            const newNotes = notes.map(n => {
                if (n.id === item.id) {
                    const updatedNote = { 
                        ...n, 
                        superCategory: targetSuper, 
                        category: targetCategory, 
                        subcategory: nextSubcategory 
                    };
                    if (window.fs && window.db) {
                        updates.push(window.fs.setDoc(window.fs.doc(window.db, "notes", String(n.id)), 
                            { 
                                superCategory: targetSuper, 
                                category: targetCategory, 
                                subcategory: nextSubcategory 
                            }, { merge: true }));
                    }
                    return updatedNote;
                }
                return n;
            });
            setNotes(newNotes);

            try { await Promise.all(updates); } catch(e) {}

            // 跳轉到新筆記的位置
            setSelectedSuper(targetSuper);
            setSelectedCategory(targetCategory);
            setSelectedSubcategory(nextSubcategory);
            setViewLevel('notes');

            setMoveConfig(null);
            if (setHasDataChangedInSession) setHasDataChangedInSession(true);
        }
    };

    const handleDelete = () => {
        if (!contextMenu) return;
        const { type, item } = contextMenu;
        
        if (type === 'note') {
            onDelete(item.id);
        } else {
            // 呼叫主程式傳入的分類刪除函式
            onDeleteCategory(type, item);
        }
        setContextMenu(null);
    };
    
    const handleRename = async () => {
        if (!contextMenu) return;
        const { type, item } = contextMenu;
        if (type === 'note') { setShowNoteEditAlert(true); setContextMenu(null); return; }

        // [修改] 改用自定義視窗取代 prompt
        setInputValue(item); // 預填舊名稱
        setInputConfig({
            title: '重新命名',
            placeholder: `請輸入新的名稱 (最多16字)`,
            callback: async (newName) => {
                if (newName === item) return;
                
                let isDuplicate = false;
                if (type === 'superCategory' && superCategoryMap[newName]) isDuplicate = true;
                else if (type === 'category' && categoryMap[newName]) isDuplicate = true;
                else if (type === 'subcategory') {
                    const subs = categoryMap[selectedCategory] || [];
                    if (subs.includes(newName)) isDuplicate = true;
                }

                if (isDuplicate) { alert("新名稱已存在，請使用其他名稱。"); return; }

                const updates = [];
                let updatedNotes = [...notes];
                const layoutDocId = user ? `layout_${user.uid}` : "layout"; // Helper for isolation

                if (type === 'superCategory') {
                    if (selectedSuper === item) setSelectedSuper(newName);
                    const newMap = { ...superCategoryMap };
                    newMap[newName] = newMap[item]; delete newMap[item];
                    setSuperCategoryMap(newMap);
                    if (window.fs && window.db && user) updates.push(window.fs.setDoc(window.fs.doc(window.db, "settings", layoutDocId), { superCategoryMapJSON: JSON.stringify(newMap) }, { merge: true }));
                    updatedNotes = notes.map(n => {
                        if ((n.superCategory || "其他") === item) {
                            const newNote = { ...n, superCategory: newName };
                            if (window.fs && window.db) updates.push(window.fs.setDoc(window.fs.doc(window.db, "notes", String(n.id)), { superCategory: newName }, { merge: true }));
                            return newNote;
                        }
                        return n;
                    });
                } else if (type === 'category') {
                    if (selectedCategory === item) setSelectedCategory(newName);
                    const newCatMap = { ...categoryMap };
                    newCatMap[newName] = newCatMap[item]; delete newCatMap[item];
                    setCategoryMap(newCatMap);
                    const newSuperMap = { ...superCategoryMap };
                    Object.keys(newSuperMap).forEach(k => {
                        const idx = newSuperMap[k].indexOf(item); if (idx !== -1) newSuperMap[k][idx] = newName;
                    });
                    setSuperCategoryMap(newSuperMap);
                    if (window.fs && window.db && user) {
                        updates.push(window.fs.setDoc(window.fs.doc(window.db, "settings", layoutDocId), { categoryMapJSON: JSON.stringify(newCatMap), superCategoryMapJSON: JSON.stringify(newSuperMap) }, { merge: true }));
                    }
                    updatedNotes = notes.map(n => {
                        if ((n.category || "未分類") === item) {
                            const newNote = { ...n, category: newName };
                            if (window.fs && window.db) updates.push(window.fs.setDoc(window.fs.doc(window.db, "notes", String(n.id)), { category: newName }, { merge: true }));
                            return newNote;
                        }
                        return n;
                    });
                } else if (type === 'subcategory') {
                    if (selectedSubcategory === item) setSelectedSubcategory(newName);
                    const newCatMap = { ...categoryMap };
                    const subs = newCatMap[selectedCategory] || [];
                    const idx = subs.indexOf(item);
                    if (idx !== -1) { subs[idx] = newName; newCatMap[selectedCategory] = subs; }
                    setCategoryMap(newCatMap);
                    if (window.fs && window.db && user) updates.push(window.fs.setDoc(window.fs.doc(window.db, "settings", layoutDocId), { categoryMapJSON: JSON.stringify(newCatMap) }, { merge: true }));
                    updatedNotes = notes.map(n => {
                        if ((n.category || "未分類") === selectedCategory && (n.subcategory || "一般") === item) {
                            const newNote = { ...n, subcategory: newName };
                            if (window.fs && window.db) updates.push(window.fs.setDoc(window.fs.doc(window.db, "notes", String(n.id)), { subcategory: newName }, { merge: true }));
                            return newNote;
                        }
                        return n;
                    });
                }

                setNotes(updatedNotes);
                if (setHasDataChangedInSession) setHasDataChangedInSession(true);
                if (updates.length > 0) try { await Promise.all(updates); } catch(e) {}
            }
        });
        setContextMenu(null); // Close context menu
        setShowInputModal(true); // Open Input modal
    };

    const handleBack = () => { window.history.back(); };

    const pressTimer = useRef(null);
    const handleTouchStart = (e, index) => { e.stopPropagation(); dragItem.current = index; setDraggingIndex(index); };
    const handleTouchMove = (e) => { if (e.cancelable) e.preventDefault(); const touch = e.touches[0]; const target = document.elementFromPoint(touch.clientX, touch.clientY); const row = target?.closest('[data-index]'); if (row) { const idx = parseInt(row.dataset.index, 10); if (!isNaN(idx)) { dragOverItem.current = idx; setDragOverIndex(idx); } } };
    const handleTouchEnd = () => handleSort();
    
    const bindLongPress = (onLongPress, onClick) => {
        const start = (e) => {
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            pressTimer.current = setTimeout(() => { if (navigator.vibrate) navigator.vibrate(50); onLongPress(cx, cy); }, 600);
        };
        const end = () => clearTimeout(pressTimer.current);
        return { 
            onMouseDown: start, onTouchStart: start, onMouseUp: end, onMouseLeave: end, onTouchEnd: end,
            onClick: (e) => { if (pressTimer.current) clearTimeout(pressTimer.current); onClick(e); }
        };
    };

    return (
        <div className={`fixed inset-0 z-40 ${theme.bg} flex flex-col animate-in slide-in-from-right duration-300`}>
             <div className={`p-4 border-b ${theme.border} ${theme.card} flex justify-between items-center sticky top-0 z-10`}>
                {/* 左側區域：返回按鈕 + 標題 (使用 overflow-hidden 確保標題過長時會截斷) */}
                <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                    {(!categorySearchTerm) ? (
                        <button 
                            onClick={viewLevel === 'superCategories' ? onClose : handleBack} 
                            className="p-1 -ml-2 text-stone-500 hover:bg-stone-100 rounded-full mr-1 shrink-0"
                        >
                            {viewLevel === 'superCategories' ? <X className="w-5 h-5" /> : <IconBase d="M15 18l-6-6 6-6" />}
                        </button>
                    ) : (
                        // [修正] 搜尋模式下的返回按鈕：點擊後清空搜尋並回到總分類 (強制重置)
                        <button onClick={handleSearchBack} className="p-1 -ml-2 text-stone-500 hover:bg-stone-100 rounded-full mr-1 shrink-0"><IconBase d="M15 18l-6-6 6-6" /></button>
                    )}
                    
                    <h2 className={`font-bold text-lg flex items-center gap-2 ${theme.text} overflow-hidden text-ellipsis whitespace-nowrap`}>
                        {categorySearchTerm ? "搜尋結果" : 
                         viewLevel === 'superCategories' ? "總分類" : 
                         viewLevel === 'categories' ? selectedSuper : 
                         viewLevel === 'subcategories' ? `${selectedSuper} > ${selectedCategory}` : 
                         `${selectedSuper} > ${selectedCategory} > ${selectedSubcategory}`}
                    </h2>
                </div>
                
                {/* 右側區域：新增按鈕 (獨立出來，靠右對齊) */}
                {!categorySearchTerm && (
                    <button 
                        onClick={handleAdd}
                        className={`p-2 rounded-full hover:bg-stone-200 transition-colors ${theme.subtext} shrink-0`}
                        title={viewLevel === 'notes' ? "新增筆記" : "新增分類"}
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                )}
            </div>

            <div className={`p-4 ${theme.bg} sticky top-[69px] z-10`}>
                <input type="text" placeholder="搜尋分類與筆記..." className={`w-full ${theme.card} border ${theme.border} rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 ${theme.text}`} value={categorySearchTerm} onChange={(e) => setCategorySearchTerm(e.target.value)} />
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-20">
                {categorySearchTerm ? (
                    // [修正] 搜尋結果顯示：區分分類與筆記
                    searchResults.length > 0 ? (
                        searchResults.map((item, index) => {
                            if (item.type === 'note') {
                                const noteData = item.data;
                                return (
                                    // [配色調整] 筆記項目：改用卡片底色 (theme.card) + 左側強調邊框
                                    <div key={noteData.id} className={`${theme.card} border-l-4 ${theme.border} p-4 rounded-xl shadow-sm mb-3 cursor-pointer select-none transition-all`} onClick={() => handleSearchResultClick(item)}>
                                        <div className="text-xs text-stone-400 mb-1 font-mono">
                                            {noteData.category} <span className="opacity-40">|</span> {noteData.subcategory}
                                        </div>
                                        <h4 className={`font-bold ${theme.text}`}>{noteData.title}</h4>
                                        <p className={`text-sm ${theme.subtext} line-clamp-1`}>{noteData.content}</p>
                                    </div>
                                );
                            } else {
                                // 分類項目 (總/大/次)
                                return (
                                    // [配色調整] 分類項目：改用 APP 底色 (theme.bg)
                                    <div key={`${item.type}-${item.id}`} 
                                         className={`${theme.bg} border ${theme.border} p-4 rounded-xl shadow-sm mb-3 flex items-center cursor-pointer hover:border-stone-300 select-none transition-all`}
                                         onClick={() => handleSearchResultClick(item)}>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded text-white font-bold ${
                                                    item.type === 'superCategory' ? 'bg-indigo-400' : 
                                                    item.type === 'category' ? 'bg-teal-500' : 'bg-orange-400'
                                                }`}>
                                                    {item.type === 'superCategory' ? '總分類' : item.type === 'category' ? '大分類' : '次分類'}
                                                </span>
                                            </div>
                                            <h4 className={`font-bold text-lg mt-1 ${theme.text}`}>{item.name}</h4>
                                            {item.type !== 'superCategory' && (
                                                <p className="text-xs text-stone-400 mt-1">
                                                    {item.type === 'category' ? `位於: ${item.parent}` : `位於: ${item.parent}`}
                                                </p>
                                            )}
                                        </div>
                                        <IconBase d="M9 18l6-6-6-6" className="text-stone-300 w-5 h-5" />
                                    </div>
                                );
                            }
                        })
                    ) : (
                        <div className="text-center text-gray-400 mt-10">沒有找到相關結果</div>
                    )
                ) : (
                    currentList.map((item, index) => {
                        const isDragging = index === draggingIndex;
                        const isDragOver = index === dragOverIndex && index !== draggingIndex;
                        const isNote = viewLevel === 'notes';
                        
                        let count = 0;
                        if (viewLevel === 'superCategories') {
                            count = notes.filter(n => (n.superCategory || "其他") === item).length;
                        } else if (viewLevel === 'categories') {
                            count = notes.filter(n => (n.superCategory || "其他") === selectedSuper && (n.category || "未分類") === item).length;
                        } else if (viewLevel === 'subcategories') {
                            count = notes.filter(n => 
                                (n.superCategory || "其他") === selectedSuper && 
                                (n.category || "未分類") === selectedCategory && 
                                (n.subcategory || "一般") === item
                            ).length;
                        }

                        return (
                            <div key={isNote ? item.id : item} 
                                 data-index={index}
                                 {...bindLongPress(
                                     (x, y) => setContextMenu({ visible: true, x, y, type: viewLevelToType[viewLevel], item }),
                                     () => {
                                         if (isNote) onItemClick(item);
                                         else {
                                             if (viewLevel === 'superCategories') { 
                                                 setSelectedSuper(item); 
                                                 setViewLevel('categories'); 
                                                 window.history.pushState({ page: 'modal', level: 'categories', time: Date.now() }, '', '');
                                             }
                                             else if (viewLevel === 'categories') { 
                                                 setSelectedCategory(item); 
                                                 setViewLevel('subcategories'); 
                                                 window.history.pushState({ page: 'modal', level: 'subcategories', time: Date.now() }, '', '');
                                             }
                                             else if (viewLevel === 'subcategories') { 
                                                 setSelectedSubcategory(item); 
                                                 setViewLevel('notes'); 
                                                 window.history.pushState({ page: 'modal', level: 'notes', time: Date.now() }, '', '');
                                             }
                                         }
                                     }
                                 )}
                                 // [配色調整] 分類用 theme.bg (APP底色)，筆記用 theme.card (卡片色)
                                 // isNote ? theme.card : theme.bg
                                 className={`
                                    ${isDragging ? 'bg-stone-100 border-stone-400 scale-[1.02] z-20' : 
                                      `${isNote ? theme.card : theme.bg} ${theme.border} ${isNote ? 'border-l-4' : ''}`
                                    } 
                                    ${isDragOver ? 'border-t-[3px] border-t-[#2c3e50] mt-2' : ''} 
                                    p-4 rounded-xl shadow-sm border mb-3 flex items-center cursor-pointer select-none transition-all
                                 `}>
                                <div className="flex-1">
                                    {isNote && (
                                        <div className="mb-1">
                                             <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded tracking-wide">
                                                {item.category} <span className="opacity-40">|</span> {item.subcategory}
                                             </span>
                                        </div>
                                    )}
                                    
                                    <h4 className={`font-bold text-lg ${theme.text}`}>{isNote ? item.title : item}</h4>
                                    {!isNote && count === 0 && <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full ml-2">空</span>}
                                    {isNote && <p className={`text-sm ${theme.subtext} line-clamp-1`}>{item.content}</p>}
                                </div>
                                {!isNote && (
                                    <div className="p-2 -mr-2 text-stone-300 hover:text-stone-500 cursor-grab touch-none"
                                         onTouchStart={(e) => handleTouchStart(e, index)} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
                                         onMouseDown={(e) => { e.stopPropagation(); dragItem.current = index; }}
                                         draggable onDragStart={() => (dragItem.current = index)}
                                         onDragEnter={() => { dragOverItem.current = index; setDragOverIndex(index); }}
                                         onDragEnd={handleSort} onClick={(e) => e.stopPropagation()}>
                                        <GripVertical className="w-6 h-6" />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {contextMenu && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setContextMenu(null)} />
                    <div className={`fixed z-[70] ${theme.card} rounded-xl shadow-xl border ${theme.border} min-w-[160px] flex flex-col overflow-hidden`}
                         style={{ top: Math.min(contextMenu.y, window.innerHeight - 150), left: Math.min(contextMenu.x, window.innerWidth - 160) }}>
                        {contextMenu.type !== 'superCategory' && (
                            <button onClick={handleMove} className={`w-full text-left px-4 py-3 hover:bg-stone-50 ${theme.text} font-bold text-sm border-b ${theme.border} flex items-center gap-2`}>
                                <MoveRight className="w-4 h-4"/> 移動
                            </button>
                        )}
                        <button onClick={handleRename} className={`w-full text-left px-4 py-3 hover:bg-stone-50 ${theme.text} font-bold text-sm border-b ${theme.border} flex items-center gap-2`}>
                            <Edit className="w-4 h-4"/> 重新命名
                        </button>
                        <button onClick={handleDelete} className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-bold text-sm flex items-center gap-2">
                            <Trash2 className="w-4 h-4"/> 刪除
                        </button>
                    </div>
                </>
            )}

            {moveConfig && (
                <div className="fixed inset-0 z-[80] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => { if(e.target === e.currentTarget) setMoveConfig(null); }}>
                    <div className={`${theme.card} rounded-xl shadow-2xl border ${theme.border} w-full max-w-xs overflow-hidden flex flex-col max-h-[60vh] animate-in zoom-in-95`}>
                        <div className={`p-4 border-b ${theme.border} font-bold text-center ${theme.text}`}>
                            {moveConfig.step === 'super' ? `移動至哪個總分類？` : 
                             moveConfig.step === 'category' ? `移動至「${moveConfig.targetSuper}」的哪個大分類？` :
                             `移動至「${moveConfig.targetCategory}」的哪個次分類？`}
                        </div>
                        <div className="overflow-y-auto p-2 custom-scrollbar">
                            {(() => {
                                let options = [];
                                // 根據當前步驟決定顯示什麼清單
                                if (moveConfig.step === 'super') {
                                    options = Object.keys(superCategoryMap);
                                    // 若移動大分類，排除自己所在的總分類
                                    if (moveConfig.type === 'category') {
                                        options = options.filter(k => k !== selectedSuper);
                                    }
                                } else if (moveConfig.step === 'category') {
                                    options = superCategoryMap[moveConfig.targetSuper] || [];
                                    // 若移動次分類且目標總分類沒變，排除自己所在的大分類
                                    if (moveConfig.type === 'subcategory' && moveConfig.targetSuper === selectedSuper) {
                                        options = options.filter(k => k !== selectedCategory);
                                    }
                                } else if (moveConfig.step === 'subcategory') {
                                    options = categoryMap[moveConfig.targetCategory] || [];
                                    // 若無次分類，提供「一般」選項
                                    if (options.length === 0) options = ["一般"];
                                    // 若移動筆記且路徑沒變，排除自己所在的次分類
                                    if (moveConfig.type === 'note' && moveConfig.targetSuper === selectedSuper && moveConfig.targetCategory === selectedCategory) {
                                        options = options.filter(k => k !== selectedSubcategory);
                                    }
                                }

                                if (options.length === 0) {
                                    return <div className="p-4 text-center text-stone-400 text-sm">沒有可用的選項</div>;
                                }

                                return options.map(opt => (
                                    <button key={opt} onClick={() => handleMoveSelect(opt)} className={`w-full text-left px-4 py-3 rounded-lg hover:bg-stone-100 ${theme.text} font-bold text-sm mb-1 transition-colors`}>{opt}</button>
                                ));
                            })()}
                        </div>
                        <div className={`p-2 border-t ${theme.border}`}><button onClick={() => setMoveConfig(null)} className="w-full py-2 text-stone-400 font-bold text-xs hover:text-stone-600">取消</button></div>
                    </div>
                </div>
            )}

            {/* [新增] 自定義輸入/命名視窗 */}
            {showInputModal && inputConfig && (
                <div 
                    className="fixed inset-0 z-[80] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" 
                    onClick={(e) => { 
                        if(e.target === e.currentTarget) {
                            setShowInputModal(false);
                            setInputConfig(null);
                        }
                    }}
                >
                    <div className={`${theme.card} rounded-xl shadow-2xl p-6 max-w-xs w-full animate-in zoom-in-95 border ${theme.border}`}>
                        <h3 className={`font-bold text-lg mb-4 ${theme.text}`}>{inputConfig.title}</h3>
                        <input 
                            autoFocus
                            className={`w-full border ${theme.border} rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 mb-4 ${theme.bg} ${theme.text}`}
                            placeholder={inputConfig.placeholder}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    if (!inputValue.trim()) return;
                                    if (inputValue.length > 16) { alert("名稱不能超過16個字"); return; }
                                    inputConfig.callback(inputValue);
                                    setShowInputModal(false);
                                    setInputConfig(null);
                                }
                            }}
                        />
                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setShowInputModal(false);
                                    setInputConfig(null);
                                }}
                                className="flex-1 px-4 py-2 bg-stone-100 text-stone-600 hover:bg-stone-200 rounded-lg font-bold transition-colors text-xs"
                            >
                                取消
                            </button>
                            <button 
                                onClick={() => {
                                    if (!inputValue.trim()) return;
                                    if (inputValue.length > 16) { alert("名稱不能超過16個字"); return; }
                                    inputConfig.callback(inputValue);
                                    setShowInputModal(false);
                                    setInputConfig(null);
                                }}
                                className={`flex-1 px-4 py-2 ${theme.accent} ${theme.accentText} rounded-lg font-bold transition-colors text-xs shadow-md`}
                            >
                                確認
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* [新增] 筆記編輯提示視窗 */}
            {showNoteEditAlert && (
                <div 
                    className="fixed inset-0 z-[90] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" 
                    onClick={(e) => { 
                        if(e.target === e.currentTarget) setShowNoteEditAlert(false);
                    }}
                >
                    <div className={`${theme.card} rounded-xl shadow-2xl p-6 max-w-xs w-full animate-in zoom-in-95 border ${theme.border}`}>
                        <h3 className={`font-bold text-lg mb-2 ${theme.text}`}>提示</h3>
                        <p className={`text-sm ${theme.subtext} mb-6 leading-relaxed`}>
                            請點擊進入編輯模式修改主旨。
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowNoteEditAlert(false)}
                                className={`flex-1 px-4 py-2 ${theme.accent} ${theme.accentText} rounded-lg font-bold transition-colors text-xs shadow-md`}
                            >
                                我知道了
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// === 8. 列表項目 (給收藏與歷史使用) ===
const NoteListItem = ({ item, isHistory, allResponses, theme }) => {
    // 取得該筆記的所有新回應
    const newResponses = allResponses ? (allResponses[item.id] || []) : [];
    
    // [修正] 取得最新回應：因為回應現在是依時間正序排列 (舊->新)，所以最新的是最後一個 (length - 1)
    const latestResponse = newResponses.length > 0 ? newResponses[newResponses.length - 1] : null;
    
    // 決定要顯示哪一個回應
    const displayResponse = latestResponse ? latestResponse.text : item.journalEntry;

    return (
        <div className={`${theme.card} p-4 rounded-xl shadow-sm border ${theme.border} mb-3`} onClick={() => {
            const event = new CustomEvent('noteSelected', { detail: item.id });
            window.dispatchEvent(event);
        }}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-[10px] font-bold text-stone-500 bg-stone-200 px-2 py-1 rounded">{item.category || "未分類"}</span>
                    <span className="text-[10px] text-stone-400 ml-2">{item.subcategory}</span>
                </div>
            </div>
            <h4 className={`font-bold ${theme.text} mb-1`}>{item.title}</h4>
            <p className={`text-xs ${theme.subtext} line-clamp-2`}>{item.content}</p>
            
            {displayResponse && (
                <div className={`mt-3 pt-2 border-t ${theme.border}`}>
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] text-stone-400 font-bold flex items-center gap-1">
                            <PenLine className="w-3 h-3"/> 
                            {newResponses.length > 0 ? `最新回應 (${newResponses.length})` : "我的回應"}
                        </p>
                        {latestResponse && <span className="text-[9px] text-stone-300">{new Date(latestResponse.timestamp).toLocaleDateString()}</span>}
                    </div>
                    <p className="text-xs text-stone-600 italic line-clamp-2">{displayResponse}</p>
                </div>
            )}
        </div>
    );
};

// === [新增] 登入畫面組件 ===
const LoginScreen = ({ onLogin, theme }) => {
    return (
        <div className={`min-h-screen ${theme.bg} flex flex-col items-center justify-center p-4 transition-colors duration-300`}>
            <div className={`${theme.card} p-8 rounded-2xl shadow-2xl border ${theme.border} max-w-sm w-full text-center`}>
                <div className="mb-6 flex justify-center">
                    <img src="icon.png" className="w-20 h-20 rounded-2xl object-cover shadow-sm" alt="EchoScript" />
                </div>
                <h1 className={`text-2xl font-bold ${theme.text} mb-2`}>EchoScript</h1>
                <p className={`text-sm ${theme.subtext} mb-8`}>您的雲端靈感筆記庫</p>
                
                <button 
                    onClick={onLogin}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3 bg-[#4285F4] hover:bg-[#3367D6]`}
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    使用 Google 帳號登入
                </button>
                <p className={`mt-6 text-xs ${theme.subtext}`}>登入後，您的筆記將安全地儲存在雲端，且只有您自己看得到。</p>
            </div>
        </div>
    );
};


// === 主程式 ===
// === 主程式 ===
function EchoScriptApp() {
    // [Auth] 使用者狀態管理
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // [Auth] 監聽登入狀態
    useEffect(() => {
        if (!window.authFns || !window.auth) return;
        const unsubscribe = window.authFns.onAuthStateChanged(window.auth, (u) => {
            setUser(u);
            setAuthLoading(false);
            if (!u) {
                // [Isolation] 登出時重置所有敏感狀態，防止資料殘留
                setNotes([]);
                setTrash([]);
                setFavorites([]);
                setHistory([]);
                setAllResponses({});
                setCategoryMap({});
                setSuperCategoryMap({"總分類": ["大分類"]});
                // 重置其他狀態
                setIsSettingsLoaded(false);
                setIsHistoryLoaded(false);
                setPinnedNoteId(null);
            }
        });
        return () => unsubscribe();
    }, []);

    // [Auth] 登入動作
    const handleLogin = async () => {
        if (!window.authFns || !window.auth) return;
        
        // [修正] 點擊登入後立即設為載入中，避免選完帳號後短暫跳回登入畫面
        setAuthLoading(true);

        try {
            const provider = new window.authFns.GoogleAuthProvider();
            // [關鍵修正] 強制跳出帳號選擇視窗，避免自動登入上一個帳號
            provider.setCustomParameters({ prompt: 'select_account' });
            
            await window.authFns.signInWithPopup(window.auth, provider);
            // 登入成功後，onAuthStateChanged 會負責處理狀態更新與頁面切換
        } catch (error) {
            console.error("Login failed:", error);
            // 發生錯誤時 (或使用者關閉視窗)，必須把 loading 狀態改回來，讓使用者能重試
            setAuthLoading(false);
            // [修改] 顯示詳細錯誤代碼，以便除錯
            alert("登入錯誤:\n" + error.code + "\n" + error.message);
        }
    };
    
    // [Auth] 登出動作
    const handleLogout = async () => {
        if (!window.authFns || !window.auth) return;
        if (confirm("確定要登出嗎？")) {
            await window.authFns.signOut(window.auth);
            window.location.reload(); 
        }
    };

    const [notes, setNotes] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const preModalIndexRef = useRef(0);
    const [isAnimating, setIsAnimating] = useState(false);
    
    const [favorites, setFavorites] = useState([]);
    const [allResponses, setAllResponses] = useState({}); 
    
    const [history, setHistory] = useState([]);
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
    
    const [trash, setTrash] = useState([]);
    const [zoomedImage, setZoomedImage] = useState(null); // [新增] 圖片放大狀態

    // [新增] 監聽/載入雲端垃圾桶 (User Specific)
    useEffect(() => {
        if (!window.fs || !window.db || !user) return; // 依賴 user
        
        // [修改] 針對使用者 ID 讀取垃圾桶
        const docRef = window.fs.doc(window.db, "settings", `trash_${user.uid}`);
        
        const unsubscribe = window.fs.onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                if (data.trashJSON) {
                    try {
                        let cloudTrash = JSON.parse(data.trashJSON);
                        const now = Date.now();
                        const thirtyDaysMs = 30 * 86400000;
                        const validTrash = cloudTrash.filter(item => (now - new Date(item.deletedAt || 0).getTime()) < thirtyDaysMs);
                        setTrash(validTrash);
                        if (validTrash.length !== cloudTrash.length) {
                             window.fs.setDoc(docRef, { trashJSON: JSON.stringify(validTrash) }, { merge: true });
                        }
                    } catch (e) {}
                }
            }
        });
        return () => unsubscribe();
    }, [user]);
    const [recentIndices, setRecentIndices] = useState([]);
    // [新增] 未來堆疊：用於記錄「返回上一張」後，原本的「下一張」是誰 (實現重播機制)
    const [futureIndices, setFutureIndices] = useState([]);
    // [新增] 洗牌機制狀態：儲存洗好的順序 (Deck) 與目前抽到的位置 (Pointer)
    const [shuffleDeck, setShuffleDeck] = useState([]); 
    const [deckPointer, setDeckPointer] = useState(0);

    const [showMenuModal, setShowMenuModal] = useState(false);
    const [showAllNotesModal, setShowAllNotesModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    // [新增] 用於儲存新增筆記時的預設模板 (從列表按+時會帶入分類)
    const [newNoteTemplate, setNewNoteTemplate] = useState(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [activeTab, setActiveTab] = useState('favorites');
    const [notification, setNotification] = useState(null);
    
    // [新增] 抽卡功能狀態：選單顯示與目標總分類
    const [showShuffleMenu, setShowShuffleMenu] = useState(false);
    const [shuffleTarget, setShuffleTarget] = useState(null);

    // [新增] 分類結構地圖 { "大分類": ["次分類1", "次分類2"] }
    const [categoryMap, setCategoryMap] = useState({});
    // [新增] 總分類結構地圖 { "總分類": ["大分類1", "大分類2"] }
    const [superCategoryMap, setSuperCategoryMap] = useState({
        "總分類": ["大分類"] // 預設值
    });
    
    // [新增] 安全鎖：標記雲端設定是否已載入，防止手機端在還沒拿到資料前，就用不完整的本地資料覆蓋雲端
    const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
    
    // [新增] 外觀主題狀態
    const [currentThemeId, setCurrentThemeId] = useState('light');
    const theme = THEMES[currentThemeId] || THEMES.light;
    // [新增] 釘選筆記 ID 狀態
    const [pinnedNoteId, setPinnedNoteId] = useState(null);
    // [新增] 釘選卡片空狀態 (當刪除釘選筆記時顯示)
    const [showPinnedPlaceholder, setShowPinnedPlaceholder] = useState(false);
    // [關鍵修正] 使用 Ref 即時追蹤空狀態，防止 onSnapshot 閉包讀取舊值導致自動跳轉
    const showPinnedPlaceholderRef = useRef(false);
    useEffect(() => { showPinnedPlaceholderRef.current = showPinnedPlaceholder; }, [showPinnedPlaceholder]);
    
    // [新增] 當切換到有效筆記 (Swipe 或跳轉) 時，自動關閉空狀態
    useEffect(() => { 
        if (currentIndex !== -1) setShowPinnedPlaceholder(false); 
    }, [currentIndex]);

    // [新增] 監聽雲端設定 (Preferences/History) - User Specific
    useEffect(() => {
        if (!window.fs || !window.db || !user) return;
        
        // 1. Preferences
        const unsubPref = window.fs.onSnapshot(window.fs.doc(window.db, "settings", `preferences_${user.uid}`), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                if (data.themeId && THEMES[data.themeId]) setCurrentThemeId(data.themeId);
                if (data.pinnedNoteId !== undefined) setPinnedNoteId(data.pinnedNoteId);
                if (data.shuffleTarget !== undefined) setShuffleTarget(data.shuffleTarget);
            }
        });

        // 2. History
        const unsubHist = window.fs.onSnapshot(window.fs.doc(window.db, "settings", `history_${user.uid}`), (doc) => {
            if (doc.exists() && doc.data().historyJSON) {
                try { setHistory(JSON.parse(doc.data().historyJSON)); } catch(e){}
            }
            setIsHistoryLoaded(true);
        });

        return () => { unsubPref(); unsubHist(); };
    }, [user]);

    // [新增] 更新 Body 背景色 (確保滑動超過邊界時顏色一致)
    useEffect(() => {
        // 1. 取得精確的 Hex 色碼
        const hexColor = theme.hex || '#fafaf9';
        const isDark = currentThemeId === 'dark';

        // 2. [Direct DOM] 強制設定 html/body 背景色
        // 將 html 高度設為 100% (非 min-height)，這在某些 Android 瀏覽器上更能確保填滿
        document.documentElement.style.backgroundColor = hexColor;
        document.documentElement.style.height = '100%';
        
        document.body.style.backgroundColor = hexColor;
        document.body.style.minHeight = '100%';
        document.body.style.overscrollBehaviorY = 'none';

        // 3. [Meta 清理與重建] 徹底移除所有舊的 theme-color 標籤，防止衝突
        // 這是解決「顏色改不掉」的關鍵，確保瀏覽器讀到的是最新且唯一的值
        document.querySelectorAll('meta[name="theme-color"]').forEach(el => el.remove());

        const metaTheme = document.createElement('meta');
        metaTheme.name = "theme-color";
        metaTheme.content = hexColor;
        document.head.appendChild(metaTheme);

        // 4. 設定 color-scheme
        let metaColorScheme = document.querySelector('meta[name="color-scheme"]');
        if (!metaColorScheme) {
            metaColorScheme = document.createElement('meta');
            metaColorScheme.name = "color-scheme";
            document.head.appendChild(metaColorScheme);
        }
        metaColorScheme.content = isDark ? "dark" : "light";

        // 5. 設定 viewport (強制 viewport-fit=cover)
        let metaViewport = document.querySelector('meta[name="viewport"]');
        if (!metaViewport) {
            metaViewport = document.createElement('meta');
            metaViewport.name = "viewport";
            document.head.appendChild(metaViewport);
        }
        // 確保 viewport-fit=cover 存在，這是讓背景色延伸到導航列下方的必要條件
        if (!metaViewport.content.includes('viewport-fit=cover')) {
            metaViewport.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
        }

        // 6. [核彈級修正] 插入固定定位的背景布幕 (Backdrop)
        // 如果 body 高度計算有誤，這個全螢幕的 div 會強制填滿所有空間，包含 Android 導航列下方
        let backdrop = document.getElementById('theme-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'theme-backdrop';
            document.body.appendChild(backdrop);
        }
        Object.assign(backdrop.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh', // 強制填滿視窗高度
            zIndex: '-9999', // 放在最底層
            backgroundColor: hexColor,
            pointerEvents: 'none'
        });

        // 7. 更新 Tailwind Class
        document.body.className = `${theme.bg} ${theme.text} transition-colors duration-300`;

        // 清理可能殘留的舊修正 (CSS注入)
        const oldStyle = document.getElementById('echo-theme-style');
        if (oldStyle) oldStyle.remove();

    }, [theme, currentThemeId]);

    // [新增] 切換主題並儲存
    const handleSetTheme = (id) => {
        setCurrentThemeId(id);
        // [Isolation] 本地儲存區隔
        if (user) localStorage.setItem(`echoScript_Theme_${user.uid}`, id);
        
        if (window.fs && window.db && user) {
            // [Isolation] 雲端儲存區隔
            window.fs.setDoc(
                window.fs.doc(window.db, "settings", `preferences_${user.uid}`), 
                { themeId: id }, 
                { merge: true }
            ).catch(e => console.error("主題同步失敗", e));
        }
    };

    // [同步] 當筆記更新時，將新的分類補入結構中 (支援總分類與大分類)
    // [修正] 加入 isSettingsLoaded 檢查，防止在雲端分類尚未下載前，就用不完整的本地資料覆蓋雲端
    useEffect(() => {
        if (notes.length === 0) return; 

        const newCatMap = { ...categoryMap };
        const newSuperMap = { ...superCategoryMap };
        let hasChange = false;

        notes.forEach(n => {
            const sup = n.superCategory || "其他";
            const cat = n.category || "未分類";
            const sub = n.subcategory || "一般";
            
            // 1. 確保總分類存在並包含大分類
            if (!newSuperMap[sup]) { newSuperMap[sup] = []; hasChange = true; }
            if (!newSuperMap[sup].includes(cat)) { newSuperMap[sup].push(cat); hasChange = true; }

            // 2. 確保大分類存在並包含次分類
            if (!newCatMap[cat]) { newCatMap[cat] = []; hasChange = true; }
            if (!newCatMap[cat].includes(sub)) { newCatMap[cat].push(sub); hasChange = true; }
        });

        if (hasChange) {
            console.log("♻️ 發現新分類結構，更新本地顯示...");
            setCategoryMap(newCatMap);
            setSuperCategoryMap(newSuperMap);
            
            // [關鍵修正] 只有當雲端設定已經載入過一次後，才允許寫回雲端
            // [Isolation] 確保 user 存在且寫入專屬 layout 文件
            if (window.fs && window.db && isSettingsLoaded && user) {
                console.log("☁️ 同步寫入雲端 settings/layout");
                window.fs.setDoc(
                    window.fs.doc(window.db, "settings", `layout_${user.uid}`), 
                    { 
                        categoryMapJSON: JSON.stringify(newCatMap),
                        superCategoryMapJSON: JSON.stringify(newSuperMap)
                    }, 
                    { merge: true }
                ).catch(e => console.error("自動同步分類失敗", e));
            }
        }
    }, [notes, categoryMap, superCategoryMap, isSettingsLoaded, user]);

    // [存取] 持久化分類結構 (隔離版)
    useEffect(() => {
        if (!user) return;
        const savedMap = localStorage.getItem(`echoScript_CategoryMap_${user.uid}`);
        if (savedMap) setCategoryMap(JSON.parse(savedMap));
    }, [user]);
    
    useEffect(() => { 
        if (user) localStorage.setItem(`echoScript_CategoryMap_${user.uid}`, JSON.stringify(categoryMap)); 
    }, [categoryMap, user]);

    // [新增] 監聽雲端分類排序 (settings/layout_UID)
    // [修正] 優先讀取 JSON 字串格式，確保順序正確，並設定 isSettingsLoaded 標記
    useEffect(() => {
        if (!window.fs || !window.db || !user) return;
        
        // [Isolation] 讀取專屬 layout 文件
        const unsubscribe = window.fs.onSnapshot(
            window.fs.doc(window.db, "settings", `layout_${user.uid}`), 
            (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    // 同步大分類地圖
                    if (data.categoryMapJSON) {
                        try { setCategoryMap(JSON.parse(data.categoryMapJSON)); } catch (e) {}
                    } else if (data.categoryMap) {
                        setCategoryMap(data.categoryMap);
                    }
                    
                    // 同步總分類地圖
                    if (data.superCategoryMapJSON) {
                        try { 
                            setSuperCategoryMap(JSON.parse(data.superCategoryMapJSON)); 
                            console.log("📥 同步雲端總分類結構");
                        } catch (e) {}
                    }
                }
                // [關鍵] 標記已完成首次載入 (無論有沒有資料)，允許後續的寫入操作
                setIsSettingsLoaded(true);
            }
        );
        return () => unsubscribe();
    }, [user]);

    // [新增] 儲存 AllNotesModal 的內部導航層級狀態，用於支援 PopState
    const [allNotesViewLevel, setAllNotesViewLevel] = useState('superCategories'); // superCategories -> categories -> subcategories -> notes
    
    // [關鍵修正] 將分類選擇狀態提升至主程式，確保從筆記返回列表時，這些狀態不會因為 Modal 關閉而遺失
    const [selectedSuper, setSelectedSuper] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    
    // [新增] 將搜尋關鍵字狀態提升至主程式，確保點擊筆記返回後，搜尋結果依然存在
    const [categorySearchTerm, setCategorySearchTerm] = useState("");
    // [新增] Ref 用於在 handlePopState 中讀取最新的搜尋狀態
    const categorySearchTermRef = useRef(categorySearchTerm);
    // [新增] 標記是否處於搜尋模式的歷史狀態
    const isSearchHistoryPushed = useRef(false);

    // [關鍵修正] 主動式歷史管理：當搜尋開始時，主動推入一層歷史紀錄
    useEffect(() => { 
        categorySearchTermRef.current = categorySearchTerm; 
        
        if (showAllNotesModal) {
            // 當開始輸入搜尋 (從無到有) -> 推入 modal_search 狀態
            if (categorySearchTerm && !isSearchHistoryPushed.current) {
                isSearchHistoryPushed.current = true;
                window.history.pushState({ page: 'modal', search: true, id: Date.now() }, '', '');
            }
            // 當手動清空搜尋 (從有到無) -> 替換當前狀態回 modal (移除 search 標記)
            // 這樣按返回鍵時就會直接關閉視窗，符合直覺
            else if (!categorySearchTerm && isSearchHistoryPushed.current) {
                isSearchHistoryPushed.current = false;
                window.history.replaceState({ page: 'modal', id: Date.now() }, '', '');
            }
        }
    }, [categorySearchTerm, showAllNotesModal]);

    // 新增 Ref 以解決 EventListener 閉包狀態不同步導致的導航錯誤
    const allNotesViewLevelRef = useRef(allNotesViewLevel);
    useEffect(() => { allNotesViewLevelRef.current = allNotesViewLevel; }, [allNotesViewLevel]);

    const [touchStart, setTouchStart] = useState(null);
    const [touchCurrent, setTouchCurrent] = useState(null);

    // 新增：全域狀態，讓主程式知道子視窗的狀況
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [responseViewMode, setResponseViewMode] = useState('list'); // 'list' or 'edit'

    // 新增：使用 Ref 追蹤狀態，解決 EventListener 閉包過期與依賴重覆觸發的問題
    const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
    const responseViewModeRef = useRef(responseViewMode);
    const exitLockRef = useRef(false); 
    const isExitingRef = useRef(false); // [新增] 標記是否正在執行退出程序
    const ignoreNextPopState = useRef(false); // [新增] 忽略下一次的歷史紀錄變更 (用於儲存後自動返回)
    
    // [關鍵修正] 新增旗標：用來判斷 Modal 開啟是否源自於「返回鍵」(History Restore)
    // 如果是 True，則 useEffect 不應該再推入新的歷史紀錄
    const isRestoringHistoryRef = useRef(false);

    // [新增] 追蹤本次會話是否有資料變更 (用於離線備份提示)
    const [hasDataChangedInSession, setHasDataChangedInSession] = useState(false);
    const hasDataChangedInSessionRef = useRef(false);
    
    // [新增] 自定義「未存檔警告」視窗狀態 (取代不穩定的 native confirm)
    const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
    
    // [新增] 同步確認視窗狀態與暫存變數
    const [showSyncConfirmModal, setShowSyncConfirmModal] = useState(false);
    const [pendingSyncStatus, setPendingSyncStatus] = useState(false);

    // [新增] 回應刪除確認視窗狀態
    const [showDeleteResponseAlert, setShowDeleteResponseAlert] = useState(false);
    const [responseIdToDelete, setResponseIdToDelete] = useState(null);

    // [新增] 筆記刪除確認視窗狀態
    const [showDeleteNoteAlert, setShowDeleteNoteAlert] = useState(false);
    const [noteIdToDelete, setNoteIdToDelete] = useState(null);

    // [新增] 分類刪除確認視窗狀態
    const [showDeleteCategoryAlert, setShowDeleteCategoryAlert] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    // [新增] 退出應用程式確認視窗狀態
    const [showExitAlert, setShowExitAlert] = useState(false);

    // 同步 Ref 與 State
    useEffect(() => { hasUnsavedChangesRef.current = hasUnsavedChanges; }, [hasUnsavedChanges]);
    useEffect(() => { hasDataChangedInSessionRef.current = hasDataChangedInSession; }, [hasDataChangedInSession]);
    useEffect(() => { responseViewModeRef.current = responseViewMode; }, [responseViewMode]);

    // === 原地滯留導航控制器 (Stay-On-Page Logic) ===

    // 1. 僅在開啟視窗時推入歷史紀錄
    useEffect(() => {
        // [修改] 加入 showShuffleMenu 與 showSyncConfirmModal
        const isAnyModalOpen = showMenuModal || showAllNotesModal || showEditModal || showResponseModal || showShuffleMenu || showSyncConfirmModal;
        if (isAnyModalOpen) {
            // [關鍵修正] 如果這次開啟是因為使用者按了「返回鍵」(isRestoringHistoryRef 為 true)
            // 代表瀏覽器已經在正確的歷史位置上了，我們「不應該」再 pushState，否則會覆蓋掉原本的層級路徑
            if (isRestoringHistoryRef.current) {
                isRestoringHistoryRef.current = false; // 重置旗標
                return;
            }

            // [關鍵修正] 調整優先順序：如果上層視窗 (編輯/選單) 開啟，優先推入通用 Modal 狀態
                    // 這避免了在「列表模式」下開啟「新增筆記」時，錯誤地推入「總分類」狀態
                    // [修正] 加入 showSyncConfirmModal，確保同步視窗開啟時有正確的歷史紀錄，防止按返回閃退
                    if (showMenuModal || showEditModal || showResponseModal || showShuffleMenu || showSyncConfirmModal) { 
                        window.history.pushState({ page: 'modal', time: Date.now() }, '', '');
                    } else if (showAllNotesModal) {
                // 只有在單純開啟列表 (且沒有上層視窗) 時，才推入列表專用紀錄
                window.history.pushState({ page: 'modal', level: 'superCategories', time: Date.now() }, '', '');
            }
        }
    }, [showMenuModal, showAllNotesModal, showEditModal, showResponseModal, showShuffleMenu, showSyncConfirmModal]); // [修改] 加入依賴

    // 2. 攔截返回鍵 (核心：真實歷史堆疊 + 狀態同步)
    useEffect(() => {
        const handlePopState = (event) => {
            // [新增] 如果標記為忽略 (例如儲存後的自動返回)，則不執行任何攔截邏輯
            if (ignoreNextPopState.current) {
                ignoreNextPopState.current = false;
                return;
            }

            // 如果已經確認要退出，就不再攔截任何返回動作
            if (isExitingRef.current) return;

            // === A. 編輯中未存檔 (優先攔截) ===
            if (hasUnsavedChangesRef.current) {
                window.history.pushState({ page: 'modal_trap', id: Date.now() }, '', '');
                setShowUnsavedAlert(true);
                return;
            }

            // === B. 視窗內導航 (編輯回應 -> 列表) ===
            if (showResponseModal && responseViewModeRef.current === 'edit') {
                window.history.pushState({ page: 'modal', time: Date.now() }, '', '');
                setResponseViewMode('list');
                return;
            }

            // === D. 正常關閉其他視窗 (優先權調高：先檢查是否要關閉一般視窗) ===
            // [修改] 加入 showShuffleMenu 與 showSyncConfirmModal
            const isAnyOtherModalOpen = showMenuModal || showEditModal || showResponseModal || showShuffleMenu || showSyncConfirmModal;
            if (isAnyOtherModalOpen) {
                // [關鍵修正] 防止 useEffect 再次推入歷史紀錄 (造成死循環)
                isRestoringHistoryRef.current = true;

                // [關鍵修正] 只有當「筆記列表」沒開的時候，才推入防護網 (Trap)
                // 如果列表還開著，我們只是退回到列表層級，不應該推入 Trap，否則下次按返回會誤判為退出 APP
                if (!showAllNotesModal) {
                    setTimeout(() => {
                        window.history.pushState({ page: 'home_trap', id: Date.now() }, '', '');
                    }, 0);
                }
                
                setShowMenuModal(false);
                setShowEditModal(false);
                setShowResponseModal(false);
                setShowShuffleMenu(false); // [新增] 關閉抽卡設定
                setShowSyncConfirmModal(false); // [新增] 關閉同步確認
                setResponseViewMode('list');
                return;
            }

            // === C. AllNotesModal 歷史同步與返回邏輯 ===
            const state = event.state || {};

            // 情況 1: 歷史紀錄指示我們應該在「列表模式」
            if (state.page === 'modal') {
                if (!showAllNotesModal) {
                    isRestoringHistoryRef.current = true;
                    setShowAllNotesModal(true);
                }
                
                // 根據歷史狀態決定是否顯示搜尋內容
                // 如果歷史狀態沒有 search 標記，但 UI 有搜尋文字 -> 代表使用者按了返回鍵想退出搜尋
                if (!state.search && categorySearchTermRef.current) {
                    setCategorySearchTerm("");
                    categorySearchTermRef.current = "";
                    isSearchHistoryPushed.current = false;
                }

                if (state.level) {
                    setAllNotesViewLevel(state.level);
                }
                return;
            }

            // 情況 2: 歷史紀錄已離開列表 (例如退到了 Home)，但視窗還開著 -> 這是使用者按了返回鍵
            if (showAllNotesModal && state.page !== 'modal') {
                
                // 1. 關閉視窗
                setShowAllNotesModal(false);
                setAllNotesViewLevel('superCategories');
                
                // 2. 清除搜尋狀態 (以防萬一)
                if (categorySearchTermRef.current) {
                    setCategorySearchTerm("");
                    categorySearchTermRef.current = "";
                    isSearchHistoryPushed.current = false;
                }

                // 3. 還原到開啟前的卡片
                if (preModalIndexRef.current !== null && preModalIndexRef.current !== -1) {
                    setCurrentIndex(preModalIndexRef.current);
                }
                
                // 4. [建立首頁防護網] (關鍵修改：使用 setTimeout)
                // 使用 setTimeout 確保「關閉視窗」的動作完成後，才佈置下一次的防護網
                // 這能確保回到首頁後，再按一次返回鍵時，一定會觸發下方的 Section E
                setTimeout(() => {
                    window.history.pushState({ page: 'home_trap', id: Date.now() }, '', '');
                }, 0);

                return;
            }

            // === E. 首頁退出檢查 (攔截所有退出動作) ===
            // 當堆疊已經退無可退，觸發此處
            
            // 1. 先把人留住 (Trap)
            window.history.pushState({ page: 'home_trap', id: Date.now() }, '', '');

            
            // 3. 退出確認提示 [修改] 改用自定義視窗
            setTimeout(() => {
                setShowExitAlert(true);
            }, 10);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [showMenuModal, showAllNotesModal, showEditModal, showResponseModal, showShuffleMenu, showSyncConfirmModal]); // [修改] 加入依賴
    
    // === 雲端版資料監聽 (User Isolated) ===
    useEffect(() => {
        if (!window.fs || !window.db || !user) return; // [Auth] 必須有 user 才執行

        const { collection, onSnapshot, query, orderBy, where, setDoc, doc } = window.fs;
        const db = window.db;

        // [關鍵] 加入 where 條件篩選當前使用者的筆記
        const q = query(
            collection(db, "notes"), 
            where("userId", "==", user.uid),
            orderBy("createdDate", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const cloudNotes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            // [修復] 移除自動修復機制，避免列表在背景自動重整導致編輯時發生錯位 (Soul Swap)
            
            // [初始化] 針對該 User 的初始化 (使用 localStorage Key 區隔)
            const initKey = `echoScript_Init_${user.uid}`;
            if (cloudNotes.length === 0 && !localStorage.getItem(initKey)) {
                console.log("☁️ 新使用者，初始化預設筆記...");
                INITIAL_NOTES.forEach(note => {
                    const noteId = String(Date.now() + Math.random()); // 隨機 ID 避免衝突
                    setDoc(doc(db, "notes", noteId), {
                        ...note,
                        id: noteId,
                        userId: user.uid, // [Auth] 標記擁有者
                        createdDate: new Date().toISOString(),
                        modifiedDate: new Date().toISOString()
                    }).catch(e => console.error(e));
                });
                localStorage.setItem(initKey, 'true');
                return;
            }

            setNotes(cloudNotes);

            const cloudResponses = {};
            cloudNotes.forEach(note => {
                if (note.responses && Array.isArray(note.responses)) {
                    cloudResponses[note.id] = note.responses.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                }
            });
            if (Object.keys(cloudResponses).length > 0) {
                 setAllResponses(prev => ({ ...prev, ...cloudResponses }));
            }
            setFavorites(cloudNotes.filter(n => n.isFavorite === true));

            try {
                // [User ID] 隔離的洗牌堆 (修正 Key 名稱以匹配 useEffect 寫入端)
                const deckKey = `echoScript_ShuffleDeck_${user.uid}`;
                const pointerKey = `echoScript_DeckPointer_${user.uid}`;
                
                let loadedDeck = JSON.parse(localStorage.getItem(deckKey) || '[]');
                let loadedPointer = parseInt(localStorage.getItem(pointerKey) || '0', 10);
                
                if (loadedDeck.length !== cloudNotes.length) {
                    loadedDeck = Array.from({length: cloudNotes.length}, (_, i) => i);
                    for (let i = loadedDeck.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [loadedDeck[i], loadedDeck[j]] = [loadedDeck[j], loadedDeck[i]];
                    }
                    loadedPointer = 0;
                }
                setShuffleDeck(loadedDeck);
                setDeckPointer(loadedPointer);

                if (cloudNotes.length > 0 && !showPinnedPlaceholderRef.current) {
                    // [Isolation] 讀取正確的 ResumeNoteId Key
                    const resumeId = localStorage.getItem(`echoScript_ResumeNoteId_${user.uid}`);
                    let idx = -1;
                    
                    // 1. 優先嘗試讀取上次停留的筆記 (Resume)
                    if (resumeId) {
                        idx = cloudNotes.findIndex(n => String(n.id) === String(resumeId));
                    }

                    // 2. [修正] 如果找不到紀錄 (新裝置/快取清除)，改為找「最後修改」的筆記
                    // 原本是 fallback 到隨機 (loadedDeck)，現在改為最新的編輯紀錄，符合「首頁」直覺
                    if (idx === -1) {
                         let latestNote = cloudNotes[0];
                         let maxTime = -1;
                         
                         cloudNotes.forEach(n => {
                             // 比較 modifiedDate (若無則用 createdDate)
                             const mTime = new Date(n.modifiedDate || n.createdDate || 0).getTime();
                             if (mTime > maxTime) {
                                 maxTime = mTime;
                                 latestNote = n;
                             }
                         });
                         
                         if (latestNote) {
                             idx = cloudNotes.findIndex(n => n.id === latestNote.id);
                             // 自動寫入 LocalStorage，確保下次直接讀取
                             localStorage.setItem(`echoScript_ResumeNoteId_${user.uid}`, String(latestNote.id));
                         }
                    }

                    // 3. 安全網：若真的完全找不到，回到第 0 筆
                    if (idx === -1) idx = 0;
                    
                    setCurrentIndex(idx);
                }
            } catch (e) { console.error(e); }
        });

        // 載入本地暫存 (僅作為備援，主要依賴雲端)
        return () => unsubscribe();
    }, [user]); // [Auth] 依賴 user

    useEffect(() => {
        const handleNoteSelect = (e) => {
            const noteId = e.detail;
            const idx = notes.findIndex(n => n.id === noteId);
            if (idx !== -1) {
                setCurrentIndex(idx);
                setShowMenuModal(false);
                window.scrollTo(0, 0);
            }
        };
        window.addEventListener('noteSelected', handleNoteSelect);
        return () => window.removeEventListener('noteSelected', handleNoteSelect);
    }, [notes]);

    useEffect(() => { if(user) localStorage.setItem(`echoScript_AllNotes_${user.uid}`, JSON.stringify(notes)); }, [notes, user]);
    useEffect(() => { if(user) localStorage.setItem(`echoScript_Favorites_${user.uid}`, JSON.stringify(favorites)); }, [favorites, user]);
    useEffect(() => { if(user) localStorage.setItem(`echoScript_AllResponses_${user.uid}`, JSON.stringify(allResponses)); }, [allResponses, user]);
    useEffect(() => { 
        if (!user) return;
        const json = JSON.stringify(history);
        localStorage.setItem(`echoScript_History_${user.uid}`, json); 
        
        // [新增] 同步寫入雲端 (僅當已完成首次載入後)
        // [Isolation] 寫入 user 專屬 history
        if (window.fs && window.db && isHistoryLoaded) {
            window.fs.setDoc(
                window.fs.doc(window.db, "settings", `history_${user.uid}`), 
                { historyJSON: json }, 
                { merge: true }
            ).catch(e => console.error("歷史紀錄同步失敗", e));
        }
    }, [history, isHistoryLoaded, user]);
    useEffect(() => { if(user) localStorage.setItem(`echoScript_Recents_${user.uid}`, JSON.stringify(recentIndices)); }, [recentIndices, user]);
    useEffect(() => { if(user) localStorage.setItem(`echoScript_FutureRecents_${user.uid}`, JSON.stringify(futureIndices)); }, [futureIndices, user]);
    // [新增] 儲存洗牌狀態
    useEffect(() => { if(user) localStorage.setItem(`echoScript_ShuffleDeck_${user.uid}`, JSON.stringify(shuffleDeck)); }, [shuffleDeck, user]);
    useEffect(() => { if(user) localStorage.setItem(`echoScript_DeckPointer_${user.uid}`, deckPointer.toString()); }, [deckPointer, user]);

    const showNotification = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

    const addToHistory = (note) => {
        // 防呆：確保筆記物件與 ID 存在
        if (!note || note.id === undefined || note.id === null) return;

        // 建立新的歷史紀錄物件
        const entry = { ...note, timestamp: new Date().toISOString(), displayId: Date.now() };

        setHistory(prev => {
            const safePrev = Array.isArray(prev) ? prev : [];
            
            // 1. 先將「新筆記」與「所有舊筆記」合併成一個暫存陣列 (新筆記在最前面)
            const rawList = [entry, ...safePrev];
            
            // 2. 準備一個 Set 來記錄已經看過的 ID
            const seenIds = new Set();
            const cleanList = [];

            // 3. 遍歷整個清單，進行「全域清洗」
            // 因為是從最前面(最新的)開始跑，所以每個 ID 我們只會保留第一次出現的那筆
            for (const item of rawList) {
                // 安全檢查：確保項目有效且有 ID
                if (item && item.id !== undefined && item.id !== null) {
                    const idStr = String(item.id); // 強制轉字串，避免 ID 1 和 "1" 被當成不同
                    
                    // 如果這個 ID 還沒出現過，就加入結果清單
                    if (!seenIds.has(idStr)) {
                        seenIds.add(idStr);
                        cleanList.push(item);
                    }
                    // 如果 seenIds 已經有了，代表這是舊的重複資料，直接丟棄
                }
            }

            // 4. 限制最大筆數為 50
            return cleanList.slice(0, 50);
        });
    };

    const currentNote = notes[currentIndex];
    const isFavorite = favorites.some(f => f.id === (currentNote ? currentNote.id : null));
    const currentNoteResponses = currentNote ? (allResponses[currentNote.id] || []) : [];

    // [修改] 統一使用「同分類智慧隨機」邏輯 (支援抽卡目標 + 200張記憶 + 循環機制)
    const handleNextNote = () => {
        if (notes.length <= 1) return;

        setIsAnimating(true);
        setTimeout(() => {
            // === 1. 優先檢查「未來堆疊」 (History Redo) ===
            // 這是為了讓「上一張」按鈕能正常運作，按下一張時能回到原本的路徑
            if (futureIndices.length > 0) {
                const nextIndex = futureIndices[0];
                setFutureIndices(prev => prev.slice(1)); // 移除未來的第一張
                
                setRecentIndices(prev => {
                    let currentHistory = [...prev];
                    // 確保歷史紀錄有當前這張作為錨點
                    if (currentIndex !== -1) {
                        if (currentHistory.length === 0 || currentHistory[0] !== currentIndex) {
                            currentHistory.unshift(currentIndex);
                        }
                    }
                    return [nextIndex, ...currentHistory];
                });
                
                setCurrentIndex(nextIndex);
                setIsAnimating(false);
                window.scrollTo(0,0);
                return;
            }

            // === 2. 核心邏輯：強制同分類智慧隨機 (Smart Category Shuffle) ===
            
            // [A] 確定抽卡範圍 (Shuffle Target)
            // 如果有設定目標，就鎖定目標；否則鎖定當前筆記的分類
            let targetSuper = "其他";
            if (shuffleTarget) {
                targetSuper = shuffleTarget;
            } else if (currentNote) {
                targetSuper = String(currentNote.superCategory || "其他").trim();
            }

            // [B] 找出該範圍內所有的候選筆記
            let candidates = notes
                .map((n, i) => ({ ...n, originalIndex: i }))
                .filter(n => String(n.superCategory || "其他").trim() === targetSuper);

            // 排除當前正在看的這張 (防止下一張立刻重複自己)
            let availableCandidates = candidates.filter(n => n.originalIndex !== currentIndex);

            if (availableCandidates.length > 0) {
            // [C] 實作「牌堆循環」邏輯 (修正版：防止重複 - 滑動視窗法)
            
            // 1. 找出與「當前分類」相關的歷史紀錄
            // 我們只過濾出屬於這個分類的歷史 ID，忽略使用者去別的分類逛的紀錄
            const availableSet = new Set(availableCandidates.map(n => n.originalIndex));
            // 從最近的歷史開始保留
            const categoryHistory = recentIndices.filter(idx => availableSet.has(idx));

            // 2. 設定「短期記憶長度」
            // 規則：只記住最近看過的 (總數 - 1) 張牌。
            // 這代表直到這分類剩下最後 1 張沒看過的牌之前，都不會重複抽到已經看過的。
            // 使用 Math.max(0, ...) 防止分類只有 1 張牌時出錯
            const memorySize = Math.max(0, availableCandidates.length - 1);
            
            // 3. 建立黑名單 (最近看過的 N-1 張)
            const shortTermMemorySet = new Set(categoryHistory.slice(0, memorySize));

            // 4. 篩選出「不在短期記憶中」的筆記
            let unseenCandidates = availableCandidates.filter(n => !shortTermMemorySet.has(n.originalIndex));

            // 5. 決定最終抽獎池 (雙重保險)
            // 基本上 unseenCandidates 不會空 (因為我們有留 1 個活口)，但為了程式安全，若真的空了就全開
            let finalPool = unseenCandidates.length > 0 ? unseenCandidates : availableCandidates;

            // [D] 隨機抽選
            const rand = Math.floor(Math.random() * finalPool.length);
            const nextIndex = finalPool[rand].originalIndex;

            // [E] 更新歷史堆疊 (上限改為 200)
            setRecentIndices(prev => {
                let currentHistory = [...prev];
                if (currentIndex !== -1) {
                    // 防止重複推入相同的當前頁
                    if (currentHistory.length === 0 || currentHistory[0] !== currentIndex) {
                        currentHistory.unshift(currentIndex);
                    }
                }
                const updated = [nextIndex, ...currentHistory];
                
                // [修改] 這裡將上限調整為 200 張
                if (updated.length > 200) updated.pop();
                
                return updated;
            });
            
            setFutureIndices([]);
            setCurrentIndex(nextIndex);
        } else {
                // 例外處理：該分類下沒有其他筆記
                if (shuffleTarget) {
                    showNotification(`目標分類「${targetSuper}」無其他筆記`);
                } else {
                    showNotification(`「${targetSuper}」分類無其他筆記`);
                }
            }
            
            setIsAnimating(false);
            window.scrollTo(0,0);
        }, 300);
    };

    // [新增] 執行抽卡目標設定與立即跳轉
    const handleSetShuffleTarget = (target) => {
        setShuffleTarget(target);
        setShowShuffleMenu(false);

        // [新增] 同步寫入雲端與本地 (Isolation)
        if (user) localStorage.setItem(`echoScript_ShuffleTarget_${user.uid}`, target);
        if (window.fs && window.db && user) {
            window.fs.setDoc(
                window.fs.doc(window.db, "settings", `preferences_${user.uid}`), 
                { shuffleTarget: target }, 
                { merge: true }
            ).catch(e => console.error("抽卡目標同步失敗", e));
        }

        // 立即執行一次跳轉，讓使用者馬上看到結果
        const candidates = notes
            .map((n, i) => ({ ...n, originalIndex: i }))
            .filter(n => String(n.superCategory || "其他").trim() === target);

        if (candidates.length > 0) {
            setIsAnimating(true);
            setTimeout(() => {
                const rand = Math.floor(Math.random() * candidates.length);
                const nextIndex = candidates[rand].originalIndex;
                
                setRecentIndices(prev => {
                    let currentHistory = [...prev];
                    if (currentIndex !== -1) {
                        if (currentHistory.length === 0 || currentHistory[0] !== currentIndex) {
                            currentHistory.unshift(currentIndex);
                        }
                    }
                    return [nextIndex, ...currentHistory];
                });
                
                setFutureIndices([]);
                setCurrentIndex(nextIndex);
                setIsAnimating(false);
                window.scrollTo(0,0);
                showNotification(`抽卡目標：${target}`);
            }, 300);
        } else {
            showNotification(`分類「${target}」目前沒有筆記`);
        }
    };

    // [新增] 清除抽卡目標
    const handleClearShuffleTarget = () => {
        setShuffleTarget(null);
        setShowShuffleMenu(false);
        showNotification("已取消鎖定，改為隨當前筆記");

        // [新增] 同步清除雲端與本地 (Isolation)
        if (user) localStorage.removeItem(`echoScript_ShuffleTarget_${user.uid}`);
        if (window.fs && window.db && user) {
            window.fs.setDoc(
                window.fs.doc(window.db, "settings", `preferences_${user.uid}`), 
                { shuffleTarget: null }, 
                { merge: true }
            ).catch(e => console.error("清除抽卡目標失敗", e));
        }
    };

    // [新增] 獨立的「回到釘選」邏輯 (完全與首頁脫鉤)
    const handleGoToPin = () => {
        // 嘗試在現有筆記中尋找釘選的筆記
        const pinnedIndex = pinnedNoteId ? notes.findIndex(n => String(n.id) === String(pinnedNoteId)) : -1;
        
        if (pinnedIndex !== -1) {
            // 情境 A: 找到釘選筆記 -> 正常跳轉
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentIndex(pinnedIndex);
                setShowPinnedPlaceholder(false); // 確保關閉空狀態
                setIsAnimating(false);
                window.scrollTo(0,0);
            }, 300);
        } else {
            // 情境 B: 無釘選筆記 (或釘選筆記已被刪除) -> 顯示「無釘選卡片」空狀態
            // 這裡不再呼叫 handleGoHome，而是明確告知使用者「沒有釘選」
            setShowPinnedPlaceholder(true);
            showPinnedPlaceholderRef.current = true; // 同步 Ref 防止雲端自動導航干擾
            setCurrentIndex(-1); // 隱藏底下的卡片
            window.scrollTo(0,0);
        }
    };

    // [新增] 回到首頁 (功能變更：回到最後編輯/查看的卡片 > 釘選 > 第一張)
    const handleGoHome = () => {
        if (notes.length === 0) return;
        
        setIsAnimating(true);
        setTimeout(() => {
            // 1. 優先尋找「最後一次編輯/操作」的卡片 (即 App 定義的「首頁」)
            // [Isolation] 讀取專屬 ResumeID
            const resumeId = user ? localStorage.getItem(`echoScript_ResumeNoteId_${user.uid}`) : null;
            let targetIndex = -1;

            if (resumeId) {
                targetIndex = notes.findIndex(n => String(n.id) === String(resumeId));
            }

            // [修正] 移除釘選筆記 fallback，按首頁鍵只會回到最後編輯的筆記
            
            // 2. 如果沒有紀錄，就回到列表第一張
            if (targetIndex === -1) targetIndex = 0;
            
            setCurrentIndex(targetIndex);
            
            setIsAnimating(false);
            window.scrollTo(0,0);
        }, 300);
    };

    // [新增] 回到上一張筆記
    const handlePreviousNote = () => {
        // [修正] 移除清除 ResumeNoteId 的邏輯，確保首頁按鈕永遠能回到最後編輯/關注的卡片

        // 檢查是否有上一張紀錄 (recentIndices[0] 是當前，recentIndices[1] 是上一張)
        if (recentIndices.length < 2) {
            // [修改] 如果隨機歷史沒了，檢查是否可以「回到釘選首頁」
            // 條件：有設定釘選 ID + 當前卡片不是釘選卡片 + 釘選卡片存在於筆記列表中
            const pinnedIndex = pinnedNoteId ? notes.findIndex(n => String(n.id) === String(pinnedNoteId)) : -1;
            
            if (pinnedNoteId && currentNote && String(currentNote.id) !== String(pinnedNoteId) && pinnedIndex !== -1) {
                setIsAnimating(true);
                setTimeout(() => {
                    // 把當前這張 (例如 F) 推入未來堆疊，確保按「下一張」可以依序回去 (FZJQ)
                    if (recentIndices.length > 0) {
                         setFutureIndices(prev => [recentIndices[0], ...prev]);
                    } else {
                        // 防呆：如果 recentIndices 全空，用 currentIndex 找
                         setFutureIndices(prev => [currentIndex, ...prev]);
                    }

                    // 跳轉回釘選卡片
                    setCurrentIndex(pinnedIndex);
                    // 這裡我們不把釘選卡片加回 recentIndices，因為它視為一個「起點」或「首頁」
                    // 當使用者從釘選卡片按「下一張」時，會觸發 handleNextNote 的 futureIndices 檢查，從而回到 F
                    
                    setIsAnimating(false);
                    window.scrollTo(0,0);
                }, 300);
                return;
            }

            showNotification("沒有上一個筆記了");
            return;
        }

        setIsAnimating(true);
        setTimeout(() => {
            const currentIndexInHistory = recentIndices[0]; // 當前正在看的那張
            const prevIndex = recentIndices[1]; // 準備要退回的那張
            
            // [關鍵修改] 記錄未來路徑：把當前這張卡片推入「未來堆疊」的最上方
            // 這樣下次按「下一張」時，就可以拿回來顯示
            setFutureIndices(prev => [currentIndexInHistory, ...prev]);

            // 更新狀態：移除最上層的「當前」紀錄，退回到上一層
            setRecentIndices(prev => prev.slice(1));
            setCurrentIndex(prevIndex);
            
            // [修改] 移除瀏覽歷史紀錄，改為僅記錄編輯歷史

            setIsAnimating(false);
            window.scrollTo(0,0);
        }, 300);
    };

    // [最終修正] 智慧型儲存邏輯：採用「樂觀 UI 更新」策略，解決儲存跳轉問題
    const handleSaveNote = async (updatedNote) => {
        if (!user) return; 
        const now = new Date().toISOString();
        
        // === ID 救援行動 ===
        // 1. 先嘗試直接讀取 ID
        let targetId = updatedNote.id ? String(updatedNote.id) : null;
        
        // 3. 再次確認：資料庫裡到底有沒有這張卡片？
        const existingIndex = targetId ? notes.findIndex(n => String(n.id) === targetId) : -1;
        
        let nextNotes;
        let finalId = targetId;
        
        // 判斷路徑：只要找得到 (Index != -1)，它就是修改，絕對不准變新增！
        if (existingIndex !== -1) {
            // === 【修改模式】 ===
            const editedNote = { 
                ...notes[existingIndex], // 保留舊資料
                ...updatedNote,          // 覆蓋新變更
                id: targetId,            // 確保 ID 鎖死
                userId: user.uid,
                modifiedDate: now
            };
            
            // 原地替換，確保不改變陣列長度與順序
            nextNotes = [...notes];
            nextNotes[existingIndex] = editedNote; 
            
            setFavorites(prev => prev.map(f => String(f.id) === targetId ? { ...f, ...editedNote } : f));
            showNotification("筆記已更新");
            
        } else {
            // === 【真正的新增模式】 ===
            // [修復] 加入隨機後綴，確保 ID 絕對唯一，防止高速建立時發生衝突
            finalId = String(Date.now()) + '-' + Math.random().toString(36).substr(2, 5);
            
            // [修正] 強制解構移除來源可能夾帶的 createdDate，確保新筆記絕對使用當下時間
            const { createdDate, ...cleanNoteData } = updatedNote;
            
            const newNote = { 
                ...cleanNoteData, 
                id: finalId, 
                userId: user.uid, 
                createdDate: now, 
                modifiedDate: now 
            };
            
            nextNotes = [newNote, ...notes];
            
            // 處理洗牌堆
            const currentDeck = [...shuffleDeck];
            const newDeck = currentDeck.map(i => i + 1); 
            const insertPos = deckPointer + Math.floor(Math.random() * (newDeck.length - deckPointer + 1));
            newDeck.splice(insertPos, 0, 0);
            
            setShuffleDeck(newDeck);
            setCurrentIndex(0); 
            showNotification("新筆記已建立");
        }
        
        // [關鍵修正] 1. 立即寫入 Local ResumeID (最優先)
        if (finalId) {
            localStorage.setItem(`echoScript_ResumeNoteId_${user.uid}`, String(finalId));
        }

        // [關鍵修正] 2. 立即更新本地 UI 狀態 (React State)
        setNotes(nextNotes);
        if (existingIndex !== -1) {
            // 確保修改後，當前 Index 依然指在正確的卡片上
            const newIdx = nextNotes.findIndex(n => String(n.id) === String(finalId));
            if (newIdx !== -1) setCurrentIndex(newIdx);
        }
        
        const savedNote = nextNotes.find(n => String(n.id) === String(finalId));
        if (savedNote) addToHistory(savedNote);

        setHasDataChangedInSession(true); 
        setIsCreatingNew(false);
        setNewNoteTemplate(null);

        // [關鍵修正] 3. 立即執行導航與關閉視窗 (Synchronous)
        // 我們不等待雲端回應，直接關閉視窗，這樣使用者體驗最順暢，且不會受非同步延遲影響
        const stepsBack = showAllNotesModal ? -2 : -1;
        setShowEditModal(false);
        setShowAllNotesModal(false);

        ignoreNextPopState.current = true;
        window.history.go(stepsBack);

        // [關鍵修正] 4. 最後才在背景執行雲端同步 (Async)
        // 就算這裡網路慢，UI 已經都處理好了，不會跳轉亂掉
        try {
            // 同步 Settings (ResumeID)
            if (finalId && window.fs && window.db && user) {
                window.fs.setDoc(window.fs.doc(window.db, "settings", `preferences_${user.uid}`), { resumeNoteId: String(finalId) }, { merge: true }).catch(e => {});
            }

            // 同步 Notes
            const noteToSave = nextNotes.find(n => String(n.id) === String(finalId));
            if (noteToSave) {
                await window.fs.setDoc(window.fs.doc(window.db, "notes", String(finalId)), noteToSave);
            }
        } catch (e) {
            console.error(e);
            showNotification("⚠️ 雲端儲存失敗");
        }
    };

    // [新增] 通用復原功能 (支援筆記與分類資料夾)
    const handleRestoreFromTrash = async (itemId) => {
        const itemToRestore = trash.find(n => String(n.id) === String(itemId));
        if (!itemToRestore) return;

        const isFolder = itemToRestore.isFolder === true;
        const displayName = isFolder ? itemToRestore.title : itemToRestore.title;

        if (confirm(`確定要復原「${displayName}」${isFolder ? '及其所有內容' : ''}嗎？`)) {
            // 1. 從垃圾桶移除
            const newTrash = trash.filter(n => String(n.id) !== String(itemId));
            setTrash(newTrash);

            const promises = [];
            let newNotes = [...notes];
            let newCatMap = { ...categoryMap };
            let newSuperMap = { ...superCategoryMap };
            let layoutChanged = false;

            // 輔助函式：確保分類存在
            const ensureStructure = (sup, cat, sub) => {
                let changed = false;
                // 檢查總分類
                if (sup && sup !== "其他") {
                    if (!newSuperMap[sup]) { newSuperMap[sup] = []; changed = true; }
                    if (cat && !newSuperMap[sup].includes(cat)) { newSuperMap[sup].push(cat); changed = true; }
                }
                // 檢查大分類
                if (cat && cat !== "未分類") {
                    if (!newCatMap[cat]) { newCatMap[cat] = []; changed = true; }
                    if (sub && !newCatMap[cat].includes(sub)) { newCatMap[cat].push(sub); changed = true; }
                }
                if (changed) layoutChanged = true;
            };

            if (isFolder) {
                // === A. 復原資料夾 ===
                // 1. 還原結構 (即使資料夾是空的也要還原)
                const { level, title: name, context } = itemToRestore;
                if (level === 'superCategory') {
                    if (!newSuperMap[name]) { newSuperMap[name] = []; layoutChanged = true; }
                } else if (level === 'category') {
                    ensureStructure(context.super, name, null);
                } else if (level === 'subcategory') {
                    ensureStructure(context.super, context.category, name);
                }

                // 2. 還原內含的筆記
                if (itemToRestore.notes && itemToRestore.notes.length > 0) {
                    itemToRestore.notes.forEach(note => {
                        // 移除刪除標記
                        const { deletedAt, ...restoredNote } = note;
                        newNotes.unshift(restoredNote);
                        // 確保該筆記的分類結構存在 (雙重保險)
                        ensureStructure(note.superCategory, note.category, note.subcategory);
                        
                        // 加入寫入排程
                        if (window.fs && window.db) {
                            promises.push(window.fs.setDoc(window.fs.doc(window.db, "notes", String(restoredNote.id)), restoredNote));
                        }
                    });
                }
                showNotification(`已復原分類「${name}」`);

            } else {
                // === B. 復原單一筆記 ===
                const { deletedAt, ...restoredNote } = itemToRestore;
                newNotes.unshift(restoredNote);
                ensureStructure(restoredNote.superCategory, restoredNote.category, restoredNote.subcategory);
                
                if (window.fs && window.db) {
                    promises.push(window.fs.setDoc(window.fs.doc(window.db, "notes", String(restoredNote.id)), restoredNote));
                }
                showNotification("筆記已復原");
            }

            // 更新狀態
            setNotes(newNotes);
            if (layoutChanged) {
                setCategoryMap(newCatMap);
                setSuperCategoryMap(newSuperMap);
                console.log("♻️ 復原：自動重建遺失的分類結構");
            }

            // 同步 Trash 與 Layout (Isolation)
            if (window.fs && window.db && user) {
                promises.push(window.fs.setDoc(window.fs.doc(window.db, "settings", `trash_${user.uid}`), { trashJSON: JSON.stringify(newTrash) }, { merge: true }));
                if (layoutChanged) {
                    promises.push(window.fs.setDoc(window.fs.doc(window.db, "settings", `layout_${user.uid}`), { 
                        categoryMapJSON: JSON.stringify(newCatMap),
                        superCategoryMapJSON: JSON.stringify(newSuperMap)
                    }, { merge: true }));
                }
                try {
                    await Promise.all(promises);
                } catch (e) {
                    console.error("復原同步失敗", e);
                    showNotification("⚠️ 復原部分失敗，請檢查網路");
                }
            }
            
            setHasDataChangedInSession(true);
        }
    };

    // [新增] 清空垃圾桶功能
    const handleEmptyTrash = () => {
        if (trash.length === 0) return;
        if (confirm("確定要清空垃圾桶嗎？此動作無法復原。")) {
            setTrash([]);
            if (window.fs && window.db && user) {
                // [Isolation] 清空專屬 trash
                window.fs.setDoc(
                    window.fs.doc(window.db, "settings", `trash_${user.uid}`), 
                    { trashJSON: "[]" }, 
                    { merge: true }
                ).catch(e => console.error("清空垃圾桶失敗", e));
            }
            showNotification("垃圾桶已清空");
        }
    };
                                
    // [修改] 觸發刪除筆記確認視窗
    const handleDeleteNote = (id) => {
        setNoteIdToDelete(id);
        setShowDeleteNoteAlert(true);
    };

    // [新增] 執行刪除筆記 (使用者確認後)
    const executeDeleteNote = () => {
        if (!noteIdToDelete) return;
        const id = noteIdToDelete;

        // 0. 備份到垃圾桶
        const noteToDelete = notes.find(n => String(n.id) === String(id));
        if (noteToDelete) {
            const trashItem = { ...noteToDelete, deletedAt: new Date().toISOString() };
            const newTrash = [trashItem, ...trash];
            setTrash(newTrash);
            
            if (window.fs && window.db && user) {
                    window.fs.setDoc(
                    window.fs.doc(window.db, "settings", `trash_${user.uid}`), 
                    { trashJSON: JSON.stringify(newTrash) }, 
                    { merge: true }
                ).catch(e => console.error("垃圾桶備份失敗", e));
            }
        }

        // 1. 執行刪除 (移除所有相同 ID 的卡片，清除重複項)
        const newNotes = notes.filter(n => String(n.id) !== String(id));
        setNotes(newNotes);

        // 2. 同步歷史紀錄
        setHistory(prevHistory => {
            const validHistory = Array.isArray(prevHistory) ? prevHistory : [];
            const newHistory = validHistory.filter(h => String(h.id) !== String(id));
            
            if(user) localStorage.setItem(`echoScript_History_${user.uid}`, JSON.stringify(newHistory));
            if (window.fs && window.db && user) {
                window.fs.setDoc(window.fs.doc(window.db, "settings", `history_${user.uid}`), { historyJSON: JSON.stringify(newHistory) }, { merge: true });
            }
            return newHistory;
        });

        // 3. 刪除雲端文件
        try {
            if (window.fs && window.db) {
                window.fs.deleteDoc(window.fs.doc(window.db, "notes", String(id)));
                console.log("✅ 雲端 notes 移除成功");
            }
        } catch (e) {
            console.error("雲端刪除失敗", e);
            showNotification("⚠️ 雲端同步失敗");
        }
        
        // 4. 計算新的索引位置 (防止索引錯位)
        let nextIdx = 0;
        const isDeletingPinned = String(id) === String(pinnedNoteId);

        if (isDeletingPinned) {
            setPinnedNoteId(null);
            if(user) localStorage.removeItem(`echoScript_PinnedId_${user.uid}`);
            if (window.fs && window.db && user) window.fs.setDoc(window.fs.doc(window.db, "settings", `preferences_${user.uid}`), { pinnedNoteId: null }, { merge: true });
            setShowPinnedPlaceholder(true);
            showPinnedPlaceholderRef.current = true;
            nextIdx = -1;
        } else if (newNotes.length > 0) {
            const latestNote = [...newNotes].sort((a, b) => {
                const timeA = new Date(a.modifiedDate || a.createdDate || 0).getTime();
                const timeB = new Date(b.modifiedDate || b.createdDate || 0).getTime();
                return timeB - timeA;
            })[0];
            
            if (latestNote) {
                nextIdx = newNotes.findIndex(n => n.id === latestNote.id);
                if (nextIdx === -1) nextIdx = 0;

                const targetId = String(latestNote.id);
                if (user) localStorage.setItem(`echoScript_ResumeNoteId_${user.uid}`, targetId);
                if (window.fs && window.db && user) window.fs.setDoc(window.fs.doc(window.db, "settings", `preferences_${user.uid}`), { resumeNoteId: targetId }, { merge: true });
            }
            setShowPinnedPlaceholder(false);
        } else {
            setShowPinnedPlaceholder(false);
            nextIdx = -1;
            if (user) localStorage.removeItem(`echoScript_ResumeNoteId_${user.uid}`);
        }
        
        // 5. [關鍵] 完全重建洗牌堆 (Deck)，確保不會有懸空索引
        const newDeck = Array.from({ length: newNotes.length }, (_, i) => i);
        for (let i = newDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }

        setCurrentIndex(nextIdx);
        setShuffleDeck(newDeck);
        setDeckPointer(0);

        setShowEditModal(false);
        setHasDataChangedInSession(true);
        showNotification("筆記已移至垃圾桶");

        // 重置狀態並關閉視窗
        setShowDeleteNoteAlert(false);
        setNoteIdToDelete(null);
    };

// [修改] 階層式分類刪除功能 - 步驟 1: 觸發確認視窗
    const handleDeleteCategory = (type, name) => {
        let targetNotes = [];
        
        // 根據當前選擇的 context 來篩選 (依賴主程式的 selectedSuper/Category 狀態)
        if (type === 'superCategory') {
            targetNotes = notes.filter(n => (n.superCategory || "其他") === name);
        } else if (type === 'category') {
            targetNotes = notes.filter(n => (n.superCategory || "其他") === selectedSuper && (n.category || "未分類") === name);
        } else if (type === 'subcategory') {
            targetNotes = notes.filter(n => 
                (n.superCategory || "其他") === selectedSuper && 
                (n.category || "未分類") === selectedCategory && 
                (n.subcategory || "一般") === name
            );
        }

        // 設定暫存狀態並開啟視窗
        setCategoryToDelete({ type, name, count: targetNotes.length });
        setShowDeleteCategoryAlert(true);
    };

    // [新增] 階層式分類刪除功能 - 步驟 2: 執行刪除
    const executeDeleteCategory = () => {
        if (!categoryToDelete) return;
        const { type, name } = categoryToDelete;

        let targetNotes = [];
        // 重新執行篩選邏輯
        if (type === 'superCategory') {
            targetNotes = notes.filter(n => (n.superCategory || "其他") === name);
        } else if (type === 'category') {
            targetNotes = notes.filter(n => (n.superCategory || "其他") === selectedSuper && (n.category || "未分類") === name);
        } else if (type === 'subcategory') {
            targetNotes = notes.filter(n => 
                (n.superCategory || "其他") === selectedSuper && 
                (n.category || "未分類") === selectedCategory && 
                (n.subcategory || "一般") === name
            );
        }

        // 1. 建立「資料夾」形式的垃圾桶物件
        const trashFolder = {
            id: `folder-${Date.now()}`,
            isFolder: true,
            type: 'folder',
            level: type,
            title: name, // 顯示名稱
            context: { super: selectedSuper, category: selectedCategory }, // 保存刪除時的父層路徑以便還原
            deletedAt: new Date().toISOString(),
            notes: targetNotes.map(n => ({ ...n, deletedAt: new Date().toISOString() })) // 將筆記打包
        };

        // 2. 更新垃圾桶
        const newTrash = [trashFolder, ...trash];
        setTrash(newTrash);

        // 3. 更新筆記列表 (移除被打包的筆記)
        const targetIds = new Set(targetNotes.map(n => String(n.id)));
        const newNotes = notes.filter(n => !targetIds.has(String(n.id)));
        setNotes(newNotes);

        // 4. 更新分類地圖 (移除該分類) - Isolation: layout_UID
        const promises = [];
        if (window.fs && window.db && user) {
            if (type === 'superCategory') {
                const newMap = { ...superCategoryMap }; delete newMap[name]; 
                setSuperCategoryMap(newMap);
                promises.push(window.fs.setDoc(window.fs.doc(window.db, "settings", `layout_${user.uid}`), { superCategoryMapJSON: JSON.stringify(newMap) }, { merge: true }));
            } else if (type === 'category') {
                // 移除大分類地圖
                const newCatMap = { ...categoryMap }; delete newCatMap[name];
                setCategoryMap(newCatMap);
                // 移除總分類關聯
                const newSuperMap = { ...superCategoryMap };
                if (newSuperMap[selectedSuper]) newSuperMap[selectedSuper] = newSuperMap[selectedSuper].filter(c => c !== name);
                setSuperCategoryMap(newSuperMap);
                
                promises.push(window.fs.setDoc(window.fs.doc(window.db, "settings", `layout_${user.uid}`), { 
                    categoryMapJSON: JSON.stringify(newCatMap),
                    superCategoryMapJSON: JSON.stringify(newSuperMap)
                }, { merge: true }));
                
            } else if (type === 'subcategory') {
                const newMap = { ...categoryMap }; 
                if (newMap[selectedCategory]) newMap[selectedCategory] = newMap[selectedCategory].filter(s => s !== name);
                setCategoryMap(newMap);
                promises.push(window.fs.setDoc(window.fs.doc(window.db, "settings", `layout_${user.uid}`), { categoryMapJSON: JSON.stringify(newMap) }, { merge: true }));
            }

            // 5. 同步垃圾桶與刪除雲端筆記 - Isolation: trash_UID
            // 更新垃圾桶
            promises.push(window.fs.setDoc(window.fs.doc(window.db, "settings", `trash_${user.uid}`), { trashJSON: JSON.stringify(newTrash) }, { merge: true }));
            
            // 批量刪除雲端筆記
            targetNotes.forEach(n => {
                promises.push(window.fs.deleteDoc(window.fs.doc(window.db, "notes", String(n.id))));
            });

            Promise.all(promises)
                .then(() => console.log("✅ 分類刪除同步完成"))
                .catch(e => console.error("分類刪除同步失敗", e));
        }

        // 6. [關鍵修正] 強制重建洗牌堆 (避免索引指向已刪除的筆記)
        // 這一步能確保刪除後不會有「幽靈卡片」或「隨機消失」的問題
        const newDeck = Array.from({ length: newNotes.length }, (_, i) => i);
        for (let i = newDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }
        setShuffleDeck(newDeck);
        setDeckPointer(0);
        setCurrentIndex(0); // 重置為第一張

        setHasDataChangedInSession(true);
        showNotification("分類及其筆記已移至垃圾桶");

        // 關閉視窗與重置狀態
        setShowDeleteCategoryAlert(false);
        setCategoryToDelete(null);
    };

    // [新增] 處理釘選/取消釘選
    const handleTogglePin = () => {
        if (!currentNote) return;
        
        const isCurrentlyPinned = pinnedNoteId === String(currentNote.id);
        const newPinnedId = isCurrentlyPinned ? null : String(currentNote.id);

        // 1. 本地樂觀更新
        setPinnedNoteId(newPinnedId);
        
        // [Isolation] 確保使用 UID Key
        if (user) {
            if (newPinnedId) localStorage.setItem(`echoScript_PinnedId_${user.uid}`, newPinnedId);
            else localStorage.removeItem(`echoScript_PinnedId_${user.uid}`);
        }

        // [修正] 簡化提示詞，避免混淆「首頁」概念
        showNotification(isCurrentlyPinned ? "已取消釘選" : "已釘選");

        // 2. 雲端同步 (寫入 settings/preferences_UID)
        if (window.fs && window.db && user) {
            window.fs.setDoc(
                window.fs.doc(window.db, "settings", `preferences_${user.uid}`), 
                { pinnedNoteId: newPinnedId }, 
                { merge: true }
            ).catch(e => console.error("釘選同步失敗", e));
        }
    };

    const handleToggleFavorite = () => {
        const nextStatus = !isFavorite;

        // 1. 更新本地 Favorites 狀態 (讓 UI 立即變色)
        if (isFavorite) {
            setFavorites(prev => prev.filter(f => f.id !== currentNote.id));
            showNotification("已移除收藏");
        } else {
            // 加入時，確保物件內也有 isFavorite: true
            setFavorites(prev => [{ ...currentNote, isFavorite: true }, ...prev]);
            showNotification("已加入收藏");
        }

        // [關鍵修正] 鎖定當前筆記 ID，避免雲端同步(onSnapshot)觸發時，App 誤以為要跳到下一張卡片
        if (currentNote && user) {
            // [Isolation]
            localStorage.setItem(`echoScript_ResumeNoteId_${user.uid}`, String(currentNote.id));
            if (window.fs && window.db) window.fs.setDoc(window.fs.doc(window.db, "settings", `preferences_${user.uid}`), { resumeNoteId: String(currentNote.id) }, { merge: true });
        }

        // 2. [新增] 同步更新雲端 Firestore
        try {
            if (window.fs && window.db && currentNote) {
                // 只更新 isFavorite 欄位，不影響其他內容
                window.fs.setDoc(
                    window.fs.doc(window.db, "notes", String(currentNote.id)), 
                    { isFavorite: nextStatus }, 
                    { merge: true }
                );
                
                // 3. 同步更新本地 notes 列表中的狀態 (確保資料一致性)
                setNotes(prev => prev.map(n => n.id === currentNote.id ? { ...n, isFavorite: nextStatus } : n));
            }
        } catch (e) {
            console.error("雲端收藏同步失敗", e);
            // 這裡不阻擋 UI，僅紀錄錯誤
        }

        setHasDataChangedInSession(true); // [新增] 標記資料已變更 (觸發備份提醒)
    };

    // [新增] 處理同步狀態切換 - 步驟 1: 開啟確認視窗
    const handleToggleSync = () => {
        if (!currentNote) return;
        const nextStatus = !currentNote.isSynced;
        setPendingSyncStatus(nextStatus);
        setShowSyncConfirmModal(true);
    };

    // [新增] 處理同步狀態切換 - 步驟 2: 執行更新 (使用者確認後)
    const executeSyncToggle = () => {
        if (!currentNote) return;
        
        // 1. 本地樂觀更新
        setNotes(prev => prev.map(n => n.id === currentNote.id ? { ...n, isSynced: pendingSyncStatus } : n));

        // 2. 雲端同步
        try {
            if (window.fs && window.db && user) {
                window.fs.setDoc(
                    window.fs.doc(window.db, "notes", String(currentNote.id)), 
                    { isSynced: pendingSyncStatus }, 
                    { merge: true }
                );
            }
        } catch (e) {
            console.error("同步狀態更新失敗", e);
        }
        setHasDataChangedInSession(true);
        
        // 關閉視窗並處理歷史紀錄
        setShowSyncConfirmModal(false);
        // 主動清除歷史堆疊，避免返回鍵鬼打牆
        ignoreNextPopState.current = true;
        window.history.back();
    };

    // [新增] 處理卡片上的核取方塊點擊事件
    const handleCheckboxUpdate = (lineIndex, newChecked) => {
        if (!currentNote) return;
        
        const lines = currentNote.content.split('\n');
        const line = lines[lineIndex];
        // 確保該行真的存在
        if (typeof line === 'undefined') return;

        // [修正] 改用字串重組而非 replace，確保邏輯絕對正確 (避免 replace 只替換第一個或是誤判)
        // 因為 MarkdownRenderer 是用 slice(6) 來切字，所以我們這裡也保留第 6 個字元之後的內容
        const textContent = line.length >= 6 ? line.substring(6) : ""; 
        lines[lineIndex] = newChecked ? `- [x] ${textContent}` : `- [ ] ${textContent}`;
        
        const newContent = lines.join('\n');

        // 1. 本地狀態樂觀更新
        const updatedNote = { ...currentNote, content: newContent, modifiedDate: new Date().toISOString() };
        setNotes(prev => prev.map(n => n.id === currentNote.id ? updatedNote : n));

        // [新增] 自動將此卡片設為首頁 (Resume Note)，因為這是最新修改的操作
        if (user) {
            localStorage.setItem(`echoScript_ResumeNoteId_${user.uid}`, String(currentNote.id));
            if (window.fs && window.db) {
                window.fs.setDoc(
                    window.fs.doc(window.db, "settings", `preferences_${user.uid}`), 
                    { resumeNoteId: String(currentNote.id) }, 
                    { merge: true }
                ).catch(e => console.error("Resume ID update failed", e));
            }
        }

        // 2. 雲端同步
        if (window.fs && window.db && user) {
             window.fs.setDoc(
                window.fs.doc(window.db, "notes", String(currentNote.id)), 
                { content: newContent, modifiedDate: updatedNote.modifiedDate }, 
                { merge: true }
            ).catch(e => console.error("Checkbox update failed", e));
        }
        
        setHasDataChangedInSession(true);
    };

    const handleSaveResponse = (text, responseId) => {
        // [修正] 立即計算新的回應資料
        const prevResponses = allResponses;
        const noteResponses = prevResponses[currentNote.id] || [];
        let newNoteResponses;
        
        if (responseId) {
            newNoteResponses = noteResponses.map(r => r.id === responseId ? { ...r, text, timestamp: new Date().toISOString() } : r);
        } else {
            const newResponse = { id: Date.now(), text, timestamp: new Date().toISOString() };
            // [修正] 改為新增在最後面 (符合先來後到的時間序)
            newNoteResponses = [...noteResponses, newResponse];
        }

        // [關鍵修正] 強制依時間正序排列：先修改(早)在上面，晚修改(晚)在下面
        newNoteResponses.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const nextAllResponses = { ...prevResponses, [currentNote.id]: newNoteResponses };
        
        // 更新 React 狀態
        setAllResponses(nextAllResponses);
        
        // [關鍵修正] 強制同步寫入 LocalStorage (Isolation)
        if (user) localStorage.setItem(`echoScript_AllResponses_${user.uid}`, JSON.stringify(nextAllResponses));
        
        // [新增] 只要有編輯或新增回應，就表示使用者正在關注此筆記，鎖定它！
        if (user) {
            localStorage.setItem(`echoScript_ResumeNoteId_${user.uid}`, currentNote.id);
            if (window.fs && window.db) window.fs.setDoc(window.fs.doc(window.db, "settings", `preferences_${user.uid}`), { resumeNoteId: String(currentNote.id) }, { merge: true });
        }

        // [新增] 同步寫入雲端 (更新該筆記的 responses 欄位)
        try {
            if (window.fs && window.db && currentNote) {
                // 使用 merge: true，只更新 responses 欄位，不影響 title/content
                window.fs.setDoc(
                    window.fs.doc(window.db, "notes", String(currentNote.id)), 
                    { responses: newNoteResponses }, 
                    { merge: true }
                );
                console.log("✅ 雲端回應儲存成功");
            }
        } catch (e) {
            console.error("雲端回應儲存失敗", e);
            // 這裡不跳出 Alert，避免干擾使用者體驗，但會在 Console 留紀錄
        }

        // [新增] 將「修改回應」視為編輯行為，加入編輯歷史
        if (currentNote) addToHistory(currentNote);

        setHasDataChangedInSession(true); // [新增] 標記資料已變更
        showNotification("回應已儲存");
        
        // [修正] 編輯/新增回應後，關閉視窗並回到卡片
        setShowResponseModal(false);
        setResponseViewMode('list'); 
        // [關鍵修正] 確保分類列表也被關閉 (防止跳回列表)
        setShowAllNotesModal(false);

        // [關鍵修正] 主動清除歷史堆疊 (移除 Response Modal 的紀錄)，讓按返回鍵時不會發生鬼打牆
        // 設定旗標：忽略這次的 popstate
        ignoreNextPopState.current = true;
        window.history.back();
    };

    // [修改] 觸發刪除回應確認視窗
    const handleDeleteResponse = (responseId) => {
        setResponseIdToDelete(responseId);
        setShowDeleteResponseAlert(true);
    };

    // [新增] 執行刪除回應 (使用者確認後)
    const executeDeleteResponse = () => {
        if (!responseIdToDelete || !currentNote) return;

        // 1. 計算刪除後的陣列
        const prevResponses = allResponses;
        const noteResponses = prevResponses[currentNote.id] || [];
        const newNoteResponses = noteResponses.filter(r => r.id !== responseIdToDelete);
        const nextAllResponses = { ...prevResponses, [currentNote.id]: newNoteResponses };

        // 2. 更新本地狀態與 LocalStorage (確保 UI 反應即時)
        setAllResponses(nextAllResponses);
        // [Isolation] 寫入專屬 Responses Key
        if (user) localStorage.setItem(`echoScript_AllResponses_${user.uid}`, JSON.stringify(nextAllResponses));

        // 3. [新增] 同步更新雲端 Firestore
        try {
            if (window.fs && window.db && currentNote) {
                // 將過濾後的陣列寫回雲端，覆蓋原本的 responses 欄位
                window.fs.setDoc(
                    window.fs.doc(window.db, "notes", String(currentNote.id)), 
                    { responses: newNoteResponses }, 
                    { merge: true }
                );
                console.log("✅ 雲端回應刪除成功");
            }
        } catch (e) {
            console.error("雲端回應刪除失敗", e);
            showNotification("⚠️ 雲端同步失敗，請檢查網路");
        }

        setHasDataChangedInSession(true); // [新增] 標記資料已變更
        showNotification("回應已刪除");
        
        // 重置狀態並關閉視窗
        setShowDeleteResponseAlert(false);
        setResponseIdToDelete(null);
    };

    const handleCopyText = () => {
        if (!currentNote) return;
        
        // 1. 基礎內容：主旨 + 內文
        let text = `${currentNote.title}\n\n${currentNote.content}`;

        // 2. 處理回應：如果有回應，則加入分隔線與回應內容
        const responses = allResponses[currentNote.id] || [];
        if (responses.length > 0) {
            // 加入使用者指定的虛線分隔
            text += '\n\n---------------- -回應- ----------------\n\n';
            
            // 組合回應 (先日期，換行後內容)
            const responseText = responses.map(r => {
                const date = new Date(r.timestamp).toLocaleDateString();
                return `${date}\n${r.text}`;
            }).join('\n\n');
            
            text += responseText;
        }
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => showNotification("已複製筆記與回應")).catch(() => showNotification("複製失敗"));
        }
    };

    const handleBackup = () => {
        // [修正] 必須備份 categoryMap，否則還原後分類順序會遺失
        const data = { 
            favorites, 
            history, 
            notes, 
            allResponses, 
            categoryMap, // <--- 這裡保存了分類順序
            version: "EchoScript_v3", 
            date: new Date().toISOString() 
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `EchoScript_Backup_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
    };

    // [新增] 匯出為純文字檔 (可讀性高，可貼入 Word)
    const handleExportText = () => {
        let fullText = "=== EchoScript 資料存檔 ===\n\n";
        fullText += `匯出日期: ${new Date().toLocaleString()}\n`;
        fullText += `筆記總數: ${notes.length}\n\n`;

        // [修正] 改為依照分類層級排序 (總分類 -> 大分類 -> 次分類)
        const sortedNotes = [...notes].sort((a, b) => {
            const superA = a.superCategory || "其他";
            const superB = b.superCategory || "其他";
            if (superA !== superB) return superA.localeCompare(superB, "zh-Hant");

            const catA = a.category || "未分類";
            const catB = b.category || "未分類";
            if (catA !== catB) return catA.localeCompare(catB, "zh-Hant");

            const subA = a.subcategory || "一般";
            const subB = b.subcategory || "一般";
            return subA.localeCompare(subB, "zh-Hant");
        });

        sortedNotes.forEach((note, index) => {
            fullText += "================================================================\n";
            fullText += `【${index + 1}】${note.title}\n`;
            fullText += `分類: ${note.superCategory || "其他"} > ${note.category || "未分類"} > ${note.subcategory || "一般"}\n`;
            fullText += `建立: ${new Date(note.createdDate).toLocaleDateString()} | 修改: ${new Date(note.modifiedDate).toLocaleDateString()}\n`;
            fullText += "----------------------------------------------------------------\n";
            fullText += `${note.content}\n`;

            // 處理回應
            const responses = allResponses[note.id] || [];
            if (responses.length > 0) {
                fullText += "\n   --- 回應紀錄 ---\n";
                responses.forEach(r => {
                    fullText += `   [${new Date(r.timestamp).toLocaleString()}] ${r.text}\n`;
                });
            }
            fullText += "\n\n";
        });

        const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `EchoScript_Archive_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
    };

    // === [還原邏輯] 直接覆蓋模式 (Overwrite) ===
    const handleRestore = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // [Safety Check] 確保已登入
        if (!user) { alert("請先登入後再執行還原"); return; }

        // 為了比對，我們需要一個快速查找表 (Map)，用 ID 當鑰匙
        // notes 是目前已讀取的筆記狀態，可直接用來比對
        const currentNotesMap = new Map(notes.map(n => [String(n.id), n]));

        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                const promises = [];
                let addedCount = 0;
                let overwriteCount = 0; // 記錄覆蓋數量
                let skippedCount = 0;

                showNotification("正在還原並覆蓋資料...");

                // 1. 處理筆記 (核心邏輯)
                if (data.notes && Array.isArray(data.notes)) {
                    for (const backupNote of data.notes) {
                        const noteId = String(backupNote.id);
                        const localNote = currentNotesMap.get(noteId);

                        const noteData = { ...backupNote, userId: user.uid }; // 確保歸屬權

                        if (!localNote) {
                            // [情況 A] 本地沒有 -> 新增
                            if (window.fs && window.db) {
                                promises.push(window.fs.setDoc(window.fs.doc(window.db, "notes", noteId), noteData));
                            }
                            addedCount++;
                        } else {
                            // [情況 B] 本地有 -> 檢查是否需要覆蓋
                            // 只要內容不同，就直接覆蓋 (不再建立副本)
                            const isContentSame = (localNote.title === backupNote.title) && (localNote.content === backupNote.content);
                            
                            if (isContentSame) {
                                skippedCount++;
                            } else {
                                // [覆蓋] 使用備份檔的資料，直接寫入原本的 ID
                                if (window.fs && window.db) {
                                    promises.push(window.fs.setDoc(window.fs.doc(window.db, "notes", noteId), noteData));
                                }
                                overwriteCount++;
                            }
                        }
                    }
                }

                // 2. 還原分類結構 (維持合併策略，以免遺失新分類)
                if (data.categoryMap && window.fs && window.db) {
                    const mergedCatMap = { ...categoryMap };
                    let layoutChanged = false;

                    Object.entries(data.categoryMap).forEach(([cat, subs]) => {
                        if (!mergedCatMap[cat]) {
                            mergedCatMap[cat] = subs; 
                            layoutChanged = true;
                        } else {
                            subs.forEach(sub => {
                                if (!mergedCatMap[cat].includes(sub)) {
                                    mergedCatMap[cat].push(sub);
                                    layoutChanged = true;
                                }
                            });
                        }
                    });

                    let mergedSuperMap = { ...superCategoryMap };
                    if (data.superCategoryMap) {
                         Object.entries(data.superCategoryMap).forEach(([sup, cats]) => {
                            if (!mergedSuperMap[sup]) {
                                mergedSuperMap[sup] = cats;
                                layoutChanged = true;
                            } else {
                                cats.forEach(c => {
                                    if(!mergedSuperMap[sup].includes(c)) {
                                        mergedSuperMap[sup].push(c);
                                        layoutChanged = true;
                                    }
                                });
                            }
                         });
                    }

                    if (layoutChanged) {
                        const payload = { 
                            categoryMapJSON: JSON.stringify(mergedCatMap),
                            superCategoryMapJSON: JSON.stringify(mergedSuperMap)
                        };
                        promises.push(window.fs.setDoc(window.fs.doc(window.db, "settings", `layout_${user.uid}`), payload, { merge: true }));
                    }
                }

                // 3. 還原歷史紀錄
                if (data.history && window.fs && window.db) {
                     promises.push(window.fs.setDoc(window.fs.doc(window.db, "settings", `history_${user.uid}`), { historyJSON: JSON.stringify(data.history) }, { merge: true }));
                }

                if (promises.length > 0) {
                    await Promise.all(promises);
                    const msg = `還原完成！\n新增: ${addedCount} 則\n覆蓋: ${overwriteCount} 則\n跳過: ${skippedCount} 則`;
                    alert(msg);
                    showNotification("☁️ 雲端還原完成！");
                    // 強制重整以確保資料顯示正確
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    showNotification("備份檔與現有資料一致，無需變更");
                }

            } catch (err) { 
                console.error("還原失敗", err);
                showNotification("檔案格式錯誤或網路上傳失敗"); 
            }
        };
        reader.readAsText(file);
    };

    const onTouchStart = (e) => { setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY }); };
    const onTouchMove = (e) => { setTouchCurrent({ x: e.touches[0].clientX, y: e.touches[0].clientY }); };
    const onTouchEnd = () => {
        if (!touchStart || !touchCurrent) return;
        const dx = touchStart.x - touchCurrent.x;
        const dy = touchCurrent.y - touchStart.y;
        
        // 左滑 (下一張)
        if (Math.abs(dx) > Math.abs(dy) && dx > 50) handleNextNote(); 
        
        // [新增] 右滑 (上一張)
        if (Math.abs(dx) > Math.abs(dy) && dx < -50) handlePreviousNote();

        // 下拉 (下一張)
        if (Math.abs(dy) > Math.abs(dx) && dy > 100 && window.scrollY === 0) handleNextNote(); 
        
        setTouchStart(null); setTouchCurrent(null);
    };

    // [Render] 登入檢查
    if (authLoading) return <div className={`min-h-screen ${theme.bg} flex items-center justify-center ${theme.text}`}>載入中...</div>;
    
    if (!user) {
        return <LoginScreen onLogin={handleLogin} theme={theme} />;
    }

    return (
        <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans pb-20 transition-colors duration-300`} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            <nav className={`sticky top-0 z-30 ${theme.bg}/90 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b ${theme.border}`}>
                <div className="flex items-center gap-2 cursor-pointer" onClick={handleGoHome} title="回到首頁">
                    {/* [修改] Icon 尺寸由 w-8 h-8 改為 w-10 h-10 (放大約 1.2 倍) */}
                    <img src="icon.png" className="w-10 h-10 rounded-lg object-cover" alt="App Icon" />
                    <h1 className={`text-lg font-bold tracking-tight ${theme.text}`}>EchoScript</h1>
                </div>
                <div className="flex gap-2">
                     <button onClick={() => { setIsCreatingNew(true); setShowEditModal(true); }} className={`${theme.card} border ${theme.border} ${theme.subtext} p-2 rounded-full shadow-sm active:opacity-80`} title="新增筆記">
                        <Plus className="w-5 h-5" />
                    </button>
                    {/* [UI調整] 筆記分類按鈕移至右上角 */}
                    <button 
                        onClick={() => { 
                            // [關鍵] 開啟前先記住現在的位置
                            preModalIndexRef.current = currentIndex;
                            setShowAllNotesModal(true); 
                            setAllNotesViewLevel('superCategories'); 
                        }} 
                        className={`${theme.card} border ${theme.border} ${theme.subtext} p-2 rounded-full shadow-sm active:opacity-80`} 
                        title="筆記分類"
                    >
                        <List className="w-5 h-5" />
                    </button>
                    {/* [Auth] 改為 User Avatar 或 Menu */}
                    <button onClick={() => setShowMenuModal(true)} className={`${theme.accent} ${theme.accentText} p-2 rounded-full shadow-sm active:opacity-80`}>
                        <BookOpen className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            <main className="px-6 py-6 max-w-lg mx-auto">
                {showPinnedPlaceholder ? (
                    // [修正] 釘選卡片被刪除後的空狀態 (點擊跳轉分類)
                    <div className={`transition-all duration-500 opacity-100 translate-y-0`}>
                        <div 
                            className={`${theme.card} rounded-xl shadow-xl border ${theme.border} min-h-[400px] flex flex-col items-center justify-center text-center p-8 cursor-pointer hover:bg-stone-50 transition-colors`}
                            onClick={() => { setShowAllNotesModal(true); setAllNotesViewLevel('superCategories'); }}
                        >
                            <Pin className={`w-12 h-12 mb-4 ${theme.subtext} opacity-50`} />
                            
                            {/* 模擬一般筆記的標題樣式 */}
                            <h2 className={`text-xl font-bold ${theme.text} mb-4`}>目前無釘選卡片</h2>
                            
                            <button 
                                className={`${theme.accent} ${theme.accentText} px-6 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-2`}
                            >
                                <List className="w-5 h-5" />
                                請選擇釘選卡片
                            </button>
                            
                            <p className="mt-8 text-xs text-stone-400 animate-pulse">← 左滑隨機探索其他筆記</p>
                        </div>
                    </div>
                ) : currentNote ? (
                    <div className={`transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                        {/* 主卡片區域 ... */}
                        <div className={`${theme.card} rounded-xl shadow-xl border ${theme.border} overflow-hidden relative min-h-[400px] flex flex-col transition-colors duration-300`}>
                            
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="mb-2">
                                    <div className="flex justify-between items-center mb-2">
                                        {/* 修改：加入 flex-wrap 允許換行，gap-x/y 控制間距 */}
                                    <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm font-bold ${theme.subtext} tracking-widest uppercase`}>
                                        {/* 總分類：加入 whitespace-nowrap 確保文字本身不斷行 */}
                                        <button 
                                            onClick={() => {
                                                preModalIndexRef.current = currentIndex;
                                                setSelectedSuper(currentNote.superCategory || "其他");
                                                setAllNotesViewLevel('categories');
                                                setShowAllNotesModal(true);
                                            }}
                                            className="hover:underline hover:text-stone-500 transition-colors cursor-pointer whitespace-nowrap"
                                            title="檢視此總分類下的資料夾"
                                        >
                                            {currentNote.superCategory || "其他"}
                                        </button>

                                        <span className="opacity-50 select-none">|</span>

                                        {/* 大分類：加入 whitespace-nowrap */}
                                        <button 
                                            onClick={() => {
                                                preModalIndexRef.current = currentIndex;
                                                setSelectedSuper(currentNote.superCategory || "其他");
                                                setSelectedCategory(currentNote.category || "未分類");
                                                setAllNotesViewLevel('subcategories');
                                                setShowAllNotesModal(true);
                                            }}
                                            className="hover:underline hover:text-stone-500 transition-colors cursor-pointer whitespace-nowrap"
                                            title="檢視此分類下的資料夾"
                                        >
                                            {currentNote.category || "未分類"}
                                        </button>
                                        
                                        <span className="opacity-50 select-none">|</span>
                                        
                                        {/* 次分類：加入 whitespace-nowrap */}
                                        <button 
                                            onClick={() => {
                                                preModalIndexRef.current = currentIndex;
                                                setSelectedSuper(currentNote.superCategory || "其他");
                                                setSelectedCategory(currentNote.category || "未分類");
                                                setSelectedSubcategory(currentNote.subcategory || "一般");
                                                setAllNotesViewLevel('notes');
                                                setShowAllNotesModal(true);
                                            }}
                                            className="hover:underline hover:text-stone-500 transition-colors cursor-pointer whitespace-nowrap"
                                            title="檢視此分類下的所有筆記"
                                        >
                                            {currentNote.subcategory || "一般"}
                                        </button>
                                    </div>
                                        <div className="flex items-center gap-3">
                                            {/* [修改] 已移除筆記編號 ID */}
                                            <button onClick={handleTogglePin} className={`transition-transform duration-200 hover:scale-110 ${String(currentNote.id) === String(pinnedNoteId) ? theme.text : 'text-stone-300'}`} title="釘選這則筆記">
                                                <Pin className="w-5 h-5" fill={String(currentNote.id) === String(pinnedNoteId) ? "currentColor" : "none"} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex-1">
                                    {/* [修改] 標題區塊改為 Flex 佈局以支援縮圖 */}
                                    <div className="flex items-start gap-3 mb-4">
                                        {currentNote.image && (
                                            <div 
                                                className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-stone-200 cursor-zoom-in active:scale-95 transition-transform"
                                                onClick={() => setZoomedImage(currentNote.image)}
                                            >
                                                <img 
                                                    src={currentNote.image} 
                                                    className="w-full h-full object-cover" 
                                                    alt="thumbnail"
                                                />
                                            </div>
                                        )}
                                        <h1 className={`text-2xl font-bold ${theme.text} flex-1 min-w-0 break-words`}>
                                            {currentNote.title}
                                        </h1>
                                    </div>
                                    
                                    {/* 日期顯示區 - 移至主旨語下方 */}
                                    <div className={`flex flex-nowrap gap-2 mb-6 text-[10px] ${theme.subtext} font-mono border-y ${theme.border} py-2 w-full items-center`}>
                                        {/* 左側：日期資訊 (gap-2 讓日期彼此靠近，移除中間分隔線) */}
                                        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                                            <span className="flex items-center gap-1 shrink-0"><Calendar className="w-3 h-3"/> 建立: {currentNote.createdDate ? new Date(currentNote.createdDate).toLocaleDateString() : '預設'}</span>
                                            <span className="flex items-center gap-1 shrink-0"><Edit className="w-3 h-3"/> 修改: {currentNote.modifiedDate ? new Date(currentNote.modifiedDate).toLocaleDateString() : (currentNote.createdDate ? new Date(currentNote.createdDate).toLocaleDateString() : '預設')}</span>
                                        </div>

                                        {/* 右側區域：分隔線 + 同步狀態 (ml-auto 將此區塊推至最右，達成較大間距) */}
                                        <div className="flex items-center gap-3 ml-auto shrink-0">
                                            {/* 新增分隔線，位於修改日期與同步狀態中間 */}
                                            <div className="w-px h-3 bg-current opacity-20"></div>
                                            
                                            <button 
                                                onClick={handleToggleSync}
                                                className="flex items-center gap-1 hover:opacity-70 transition-opacity select-none"
                                                title="點擊切換同步狀態"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                    {currentNote.isSynced && <polyline points="9 11 12 14 22 4"></polyline>}
                                                </svg>
                                                <span>{currentNote.isSynced ? '已同步' : '未同步'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* 內文區域 - 這裡強制使用深色字體以確保 Markdown 在淺色底的卡片上可讀，若為深色模式則自動調整 */ }
                                    <div className={`-mt-2 text-lg leading-loose font-sans text-justify whitespace-pre-wrap ${currentThemeId === 'dark' ? 'text-slate-300' : 'text-stone-700'}`}>
                                        {/* [修改] 傳入 onCheckboxChange 以支援互動核取 */}
                                        <MarkdownRenderer content={currentNote.content} onCheckboxChange={handleCheckboxUpdate} />
                                    </div>
                                </div>
                            </div>

                            {/* 操作按鈕區 (位於卡片內部底部) */}
                            <div className={`${currentThemeId === 'dark' ? 'bg-slate-950/30' : 'bg-stone-50'} px-12 py-4 border-t ${theme.border} flex justify-between items-center`}>
                                <button onClick={() => { setIsCreatingNew(false); setShowEditModal(true); }} className="flex flex-col items-center gap-1 text-stone-400 hover:scale-110 transition-transform duration-200">
                                    <Edit className="w-6 h-6" />
                                    <span className="text-[9px] font-bold">修改筆記</span>
                                </button>
                                
                                <button onClick={() => setShowResponseModal(true)} className="flex flex-col items-center gap-1 text-stone-400 hover:scale-110 transition-transform duration-200 relative">
                                    <PenLine className="w-6 h-6" />
                                    <span className="text-[9px] font-bold">回應</span>
                                    {currentNoteResponses.length > 0 && (
                                        <span className="absolute top-0 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-stone-400 text-xs font-bold text-white border-2 border-stone-50">
                                            {currentNoteResponses.length}
                                        </span>
                                    )}
                                </button>

                                <button onClick={handleToggleFavorite} className="flex flex-col items-center gap-1 hover:scale-110 transition-transform duration-200 text-stone-400">
                                    <Heart className="w-6 h-6" fill={isFavorite ? "currentColor" : "none"} />
                                    <span className="text-[9px] font-bold">收藏</span>
                                </button>

                                <button onClick={handleCopyText} className="flex flex-col items-center gap-1 text-stone-400 hover:scale-110 transition-transform duration-200">
                                    <Copy className="w-6 h-6" />
                                    <span className="text-[9px] font-bold">複製筆記</span>
                                </button>
                            </div>
                        </div> {/* 卡片結束 */}

                        {/* 獨立的回應列表 (位於卡片下方) */}
                        {currentNoteResponses.length > 0 && (
                            <div className="mt-6 px-4 animate-in fade-in slide-in-from-bottom-3">
                                <div className="flex items-center gap-3 mb-4 opacity-60">
                                    <div className="h-px bg-stone-300 flex-1"></div>
                                    <span className="text-[10px] font-bold text-stone-500 tracking-widest uppercase">回應紀錄</span>
                                    <div className="h-px bg-stone-300 flex-1"></div>
                                </div>
                                
                                <div className="space-y-4">
                                    {currentNoteResponses.map(resp => (
                                        <div key={resp.id} className="relative pl-4 border-l-2 border-stone-300 py-1">
                                            {/* 裝飾小圓點 */}
                                            <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-stone-400"></div>
                                            
                                            {/* 日期 */}
                                            <p className="text-[10px] text-stone-400 font-mono mb-1">
                                                {new Date(resp.timestamp).toLocaleDateString()}
                                            </p>
                                            
                                            {/* 回應內容 */}
                                            <div className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed break-words" style={{ whiteSpace: 'pre-wrap' }}>
                                                {resp.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                        <BookOpen className="w-12 h-12 mb-4 opacity-50"/>
                        <p>資料庫是空的</p>
                        <button onClick={() => { setIsCreatingNew(true); setShowEditModal(true); }} className="mt-4 text-stone-600 underline">新增第一則筆記</button>
                    </div>
                )}
            </main>
            
            {/* [UI調整] 左下角導航操作區：改為橫向排列 (首頁 -> 釘選 -> 隨機) */}
            <div className="fixed bottom-6 left-6 z-20 flex gap-3 items-center">
                
                {/* 1. 首頁按鈕 (最左邊) */}
                <button 
                    onClick={handleGoHome} 
                    disabled={isAnimating || notes.length === 0} 
                    className={`${theme.accent} ${theme.accentText} p-3 rounded-full shadow-lg active:scale-95 transition-transform`} 
                    title="回到最後編輯 (首頁)"
                >
                    <Home className="w-6 h-6"/>
                </button>

                {/* 2. 釘選按鈕 (中間) */}
                <button 
                    onClick={handleGoToPin} 
                    disabled={isAnimating || notes.length === 0} 
                    className={`${theme.accent} ${theme.accentText} p-3 rounded-full shadow-lg active:scale-95 transition-transform`} 
                    title="回到釘選筆記"
                >
                    <Pin className="w-6 h-6" />
                </button>

                {/* 3. [修改] 抽卡設定按鈕 (右邊) - 改為圖示「抽卡」，點擊設定目標 */}
                <button 
                    onClick={() => setShowShuffleMenu(true)} 
                    className={`${shuffleTarget ? `${theme.accent} ${theme.accentText}` : `${theme.card} border ${theme.border} ${theme.subtext}`} p-3 rounded-full shadow-lg active:scale-95 transition-transform relative`} 
                    title="設定抽卡目標"
                >
                    <Shuffle className="w-6 h-6" />
                </button>
            </div>

            {showMenuModal && (
                <div className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm flex justify-end" onClick={(e) => { if(e.target === e.currentTarget) setShowMenuModal(false); }}>
                    <div className={`w-full max-w-sm ${theme.bg} h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300`}>
                        <div className={`p-5 border-b ${theme.border} ${theme.card} flex items-center gap-3`}>
                             <img src={user.photoURL} className="w-10 h-10 rounded-full" />
                             <div className="flex-1 overflow-hidden">
                                <h2 className={`font-bold text-sm ${theme.text} truncate`}>{user.displayName}</h2>
                                <button onClick={handleLogout} className="text-xs text-red-500 font-bold hover:underline">登出帳號</button>
                             </div>
                            <button onClick={() => setShowMenuModal(false)}><X className="w-6 h-6 text-gray-400" /></button>
                        </div>
                       <div className={`flex p-2 gap-2 ${theme.card} border-b ${theme.border}`}>
                            {['favorites', 'history', 'appearance', 'settings'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === tab ? theme.activeTab : 'text-stone-400 hover:bg-stone-100'}`}>
                                    {tab === 'favorites' ? '收藏' : tab === 'history' ? '編輯歷史' : tab === 'appearance' ? '外觀' : '備份'}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            

                            {activeTab === 'favorites' && favorites.map(item => {
                                // 選擇性：如果不想讓釘選筆記重複出現在下方列表，可以過濾掉
                                // if (String(item.id) === String(pinnedNoteId)) return null;
                                return (
                                    <NoteListItem 
                                        key={item.id} 
                                        item={item} 
                                        allResponses={allResponses} 
                                        theme={theme}
                                    />
                                );
                            })}
                            {activeTab === 'favorites' && favorites.length === 0 && !pinnedNoteId && <div className="text-center text-stone-400 mt-10 text-xs">暫無收藏</div>}
                            
                            {/* [修正] 強制過濾：顯示前先比對 notes 列表，只有 ID 還存在的筆記才顯示，徹底解決刪除後殘留問題 */}
                            {activeTab === 'history' && history
                                .filter(h => h && notes.some(n => String(n.id) === String(h.id)))
                                .map((item, i) => (
                                    <NoteListItem 
                                        key={i} 
                                        item={item} 
                                        isHistory 
                                        allResponses={allResponses} 
                                        theme={theme}
                                    />
                            ))}

                            {/* [新增] 外觀主題選擇面板 */}
                            {activeTab === 'appearance' && (
                                <div className="space-y-4">
                                    <h3 className={`font-bold ${theme.subtext} mb-2`}>選擇主題</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {Object.values(THEMES).map(t => (
                                            <button 
                                                key={t.id}
                                                onClick={() => handleSetTheme(t.id)}
                                                className={`
                                                    relative p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 overflow-hidden ${t.card}
                                                    ${currentThemeId === t.id ? 'border-[#2c3e50] ring-1 ring-[#2c3e50]' : 'border-transparent hover:border-gray-200'}
                                                `}
                                            >
                                                {/* 預覽色塊 */}
                                                <div className={`w-12 h-12 rounded-full shadow-sm flex items-center justify-center ${t.bg} border border-gray-100`}>
                                                    <div className={`w-6 h-6 rounded-full ${t.accent}`}></div>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className={`font-bold ${t.id === 'dark' ? 'text-slate-200' : 'text-stone-800'}`}>{t.name}</h4>
                                                    <p className={`text-xs ${t.id === 'dark' ? 'text-slate-500' : 'text-stone-400'}`}>
                                                        {t.id === 'light' ? '經典簡約風格' : t.id === 'dark' ? '適合低光源閱讀' : '柔和多彩的花園配色'}
                                                    </p>
                                                </div>
                                                {currentThemeId === t.id && (
                                                    <div className="absolute right-3 top-3 text-[#2c3e50]">
                                                        <IconBase d="M20 6 9 17l-5-5" className="w-5 h-5"/>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'settings' && (
                                <div className="space-y-4">
                                    {/* [新增] 垃圾桶介面 */}
                                    <div className={`${theme.card} p-4 rounded-xl border ${theme.border}`}>
                                        <h3 className={`font-bold mb-3 flex items-center gap-2 ${theme.text}`}>
                                            <Trash2 className="w-4 h-4"/> 垃圾桶
                                            <div className="ml-auto flex items-center gap-2">
                                                <span className="text-xs font-normal text-stone-400">保留 30 天</span>
                                                {trash.length > 0 && (
                                                    <button 
                                                        onClick={handleEmptyTrash}
                                                        className="text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                                                    >
                                                        清空
                                                    </button>
                                                )}
                                            </div>
                                        </h3>
                                        
                                        {trash.length > 0 ? (
                                            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                                                {trash.map(t => {
                                                    const daysLeft = Math.max(0, 30 - Math.floor((Date.now() - new Date(t.deletedAt).getTime()) / (1000 * 60 * 60 * 24)));
                                                    const isFolder = t.isFolder;

                                                    return (
                                                        <div key={t.id} className={`flex justify-between items-center p-3 ${isFolder ? 'bg-orange-50/50' : 'bg-stone-50/50'} rounded-lg border ${theme.border}`}>
                                                            <div className="flex-1 min-w-0 mr-3">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    {isFolder && <span className="bg-orange-200 text-orange-800 text-[10px] px-1.5 py-0.5 rounded font-bold">資料夾</span>}
                                                                    <h4 className={`text-sm font-bold ${theme.text} truncate`}>{t.title}</h4>
                                                                </div>
                                                                <div className="flex gap-2 text-[10px] text-stone-400">
                                                                    {isFolder ? (
                                                                        <span>包含 {t.notes.length} 則筆記</span>
                                                                    ) : (
                                                                        <span>{t.category}</span>
                                                                    )}
                                                                    <span>•</span>
                                                                    <span>剩 {daysLeft} 天</span>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleRestoreFromTrash(t.id)}
                                                                className="shrink-0 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full hover:bg-green-200 transition-colors"
                                                            >
                                                                復原
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-xs text-stone-400 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                                                垃圾桶是空的
                                            </div>
                                        )}
                                    </div>

                                    <div className={`${theme.card} p-4 rounded-xl border ${theme.border}`}>
                                        <h3 className={`font-bold mb-2 flex items-center gap-2 ${theme.text}`}><Download className="w-4 h-4"/> 匯出備份 (JSON)</h3>
                                        <p className={`text-xs ${theme.subtext} mb-3`}>包含完整資料結構，用於還原 App。</p>
                                        <button onClick={handleBackup} className="w-full bg-stone-100 text-stone-800 text-sm font-bold py-2 rounded-lg border border-stone-200">下載 JSON 檔案</button>
                                    </div>

                                    <div className={`${theme.card} p-4 rounded-xl border ${theme.border}`}>
                                        <h3 className={`font-bold mb-2 flex items-center gap-2 ${theme.text}`}><Upload className="w-4 h-4"/> 匯入備份</h3>
                                        <label className="block w-full bg-[#2c3e50] text-white text-center text-sm font-bold py-2 rounded-lg cursor-pointer">
                                            選擇 JSON 檔案
                                            <input type="file" accept=".json" className="hidden" onChange={handleRestore} />
                                        </label>
                                    </div>

                                    {/* [新增] 資料存檔區塊 */}
                                    <div className={`${theme.card} p-4 rounded-xl border ${theme.border}`}>
                                        <h3 className={`font-bold mb-2 flex items-center gap-2 ${theme.text}`}><FileText className="w-4 h-4"/> 資料存檔 (TXT)</h3>
                                        <p className={`text-xs ${theme.subtext} mb-3`}>將所有筆記與回應轉為純文字，可貼入 Word 或保存閱讀。</p>
                                        <button onClick={handleExportText} className="w-full bg-stone-100 text-stone-800 text-sm font-bold py-2 rounded-lg border border-stone-200">下載 TXT 檔案</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <MarkdownEditorModal 
                    // [修正] 如果是新增模式，優先使用模板資料(若有)，否則為 null
                    note={isCreatingNew ? (newNoteTemplate || null) : currentNote} 
                    existingNotes={notes}
                    isNew={isCreatingNew}
                    onClose={() => { setShowEditModal(false); setNewNoteTemplate(null); }} // 關閉時重置模板
                    onSave={(data) => { handleSaveNote(data); setHasUnsavedChanges(false); setNewNoteTemplate(null); }} 
                    onDelete={() => { handleDeleteNote(currentNote?.id); setHasUnsavedChanges(false); }}
                    setHasUnsavedChanges={setHasUnsavedChanges}
                    triggerUnsavedAlert={() => setShowUnsavedAlert(true)}
                    theme={theme}
                />
            )}

            {showAllNotesModal && (
                <AllNotesModal 
                    user={user} // [Isolation] 傳遞 user 資訊
                    notes={notes}
                    setNotes={setNotes} 
                    categoryMap={categoryMap}
                    setCategoryMap={setCategoryMap}
                    superCategoryMap={superCategoryMap}
                    setSuperCategoryMap={setSuperCategoryMap}
                    setHasDataChangedInSession={setHasDataChangedInSession}
                    
                    // [關鍵修正] 傳遞狀態給子視窗，確保關閉重開後狀態還在
                    selectedSuper={selectedSuper} setSelectedSuper={setSelectedSuper}
                    selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                    selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory}
                    
                    // [新增] 傳遞搜尋狀態
                    categorySearchTerm={categorySearchTerm} setCategorySearchTerm={setCategorySearchTerm}

                    onClose={() => { 
                        setShowAllNotesModal(false); 
                        setAllNotesViewLevel('superCategories'); 
                        
                        // [關鍵修正] 手動關閉視窗時，也要還原卡片
                        if (preModalIndexRef.current !== null && preModalIndexRef.current !== -1) {
                            setCurrentIndex(preModalIndexRef.current);
                        }
                    }}
                    onItemClick={(item) => {
                        const idx = notes.findIndex(n => n.id === item.id);
                        if(idx !== -1) {
                            setCurrentIndex(idx);
                            setShowAllNotesModal(false);
                            // 這裡不清除 selected 狀態，確保按返回時能回到原本的列表位置
                            
                            window.history.pushState({ page: 'reading_from_list', noteId: item.id }, '', '');
                            window.scrollTo(0,0);
                        }
                    }}
                    onDelete={handleDeleteNote}
                    onDeleteCategory={handleDeleteCategory} // [新增] 傳入分類刪除函式
                    viewLevel={allNotesViewLevel}
                    setViewLevel={setAllNotesViewLevel}
                    theme={theme}
                    // [新增] 處理從列表新增筆記的動作
                    onAddNote={(template) => {
                        setNewNoteTemplate(template); // 設定預填分類
                        setIsCreatingNew(true);
                        setShowEditModal(true); // 開啟編輯器
                        // 這裡不關閉 AllNotesModal，讓使用者新增完後回來還在列表
                    }}
                />
            )}

            {showResponseModal && currentNote && (
                <ResponseModal 
                    note={currentNote} 
                    responses={currentNoteResponses} 
                    onClose={() => setShowResponseModal(false)}
                    onSave={(text, id) => { handleSaveResponse(text, id); setHasUnsavedChanges(false); }}
                    onDelete={handleDeleteResponse}
                    viewMode={responseViewMode}
                    setViewMode={setResponseViewMode}
                    setHasUnsavedChanges={setHasUnsavedChanges}
                    theme={theme}
                />
            )}

            {/* [新增] 自定義未存檔警告視窗 (徹底解決返回閃退問題) */}
            {showUnsavedAlert && (
                <div className="fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => { if(e.target === e.currentTarget) setShowUnsavedAlert(false); }}>
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-xs w-full animate-in zoom-in-95">
                        <h3 className="font-bold text-lg mb-2 text-stone-800">尚未存檔</h3>
                        <p className="text-sm text-stone-600 mb-6">您有變更尚未儲存，確定要直接離開嗎？</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowUnsavedAlert(false)}
                                className="flex-1 px-4 py-2 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg font-bold transition-colors"
                            >
                                繼續編輯
                            </button>
                            <button 
                                onClick={() => {
                                    // 1. 解除未存檔狀態
                                    hasUnsavedChangesRef.current = false;
                                    setHasUnsavedChanges(false);
                                    setShowUnsavedAlert(false);
                                    
                                    // 2. 計算需要退回的層級 (與儲存邏輯一致)
                                    // 如果是從列表開啟的(-2)，如果是從卡片開啟的(-1)
                                    const stepsBack = showAllNotesModal ? -2 : -1;

                                    // 3. 強制關閉所有視窗 (確保 UI 停留在當前卡片)
                                    setShowMenuModal(false);
                                    setShowAllNotesModal(false);
                                    setAllNotesViewLevel('categories');
                                    setShowEditModal(false);
                                    setShowResponseModal(false);
                                    setResponseViewMode('list');
                                    
                                    // [關鍵修正] 使用 ignoreNextPopState 防止自動導航干擾
                                    // 手動控制歷史堆疊清理，確保畫面穩定的停留在當前卡片
                                    ignoreNextPopState.current = true;
                                    window.history.go(stepsBack);
                                }} 
                                className="flex-1 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg font-bold transition-colors"
                            >
                                確定離開
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* [新增] 同步確認浮動視窗 */}
            {showSyncConfirmModal && (
                <div 
                    className="fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" 
                    onClick={(e) => { 
                        if(e.target === e.currentTarget) {
                            setShowSyncConfirmModal(false);
                            // 點擊背景關閉時，也要清除歷史堆疊，避免返回鍵行為異常
                            ignoreNextPopState.current = true;
                            window.history.back();
                        }
                    }}
                >
                    <div className={`${theme.card} rounded-xl shadow-2xl p-6 max-w-xs w-full animate-in zoom-in-95 border ${theme.border}`}>
                        <h3 className={`font-bold text-lg mb-2 ${theme.text}`}>同步狀態確認</h3>
                        <p className={`text-sm ${theme.subtext} mb-6 leading-relaxed`}>
                            {pendingSyncStatus 
                                ? '確認已與其他雲端筆記本同步？' 
                                : '將狀態改為「尚未與其他雲端筆記本同步」？'}
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setShowSyncConfirmModal(false);
                                    ignoreNextPopState.current = true;
                                    window.history.back();
                                }}
                                className="flex-1 px-4 py-2 bg-stone-100 text-stone-600 hover:bg-stone-200 rounded-lg font-bold transition-colors text-xs"
                            >
                                取消
                            </button>
                            <button 
                                onClick={executeSyncToggle}
                                className={`flex-1 px-4 py-2 ${theme.accent} ${theme.accentText} rounded-lg font-bold transition-colors text-xs shadow-md`}
                            >
                                確認
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* [新增] 回應刪除確認浮動視窗 (Z-Index 設為 70 以覆蓋 ResponseModal) */}
            {showDeleteResponseAlert && (
                <div 
                    className="fixed inset-0 z-[70] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" 
                    onClick={(e) => { 
                        if(e.target === e.currentTarget) {
                            setShowDeleteResponseAlert(false);
                            setResponseIdToDelete(null);
                        }
                    }}
                >
                    <div className={`${theme.card} rounded-xl shadow-2xl p-6 max-w-xs w-full animate-in zoom-in-95 border ${theme.border}`}>
                        <h3 className={`font-bold text-lg mb-2 ${theme.text}`}>刪除回應</h3>
                        <p className={`text-sm ${theme.subtext} mb-6 leading-relaxed`}>
                            確定要永久刪除這則回應嗎？<br/>此動作無法復原。
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setShowDeleteResponseAlert(false);
                                    setResponseIdToDelete(null);
                                }}
                                className="flex-1 px-4 py-2 bg-stone-100 text-stone-600 hover:bg-stone-200 rounded-lg font-bold transition-colors text-xs"
                            >
                                取消
                            </button>
                            <button 
                                onClick={executeDeleteResponse}
                                className="flex-1 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg font-bold transition-colors text-xs shadow-md"
                            >
                                刪除
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* [新增] 筆記刪除確認浮動視窗 (Z-Index 設為 80 確保最上層) */}
            {showDeleteNoteAlert && (
                <div 
                    className="fixed inset-0 z-[80] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" 
                    onClick={(e) => { 
                        if(e.target === e.currentTarget) {
                            setShowDeleteNoteAlert(false);
                            setNoteIdToDelete(null);
                        }
                    }}
                >
                    <div className={`${theme.card} rounded-xl shadow-2xl p-6 max-w-xs w-full animate-in zoom-in-95 border ${theme.border}`}>
                        <h3 className={`font-bold text-lg mb-2 ${theme.text}`}>刪除筆記</h3>
                        <p className={`text-sm ${theme.subtext} mb-6 leading-relaxed`}>
                            確定要刪除這則筆記嗎？<br/>它將被移至垃圾桶保留 30 天。
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setShowDeleteNoteAlert(false);
                                    setNoteIdToDelete(null);
                                }}
                                className="flex-1 px-4 py-2 bg-stone-100 text-stone-600 hover:bg-stone-200 rounded-lg font-bold transition-colors text-xs"
                            >
                                取消
                            </button>
                            <button 
                                onClick={executeDeleteNote}
                                className="flex-1 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg font-bold transition-colors text-xs shadow-md"
                            >
                                刪除
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* [新增] 分類刪除確認浮動視窗 (Z-Index 設為 90) */}
            {showDeleteCategoryAlert && categoryToDelete && (
                <div 
                    className="fixed inset-0 z-[90] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" 
                    onClick={(e) => { 
                        if(e.target === e.currentTarget) {
                            setShowDeleteCategoryAlert(false);
                            setCategoryToDelete(null);
                        }
                    }}
                >
                    <div className={`${theme.card} rounded-xl shadow-2xl p-6 max-w-xs w-full animate-in zoom-in-95 border ${theme.border}`}>
                        <h3 className={`font-bold text-lg mb-2 ${theme.text}`}>
                            刪除{categoryToDelete.type === 'superCategory' ? '總分類' : categoryToDelete.type === 'category' ? '大分類' : '次分類'}
                        </h3>
                        <p className={`text-sm ${theme.subtext} mb-6 leading-relaxed`}>
                            確定要刪除「{categoryToDelete.name}」嗎？<br/>
                            這將會同時刪除其下的 {categoryToDelete.count} 則筆記。
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setShowDeleteCategoryAlert(false);
                                    setCategoryToDelete(null);
                                }}
                                className="flex-1 px-4 py-2 bg-stone-100 text-stone-600 hover:bg-stone-200 rounded-lg font-bold transition-colors text-xs"
                            >
                                取消
                            </button>
                            <button 
                                onClick={executeDeleteCategory}
                                className="flex-1 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg font-bold transition-colors text-xs shadow-md"
                            >
                                刪除
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* [新增] 退出應用程式確認視窗 (Z-Index 設為 100 確保最高) */}
            {showExitAlert && (
                <div 
                    className="fixed inset-0 z-[100] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" 
                    onClick={(e) => { 
                        if(e.target === e.currentTarget) setShowExitAlert(false);
                    }}
                >
                    <div className={`${theme.card} rounded-xl shadow-2xl p-6 max-w-xs w-full animate-in zoom-in-95 border ${theme.border}`}>
                        <h3 className={`font-bold text-lg mb-2 ${theme.text}`}>離開 EchoScript</h3>
                        <p className={`text-sm ${theme.subtext} mb-6 leading-relaxed`}>
                            確定要退出應用程式嗎？
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowExitAlert(false)}
                                className="flex-1 px-4 py-2 bg-stone-100 text-stone-600 hover:bg-stone-200 rounded-lg font-bold transition-colors text-xs"
                            >
                                取消
                            </button>
                            <button 
                                onClick={() => {
                                    isExitingRef.current = true;
                                    // [修正] 改回標準 -2 (Trap -> Home -> Exit)
                                    window.history.go(-2);
                                }}
                                className="flex-1 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg font-bold transition-colors text-xs shadow-md"
                            >
                                確定
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* [新增] 抽卡目標選擇選單 */}
            {showShuffleMenu && (
                <div className="fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={(e) => { if(e.target === e.currentTarget) setShowShuffleMenu(false); }}>
                    <div className={`${theme.card} rounded-xl shadow-2xl border ${theme.border} w-full max-w-xs overflow-hidden flex flex-col animate-in zoom-in-95`}>
                        <div className={`p-4 border-b ${theme.border} flex justify-between items-center`}>
                            <h3 className={`font-bold ${theme.text} flex items-center gap-2`}>
                                <Shuffle className="w-5 h-5" /> 設定抽卡目標
                            </h3>
                            {shuffleTarget && (
                                <button onClick={handleClearShuffleTarget} className="text-xs text-red-500 font-bold hover:underline">
                                    取消鎖定
                                </button>
                            )}
                        </div>
                        <div className="p-2 overflow-y-auto max-h-[60vh] custom-scrollbar">
                            {Object.keys(superCategoryMap).map(sup => (
                                <button 
                                    key={sup} 
                                    onClick={() => handleSetShuffleTarget(sup)}
                                    className={`w-full text-left px-4 py-3 rounded-lg font-bold text-sm mb-1 transition-colors flex justify-between items-center ${
                                        shuffleTarget === sup 
                                        ? `${theme.accent} ${theme.accentText}` 
                                        : `hover:bg-stone-100 ${theme.text}`
                                    }`}
                                >
                                    {sup}
                                    {shuffleTarget === sup && <IconBase d="M20 6 9 17l-5-5" className="w-4 h-4"/>}
                                </button>
                            ))}
                        </div>
                        <div className={`p-2 border-t ${theme.border}`}>
                            <button onClick={() => setShowShuffleMenu(false)} className="w-full py-2 text-stone-400 font-bold text-xs hover:text-stone-600">
                                關閉
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* [新增] 圖片放大檢視器 */}
            {zoomedImage && (
                <div 
                    className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setZoomedImage(null)}
                >
                    <img 
                        src={zoomedImage} 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    />
                    <button className="absolute top-4 right-4 text-white/50 hover:text-white p-2">
                        <X className="w-8 h-8" />
                    </button>
                </div>
            )}

            {notification && (
                // [修正] 顏色改為 theme.accent 與 theme.accentText，隨主題變色 (與「我的資料庫」按鈕一致)
                <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 ${theme.accent} ${theme.accentText} text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-2 z-50`}>
                    {notification}
                </div>
            )}
        </div>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<ErrorBoundary><EchoScriptApp /></ErrorBoundary>);
























































































































































































































































































































































