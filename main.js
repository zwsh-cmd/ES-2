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
        id: 'dark', name: '深邃夜空', hex: '#020617', // bg-slate-950
        bg: 'bg-slate-950', text: 'text-slate-200', 
        card: 'bg-slate-900', border: 'border-slate-800', 
        accent: 'bg-sky-600', accentText: 'text-white',
        subtext: 'text-slate-500', activeTab: 'bg-sky-600 text-white'
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
const Type = (props) => <IconBase d={["M4 7V4h16v3", "M9 20h6", "M12 4v16"]} {...props} />;
const Quote = (props) => <IconBase d={["M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z", "M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"]} {...props} />;
const Italic = (props) => <IconBase d={["M19 4h-9", "M14 20H5", "M15 4L9 20"]} {...props} />;
const Underline = (props) => <IconBase d={["M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3", "M4 21h16"]} {...props} />;
const Calendar = (props) => <IconBase d={["M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z", "M16 2v4", "M8 2v4", "M3 10h18"]} {...props} />;
const GripVertical = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>;
const Pin = (props) => <IconBase d={["M2 12h10", "M9 4v16", "M3 7l3 3", "M3 17l3-3", "M12 2l3 3", "M12 22l3-3"]} d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" {...props} d={["M12 17v5", "M9 2h6v2l-1 1v8l4 4H6l4-4V5l-1-1V2z"]} />; // 使用 Pushpin 樣式
const MoveRight = (props) => <IconBase d={["M13 5l7 7-7 7", "M5 12h14"]} {...props} />;


// === 2. 初始筆記資料庫 (確保有完整分類) ===
const INITIAL_NOTES = [
    { id: 1, superCategory: "敘事技巧", category: "故事結構", subcategory: "三幕劇", title: "第一幕：鋪陳", content: "在第一幕中，必須建立主角的現狀（Normal World），並引入『引發事件』（Inciting Incident），這通常發生在故事的前10-15%。這個事件打破了主角的平衡，迫使他們做出選擇。" },
    { id: 2, superCategory: "敘事技巧", category: "人物塑造", subcategory: "角色弧光", title: "內在需求 vs 外在慾望", content: "一個立體的角色通常擁有一個明確的『外在慾望』（Want），例如贏得比賽或復仇；但他們同時有一個隱藏的『內在需求』（Need），通常是他們自己沒意識到的性格缺陷。故事的終點，往往是角色犧牲了慾望，滿足了需求。" },
    { id: 3, superCategory: "敘事技巧", category: "對白技巧", subcategory: "潛台詞", title: "不要說出心裡話", content: "優秀的對白是『言不由衷』的。角色很少直接說出他們真正的感受。如果一對情侶在吵架，他們爭論的可能是誰沒洗碗，但潛台詞其實是『我覺得你不夠重視這個家』。" },
    { id: 4, superCategory: "敘事技巧", category: "場景設計", subcategory: "進出原則", title: "晚進早出", content: "盡可能晚地進入場景（Late In），在衝突發生前的一刻切入；並盡可能早地離開場景（Early Out），在懸念或衝突最高點結束，不要拖泥帶水地交代結尾。" },
    { id: 5, superCategory: "敘事技巧", category: "故事結構", subcategory: "救貓咪", title: "定場畫面", content: "故事的第一個畫面應該暗示整部電影的主題、氛圍和風格。它是一個視覺隱喻，告訴觀眾這是一個什麼樣的故事。" },
    { id: 6, superCategory: "敘事技巧", category: "人物塑造", subcategory: "反派", title: "反派是自己故事裡的英雄", content: "不要把反派寫成只會作惡的壞人。在反派的眼裡，他們所做的一切都是合理、必要，甚至是正義的。給他們一個強大的動機，主角的對抗才會有力。" },
    { id: 7, superCategory: "敘事技巧", category: "情節推動", subcategory: "轉折點", title: "無路可退", content: "第一幕結束進入第二幕的轉折點（Plot Point 1），主角必須主動做出決定跨越門檻。這個決定必須是不可逆的，他們不能再回頭過原本的生活。" },
    { id: 8, superCategory: "智慧", category: "寫作心法", subcategory: "初稿", title: "容許垃圾", content: "海明威說：『初稿都是狗屎。』寫作的重點是『寫完』，而不是寫好。不要邊寫邊修，先把故事從頭到尾寫出來，讓它存在，然後再像雕刻一樣慢慢修正。" },
    { id: 9, superCategory: "敘事技巧", category: "對白技巧", subcategory: "展現而非告知", title: "Show, Don't Tell", content: "與其讓角色說『我很生氣』，不如讓他用力摔門，或是手顫抖著點不著煙。用動作和視覺細節來傳達情緒，永遠比對白更有力。" },
    { id: 10, superCategory: "敘事技巧", category: "故事結構", subcategory: "英雄旅程", title: "拒絕召喚", content: "當冒險的召喚來臨時，英雄通常會先拒絕。這展現了他們對未知的恐懼，也讓他們隨後的接受變得更加勇敢且有意義。" },
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
const MarkdownRenderer = ({ content }) => {
    const parseInline = (text) => {
        // 新增支援 *斜體* 與 <u>底線</u>
        const parts = text.split(/(\*\*.*?\*\*|~~.*?~~|\*.*?\*|<u>.*?<\/u>)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="text-stone-900 font-extrabold">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('~~') && part.endsWith('~~')) {
                return <del key={index} className="text-stone-400">{part.slice(2, -2)}</del>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={index} className="italic text-stone-600">{part.slice(1, -1)}</em>;
            }
            if (part.startsWith('<u>') && part.endsWith('</u>')) {
                return <u key={index} className="underline decoration-stone-400 underline-offset-4">{part.slice(3, -4)}</u>;
            }
            return part;
        });
    };

    return (
        <div className="text-base leading-loose text-stone-700 font-sans text-justify whitespace-pre-wrap">
            {content.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold mt-5 mb-3 text-stone-900">{parseInline(line.slice(2))}</h1>;
                if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold mt-4 mb-2 text-stone-600">{parseInline(line.slice(3))}</h2>;
                if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-stone-300 pl-4 italic text-stone-500 my-2">{parseInline(line.slice(2))}</blockquote>;
                // [新增] 處理清單符號：將 "- " 轉換為縮排 + 圓點
                if (line.startsWith('- ')) {
                    return (
                        <div key={i} className="flex items-start gap-2 ml-4 mb-1">
                            <span className="text-stone-400 font-bold mt-[0.4em] text-[0.6em]">•</span>
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
                className += "text-gray-800"; // 一般文字顏色
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
            <textarea
                ref={textareaRef}
                className="absolute inset-0 w-full h-full p-3 bg-transparent text-transparent caret-stone-800 resize-none outline-none whitespace-pre-wrap break-words overflow-y-auto"
                style={{ fontFamily: 'inherit', lineHeight: '1.6', fontSize: '1rem' }}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onScroll={syncScroll}
                placeholder="在此輸入內容... 支援 Markdown"
                spellCheck="false" 
            />
        </div>
    );
};

// === 4. Markdown 編輯器組件 (整合高亮編輯器) ===
// 修改：加入 setHasUnsavedChanges 參數，並監聽內容變更
const MarkdownEditorModal = ({ note, existingNotes = [], isNew = false, onClose, onSave, onDelete, setHasUnsavedChanges, theme }) => {
    const [formData, setFormData] = useState({
        superCategory: note?.superCategory || "其他", // [新增] 總分類 (預設為其他)
        category: note?.category || "",
        subcategory: note?.subcategory || "",
        title: note?.title || "",
        content: note?.content || ""
    });

    const [activeTab, setActiveTab] = useState('write'); 

    // 新增：監聽內容變更，同步狀態給主程式 (給手機返回鍵使用)
    useEffect(() => {
        const initialSuper = note?.superCategory || "其他";
        const initialCategory = note?.category || "";
        const initialSubcategory = note?.subcategory || "";
        const initialTitle = note?.title || "";
        const initialContent = note?.content || "";

        const hasChanges = 
            formData.superCategory !== initialSuper ||
            formData.category !== initialCategory ||
            formData.subcategory !== initialSubcategory ||
            formData.title !== initialTitle ||
            formData.content !== initialContent;
            
        // 如果 setHasUnsavedChanges 存在才執行 (防止報錯)
        if (setHasUnsavedChanges) setHasUnsavedChanges(hasChanges);

        // 卸載時重置狀態
        return () => { if (setHasUnsavedChanges) setHasUnsavedChanges(false); };
    }, [formData, note, setHasUnsavedChanges]);

    // [新增] 總分類列表 (從現有筆記中提取，並加入預設值)
    const existingSuperCategories = useMemo(() => {
        const defaults = ["敘事技巧", "智慧", "其他"];
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
        
        // [修正] 移除舊版「流水號 ID」生成邏輯 (maxId + 1)
        // 改為傳遞 null/undefined，讓主程式的 handleSaveNote 自動使用 Date.now() 生成時間戳 ID
        // 這能避免在多裝置同時新增筆記時發生 ID 衝突 (例如兩台裝置都搶著用 ID: 11)
        let finalId = note?.id;

        onSave({ ...note, ...formData, id: finalId });
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
            if (confirm("編輯內容還未存檔，是否離開？")) {
                onClose();
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

                        <input 
                            placeholder="主旨語 (必填，如：先讓英雄救貓咪)"
                            className={`${theme.card} border ${theme.border} rounded-lg p-3 font-bold ${theme.text} focus:outline-none focus:ring-2 focus:ring-stone-400`}
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    {/* 中間區塊：工具列 (固定不捲動) */}
                    <div className={`px-4 py-2 shrink-0 border-b ${theme.border} flex justify-between items-center ${theme.card}`}>
                        <div className="flex gap-1 overflow-x-auto no-scrollbar">
                            <button onClick={() => insertMarkdown('normal')} className="p-2 hover:bg-stone-100 rounded text-stone-600 flex items-center gap-1 text-xs font-bold min-w-fit" title="內文"><Type className="w-4 h-4"/> 內文</button>
                            <button onClick={() => insertMarkdown('h1')} className="p-2 hover:bg-stone-100 rounded text-stone-600 flex items-center gap-1 text-xs font-bold min-w-fit" title="大標"><Heading1 className="w-5 h-5"/> 大標</button>
                            <button onClick={() => insertMarkdown('h2')} className="p-2 hover:bg-stone-100 rounded text-stone-600 flex items-center gap-1 text-xs font-bold min-w-fit" title="小標"><Heading2 className="w-5 h-5"/> 小標</button>
                            <button onClick={() => insertMarkdown('bold')} className="p-2 hover:bg-stone-100 rounded text-stone-600 flex items-center gap-1 text-xs font-bold min-w-fit" title="粗體"><Bold className="w-4 h-4"/> 粗體</button>
                            <button onClick={() => insertMarkdown('italic')} className="p-2 hover:bg-stone-100 rounded text-stone-600 flex items-center gap-1 text-xs font-bold min-w-fit" title="斜體"><Italic className="w-4 h-4"/> 斜體</button>
                            <button onClick={() => insertMarkdown('underline')} className="p-2 hover:bg-stone-100 rounded text-stone-600 flex items-center gap-1 text-xs font-bold min-w-fit" title="底線"><Underline className="w-4 h-4"/> 底線</button>
                            <button onClick={() => insertMarkdown('quote')} className="p-2 hover:bg-stone-100 rounded text-stone-600 flex items-center gap-1 text-xs font-bold min-w-fit" title="引用"><Quote className="w-4 h-4"/> 引用</button>
                            <button onClick={() => insertMarkdown('list')} className="p-2 hover:bg-stone-100 rounded text-stone-600 flex items-center gap-1 text-xs font-bold min-w-fit" title="項目"><List className="w-4 h-4"/> 項目</button>
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
            if (confirm("編輯內容還未存檔，是否離開？")) {
                action();
            }
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
        </div>
    );
};

// === 6. 所有筆記列表 Modal (支援分類顯示) ===
// [修正] 接收來自父層的 selected 狀態，取代內部的 useState
const AllNotesModal = ({ 
    notes, setNotes, onClose, onItemClick, onDelete, 
    viewLevel, setViewLevel, 
    selectedSuper, setSelectedSuper,       // [新增] 接收狀態
    selectedCategory, setSelectedCategory, // [新增] 接收狀態
    selectedSubcategory, setSelectedSubcategory, // [新增] 接收狀態
    categoryMap, setCategoryMap, superCategoryMap, setSuperCategoryMap, 
    setHasDataChangedInSession, theme 
}) => {
    // 移除內部的 selected 狀態，改用 props 傳進來的
    const [searchTerm, setSearchTerm] = useState("");
    
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);
    
    const [contextMenu, setContextMenu] = useState(null);
    const [moveConfig, setMoveConfig] = useState(null);

    const viewLevelToType = {
        'superCategories': 'superCategory',
        'categories': 'category',
        'subcategories': 'subcategory',
        'notes': 'note'
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
            // 筆記排序邏輯 (暫略，筆記通常依時間排序)
        } else {
            list.splice(dragItem.current, 1);
            list.splice(dragOverItem.current, 0, draggedContent);
            
            if (viewLevel === 'superCategories') {
                const newMap = {};
                list.forEach(key => { newMap[key] = superCategoryMap[key]; });
                setSuperCategoryMap(newMap);
                syncToCloud('layout', { superCategoryMapJSON: JSON.stringify(newMap) });
            } 
            else if (viewLevel === 'categories') {
                const newMap = { ...superCategoryMap };
                newMap[selectedSuper] = list;
                setSuperCategoryMap(newMap);
                syncToCloud('layout', { superCategoryMapJSON: JSON.stringify(newMap) });
            }
            else if (viewLevel === 'subcategories') {
                const newMap = { ...categoryMap };
                newMap[selectedCategory] = list;
                setCategoryMap(newMap);
                syncToCloud('layout', { categoryMapJSON: JSON.stringify(newMap) });
            }
        }
        resetDrag();
        if (setHasDataChangedInSession) setHasDataChangedInSession(true);
    };

    const resetDrag = () => { dragItem.current = null; dragOverItem.current = null; setDraggingIndex(null); setDragOverIndex(null); };
    const syncToCloud = (docName, data) => { if (window.fs && window.db) window.fs.setDoc(window.fs.doc(window.db, "settings", docName), data, { merge: true }); };

    const handleMove = () => {
        if (!contextMenu) return;
        const { type, item } = contextMenu;
        let targetList = [];
        if (type === 'category') targetList = Object.keys(superCategoryMap).filter(k => k !== selectedSuper);
        else if (type === 'subcategory') targetList = Object.keys(categoryMap).filter(k => k !== selectedCategory);
        else if (type === 'note') targetList = (categoryMap[selectedCategory] || []).filter(s => s !== selectedSubcategory);

        if (targetList.length === 0) { alert("沒有其他可移動的目標分類"); setContextMenu(null); return; }
        setMoveConfig({ type, item, targets: targetList });
        setContextMenu(null);
    };

    const executeMove = async (target) => {
        if (!moveConfig) return;
        const { type, item } = moveConfig;
        const updates = [];
        
        if (type === 'category') {
             const newSuper = target;
             const newSuperMap = { ...superCategoryMap };
             newSuperMap[selectedSuper] = newSuperMap[selectedSuper].filter(c => c !== item);
             if (!newSuperMap[newSuper]) newSuperMap[newSuper] = [];
             newSuperMap[newSuper].push(item);
             setSuperCategoryMap(newSuperMap);
             if (window.fs && window.db) updates.push(window.fs.setDoc(window.fs.doc(window.db, "settings", "layout"), { superCategoryMapJSON: JSON.stringify(newSuperMap) }, { merge: true }));
             const newNotes = notes.map(n => {
                if ((n.category || "未分類") === item) {
                     if (window.fs && window.db) updates.push(window.fs.setDoc(window.fs.doc(window.db, "notes", String(n.id)), { superCategory: newSuper }, { merge: true }));
                    return { ...n, superCategory: newSuper };
                }
                return n;
            });
            setNotes(newNotes);
        } else if (type === 'subcategory') {
             const newCat = target;
             
             // 1. 更新 CategoryMap (將次分類移到新大分類)
             const newCatMap = { ...categoryMap };
             newCatMap[selectedCategory] = newCatMap[selectedCategory].filter(s => s !== item);
             if (!newCatMap[newCat]) newCatMap[newCat] = [];
             newCatMap[newCat].push(item);
             setCategoryMap(newCatMap);

             // 2. [關鍵修正] 檢查目標大分類是否屬於某個總分類，若是孤兒則歸入「其他」
             let newSuper = null;
             let superMapChanged = false;
             const newSuperMap = { ...superCategoryMap };

             // 遍歷尋找該大分類屬於哪個總分類
             Object.entries(newSuperMap).forEach(([sKey, cats]) => { 
                 if (cats.includes(newCat)) newSuper = sKey; 
             });

             // 如果找不到歸屬 (孤兒分類)，強制歸入「其他」
             if (!newSuper) {
                 newSuper = "其他";
                 if (!newSuperMap["其他"]) newSuperMap["其他"] = [];
                 if (!newSuperMap["其他"].includes(newCat)) {
                     newSuperMap["其他"].push(newCat);
                     superMapChanged = true;
                 }
                 setSuperCategoryMap(newSuperMap);
                 console.log(`🔧 修復孤兒分類: 將「${newCat}」歸入「其他」`);
             }

             // 3. 準備雲端更新 (Layout)
             if (window.fs && window.db) {
                 const layoutUpdates = { categoryMapJSON: JSON.stringify(newCatMap) };
                 if (superMapChanged) {
                     layoutUpdates.superCategoryMapJSON = JSON.stringify(newSuperMap);
                 }
                 updates.push(window.fs.setDoc(window.fs.doc(window.db, "settings", "layout"), layoutUpdates, { merge: true }));
             }

             // 4. 更新相關筆記 (同步更新 category 與 superCategory)
             const newNotes = notes.map(n => {
                if ((n.category || "未分類") === selectedCategory && (n.subcategory || "一般") === item) {
                    const updateData = { category: newCat };
                    // 即使原本有 superCategory，也要強制更新為新大分類所屬的 superCategory
                    // 這樣才能確保筆記出現在正確的路徑下
                    if (newSuper) updateData.superCategory = newSuper;

                    if (window.fs && window.db) {
                        updates.push(window.fs.setDoc(window.fs.doc(window.db, "notes", String(n.id)), updateData, { merge: true }));
                    }
                    return { ...n, ...updateData };
                }
                return n;
            });
            setNotes(newNotes);
        } else if (type === 'note') {
             const newSub = target;
             const newNotes = notes.map(n => {
                if (n.id === item.id) {
                    if (window.fs && window.db) updates.push(window.fs.setDoc(window.fs.doc(window.db, "notes", String(n.id)), { subcategory: newSub }, { merge: true }));
                    return { ...n, subcategory: newSub };
                }
                return n;
            });
            setNotes(newNotes);
        }
        if (updates.length > 0) try { await Promise.all(updates); } catch(e) {}
        
        setMoveConfig(null);
        if (setHasDataChangedInSession) setHasDataChangedInSession(true);
    };

    const handleDelete = () => {
        if (!contextMenu) return;
        const { type, item } = contextMenu;
        if (type === 'note') { onDelete(item.id); setContextMenu(null); return; }
        
        if (confirm(`確定要刪除「${item}」嗎？`)) {
             if (type === 'superCategory') {
                const newMap = { ...superCategoryMap }; delete newMap[item]; setSuperCategoryMap(newMap);
                syncToCloud('layout', { superCategoryMapJSON: JSON.stringify(newMap) });
             } else if (type === 'category') {
                const newMap = { ...superCategoryMap }; newMap[selectedSuper] = newMap[selectedSuper].filter(i => i !== item); setSuperCategoryMap(newMap);
                syncToCloud('layout', { superCategoryMapJSON: JSON.stringify(newMap) });
             } else if (type === 'subcategory') {
                const newMap = { ...categoryMap }; newMap[selectedCategory] = newMap[selectedCategory].filter(i => i !== item); setCategoryMap(newMap);
                syncToCloud('layout', { categoryMapJSON: JSON.stringify(newMap) });
             }
             setContextMenu(null);
             if (setHasDataChangedInSession) setHasDataChangedInSession(true);
        }
    };
    
    // [修正] 實作完整的重新命名邏輯 (含重複檢查與連動更新)
    const handleRename = async () => {
        if (!contextMenu) return;
        const { type, item } = contextMenu;
        
        if (type === 'note') { 
            alert("筆記請直接點擊進入編輯模式修改。"); 
            setContextMenu(null); 
            return; 
        }

        const newName = prompt(`請輸入新的名稱`, item);
        if (!newName || newName === item) {
            setContextMenu(null);
            return;
        }

        // 1. 檢查名稱是否重複
        let isDuplicate = false;
        if (type === 'superCategory' && superCategoryMap[newName]) isDuplicate = true;
        else if (type === 'category' && categoryMap[newName]) isDuplicate = true;
        else if (type === 'subcategory') {
            const subs = categoryMap[selectedCategory] || [];
            if (subs.includes(newName)) isDuplicate = true;
        }

        if (isDuplicate) {
            alert("新名稱已存在，請使用其他名稱。");
            return;
        }

        // 2. 執行資料更新
        const updates = [];
        let updatedNotes = [...notes];

        if (type === 'superCategory') {
            // 更新 Map Key
            const newMap = { ...superCategoryMap };
            newMap[newName] = newMap[item];
            delete newMap[item];
            setSuperCategoryMap(newMap);
            if (window.fs && window.db) updates.push(window.fs.setDoc(window.fs.doc(window.db, "settings", "layout"), { superCategoryMapJSON: JSON.stringify(newMap) }, { merge: true }));

            // 更新筆記
            updatedNotes = notes.map(n => {
                if ((n.superCategory || "其他") === item) {
                    const newNote = { ...n, superCategory: newName };
                    if (window.fs && window.db) updates.push(window.fs.setDoc(window.fs.doc(window.db, "notes", String(n.id)), { superCategory: newName }, { merge: true }));
                    return newNote;
                }
                return n;
            });

        } else if (type === 'category') {
            // 更新 CategoryMap Key
            const newCatMap = { ...categoryMap };
            newCatMap[newName] = newCatMap[item];
            delete newCatMap[item];
            setCategoryMap(newCatMap);

            // 更新 SuperCategoryMap 中的參照
            const newSuperMap = { ...superCategoryMap };
            Object.keys(newSuperMap).forEach(k => {
                const idx = newSuperMap[k].indexOf(item);
                if (idx !== -1) newSuperMap[k][idx] = newName;
            });
            setSuperCategoryMap(newSuperMap);

            if (window.fs && window.db) {
                updates.push(window.fs.setDoc(window.fs.doc(window.db, "settings", "layout"), { 
                    categoryMapJSON: JSON.stringify(newCatMap),
                    superCategoryMapJSON: JSON.stringify(newSuperMap)
                }, { merge: true }));
            }

            // 更新筆記
            updatedNotes = notes.map(n => {
                if ((n.category || "未分類") === item) {
                    const newNote = { ...n, category: newName };
                    if (window.fs && window.db) updates.push(window.fs.setDoc(window.fs.doc(window.db, "notes", String(n.id)), { category: newName }, { merge: true }));
                    return newNote;
                }
                return n;
            });

        } else if (type === 'subcategory') {
            // 更新 CategoryMap 中的值
            const newCatMap = { ...categoryMap };
            const subs = newCatMap[selectedCategory] || [];
            const idx = subs.indexOf(item);
            if (idx !== -1) {
                subs[idx] = newName;
                newCatMap[selectedCategory] = subs;
            }
            setCategoryMap(newCatMap);
            if (window.fs && window.db) updates.push(window.fs.setDoc(window.fs.doc(window.db, "settings", "layout"), { categoryMapJSON: JSON.stringify(newCatMap) }, { merge: true }));

            // 更新筆記
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
        setContextMenu(null);
        if (setHasDataChangedInSession) setHasDataChangedInSession(true);

        if (updates.length > 0) {
            try { await Promise.all(updates); console.log("✅ 重新命名同步完成"); } catch(e) { console.error(e); }
        }
    };

    const handleBack = () => {
        window.history.back();
    };

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
                <div className="flex items-center gap-2">
                    {(!searchTerm) ? (
                        <button 
                            onClick={viewLevel === 'superCategories' ? onClose : handleBack} 
                            className="p-1 -ml-2 text-stone-500 hover:bg-stone-100 rounded-full mr-1"
                        >
                            {viewLevel === 'superCategories' ? <X className="w-5 h-5" /> : <IconBase d="M15 18l-6-6 6-6" />}
                        </button>
                    ) : (
                        <button onClick={() => setSearchTerm("")} className="p-1 -ml-2 text-stone-500 hover:bg-stone-100 rounded-full mr-1"><IconBase d="M15 18l-6-6 6-6" /></button>
                    )}
                    {/* [修正] 標題顯示格式：改為路徑顯示 (Breadcrumbs) 並移除強調色 */}
                    <h2 className={`font-bold text-lg flex items-center gap-2 ${theme.text} overflow-hidden text-ellipsis whitespace-nowrap`}>
                        {searchTerm ? "搜尋結果" : 
                         viewLevel === 'superCategories' ? "總分類" : 
                         viewLevel === 'categories' ? selectedSuper : 
                         viewLevel === 'subcategories' ? `${selectedSuper} > ${selectedCategory}` : 
                         `${selectedSuper} > ${selectedCategory} > ${selectedSubcategory}`}
                    </h2>
                </div>
            </div>

            <div className={`p-4 ${theme.bg} sticky top-[69px] z-10`}>
                <input type="text" placeholder="搜尋筆記..." className={`w-full ${theme.card} border ${theme.border} rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 ${theme.text}`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-20">
                {searchTerm ? (
                    notes.filter(n => n.title.includes(searchTerm) || n.content.includes(searchTerm)).map(item => (
                        <div key={item.id} className={`${theme.card} p-4 rounded-xl shadow-sm border ${theme.border} mb-3`} onClick={() => onItemClick(item)}>
                            <div className="text-xs text-stone-400 mb-1">{item.superCategory} / {item.category}</div>
                            <h4 className={`font-bold ${theme.text}`}>{item.title}</h4>
                        </div>
                    ))
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
                                 className={`
                                    ${isDragging ? 'bg-stone-100 border-stone-400 scale-[1.02] z-20' : 
                                      // [修正] 筆記項目使用不同樣式：使用 theme.bg (較平坦) 並加上左側強調邊框
                                      `${isNote ? theme.bg : theme.card} ${theme.border} ${isNote ? 'border-l-4' : ''}`
                                    } 
                                    ${isDragOver ? 'border-t-[3px] border-t-[#2c3e50] mt-2' : ''} 
                                    p-4 rounded-xl shadow-sm border mb-3 flex items-center cursor-pointer select-none transition-all
                                 `}>
                                <div className="flex-1">
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
                        <div className={`p-4 border-b ${theme.border} font-bold text-center ${theme.text}`}>移動「{moveConfig.item.title || moveConfig.item}」至...</div>
                        <div className="overflow-y-auto p-2 custom-scrollbar">
                            {moveConfig.targets.map(target => (
                                <button key={target} onClick={() => executeMove(target)} className={`w-full text-left px-4 py-3 rounded-lg hover:bg-stone-100 ${theme.text} font-bold text-sm mb-1 transition-colors`}>{target}</button>
                            ))}
                        </div>
                        <div className={`p-2 border-t ${theme.border}`}><button onClick={() => setMoveConfig(null)} className="w-full py-2 text-stone-400 font-bold text-xs hover:text-stone-600">取消</button></div>
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


// === 主程式 ===
// === 主程式 ===
function EchoScriptApp() {
    const [notes, setNotes] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    // [關鍵修正] 記錄開啟列表前的卡片索引，用於退出列表時還原
    const preModalIndexRef = useRef(0);
    const [isAnimating, setIsAnimating] = useState(false);
    
    const [favorites, setFavorites] = useState([]);
    const [allResponses, setAllResponses] = useState({}); 
    
    const [history, setHistory] = useState([]);
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false); // [新增] 標記歷史紀錄是否已從雲端同步
    
    // [新增] 垃圾桶狀態
    const [trash, setTrash] = useState([]);

    // [新增] 監聽/載入雲端垃圾桶 (settings/trash) 並執行 30 天自動清理
    useEffect(() => {
        if (!window.fs || !window.db) return;
        const unsubscribe = window.fs.onSnapshot(
            window.fs.doc(window.db, "settings", "trash"),
            (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    if (data.trashJSON) {
                        let cloudTrash = JSON.parse(data.trashJSON);
                        
                        // [自動清理] 過濾掉超過 30 天的筆記
                        const now = Date.now();
                        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
                        const validTrash = cloudTrash.filter(item => {
                            const deletedTime = new Date(item.deletedAt || 0).getTime();
                            return (now - deletedTime) < thirtyDaysMs;
                        });

                        setTrash(validTrash);
                        
                        // 如果有過期被清掉的，順便更新回雲端 (延遲執行避免頻繁寫入)
                        if (validTrash.length !== cloudTrash.length) {
                             window.fs.setDoc(
                                window.fs.doc(window.db, "settings", "trash"), 
                                { trashJSON: JSON.stringify(validTrash) }, 
                                { merge: true }
                            ).catch(e => console.error("垃圾桶自動清理同步失敗", e));
                        }
                    }
                }
            }
        );
        return () => unsubscribe();
    }, []);
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
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [activeTab, setActiveTab] = useState('favorites');
    const [notification, setNotification] = useState(null);
    
    // [新增] 分類結構地圖 { "大分類": ["次分類1", "次分類2"] }
    const [categoryMap, setCategoryMap] = useState({});
    // [新增] 總分類結構地圖 { "總分類": ["大分類1", "大分類2"] }
    const [superCategoryMap, setSuperCategoryMap] = useState({
        "敘事技巧": [], "智慧": [], "其他": [] // 預設值
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

    // [新增] 初始化與監聽雲端主題設定 (settings/preferences)
    useEffect(() => {
        // 1. 先讀取本地快取，避免閃爍
        const localTheme = localStorage.getItem('echoScript_Theme');
        if (localTheme && THEMES[localTheme]) setCurrentThemeId(localTheme);
        
        const localPinnedId = localStorage.getItem('echoScript_PinnedId');
        if (localPinnedId) setPinnedNoteId(localPinnedId);

        // 2. 監聽雲端
        if (!window.fs || !window.db) return;
        const unsubscribe = window.fs.onSnapshot(
            window.fs.doc(window.db, "settings", "preferences"),
            (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    // 同步主題
                    if (data.themeId && THEMES[data.themeId]) {
                        setCurrentThemeId(data.themeId);
                        localStorage.setItem('echoScript_Theme', data.themeId);
                    }
                    // 同步釘選筆記
                    if (data.pinnedNoteId !== undefined) { // 允許 null (取消釘選)
                        setPinnedNoteId(data.pinnedNoteId);
                        if (data.pinnedNoteId) localStorage.setItem('echoScript_PinnedId', data.pinnedNoteId);
                        else localStorage.removeItem('echoScript_PinnedId');
                    }
                    
                    // [新增] 同步「最後編輯/查看」的筆記 ID (Resume ID)
                    if (data.resumeNoteId !== undefined) {
                        if (data.resumeNoteId) localStorage.setItem('echoScript_ResumeNoteId', data.resumeNoteId);
                        else localStorage.removeItem('echoScript_ResumeNoteId');
                    }
                }
            }
        );
        return () => unsubscribe();
    }, []);

    // [新增] 監聽雲端編輯歷史 (settings/history)
    useEffect(() => {
        if (!window.fs || !window.db) return;
        const unsubscribe = window.fs.onSnapshot(
            window.fs.doc(window.db, "settings", "history"),
            (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    if (data.historyJSON) {
                        console.log("📥 同步雲端歷史紀錄");
                        const rawHistory = JSON.parse(data.historyJSON);
                        
                        // [關鍵修正] 在讀取時立刻清洗重複資料 (Load-time Deduplication)
                        // 這樣即使雲端存有以前留下的重複髒資料，讀進來時也會被強制修復
                        const uniqueHistory = [];
                        const seenIds = new Set();
                        
                        if (Array.isArray(rawHistory)) {
                            for (const item of rawHistory) {
                                if (item && item.id !== undefined && item.id !== null) {
                                    const idStr = String(item.id);
                                    // 確保 ID 唯一，若重複則只保留排在前面的(通常是最新的)
                                    if (!seenIds.has(idStr)) {
                                        seenIds.add(idStr);
                                        uniqueHistory.push(item);
                                    }
                                }
                            }
                        }

                        setHistory(uniqueHistory);
                        // 更新本地快取為乾淨版本
                        localStorage.setItem('echoScript_History', JSON.stringify(uniqueHistory));
                    }
                }
                setIsHistoryLoaded(true); // 標記載入完成，允許後續寫入
            }
        );
        return () => unsubscribe();
    }, []);

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
        localStorage.setItem('echoScript_Theme', id);
        
        if (window.fs && window.db) {
            window.fs.setDoc(
                window.fs.doc(window.db, "settings", "preferences"), 
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
            if (window.fs && window.db && isSettingsLoaded) {
                console.log("☁️ 同步寫入雲端 settings/layout");
                window.fs.setDoc(
                    window.fs.doc(window.db, "settings", "layout"), 
                    { 
                        categoryMapJSON: JSON.stringify(newCatMap),
                        superCategoryMapJSON: JSON.stringify(newSuperMap)
                    }, 
                    { merge: true }
                ).catch(e => console.error("自動同步分類失敗", e));
            }
        }
    }, [notes, categoryMap, superCategoryMap, isSettingsLoaded]);

    // [存取] 持久化分類結構
    useEffect(() => {
        const savedMap = localStorage.getItem('echoScript_CategoryMap');
        if (savedMap) setCategoryMap(JSON.parse(savedMap));
    }, []);
    useEffect(() => { localStorage.setItem('echoScript_CategoryMap', JSON.stringify(categoryMap)); }, [categoryMap]);

    // [新增] 監聽雲端分類排序 (settings/layout)
    // [修正] 優先讀取 JSON 字串格式，確保順序正確，並設定 isSettingsLoaded 標記
    useEffect(() => {
        if (!window.fs || !window.db) return;
        const unsubscribe = window.fs.onSnapshot(
            window.fs.doc(window.db, "settings", "layout"), 
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
    }, []);

    // [新增] 儲存 AllNotesModal 的內部導航層級狀態，用於支援 PopState
    const [allNotesViewLevel, setAllNotesViewLevel] = useState('superCategories'); // superCategories -> categories -> subcategories -> notes
    
    // [關鍵修正] 將分類選擇狀態提升至主程式，確保從筆記返回列表時，這些狀態不會因為 Modal 關閉而遺失
    const [selectedSuper, setSelectedSuper] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);

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
    
    // [關鍵修正] 新增旗標：用來判斷 Modal 開啟是否源自於「返回鍵」(History Restore)
    // 如果是 True，則 useEffect 不應該再推入新的歷史紀錄
    const isRestoringHistoryRef = useRef(false);

    // [新增] 追蹤本次會話是否有資料變更 (用於離線備份提示)
    const [hasDataChangedInSession, setHasDataChangedInSession] = useState(false);
    const hasDataChangedInSessionRef = useRef(false);
    
    // [新增] 自定義「未存檔警告」視窗狀態 (取代不穩定的 native confirm)
    const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
    
    // 同步 Ref 與 State
    useEffect(() => { hasUnsavedChangesRef.current = hasUnsavedChanges; }, [hasUnsavedChanges]);
    useEffect(() => { hasDataChangedInSessionRef.current = hasDataChangedInSession; }, [hasDataChangedInSession]);
    useEffect(() => { responseViewModeRef.current = responseViewMode; }, [responseViewMode]);

    // === 原地滯留導航控制器 (Stay-On-Page Logic) ===

    // [新增] 當資料變更時，立刻推入歷史紀錄以攔截退出 (解決新增筆記後直接退出沒反應的問題)
    useEffect(() => {
        if (hasDataChangedInSession) {
            // 建立一個 "trap" 狀態，確保使用者按返回鍵時會觸發 popstate 事件，而不是直接關閉 App
            window.history.pushState({ page: 'home_trap', changed: true, time: Date.now() }, '', '');
        }
    }, [hasDataChangedInSession]);
    
    // 1. 僅在開啟視窗時推入歷史紀錄
    useEffect(() => {
        const isAnyModalOpen = showMenuModal || showAllNotesModal || showEditModal || showResponseModal;
        if (isAnyModalOpen) {
            // [關鍵修正] 如果這次開啟是因為使用者按了「返回鍵」(isRestoringHistoryRef 為 true)
            // 代表瀏覽器已經在正確的歷史位置上了，我們「不應該」再 pushState，否則會覆蓋掉原本的層級路徑
            if (isRestoringHistoryRef.current) {
                isRestoringHistoryRef.current = false; // 重置旗標
                return;
            }

            if (showAllNotesModal) {
                // 只有在「主動點擊按鈕開啟」時，才推入新的歷史紀錄 (預設從總分類開始)
                window.history.pushState({ page: 'modal', level: 'superCategories', time: Date.now() }, '', '');
            } else if (showMenuModal || showEditModal || showResponseModal) {
                window.history.pushState({ page: 'modal', time: Date.now() }, '', '');
            }
        }
    }, [showMenuModal, showAllNotesModal, showEditModal, showResponseModal]);

    // 2. 攔截返回鍵 (核心：真實歷史堆疊 + 狀態同步)
    useEffect(() => {
        const handlePopState = (event) => {
            // 如果已經確認要退出，就不再攔截任何返回動作
            if (isExitingRef.current) return;

            // === A. 編輯中未存檔 (優先攔截) ===
            if (hasUnsavedChangesRef.current) {
                // 把歷史紀錄「塞回去」，防止瀏覽器真的退回上一頁
                window.history.pushState({ page: 'modal_trap', id: Math.random() }, '', '');
                setShowUnsavedAlert(true);
                return;
            }

            // === B. 視窗內導航 (編輯回應 -> 列表) ===
            if (showResponseModal && responseViewModeRef.current === 'edit') {
                setResponseViewMode('list');
                // 補回一個歷史狀態，保持在 Modal 內
                setTimeout(() => window.history.pushState({ page: 'modal', time: Date.now() }, '', ''), 0);
                return;
            }

            // === C. AllNotesModal 歷史同步與返回邏輯 ===
            const state = event.state || {};

            // 情況 1: 歷史紀錄指示我們應該在「列表模式」
            if (state.page === 'modal') {
                // 如果列表視窗目前是關閉的 (例如剛從閱讀畫面返回)，我們需要重新打開它
                if (!showAllNotesModal) {
                    // [關鍵] 標記這是「還原操作」，通知 useEffect 不要亂推歷史紀錄
                    isRestoringHistoryRef.current = true;
                    setShowAllNotesModal(true);
                }
                
                // 根據歷史紀錄恢復到正確的層級 (筆記 > 次分類 > 大分類...)
                if (state.level) {
                    setAllNotesViewLevel(state.level);
                }
                return;
            }

            // 情況 2: 歷史紀錄已離開列表 (例如退到了 Home)，但視窗還開著 -> 執行關閉
            if (showAllNotesModal && state.page !== 'modal') {
                setShowAllNotesModal(false);
                setAllNotesViewLevel('superCategories');
                
                // [關鍵修正] 退出列表時，還原到開啟前的卡片 (首頁/釘選/隨機)
                // 這樣使用者就不會因為在列表中點過其他筆記，而回不到原本的地方
                if (preModalIndexRef.current !== null && preModalIndexRef.current !== -1) {
                    setCurrentIndex(preModalIndexRef.current);
                }

                if (hasDataChangedInSessionRef.current) {
                    window.history.pushState({ page: 'home_trap', changed: true, time: Date.now() }, '', '');
                }
                return;
            }

            // === D. 正常關閉其他視窗 ===
            const isAnyOtherModalOpen = showMenuModal || showEditModal || showResponseModal;
            if (isAnyOtherModalOpen) {
                setShowMenuModal(false);
                setShowEditModal(false);
                setShowResponseModal(false);
                setResponseViewMode('list');
                
                if (hasDataChangedInSessionRef.current) {
                    window.history.pushState({ page: 'home_trap', changed: true, time: Date.now() }, '', '');
                }
                return;
            }

            // === E. 首頁退出檢查 ===
            if (hasDataChangedInSessionRef.current) {
                window.history.pushState({ page: 'home_trap', time: Date.now() }, '', '');
                if (confirm("您本次使用已更動過資料，離開前是否前往備份？")) {
                    setShowMenuModal(true);
                    setActiveTab('settings');
                    setHasDataChangedInSession(false); 
                }
                return;
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [showMenuModal, showAllNotesModal, showEditModal, showResponseModal]);
    
    // === 雲端版資料監聽 (取代原本的 LocalStorage 初始化) ===
    useEffect(() => {
        // 確保 window.fs 工具箱存在 (防止報錯)
        if (!window.fs || !window.db) {
            console.error("Firebase 未初始化，請檢查 index.html");
            return;
        }

        const { collection, onSnapshot, query, orderBy, setDoc, doc } = window.fs;
        const db = window.db;

        // 1. 建立監聽器：按建立時間倒序排列 (讓新筆記排前面)
        // 這裡我們用 createdDate 排序，你也可以改用 modifiedDate
        const q = query(collection(db, "notes"), orderBy("createdDate", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const cloudNotes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            // 2. [首次初始化] 如果雲端完全沒資料，自動上傳預設筆記
            if (cloudNotes.length === 0 && !localStorage.getItem('echoScript_CloudInitDone')) {
                console.log("☁️ 雲端無資料，正在初始化預設筆記...");
                INITIAL_NOTES.forEach(note => {
                    // 使用 setDoc 確保 ID 一致
                    const noteId = String(note.id);
                    setDoc(doc(db, "notes", noteId), {
                        ...note,
                        id: noteId, // 確保 ID 寫入欄位
                        createdDate: new Date().toISOString(),
                        modifiedDate: new Date().toISOString()
                    }).catch(e => console.error("上傳失敗", e));
                });
                localStorage.setItem('echoScript_CloudInitDone', 'true');
                return; // 等待下一次 snapshot 更新
            }

            // 3. 更新 React 狀態
            setNotes(cloudNotes);

            // [新增] 同步雲端回應 (解決回應消失問題)
            // 從下載的筆記資料中，把 responses 欄位抓出來，更新到 allResponses 狀態
            const cloudResponses = {};
            cloudNotes.forEach(note => {
                if (note.responses && Array.isArray(note.responses)) {
                    // [修正] 確保載入時也依時間正序排序 (舊 -> 新)，修正既有資料順序不一的問題
                    cloudResponses[note.id] = note.responses.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                }
            });
            // 只有當雲端有回應資料時才更新，確保 UI 能顯示出來，並同步寫入 LocalStorage
            if (Object.keys(cloudResponses).length > 0) {
                 setAllResponses(prev => ({ ...prev, ...cloudResponses }));
                 localStorage.setItem('echoScript_AllResponses', JSON.stringify(cloudResponses));
            }

            // [新增] 同步雲端收藏 (解決清快取後收藏消失問題)
            // 檢查雲端資料中的 isFavorite 標記，重建 favorites 列表
            const cloudFavorites = cloudNotes.filter(n => n.isFavorite === true);
            // 無論是否有收藏，都更新狀態 (以雲端為準)，確保多裝置或清快取後資料一致
            setFavorites(cloudFavorites);
            localStorage.setItem('echoScript_Favorites', JSON.stringify(cloudFavorites));

            // 4. [洗牌邏輯修復] 資料來源改變後，必須檢查洗牌堆是否需要重建
            try {
                let loadedDeck = JSON.parse(localStorage.getItem('echoScript_ShuffleDeck') || '[]');
                let loadedPointer = parseInt(localStorage.getItem('echoScript_DeckPointer') || '0', 10);
                
                // 如果雲端資料筆數變了 (例如別台電腦新增了筆記)，或者這是第一次同步
                if (loadedDeck.length !== cloudNotes.length) {
                    console.log("♻️ 同步雲端：重建洗牌堆...");
                    loadedDeck = Array.from({length: cloudNotes.length}, (_, i) => i);
                    // Fisher-Yates 洗牌
                    for (let i = loadedDeck.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [loadedDeck[i], loadedDeck[j]] = [loadedDeck[j], loadedDeck[i]];
                    }
                    loadedPointer = 0;
                }
                setShuffleDeck(loadedDeck);
                setDeckPointer(loadedPointer);

                // 5. [狀態恢復] 決定當前要顯示哪一張卡片
                // [邏輯修正] 嚴格定義：App 啟動只回到「首頁」(最後編輯/查看的卡片)，不再自動跳轉釘選
                if (cloudNotes.length > 0 && !showPinnedPlaceholderRef.current) {
                    const resumeId = localStorage.getItem('echoScript_ResumeNoteId');
                    let idx = -1;

                    // A. 優先檢查是否有上次離開或剛操作的筆記 (Resume = 首頁)
                    if (resumeId) {
                        idx = cloudNotes.findIndex(n => String(n.id) === String(resumeId));
                    }

                    // [已移除] 移除釘選筆記 fallback，確保邏輯不混淆
                    
                    // B. 如果找不到 Resume，就從洗牌堆拿一張新的
                    if (idx === -1) {
                        const deckIndex = loadedDeck[loadedPointer] || 0;
                        idx = deckIndex;
                    }
                    
                    // 只有當「目前顯示是 0 (初始狀態)」或「強制刷新」時才更新
                    // 如果有釘選 (cachedPinnedId)，我們傾向於每次打開 App 都看到它，除非使用者已經在操作中
                    setCurrentIndex(prev => {
                        // 簡單邏輯：如果是剛載入(0) 或者是因為雲端同步導致的更新，我們希望能定錨到正確位置
                        // 但為了不干擾使用者如果已經按了下一張，我們這裡採取：只在初始化或目標明確時切換
                        return idx; 
                    });
                }
            } catch (e) { console.error("Deck sync error", e); }
        });

        // 6. 載入非核心資料 (這些保留在 LocalStorage 即可)
        setFavorites(JSON.parse(localStorage.getItem('echoScript_Favorites') || '[]'));
        setAllResponses(JSON.parse(localStorage.getItem('echoScript_AllResponses') || '{}'));
        setHistory(JSON.parse(localStorage.getItem('echoScript_History') || '[]'));
        setRecentIndices(JSON.parse(localStorage.getItem('echoScript_Recents') || '[]'));
        setFutureIndices(JSON.parse(localStorage.getItem('echoScript_FutureRecents') || '[]'));

        // 關閉時取消監聽
        return () => unsubscribe();
    }, []);

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

    useEffect(() => { localStorage.setItem('echoScript_AllNotes', JSON.stringify(notes)); }, [notes]);
    useEffect(() => { localStorage.setItem('echoScript_Favorites', JSON.stringify(favorites)); }, [favorites]);
    useEffect(() => { localStorage.setItem('echoScript_AllResponses', JSON.stringify(allResponses)); }, [allResponses]);
    useEffect(() => { 
        const json = JSON.stringify(history);
        localStorage.setItem('echoScript_History', json); 
        
        // [新增] 同步寫入雲端 (僅當已完成首次載入後)
        if (window.fs && window.db && isHistoryLoaded) {
            window.fs.setDoc(
                window.fs.doc(window.db, "settings", "history"), 
                { historyJSON: json }, 
                { merge: true }
            ).catch(e => console.error("歷史紀錄同步失敗", e));
        }
    }, [history, isHistoryLoaded]);
    useEffect(() => { localStorage.setItem('echoScript_Recents', JSON.stringify(recentIndices)); }, [recentIndices]);
    useEffect(() => { localStorage.setItem('echoScript_FutureRecents', JSON.stringify(futureIndices)); }, [futureIndices]);
    // [新增] 儲存洗牌狀態
    useEffect(() => { localStorage.setItem('echoScript_ShuffleDeck', JSON.stringify(shuffleDeck)); }, [shuffleDeck]);
    useEffect(() => { localStorage.setItem('echoScript_DeckPointer', deckPointer.toString()); }, [deckPointer]);

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

    const handleNextNote = () => {
        if (notes.length <= 1) return;
        // [修正] 移除清除 ResumeNoteId 的邏輯，確保首頁按鈕永遠能回到最後編輯/關注的卡片
        
        setIsAnimating(true);
        setTimeout(() => {
            // === [新增邏輯] 優先檢查「未來堆疊」 (History Redo) ===
            // 如果我們之前按了「上一張」，futureIndices 會有紀錄。
            // 這時候按「下一張」，應該要依照順序走回原本的路，而不是隨機抽新牌。
            if (futureIndices.length > 0) {
                const nextIndex = futureIndices[0]; // 取出最近被放入「未來」的那張
                
                // 1. 將這張牌從「未來」移除
                setFutureIndices(prev => prev.slice(1));
                
                // 2. 將這張牌加回「最近」歷史
                setRecentIndices(prev => [nextIndex, ...prev]);
                
                // 3. 顯示這張牌
                setCurrentIndex(nextIndex);
                // [修正] 移除 addToHistory，避免單純的瀏覽/重播被誤認為編輯紀錄
                
                setIsAnimating(false);
                window.scrollTo(0,0);
                return; // [關鍵] 直接結束，不消耗洗牌堆的額度 (DeckPointer 不動)
            }
            
            // === 原本的隨機抽卡邏輯 (當沒有未來路徑時才執行) ===
            let currentDeck = [...shuffleDeck];
            let currentPointer = deckPointer;

            // [新增] 防重複檢查：解決「剛開啟 App 時按下一張會重複」的問題
            // 如果指標指向的卡片就是當前正在顯示的卡片，直接跳過這張，往後移一格
            if (currentPointer < currentDeck.length && notes[currentDeck[currentPointer]]?.id === (currentNote ? currentNote.id : null)) {
                currentPointer++;
            }

            // [修正] 智慧洗牌邏輯：避免因筆記數量變動而強制重洗，導致容易抽到重複卡片
            
            // 情況 A: 牌堆長度不符 (有新增或刪除筆記) -> 執行「智慧修補」，而不是重洗
            if (currentDeck.length !== notes.length) {
                // 1. 建立目前所有有效的索引集合
                const allIndices = new Set(notes.map((_, i) => i));
                // 2. 過濾掉牌堆裡已經無效的索引 (例如被刪除的筆記)
                currentDeck = currentDeck.filter(idx => allIndices.has(idx));
                
                // 3. 找出哪些是新筆記的索引 (不在目前牌堆裡的)
                const existingIndices = new Set(currentDeck);
                const newIndices = [...allIndices].filter(idx => !existingIndices.has(idx));

                // 4. 將新筆記隨機插入到「未來」的牌堆中 (Pointer 之後)
                if (newIndices.length > 0) {
                    newIndices.forEach(newIdx => {
                        // 在 pointer 到 結尾 之間隨機找個位置插進去
                        // 這樣保證你下一張還是原本排好的，但新筆記會在未來出現
                        const remainingSlots = currentDeck.length - currentPointer;
                        const insertOffset = Math.floor(Math.random() * (remainingSlots + 1));
                        currentDeck.splice(currentPointer + insertOffset, 0, newIdx);
                    });
                }
            }

            // 情況 B: 牌真的抽完了 (或是修補後還是空的) -> 執行「全域洗牌」
            if (currentPointer >= currentDeck.length || currentDeck.length === 0) {
                console.log("🃏 牌堆用盡，重新洗牌...");
                const newDeck = Array.from({length: notes.length}, (_, i) => i);
                // Fisher-Yates 洗牌
                for (let i = newDeck.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
                }
                currentDeck = newDeck;
                currentPointer = 0;

                // 防重複：如果剛洗完的第一張跟現在顯示的一樣，把它塞到最後面去
                if (notes[currentDeck[0]]?.id === (currentNote ? currentNote.id : null)) {
                    const firstCard = currentDeck.shift();
                    currentDeck.push(firstCard);
                }
            }

            // 抽出下一張
            const newIndex = currentDeck[currentPointer];

            // 更新狀態
            setShuffleDeck(currentDeck);
            setDeckPointer(currentPointer + 1);

            setRecentIndices(prev => {
                const updated = [newIndex, ...prev];
                if (updated.length > 50) updated.pop();
                return updated;
            });

            setCurrentIndex(newIndex);
            // [修改] 移除瀏覽歷史紀錄，改為僅記錄編輯歷史
            
            setIsAnimating(false);
            window.scrollTo(0,0);
        }, 300);
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
            const resumeId = localStorage.getItem('echoScript_ResumeNoteId');
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

    // [修改] 雲端版儲存邏輯 (保留了原本的洗牌與智慧插入算法，但寫入改為 Firestore)
    const handleSaveNote = async (updatedNote) => {
        const now = new Date().toISOString();
        let targetId;
        let nextNotes;
        
        // 取得當前的洗牌狀態
        let nextDeck = [...shuffleDeck];
        let nextPointer = deckPointer;

        if (isCreatingNew) {
            // 1. 準備新筆記資料 (確保 ID 為字串，這是雲端資料庫的要求)
            const newId = updatedNote.id ? String(updatedNote.id) : String(Date.now());
            const newNote = { ...updatedNote, id: newId, createdDate: now, modifiedDate: now };
            
            // 2. 更新筆記列表 (新筆記加入最前面)
            nextNotes = [newNote, ...notes];
            targetId = newId;
            
            // 3. [智慧插入] 邏輯保留：原本洗牌堆裡的號碼+1，並將新筆記(0)隨機插入未來
            nextDeck = nextDeck.map(i => i + 1);
            const futureSlots = nextDeck.length - nextPointer;
            const insertOffset = Math.floor(Math.random() * (futureSlots + 1));
            const insertPos = nextPointer + insertOffset;
            
            nextDeck.splice(insertPos, 0, 0);
            
            setCurrentIndex(0); 
            showNotification("新筆記已建立 (同步中...)");

        } else {
            // 修改模式
            const editedNote = { 
                ...updatedNote, 
                id: String(updatedNote.id), // 確保 ID 為字串
                createdDate: updatedNote.createdDate || now, 
                modifiedDate: now 
            };
            nextNotes = notes.map(n => String(n.id) === String(editedNote.id) ? editedNote : n);
            setFavorites(prev => prev.map(f => String(f.id) === String(editedNote.id) ? { ...f, ...editedNote } : f));
            targetId = editedNote.id;
            
            showNotification("筆記已更新 (同步中...)");
        }
        
        // 4. [樂觀更新] 先立刻更新畫面與本地狀態，讓使用者感覺不到延遲
        setNotes(nextNotes);
        setShuffleDeck(nextDeck);
        setDeckPointer(nextPointer);
        
        // 5. [雲端寫入] 取代原本的 LocalStorage 寫入
        try {
            const noteToSave = nextNotes.find(n => String(n.id) === String(targetId));
            if (noteToSave) {
                // 使用 setDoc (若 ID 存在則覆蓋，不存在則新增)
                await window.fs.setDoc(window.fs.doc(window.db, "notes", String(targetId)), noteToSave);
                console.log("✅ 雲端儲存成功");
            }
        } catch (e) {
            console.error("雲端儲存失敗", e);
            showNotification("⚠️ 雲端儲存失敗，請檢查網路");
        }
        
        // 6. 這些是「暫存狀態」，依然保留在 LocalStorage (因為這屬於你個人的操作進度，不需要存雲端)
        localStorage.setItem('echoScript_ShuffleDeck', JSON.stringify(nextDeck));
        localStorage.setItem('echoScript_DeckPointer', nextPointer.toString());
        localStorage.setItem('echoScript_ResumeNoteId', String(targetId));
        if (window.fs && window.db) window.fs.setDoc(window.fs.doc(window.db, "settings", "preferences"), { resumeNoteId: String(targetId) }, { merge: true });
        
        // [新增] 記錄編輯歷史 (Edit History) - 至少保留 30 筆 (原設定為 50 筆)
        const savedNote = nextNotes.find(n => String(n.id) === String(targetId));
        if (savedNote) addToHistory(savedNote);

        // [修正] 編輯完後，強制跳轉到該筆記的卡片位置
        const savedIndex = nextNotes.findIndex(n => String(n.id) === String(targetId));
        if (savedIndex !== -1) setCurrentIndex(savedIndex);

        setHasDataChangedInSession(true); 
        setShowEditModal(false);
    };

    // [新增] 復原筆記功能
    const handleRestoreNote = async (noteId) => {
        const noteToRestore = trash.find(n => String(n.id) === String(noteId));
        if (!noteToRestore) return;

        if (confirm(`確定要復原「${noteToRestore.title}」嗎？`)) {
            // 1. 從垃圾桶移除
            const newTrash = trash.filter(n => String(n.id) !== String(noteId));
            setTrash(newTrash);

            // 2. 準備復原的筆記物件 (移除刪除標記)
            const { deletedAt, ...restoredNote } = noteToRestore;
            const newNotes = [restoredNote, ...notes];
            setNotes(newNotes);

            // 3. [關鍵] 檢查並修復分類 (如果原分類已不存在，自動重建)
            const cat = restoredNote.category || "未分類";
            const sub = restoredNote.subcategory || "一般";
            let newMap = { ...categoryMap };
            let mapChanged = false;

            if (!newMap[cat]) {
                newMap[cat] = [];
                mapChanged = true;
            }
            if (!newMap[cat].includes(sub)) {
                newMap[cat].push(sub);
                mapChanged = true;
            }

            if (mapChanged) {
                setCategoryMap(newMap);
                console.log("♻️ 復原筆記：自動重建遺失的分類結構");
            }

            // 4. 同步所有變更到雲端 (原子化操作概念)
            if (window.fs && window.db) {
                try {
                    const promises = [];
                    
                    // A. 寫回 Notes 集合
                    promises.push(window.fs.setDoc(window.fs.doc(window.db, "notes", String(restoredNote.id)), restoredNote));
                    
                    // B. 更新 Settings/Trash
                    promises.push(window.fs.setDoc(window.fs.doc(window.db, "settings", "trash"), { trashJSON: JSON.stringify(newTrash) }, { merge: true }));
                    
                    // C. 如果分類有變，更新 Settings/Layout
                    if (mapChanged) {
                        promises.push(window.fs.setDoc(window.fs.doc(window.db, "settings", "layout"), { categoryMapJSON: JSON.stringify(newMap) }, { merge: true }));
                    }

                    await Promise.all(promises);
                    showNotification("筆記已復原");
                } catch (e) {
                    console.error("復原同步失敗", e);
                    showNotification("⚠️ 復原失敗，請檢查網路");
                }
            }
            
            setHasDataChangedInSession(true);
        }
    };
                                
    const handleDeleteNote = (id) => {
        // [修改] 提示文字變更
        if (confirm("確定要刪除這則筆記嗎？它將被移至垃圾桶保留 30 天。")) {
            // 0. [新增] 備份到垃圾桶
            const noteToDelete = notes.find(n => String(n.id) === String(id));
            if (noteToDelete) {
                const trashItem = { ...noteToDelete, deletedAt: new Date().toISOString() };
                const newTrash = [trashItem, ...trash];
                setTrash(newTrash);
                
                // 同步垃圾桶到雲端
                if (window.fs && window.db) {
                     window.fs.setDoc(
                        window.fs.doc(window.db, "settings", "trash"), 
                        { trashJSON: JSON.stringify(newTrash) }, 
                        { merge: true }
                    ).catch(e => console.error("垃圾桶備份失敗", e));
                }
            }

            // 1. 先找出這張筆記「刪除前」的 Index
            const deletedIndex = notes.findIndex(n => String(n.id) === String(id));

            // 2. 執行刪除 (更新筆記列表)
            const newNotes = notes.filter(n => String(n.id) !== String(id));
            setNotes(newNotes);

            // [修正] 同步從編輯歷史中移除該筆記
            setHistory(prevHistory => {
                const validHistory = Array.isArray(prevHistory) ? prevHistory : [];
                const validNoteIds = new Set(newNotes.map(n => String(n.id)));
                
                const newHistory = validHistory.filter(h => 
                    h && 
                    String(h.id) !== String(id) && 
                    validNoteIds.has(String(h.id))
                );
                
                localStorage.setItem('echoScript_History', JSON.stringify(newHistory));
                if (window.fs && window.db) {
                    window.fs.setDoc(
                        window.fs.doc(window.db, "settings", "history"), 
                        { historyJSON: JSON.stringify(newHistory) }, 
                        { merge: true }
                    ).catch(e => console.error("歷史紀錄強制同步失敗", e));
                }
                return newHistory;
            });

            // [新增] 同步刪除雲端資料 (Firestore) - 從 notes 集合中移除
            try {
                if (window.fs && window.db) {
                    window.fs.deleteDoc(window.fs.doc(window.db, "notes", String(id)));
                    console.log("✅ 雲端 notes 移除成功 (已移至垃圾桶)");
                }
            } catch (e) {
                console.error("雲端刪除失敗", e);
                showNotification("⚠️ 雲端同步失敗，請檢查網路");
            }
            
            // 3. 處理畫面顯示與導航邏輯
            let nextIdx = -1;
            const isDeletingPinned = String(id) === String(pinnedNoteId);

            if (isDeletingPinned) {
                setPinnedNoteId(null);
                localStorage.removeItem('echoScript_PinnedId');
                if (window.fs && window.db) {
                    window.fs.setDoc(window.fs.doc(window.db, "settings", "preferences"), { pinnedNoteId: null }, { merge: true });
                }
                setShowPinnedPlaceholder(true);
                showPinnedPlaceholderRef.current = true;
                nextIdx = -1;
                localStorage.removeItem('echoScript_ResumeNoteId');
            
            } else if (newNotes.length > 0) {
                const latestNote = [...newNotes].sort((a, b) => {
                    const timeA = new Date(a.modifiedDate || a.createdDate || 0).getTime();
                    const timeB = new Date(b.modifiedDate || b.createdDate || 0).getTime();
                    return timeB - timeA;
                })[0];
                
                if (latestNote) {
                    nextIdx = newNotes.findIndex(n => n.id === latestNote.id);
                    const targetId = String(latestNote.id);
                    localStorage.setItem('echoScript_ResumeNoteId', targetId);
                    if (window.fs && window.db) {
                        window.fs.setDoc(
                            window.fs.doc(window.db, "settings", "preferences"), 
                            { resumeNoteId: targetId }, 
                            { merge: true }
                        );
                    }
                } else { nextIdx = 0; }
                setShowPinnedPlaceholder(false);
            
            } else {
                setShowPinnedPlaceholder(false);
                nextIdx = -1;
                localStorage.removeItem('echoScript_ResumeNoteId');
            }
            
            setCurrentIndex(nextIdx);
            setShowEditModal(false);

            // 4. 洗牌堆修正 (維持原有邏輯)
            if (deletedIndex !== -1) {
                const newDeck = shuffleDeck
                    .filter(i => i !== deletedIndex)
                    .map(i => i > deletedIndex ? i - 1 : i);
                const indexInDeck = shuffleDeck.indexOf(deletedIndex);
                let newPointer = deckPointer;
                if (indexInDeck !== -1 && indexInDeck < deckPointer) {
                    newPointer = Math.max(0, deckPointer - 1);
                }
                newPointer = Math.min(newPointer, newDeck.length);

                setShuffleDeck(newDeck);
                setDeckPointer(newPointer);
                localStorage.setItem('echoScript_ShuffleDeck', JSON.stringify(newDeck));
                localStorage.setItem('echoScript_DeckPointer', newPointer.toString());
            }
            
            localStorage.setItem('echoScript_AllNotes', JSON.stringify(newNotes));
            setHasDataChangedInSession(true);
            showNotification("筆記已移至垃圾桶");
        }
    };

    // [新增] 處理釘選/取消釘選
    const handleTogglePin = () => {
        if (!currentNote) return;
        
        const isCurrentlyPinned = pinnedNoteId === String(currentNote.id);
        const newPinnedId = isCurrentlyPinned ? null : String(currentNote.id);

        // 1. 本地樂觀更新
        setPinnedNoteId(newPinnedId);
        if (newPinnedId) localStorage.setItem('echoScript_PinnedId', newPinnedId);
        else localStorage.removeItem('echoScript_PinnedId');

        // [修正] 簡化提示詞，避免混淆「首頁」概念
        showNotification(isCurrentlyPinned ? "已取消釘選" : "已釘選");

        // 2. 雲端同步 (寫入 settings/preferences)
        if (window.fs && window.db) {
            window.fs.setDoc(
                window.fs.doc(window.db, "settings", "preferences"), 
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
        if (currentNote) {
            localStorage.setItem('echoScript_ResumeNoteId', String(currentNote.id));
            if (window.fs && window.db) window.fs.setDoc(window.fs.doc(window.db, "settings", "preferences"), { resumeNoteId: String(currentNote.id) }, { merge: true });
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
        
        // [關鍵修正] 強制同步寫入 LocalStorage
        localStorage.setItem('echoScript_AllResponses', JSON.stringify(nextAllResponses));
        // [新增] 只要有編輯或新增回應，就表示使用者正在關注此筆記，鎖定它！
        localStorage.setItem('echoScript_ResumeNoteId', currentNote.id);
        if (window.fs && window.db) window.fs.setDoc(window.fs.doc(window.db, "settings", "preferences"), { resumeNoteId: String(currentNote.id) }, { merge: true });

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
    };

    const handleDeleteResponse = (responseId) => {
        if(confirm("確定要刪除這則回應嗎？")) {
            // 1. 計算刪除後的陣列
            const prevResponses = allResponses;
            const noteResponses = prevResponses[currentNote.id] || [];
            const newNoteResponses = noteResponses.filter(r => r.id !== responseId);
            const nextAllResponses = { ...prevResponses, [currentNote.id]: newNoteResponses };

            // 2. 更新本地狀態與 LocalStorage (確保 UI 反應即時)
            setAllResponses(nextAllResponses);
            localStorage.setItem('echoScript_AllResponses', JSON.stringify(nextAllResponses));

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
        }
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

    const handleRestore = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                if (data.favorites) setFavorites(data.favorites);
                if (data.history) setHistory(data.history);
                if (data.allResponses) setAllResponses(data.allResponses);
                
                // [關鍵] 優先還原分類結構，確保順序正確
                if (data.categoryMap) {
                    setCategoryMap(data.categoryMap);
                    localStorage.setItem('echoScript_CategoryMap', JSON.stringify(data.categoryMap));
                }
                
                if (data.notes) {
                    setNotes(data.notes);
                    showNotification("資料庫還原成功！");
                    setTimeout(() => window.location.reload(), 1000);
                }
            } catch (err) { showNotification("檔案格式錯誤"); }
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

    return (
        <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans pb-20 transition-colors duration-300`}>
            <nav className={`sticky top-0 z-30 ${theme.bg}/90 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b ${theme.border}`}>
                <div className="flex items-center gap-2">
                    <img src="icon.png" className="w-8 h-8 rounded-lg object-cover" alt="App Icon" />
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
                    {/* [UI調整] 我的資料庫按鈕移至右上角 */}
                    <button 
                        onClick={() => setShowMenuModal(true)} 
                        className={`${theme.accent} ${theme.accentText} p-2 rounded-full shadow-sm active:opacity-80`} 
                        title="我的資料庫"
                    >
                        <BookOpen className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            <main className="px-6 py-6 max-w-lg mx-auto" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
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
                                        <div className={`flex items-baseline gap-2 text-sm font-bold ${theme.subtext} tracking-widest uppercase`}>
                                            <h2>{currentNote.category || "未分類"}</h2>
                                            <span className="opacity-50">|</span>
                                            <h3>{currentNote.subcategory}</h3>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs ${theme.subtext} font-sans opacity-70`}>#{currentNote.id}</span>
                                            <button onClick={handleTogglePin} className={`transition-transform duration-200 hover:scale-110 ${String(currentNote.id) === String(pinnedNoteId) ? theme.text : 'text-stone-300'}`} title="釘選這則筆記">
                                                <Pin className="w-5 h-5" fill={String(currentNote.id) === String(pinnedNoteId) ? "currentColor" : "none"} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex-1">
                                    <h1 className={`text-2xl font-bold ${theme.text} mb-4`}>{currentNote.title}</h1>
                                    
                                    {/* 日期顯示區 - 移至主旨語下方 */}
                                    <div className={`flex gap-4 mb-6 text-[10px] ${theme.subtext} font-mono border-y ${theme.border} py-2 w-full`}>
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> 建立: {currentNote.createdDate ? new Date(currentNote.createdDate).toLocaleDateString() : '預設'}</span>
                                        <span className="flex items-center gap-1"><Edit className="w-3 h-3"/> 修改: {currentNote.modifiedDate ? new Date(currentNote.modifiedDate).toLocaleDateString() : (currentNote.createdDate ? new Date(currentNote.createdDate).toLocaleDateString() : '預設')}</span>
                                    </div>

                                    {/* 內文區域 - 這裡強制使用深色字體以確保 Markdown 在淺色底的卡片上可讀，若為深色模式則自動調整 */}
                                    <div className={`-mt-5 text-lg leading-loose font-sans text-justify whitespace-pre-wrap ${currentThemeId === 'dark' ? 'text-slate-300' : 'text-stone-700'}`}>
                                        <MarkdownRenderer content={currentNote.content} />
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
            
            {/* [UI調整] 左下角導航操作區：由下而上分別是 首頁 -> 釘選 -> 資料庫 */}
            <div className="fixed bottom-6 left-6 z-20 flex flex-col gap-3 items-start">
                
                {/* [已移除] 我的資料庫按鈕已移至右上角 */}

                {/* 2. 釘選按鈕 (中間) - 專門負責「釘選筆記」 */}
                <button 
                    onClick={handleGoToPin} 
                    disabled={isAnimating || notes.length === 0} 
                    className={`${theme.accent} ${theme.accentText} p-3 rounded-full shadow-lg active:scale-95 transition-transform`} 
                    title="回到釘選筆記"
                >
                    <Pin className="w-6 h-6" />
                </button>

                {/* 1. 首頁按鈕 (最下方，功能：回到最後編輯的卡片) */}
                <button 
                    onClick={handleGoHome} 
                    disabled={isAnimating || notes.length === 0} 
                    className={`${theme.accent} ${theme.accentText} p-3 rounded-full shadow-lg active:scale-95 transition-transform`} 
                    title="回到最後編輯 (首頁)"
                >
                    <Home className="w-6 h-6"/>
                </button>
            </div>

            {showMenuModal && (
                <div className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm flex justify-end" onClick={(e) => { if(e.target === e.currentTarget) setShowMenuModal(false); }}>
                    <div className={`w-full max-w-sm ${theme.bg} h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300`}>
                        <div className={`p-5 border-b ${theme.border} ${theme.card} flex justify-between items-center`}>
                            <h2 className={`font-bold text-lg ${theme.text}`}>我的資料庫</h2>
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
                                            <span className="text-xs font-normal text-stone-400 ml-auto">保留 30 天</span>
                                        </h3>
                                        
                                        {trash.length > 0 ? (
                                            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                                                {trash.map(t => (
                                                    <div key={t.id} className={`flex justify-between items-center p-3 bg-stone-50/50 rounded-lg border ${theme.border}`}>
                                                        <div className="flex-1 min-w-0 mr-3">
                                                            <h4 className={`text-sm font-bold ${theme.text} truncate`}>{t.title}</h4>
                                                            <div className="flex gap-2 text-[10px] text-stone-400">
                                                                <span>{t.category}</span>
                                                                <span>•</span>
                                                                <span>剩 {Math.max(0, 30 - Math.floor((Date.now() - new Date(t.deletedAt).getTime()) / (1000 * 60 * 60 * 24)))} 天</span>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleRestoreNote(t.id)}
                                                            className="shrink-0 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full hover:bg-green-200 transition-colors"
                                                        >
                                                            復原
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-xs text-stone-400 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                                                垃圾桶是空的
                                            </div>
                                        )}
                                    </div>

                                    <div className={`${theme.card} p-4 rounded-xl border ${theme.border}`}>
                                        <h3 className={`font-bold mb-2 flex items-center gap-2 ${theme.text}`}><Download className="w-4 h-4"/> 匯出資料</h3>
                                        <p className={`text-xs ${theme.subtext} mb-3`}>包含所有新增的筆記與回應。</p>
                                        <button onClick={handleBackup} className="w-full bg-stone-100 text-stone-800 text-sm font-bold py-2 rounded-lg border border-stone-200">下載 JSON</button>
                                    </div>
                                    <div className={`${theme.card} p-4 rounded-xl border ${theme.border}`}>
                                        <h3 className={`font-bold mb-2 flex items-center gap-2 ${theme.text}`}><Upload className="w-4 h-4"/> 匯入資料</h3>
                                        <label className="block w-full bg-[#2c3e50] text-white text-center text-sm font-bold py-2 rounded-lg cursor-pointer">
                                            選擇檔案
                                            <input type="file" accept=".json" className="hidden" onChange={handleRestore} />
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <MarkdownEditorModal 
                    note={isCreatingNew ? null : currentNote} 
                    existingNotes={notes}
                    isNew={isCreatingNew}
                    onClose={() => setShowEditModal(false)} 
                    onSave={(data) => { handleSaveNote(data); setHasUnsavedChanges(false); }} 
                    onDelete={() => { handleDeleteNote(currentNote?.id); setHasUnsavedChanges(false); }}
                    setHasUnsavedChanges={setHasUnsavedChanges}
                    theme={theme}
                />
            )}

            {showAllNotesModal && (
                <AllNotesModal 
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
                    viewLevel={allNotesViewLevel}
                    setViewLevel={setAllNotesViewLevel}
                    theme={theme}
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
                                    hasUnsavedChangesRef.current = false; // 手動更新 Ref 確保同步
                                    setHasUnsavedChanges(false);
                                    setShowUnsavedAlert(false);
                                    
                                    // 2. 關閉所有編輯視窗
                                    setShowMenuModal(false);
                                    setShowAllNotesModal(false);
                                    setAllNotesViewLevel('categories');
                                    setShowEditModal(false);
                                    setShowResponseModal(false);
                                    setResponseViewMode('list');

                                    // 3. 模擬「確定離開」，退回上一頁 (抵銷剛剛為了攔截而 pushState 的那一層)
                                    // 這樣使用者就會回到列表頁，感覺像是「真的退出了」
                                    window.history.back();
                                }} 
                                className="flex-1 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg font-bold transition-colors"
                            >
                                確定離開
                            </button>
                        </div>
                    </div>
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


































































































































































































































