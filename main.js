// === EchoScript v2.2: 完整修復版 (包含分類顯示與防白畫面) ===
const { useState, useEffect, useRef, useCallback, useMemo } = React;
const { createRoot } = ReactDOM;

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


// === 2. 初始筆記資料庫 (確保有完整分類) ===
const INITIAL_NOTES = [
    { id: 1, category: "故事結構", subcategory: "三幕劇", title: "第一幕：鋪陳", content: "在第一幕中，必須建立主角的現狀（Normal World），並引入『引發事件』（Inciting Incident），這通常發生在故事的前10-15%。這個事件打破了主角的平衡，迫使他們做出選擇。" },
    { id: 2, category: "人物塑造", subcategory: "角色弧光", title: "內在需求 vs 外在慾望", content: "一個立體的角色通常擁有一個明確的『外在慾望』（Want），例如贏得比賽或復仇；但他們同時有一個隱藏的『內在需求』（Need），通常是他們自己沒意識到的性格缺陷。故事的終點，往往是角色犧牲了慾望，滿足了需求。" },
    { id: 3, category: "對白技巧", subcategory: "潛台詞", title: "不要說出心裡話", content: "優秀的對白是『言不由衷』的。角色很少直接說出他們真正的感受。如果一對情侶在吵架，他們爭論的可能是誰沒洗碗，但潛台詞其實是『我覺得你不夠重視這個家』。" },
    { id: 4, category: "場景設計", subcategory: "進出原則", title: "晚進早出", content: "盡可能晚地進入場景（Late In），在衝突發生前的一刻切入；並盡可能早地離開場景（Early Out），在懸念或衝突最高點結束，不要拖泥帶水地交代結尾。" },
    { id: 5, category: "故事結構", subcategory: "救貓咪", title: "定場畫面", content: "故事的第一個畫面應該暗示整部電影的主題、氛圍和風格。它是一個視覺隱喻，告訴觀眾這是一個什麼樣的故事。" },
    { id: 6, category: "人物塑造", subcategory: "反派", title: "反派是自己故事裡的英雄", content: "不要把反派寫成只會作惡的壞人。在反派的眼裡，他們所做的一切都是合理、必要，甚至是正義的。給他們一個強大的動機，主角的對抗才會有力。" },
    { id: 7, category: "情節推動", subcategory: "轉折點", title: "無路可退", content: "第一幕結束進入第二幕的轉折點（Plot Point 1），主角必須主動做出決定跨越門檻。這個決定必須是不可逆的，他們不能再回頭過原本的生活。" },
    { id: 8, category: "寫作心法", subcategory: "初稿", title: "容許垃圾", content: "海明威說：『初稿都是狗屎。』寫作的重點是『寫完』，而不是寫好。不要邊寫邊修，先把故事從頭到尾寫出來，讓它存在，然後再像雕刻一樣慢慢修正。" },
    { id: 9, category: "對白技巧", subcategory: "展現而非告知", title: "Show, Don't Tell", content: "與其讓角色說『我很生氣』，不如讓他用力摔門，或是手顫抖著點不著煙。用動作和視覺細節來傳達情緒，永遠比對白更有力。" },
    { id: 10, category: "故事結構", subcategory: "英雄旅程", title: "拒絕召喚", content: "當冒險的召喚來臨時，英雄通常會先拒絕。這展現了他們對未知的恐懼，也讓他們隨後的接受變得更加勇敢且有意義。" },
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
const Combobox = ({ value, onChange, options, placeholder }) => {
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 pr-8"
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
const HighlightingEditor = ({ value, onChange, textareaRef }) => {
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
        <div className="relative flex-1 w-full border border-stone-200 rounded-lg overflow-hidden bg-white h-full">
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
const MarkdownEditorModal = ({ note, existingNotes = [], isNew = false, onClose, onSave, onDelete, setHasUnsavedChanges }) => {
    const [formData, setFormData] = useState({
        category: note?.category || "",
        subcategory: note?.subcategory || "",
        title: note?.title || "",
        content: note?.content || ""
    });

    const [activeTab, setActiveTab] = useState('write'); 

    // 新增：監聽內容變更，同步狀態給主程式 (給手機返回鍵使用)
    useEffect(() => {
        const initialCategory = note?.category || "";
        const initialSubcategory = note?.subcategory || "";
        const initialTitle = note?.title || "";
        const initialContent = note?.content || "";

        const hasChanges = 
            formData.category !== initialCategory ||
            formData.subcategory !== initialSubcategory ||
            formData.title !== initialTitle ||
            formData.content !== initialContent;
            
        // 如果 setHasUnsavedChanges 存在才執行 (防止報錯)
        if (setHasUnsavedChanges) setHasUnsavedChanges(hasChanges);

        // 卸載時重置狀態
        return () => { if (setHasUnsavedChanges) setHasUnsavedChanges(false); };
    }, [formData, note, setHasUnsavedChanges]);

    const existingCategories = useMemo(() => {
        return [...new Set(existingNotes.map(n => n.category).filter(Boolean))];
    }, [existingNotes]);

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
        
        let finalId = note?.id;
        
        // 如果是新筆記 (沒有 ID)，則計算新的序號
        if (!finalId) {
            // 1. 取出所有 ID，並轉為數字
            const allIds = existingNotes.map(n => Number(n.id) || 0);
            
            // 2. [關鍵邏輯] 過濾掉那些像是時間戳記的長亂碼 (例如大於 100 萬的數字)
            // 這樣就算資料庫裡有 "171358..." 這種怪 ID，我們也不會被它影響
            const validIds = allIds.filter(id => id < 1000000);
            
            // 3. 找出最大值，若沒有則從 0 開始 (預設資料最大是 10)
            const maxId = validIds.length > 0 ? Math.max(...validIds) : 0;
            
            // 4. 新 ID 就是最大值 + 1
            finalId = maxId + 1;
        }

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
            <div className="absolute top-6 bottom-6 left-4 right-4 mx-auto max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <nav className="flex justify-between items-center p-4 border-b border-gray-100">
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-800 px-2">取消</button>
                    <h3 className="font-bold text-gray-800">{isNew ? "新增筆記" : "修改筆記"}</h3>
                    <button onClick={handleSave} className="bg-[#2c3e50] text-white px-4 py-1.5 rounded-full text-sm font-bold">儲存</button>
                </nav>
                
                {/* 主內容區：鎖定捲動 (Overflow Hidden) */}
                <div className="flex flex-col flex-1 overflow-hidden">
                    
                    {/* 上方區塊：分類與標題 (固定不捲動) */}
                    <div className="p-4 pb-2 shrink-0 flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                            <Combobox 
                                placeholder="大分類 (如:故事結構)"
                                value={formData.category}
                                onChange={(val) => setFormData(prev => ({...prev, category: val}))}
                                options={existingCategories}
                            />
                            <Combobox 
                                placeholder="次分類 (如:三幕劇)"
                                value={formData.subcategory}
                                onChange={(val) => setFormData(prev => ({...prev, subcategory: val}))}
                                options={existingSubcategories}
                            />
                        </div>

                        <input 
                            placeholder="主旨語 (必填，如：先讓英雄救貓咪)"
                            className="bg-stone-50 border border-stone-200 rounded-lg p-3 font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    {/* 中間區塊：工具列 (固定不捲動) */}
                    <div className="px-4 py-2 shrink-0 border-b border-stone-100 flex justify-between items-center bg-white">
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
                            />
                        ) : (
                            <div className="flex-1 w-full bg-stone-50 p-4 rounded-lg border border-stone-200 overflow-y-auto">
                                <MarkdownRenderer content={formData.content || "（尚未輸入內容）"} />
                            </div>
                        )}
                    </div>
                </div>

                {/* 底部刪除按鈕區 (僅在修改模式顯示) */}
                {!isNew && (
                    <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50 rounded-b-2xl">
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
const ResponseModal = ({ note, responses = [], onClose, onSave, onDelete, viewMode, setViewMode, setHasUnsavedChanges }) => {
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
            <div className="bg-white w-full max-w-lg h-[70%] sm:h-auto rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <nav className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
                    {viewMode === 'list' ? (
                        <>
                            <button onClick={() => handleCheckUnsaved(onClose)} className="text-gray-500 hover:text-gray-800 px-2">關閉</button>
                            <h3 className="font-bold text-gray-800">回應列表 ({responses.length})</h3>
                            <div className="w-8"></div>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleCheckUnsaved(() => setViewMode('list'))} className="text-gray-500 hover:text-gray-800 px-2">返回</button>
                            <h3 className="font-bold text-gray-800">{editingId ? "修改回應" : "新增回應"}</h3>
                            <button onClick={handleSaveCurrent} className="bg-[#2c3e50] text-white px-4 py-1.5 rounded-full text-sm font-bold">儲存</button>
                        </>
                    )}
                </nav>

                <div className="p-4 flex flex-col flex-1 overflow-y-auto custom-scrollbar">
                    {viewMode === 'list' ? (
                        <>
                            <div className="mb-4 p-3 bg-stone-50 rounded-lg border border-stone-100">
                                <p className="text-xs text-stone-500 mb-1">關於：{note.title}</p>
                                <p className="text-sm text-gray-600 line-clamp-2">{note.content}</p>
                            </div>
                            
                            <div className="space-y-3 mb-4">
                                {responses.length > 0 ? responses.map(r => (
                                    <div key={r.id} className="relative group">
                                        <div onClick={() => handleEdit(r)} className="bg-white p-3 rounded-lg border border-gray-200 hover:border-stone-400 cursor-pointer active:scale-[0.99] transition-all shadow-sm">
                                            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed break-words pr-6" style={{ whiteSpace: 'pre-wrap' }}>{r.text}</div>
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

                            <button onClick={handleNew} className="mt-auto w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors sticky bottom-0 shadow-sm border border-stone-200">
                                <Plus className="w-5 h-5"/> 新增回應
                            </button>
                        </>
                    ) : (
                        <textarea 
                            className="flex-1 w-full bg-stone-50 p-4 text-gray-800 text-lg leading-relaxed outline-none resize-none placeholder-gray-400 rounded-xl border border-stone-200 focus:border-stone-400 focus:bg-white transition-colors"
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
// [修改] 接收 setNotes 以支援排序
const AllNotesModal = ({ notes, setNotes, onClose, onItemClick, onDelete, viewLevel, setViewLevel, categoryMap, setCategoryMap, setHasDataChangedInSession }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // [新增] 視覺回饋狀態：記錄目前正在拖曳的項目索引
    const [draggingIndex, setDraggingIndex] = useState(null);
    // [新增] 動畫回饋狀態：記錄目前手指/滑鼠經過的目標索引 (用於顯示插入線)
    const [dragOverIndex, setDragOverIndex] = useState(null);
    
    // [新增] 懸浮選單狀態：{ visible, x, y, type, item }
    const [contextMenu, setContextMenu] = useState(null);

    // [新增] 拖曳排序用的 Refs
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    // [新增] 執行排序資料更新
    const handleSort = () => {
        if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
            dragItem.current = null;
            dragOverItem.current = null;
            return;
        }

        if (viewLevel === 'categories') {
             let _categories = Object.keys(categoryMap);
             const draggedItemContent = _categories[dragItem.current];
             _categories.splice(dragItem.current, 1);
             _categories.splice(dragOverItem.current, 0, draggedItemContent);
             
             // 確實依序重建物件，確保順序被保存
             const newMap = {};
             _categories.forEach(cat => { newMap[cat] = categoryMap[cat]; });
             setCategoryMap(newMap);
        }
        else if (viewLevel === 'subcategories') {
            let _subs = [...(categoryMap[selectedCategory] || [])];
            const draggedItemContent = _subs[dragItem.current];
            _subs.splice(dragItem.current, 1);
            _subs.splice(dragOverItem.current, 0, draggedItemContent);
            
            const newMap = { ...categoryMap };
            newMap[selectedCategory] = _subs;
            setCategoryMap(newMap);
        }
        else if (viewLevel === 'notes') {
            const currentList = notes.filter(n => 
                (n.category || "未分類") === selectedCategory && 
                (n.subcategory || "一般") === selectedSubcategory
            );
            
            const draggedNote = currentList[dragItem.current];
            const overNote = currentList[dragOverItem.current];
            
            let _notes = [...notes];
            const realDragIndex = _notes.findIndex(n => n.id === draggedNote.id);
            const noteContent = _notes[realDragIndex];

            _notes.splice(realDragIndex, 1);
            const realOverIndex = _notes.findIndex(n => n.id === overNote.id);
            _notes.splice(realOverIndex, 0, noteContent);
            
            setNotes(_notes);
        }
        
        dragItem.current = null;
        dragOverItem.current = null;
        setDraggingIndex(null); 
        setDragOverIndex(null);

        // [關鍵修正] 只要有排序，就標記資料已變更，確保退出時提醒備份
        if (setHasDataChangedInSession) setHasDataChangedInSession(true);
    };

    // [新增] 手機觸控拖曳邏輯
    const handleTouchStart = (e, index) => {
        e.stopPropagation(); // [關鍵] 阻止事件傳遞給父層，避免觸發長按刪除
        dragItem.current = index;
        setDraggingIndex(index); // 設定視覺回饋
    };
    
    const handleTouchMove = (e) => {
        // 防止手機畫面跟著捲動 (僅當按住手把時)
        if (e.cancelable) e.preventDefault();
        
        // 取得手指目前位置的元素
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // 找到該元素所屬的列表項目 (透過 data-index)
        const row = target?.closest('[data-index]');
        if (row) {
             const idx = parseInt(row.dataset.index, 10);
             if (!isNaN(idx)) {
                 dragOverItem.current = idx;
                 setDragOverIndex(idx); // [關鍵] 觸發畫面更新，顯示插入位置
             }
        }
    };

    const handleTouchEnd = () => {
        handleSort();
    };

    // 長按偵測 Ref
    const pressTimer = useRef(null);
    const isLongPress = useRef(false);

    // 1. 使用 categoryMap 取得大分類 (包含空的)
    const categories = useMemo(() => Object.keys(categoryMap || {}), [categoryMap]);

    // 2. 使用 categoryMap 取得次分類 (包含空的)
    const subcategories = useMemo(() => {
        if (!selectedCategory || !categoryMap) return [];
        return categoryMap[selectedCategory] || [];
    }, [categoryMap, selectedCategory]);

    // 刪除大分類邏輯
    const handleDeleteCategory = (cat) => {
        const hasNotes = notes.some(n => (n.category || "未分類") === cat);
        if (hasNotes) {
            alert(`「${cat}」下還有筆記，無法刪除！`);
            return;
        }
        if (confirm(`確定要刪除空分類「${cat}」嗎？`)) {
            const newMap = { ...categoryMap };
            delete newMap[cat];
            setCategoryMap(newMap);
            // [關鍵] 觸發備份提醒
            if (setHasDataChangedInSession) setHasDataChangedInSession(true);
        }
    };

    // 刪除次分類邏輯
    const handleDeleteSubcategory = (sub) => {
        const hasNotes = notes.some(n => (n.category || "未分類") === selectedCategory && (n.subcategory || "一般") === sub);
        if (hasNotes) {
            alert(`「${sub}」下還有筆記，無法刪除！`);
            return;
        }
        if (confirm(`確定要刪除空次分類「${sub}」嗎？`)) {
            const newMap = { ...categoryMap };
            newMap[selectedCategory] = newMap[selectedCategory].filter(s => s !== sub);
            setCategoryMap(newMap);
            // [關鍵] 觸發備份提醒
            if (setHasDataChangedInSession) setHasDataChangedInSession(true);
        }
    };

    // 長按事件綁定器 (改良版：支援回傳座標)
    const bindLongPress = (onLongPress, onClick) => {
        const start = (e) => {
            // 抓取觸控或滑鼠座標
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            isLongPress.current = false;
            pressTimer.current = setTimeout(() => {
                isLongPress.current = true;
                if (navigator.vibrate) navigator.vibrate(50);
                onLongPress(clientX, clientY); // 回傳座標給回呼函式
            }, 600);
        };
        const end = () => { if (pressTimer.current) clearTimeout(pressTimer.current); };
        
        return {
            onMouseDown: start, onTouchStart: start,
            onMouseUp: end, onMouseLeave: end, onTouchEnd: end,
            onClick: (e) => {
                if (isLongPress.current) {
                    e.preventDefault();
                    e.stopPropagation();
                    isLongPress.current = false; // 重置
                } else {
                    onClick(e);
                }
            }
        };
    };

    // [新增] 處理重新命名
    const handleRename = () => {
        if (!contextMenu) return;
        const { type, item } = contextMenu;
        const newName = prompt(`請輸入新的${type === 'category' ? '分類' : '次分類'}名稱`, item);
        
        if (!newName || newName === item) {
            setContextMenu(null);
            return;
        }

        if (type === 'category' && categoryMap[newName]) { alert("該分類名稱已存在"); return; }
        if (type === 'subcategory' && categoryMap[selectedCategory].includes(newName)) { alert("該次分類名稱已存在"); return; }

        if (type === 'category') {
            // 1. 更新 Map (依序重建，確保舊鍵 'item' 被 'newName' 取代，且順序不變)
            const newMap = {};
            Object.keys(categoryMap).forEach(key => {
                if (key === item) {
                    newMap[newName] = categoryMap[item]; 
                } else {
                    newMap[key] = categoryMap[key];
                }
            });
            setCategoryMap(newMap);
            
            // 2. 更新筆記
            const newNotes = notes.map(n => (n.category || "未分類") === item ? { ...n, category: newName } : n);
            setNotes(newNotes);
        } else {
            // 1. 更新 Map (次分類)
            const newMap = { ...categoryMap };
            const subs = newMap[selectedCategory].map(s => s === item ? newName : s);
            newMap[selectedCategory] = subs;
            setCategoryMap(newMap);
            
            // 2. 更新筆記
            const newNotes = notes.map(n => 
                ((n.category || "未分類") === selectedCategory && (n.subcategory || "一般") === item) 
                ? { ...n, subcategory: newName } 
                : n
            );
            setNotes(newNotes);
        }
        
        // [關鍵] 觸發備份提醒
        if (setHasDataChangedInSession) setHasDataChangedInSession(true);
        setContextMenu(null);
    };

    // [新增] 處理選單刪除
    const handleDeleteFromMenu = () => {
        if (!contextMenu) return;
        const { type, item } = contextMenu;
        if (type === 'category') handleDeleteCategory(item);
        if (type === 'subcategory') handleDeleteSubcategory(item);
        setContextMenu(null);
    };

    // 3. 取得最終筆記列表
    const targetNotes = useMemo(() => {
        if (!selectedCategory || !selectedSubcategory) return [];
        return notes.filter(n => 
            (n.category || "未分類") === selectedCategory && 
            (n.subcategory || "一般") === selectedSubcategory
        );
    }, [notes, selectedCategory, selectedSubcategory]);

    // 搜尋邏輯 (搜尋時暫時忽略層級)
    // 搜尋邏輯 (搜尋時暫時忽略層級)
    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        return notes.filter(n => 
            (n.title && n.title.includes(searchTerm)) || 
            (n.content && n.content.includes(searchTerm)) ||
            (n.category && n.category.includes(searchTerm)) || 
            (n.subcategory && n.subcategory.includes(searchTerm))
        );
    }, [notes, searchTerm]);

    // 返回上一層邏輯
    const handleBack = () => {
        // 從「筆記」層級返回「次分類」
        if (viewLevel === 'notes') {
            setViewLevel('subcategories');
            setSelectedSubcategory(null);
        } 
        // 從「次分類」層級返回「大分類」 <--- 清空 Category，修復空白畫面問題
        else if (viewLevel === 'subcategories') {
            setViewLevel('categories');
            setSelectedCategory(null); // 【關鍵修復】
        }
    };

    return (
        <div className="fixed inset-0 z-40 bg-stone-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* 頂部導航列 (修復版) */}
            <div className="p-4 border-b border-stone-200 bg-white flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    {/* 智慧返回/關閉按鈕：在非搜尋模式下 */}
                    {(!searchTerm) ? (
                        <button 
                            onClick={viewLevel === 'categories' ? onClose : handleBack} 
                            className="p-1 -ml-2 text-stone-500 hover:bg-stone-100 rounded-full mr-1"
                            title={viewLevel === 'categories' ? "關閉" : "返回上一層"}
                        >
                            {/* 在「大分類」層級時顯示 X 關閉，否則顯示左箭頭返回 */}
                            {viewLevel === 'categories' ? <X className="w-5 h-5" /> : <IconBase d="M15 18l-6-6 6-6" />}
                        </button>
                    ) : (
                        <button onClick={() => setSearchTerm("")} className="p-1 -ml-2 text-stone-500 hover:bg-stone-100 rounded-full mr-1" title="返回分類列表">
                            <IconBase d="M15 18l-6-6 6-6" /> 
                        </button>
                    )}
                    {/* 標題隨層級變化 */}
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        {searchTerm ? "搜尋結果" : 
                         viewLevel === 'categories' ? "筆記分類" : 
                         viewLevel === 'subcategories' ? selectedCategory : 
                         selectedSubcategory}
                    </h2>
                </div>
                {/* 移除原本固定的右上角 X 按鈕 */}
            </div>
            
            {/* 搜尋框 */}
            <div className="p-4 bg-stone-50 sticky top-[69px] z-10">
                <input 
                    type="text" 
                    placeholder="搜尋筆記關鍵字..." 
                    className="w-full bg-white border border-stone-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* 列表內容區 */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-20">
                
                {/* 情況 A: 正在搜尋 (顯示扁平列表) */}
                {searchTerm && (
                    searchResults.length > 0 ? searchResults.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3" 
                             onClick={() => onItemClick(item)}>
                            <div className="text-xs text-stone-400 mb-1">{item.category} / {item.subcategory}</div>
                            <h4 className="font-bold text-gray-800">{item.title}</h4>
                        </div>
                    )) : <div className="text-center text-gray-400 mt-10">沒有找到相關筆記</div>
                )}

                {/* 情況 B: 階層導航 */}
                {!searchTerm && (
                    <>
                        {/* Level 1: 大分類列表 */}
                        {viewLevel === 'categories' && categories.map((cat, index) => {
                            const count = notes.filter(n => (n.category || "未分類") === cat).length;
                            const isDragging = index === draggingIndex;
                            const isDragOver = index === dragOverIndex && index !== draggingIndex;
                            return (
                                <div key={cat} 
                                     data-index={index}
                                     {...bindLongPress(
                                         (x, y) => setContextMenu({ visible: true, x, y, type: 'category', item: cat }), // [修改] 長按開啟選單
                                         () => {
                                             setSelectedCategory(cat); 
                                             setViewLevel('subcategories'); 
                                             window.history.pushState({ page: 'modal', level: 'subcategories', time: Date.now() }, '', '');
                                         }
                                     )}
                                     className={`
                                        ${isDragging ? 'bg-stone-100 border-stone-400 scale-[1.02] z-20' : 'bg-white border-gray-100'} 
                                        ${isDragOver ? 'border-t-[3px] border-t-[#2c3e50] mt-2 transition-all duration-200' : ''} 
                                        p-4 rounded-xl shadow-sm border mb-3 flex items-center cursor-pointer hover:border-stone-300 select-none transition-all
                                     `}>
                                    
                                    <div className="flex-1 flex items-baseline gap-2">
                                        <span className="font-bold text-lg text-stone-800">{cat}</span>
                                        {count === 0 && <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">空</span>}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <IconBase d="M9 18l6-6-6-6" className="text-stone-300 w-5 h-5" />
                                        {/* 拖曳手把 */}
                                        <div className="p-2 -mr-2 text-stone-300 hover:text-stone-500 cursor-grab touch-none active:text-stone-800"
                                             onTouchStart={(e) => handleTouchStart(e, index)}
                                             onTouchMove={handleTouchMove}
                                             onTouchEnd={handleTouchEnd}
                                             onMouseDown={(e) => { e.stopPropagation(); dragItem.current = index; }}
                                             draggable
                                             onDragStart={() => (dragItem.current = index)}
                                             onDragEnter={() => { dragOverItem.current = index; setDragOverIndex(index); }}
                                             onDragEnd={handleSort}
                                             onDragOver={(e) => e.preventDefault()}
                                             onClick={(e) => e.stopPropagation()}>
                                            <GripVertical className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Level 2: 次分類列表 */}
                        {viewLevel === 'subcategories' && subcategories.map((sub, index) => {
                            const count = notes.filter(n => (n.category || "未分類") === selectedCategory && (n.subcategory || "一般") === sub).length;
                            const isDragging = index === draggingIndex;
                            const isDragOver = index === dragOverIndex && index !== draggingIndex;
                            return (
                                <div key={sub} 
                                     data-index={index}
                                     {...bindLongPress(
                                         (x, y) => setContextMenu({ visible: true, x, y, type: 'subcategory', item: sub }), // [修改] 長按開啟選單
                                         () => {
                                             setSelectedSubcategory(sub); 
                                             setViewLevel('notes'); 
                                             window.history.pushState({ page: 'modal', level: 'notes', time: Date.now() }, '', '');
                                         }
                                     )}
                                     className={`
                                        ${isDragging ? 'bg-stone-100 border-stone-400 scale-[1.02] z-20' : 'bg-white border-gray-100'} 
                                        ${isDragOver ? 'border-t-[3px] border-t-[#2c3e50] mt-2 transition-all duration-200' : ''}
                                        p-4 rounded-xl shadow-sm border mb-3 flex items-center cursor-pointer hover:border-stone-300 select-none transition-all
                                     `}>
                                    
                                    <div className="flex-1 flex items-baseline gap-2">
                                        <span className="font-medium text-lg text-stone-700">{sub}</span>
                                        {count === 0 && <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">空</span>}
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <IconBase d="M9 18l6-6-6-6" className="text-stone-300 w-5 h-5" />
                                        <div className="p-2 -mr-2 text-stone-300 hover:text-stone-500 cursor-grab touch-none active:text-stone-800"
                                             onTouchStart={(e) => handleTouchStart(e, index)}
                                             onTouchMove={handleTouchMove}
                                             onTouchEnd={handleTouchEnd}
                                             onMouseDown={(e) => { e.stopPropagation(); dragItem.current = index; }}
                                             draggable
                                             onDragStart={() => (dragItem.current = index)}
                                             onDragEnter={() => { dragOverItem.current = index; setDragOverIndex(index); }}
                                             onDragEnd={handleSort}
                                             onDragOver={(e) => e.preventDefault()}
                                             onClick={(e) => e.stopPropagation()}>
                                            <GripVertical className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Level 3: 最終筆記列表 */}
                        {viewLevel === 'notes' && targetNotes.map((item, index) => {
                            const isDragging = index === draggingIndex;
                            const isDragOver = index === dragOverIndex && index !== draggingIndex; // [新增]
                            return (
                                <div key={item.id} 
                                     data-index={index}
                                     className={`
                                        ${isDragging ? 'bg-stone-100 border-stone-400 scale-[1.02] z-20' : 'bg-white border-gray-100'} 
                                        ${isDragOver ? 'border-t-[3px] border-t-[#2c3e50] mt-2 transition-all duration-200' : ''}
                                        p-4 rounded-xl shadow-sm border mb-3 transition-all select-none
                                     `}
                                     onClick={() => onItemClick(item)}>
                                    
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 text-lg">{item.title}</h4>
                                            <p className="text-sm text-gray-500 line-clamp-2 mt-2">{item.content}</p>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-2 ml-2">
                                            {/* 拖曳手把 */}
                                            <div className="p-2 -mr-2 -mt-2 text-stone-300 hover:text-stone-500 cursor-grab touch-none active:text-stone-800"
                                                 onTouchStart={(e) => handleTouchStart(e, index)}
                                                 onTouchMove={handleTouchMove}
                                                 onTouchEnd={handleTouchEnd}
                                                 onMouseDown={(e) => { e.stopPropagation(); dragItem.current = index; }}
                                                 draggable
                                                 onDragStart={() => (dragItem.current = index)}
                                                 onDragEnter={() => { dragOverItem.current = index; setDragOverIndex(index); }} // [修改]
                                                 onDragEnd={handleSort}
                                                 onDragOver={(e) => e.preventDefault()}
                                                 onClick={(e) => e.stopPropagation()}>
                                                <GripVertical className="w-6 h-6" />
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="text-stone-300 hover:text-red-500 p-2 -mr-2">
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>

            {/* [新增] 懸浮操作選單 */}
            {contextMenu && (
                <>
                    {/* 背景遮罩：點擊空白處關閉選單 */}
                    <div className="fixed inset-0 z-[60]" onClick={() => setContextMenu(null)} />
                    
                    {/* 選單本體：根據滑鼠/手指座標定位 */}
                    <div 
                        className="fixed z-[70] bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden min-w-[140px] animate-in fade-in zoom-in-95 duration-100 flex flex-col"
                        style={{ 
                            // 智慧定位：防止選單超出螢幕邊界
                            top: Math.min(contextMenu.y, window.innerHeight - 100), 
                            left: Math.min(contextMenu.x, window.innerWidth - 140) 
                        }}
                    >
                        <button onClick={handleRename} className="w-full text-left px-4 py-3 hover:bg-stone-50 text-stone-700 font-bold text-sm border-b border-stone-100 flex items-center gap-2">
                            <Edit className="w-4 h-4"/> 重新命名
                        </button>
                        <button onClick={handleDeleteFromMenu} className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-bold text-sm flex items-center gap-2">
                            <Trash2 className="w-4 h-4"/> 刪除
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

// === 8. 列表項目 (給收藏與歷史使用) ===
const NoteListItem = ({ item, isHistory, allResponses }) => {
    // 取得該筆記的所有新回應
    const newResponses = allResponses ? (allResponses[item.id] || []) : [];
    // 決定要顯示哪一個回應：如果有新回應，顯示最新的一則 (index 0)；如果沒有，顯示舊的 journalEntry
    const displayResponse = newResponses.length > 0 ? newResponses[0].text : item.journalEntry;
    // 計算總回應數
    const responseCount = newResponses.length;

    return (
        <div className="bg-stone-50 p-4 rounded-xl shadow-sm border border-stone-200 mb-3" onClick={() => {
            const event = new CustomEvent('noteSelected', { detail: item.id });
            window.dispatchEvent(event);
        }}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-[10px] font-bold text-stone-500 bg-stone-200 px-2 py-1 rounded">{item.category || "未分類"}</span>
                    <span className="text-[10px] text-stone-400 ml-2">{item.subcategory}</span>
                </div>
            </div>
            <h4 className="font-bold text-stone-800 mb-1">{item.title}</h4>
            <p className="text-xs text-stone-500 line-clamp-2">{item.content}</p>
            
            {displayResponse && (
                <div className="mt-3 pt-2 border-t border-stone-200">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] text-stone-400 font-bold flex items-center gap-1">
                            <PenLine className="w-3 h-3"/> 
                            {newResponses.length > 0 ? `最新回應 (${newResponses.length})` : "我的回應"}
                        </p>
                        {newResponses.length > 0 && <span className="text-[9px] text-stone-300">{new Date(newResponses[0].timestamp).toLocaleDateString()}</span>}
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
    const [isAnimating, setIsAnimating] = useState(false);
    
    const [favorites, setFavorites] = useState([]);
    const [allResponses, setAllResponses] = useState({}); 
    
    const [history, setHistory] = useState([]);
    const [recentIndices, setRecentIndices] = useState([]);
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
    
    // [新增] 分類結構地圖 { "大分類": ["次分類1", "次分類2"] }，用於保留空分類
    const [categoryMap, setCategoryMap] = useState({});

    // [同步] 當筆記更新時，將新的分類補入結構中 (只增不減，達成保留效果)
    useEffect(() => {
        setCategoryMap(prev => {
            const newMap = { ...prev };
            let hasChange = false;
            notes.forEach(n => {
                const c = n.category || "未分類";
                const s = n.subcategory || "一般";
                if (!newMap[c]) { newMap[c] = []; hasChange = true; }
                if (!newMap[c].includes(s)) { newMap[c].push(s); hasChange = true; }
            });
            return hasChange ? newMap : prev;
        });
    }, [notes]);

    // [存取] 持久化分類結構
    useEffect(() => {
        const savedMap = localStorage.getItem('echoScript_CategoryMap');
        if (savedMap) setCategoryMap(JSON.parse(savedMap));
    }, []);
    useEffect(() => { localStorage.setItem('echoScript_CategoryMap', JSON.stringify(categoryMap)); }, [categoryMap]);

    // [新增] 儲存 AllNotesModal 的內部導航層級狀態，用於支援 PopState
    const [allNotesViewLevel, setAllNotesViewLevel] = useState('categories'); // 'categories', 'subcategories', 'notes'
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

    // [新增] 追蹤本次會話是否有資料變更 (用於離線備份提示)
    const [hasDataChangedInSession, setHasDataChangedInSession] = useState(false);
    const hasDataChangedInSessionRef = useRef(false);

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
    
    // 1. 僅在開啟視窗時推入歷史紀錄 (移除首頁強制鎖定，解決無法退出問題)
    useEffect(() => {
        // 只有當視窗開啟時，我們才需要介入歷史紀錄 (這會讓編輯頁面有路可退，從而觸發攔截)
        const isAnyModalOpen = showMenuModal || showAllNotesModal || showEditModal || showResponseModal;
        if (isAnyModalOpen) {
            // [優化] 為 AllNotesModal 建立明確的歷史層級 'categories'
            const state = showAllNotesModal 
                ? { page: 'modal', level: 'categories', time: Date.now() }
                : { page: 'modal', time: Date.now() };
            window.history.pushState(state, '', '');
        }
    }, [showMenuModal, showAllNotesModal, showEditModal, showResponseModal]);

    // 2. 攔截返回鍵 (核心：真實歷史堆疊 + 狀態同步)
    useEffect(() => {
        const handlePopState = (event) => {
            // 如果已經確認要退出，就不再攔截任何返回動作，讓瀏覽器自然離開
            if (isExitingRef.current) return;

            // === A. 編輯中未存檔 ===
            if (hasUnsavedChangesRef.current) {
                setTimeout(() => window.history.pushState({ page: 'modal_trap', time: Date.now() }, '', ''), 0);
                setTimeout(() => {
                    if (confirm("編輯內容還未存檔，是否離開？")) {
                        setHasUnsavedChanges(false);
                        hasUnsavedChangesRef.current = false;
                        setShowMenuModal(false);
                        setShowAllNotesModal(false);
                        setAllNotesViewLevel('categories');
                        setShowEditModal(false);
                        setShowResponseModal(false);
                        setResponseViewMode('list');
                    }
                }, 20);
                return;
            }

            // === B. 視窗內導航 (編輯 -> 列表) ===
            if (showResponseModal && responseViewModeRef.current === 'edit') {
                setResponseViewMode('list');
                setTimeout(() => window.history.pushState({ page: 'modal', time: Date.now() }, '', ''), 0);
                return;
            }

            // === C. AllNotesModal 的三層導航邏輯 ===
            if (showAllNotesModal) {
                const destState = event.state || {};
                const currentLevel = allNotesViewLevelRef.current;

                // 1. 內部導航 (優先權最高)
                // 只要歷史紀錄裡有 level 標籤，代表我們還是在視窗內部的移動
                if (destState.level === 'notes') {
                    setAllNotesViewLevel('notes');
                    return;
                }
                if (destState.level === 'subcategories') {
                    setAllNotesViewLevel('subcategories');
                    return;
                }
                if (destState.level === 'categories') {
                    setAllNotesViewLevel('categories');
                    return;
                }

                // 2. 外部導航 (當歷史紀錄沒有 level 時，代表要退出了)
                
                // [防呆] 如果人還在深層 (次分類/筆記)，但歷史紀錄卻直接跳到了外面 (Root/Home)
                // 我們不直接關閉，而是先退回「大分類」，給使用者一種「返回上一層」的感覺
                if (currentLevel !== 'categories') {
                    setAllNotesViewLevel('categories');
                    return;
                }

                // [正常退出] 人在「大分類」，且沒有更上一層的 level 了 -> 關閉視窗回到首頁
                setShowAllNotesModal(false);
                setAllNotesViewLevel('categories');
                
                // [關鍵修復] 如果資料已變更，關閉視窗回到首頁後，需立刻補上一個歷史紀錄，防止下次按返回直接退出 App
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
                
                // [關鍵修復] 同上，回到首頁時補防護網
                if (hasDataChangedInSessionRef.current) {
                    window.history.pushState({ page: 'home_trap', changed: true, time: Date.now() }, '', '');
                }
                return;
            }

            // === E. 首頁退出 (Home -> Exit) ===
            // 檢查是否有資料變更，若有則提示備份
            if (hasDataChangedInSessionRef.current) {
                // 暫時阻止退出，將狀態推回去
                window.history.pushState({ page: 'home_trap', time: Date.now() }, '', '');
                
                if (confirm("您本次使用已更動過資料，離開前是否前往備份？")) {
                    setShowMenuModal(true);
                    setActiveTab('settings');
                    // 重置變更狀態，避免在備份頁面按返回時又跳出一次
                    setHasDataChangedInSession(false); 
                } else {
                    // 如果使用者按「取消」，代表他真的想走，但因為我們剛剛 pushState 了，
                    // 使用者需要再按一次返回鍵才能真正離開。
                    // 為了不讓使用者覺得卡住，這裡我們也可以選擇不做任何事，
                    // 讓他停留在首頁，或者您可以選擇清除狀態讓他下次直接走：
                    // setHasDataChangedInSession(false); // 如果希望按否之後下次直接退出，可解開這行
                }
                return;
            }

            // 不再攔截退出動作，讓瀏覽器自然返回上一頁 (或關閉 PWA)
            // 解決所有重複詢問與迴圈問題
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [showMenuModal, showAllNotesModal, showEditModal, showResponseModal]);
    
    useEffect(() => {
        try {
            const savedNotes = JSON.parse(localStorage.getItem('echoScript_AllNotes'));
            let finalNotes;
            
            // [修正] 只要是有效的陣列資料就信任它，不檢查 category 是否為空 (避免使用者新增無分類筆記時導致資料被誤刪)
            if (Array.isArray(savedNotes) && savedNotes.length > 0) {
                finalNotes = savedNotes;
            } else {
                console.log("偵測到無資料或格式錯誤，初始化為預設筆記...");
                finalNotes = INITIAL_NOTES;
                localStorage.setItem('echoScript_AllNotes', JSON.stringify(finalNotes));
                localStorage.removeItem('echoScript_History');
                setHistory([]); 
            }
            setNotes(finalNotes);
            setFavorites(JSON.parse(localStorage.getItem('echoScript_Favorites') || '[]'));
            setAllResponses(JSON.parse(localStorage.getItem('echoScript_AllResponses') || '{}'));
            
            setHistory(JSON.parse(localStorage.getItem('echoScript_History') || '[]'));
            setRecentIndices(JSON.parse(localStorage.getItem('echoScript_Recents') || '[]'));
            
            // [地基工程] 啟動時立刻檢查：洗牌堆是否健康？
            let loadedDeck = JSON.parse(localStorage.getItem('echoScript_ShuffleDeck') || '[]');
            let loadedPointer = parseInt(localStorage.getItem('echoScript_DeckPointer') || '0', 10);

            // [關鍵] 如果數量對不上 (例如剛清除快取)，立刻產生新的洗牌堆
            // 這能確保接下來的「新增」動作絕對安全，不會崩潰
            if (loadedDeck.length !== finalNotes.length) {
                console.log("初始化：偵測到洗牌堆與筆記數量不符，執行自動修復...");
                loadedDeck = Array.from({length: finalNotes.length}, (_, i) => i);
                // 執行全域洗牌
                for (let i = loadedDeck.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [loadedDeck[i], loadedDeck[j]] = [loadedDeck[j], loadedDeck[i]];
                }
                loadedPointer = 0;
            }

            setShuffleDeck(loadedDeck);
            setDeckPointer(loadedPointer);

            if (finalNotes.length > 0) {
                // [修改] 智慧初始化：檢查是否有「最後編輯」的筆記需要恢復
                const resumeId = localStorage.getItem('echoScript_ResumeNoteId');
                let idx = -1;
                
                if (resumeId) {
                    // 嘗試尋找該筆記的索引 (ID可能是數字或字串，轉型比較保險)
                    idx = finalNotes.findIndex(n => n.id == resumeId);
                }

                // 如果沒有要恢復的紀錄，或是找不到該筆記，則執行隨機抽取
                if (idx === -1) {
                    idx = Math.floor(Math.random() * finalNotes.length);
                }
                
                setCurrentIndex(idx);
                addToHistory(finalNotes[idx]);
            }
        } catch (e) { console.error("Init failed", e); }
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
    useEffect(() => { localStorage.setItem('echoScript_History', JSON.stringify(history)); }, [history]);
    useEffect(() => { localStorage.setItem('echoScript_Recents', JSON.stringify(recentIndices)); }, [recentIndices]);
    // [新增] 儲存洗牌狀態
    useEffect(() => { localStorage.setItem('echoScript_ShuffleDeck', JSON.stringify(shuffleDeck)); }, [shuffleDeck]);
    useEffect(() => { localStorage.setItem('echoScript_DeckPointer', deckPointer.toString()); }, [deckPointer]);

    const showNotification = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

    const addToHistory = (note) => {
        if(!note) return;
        const entry = { ...note, timestamp: new Date().toISOString(), displayId: Date.now() };
        setHistory(prev => [entry, ...prev].slice(0, 50));
    };

    const currentNote = notes[currentIndex];
    const isFavorite = favorites.some(f => f.id === (currentNote ? currentNote.id : null));
    const currentNoteResponses = currentNote ? (allResponses[currentNote.id] || []) : [];

    const handleNextNote = () => {
        if (notes.length <= 1) return;
        // [新增] 使用者主動切換卡片，代表已離開編輯情境，清除恢復標記
        localStorage.removeItem('echoScript_ResumeNoteId');
        
        setIsAnimating(true);
        setTimeout(() => {
            let currentDeck = [...shuffleDeck];
            let currentPointer = deckPointer;

            // 檢查是否需要重新洗牌：
            // 1. 牌堆是空的
            // 2. 牌堆長度與筆記總數不符 (可能有新增/刪除筆記)
            // 3. 指標已經指到最後一張了 (currentPointer >= currentDeck.length)
            if (currentDeck.length !== notes.length || currentPointer >= currentDeck.length) {
                // 建立新的索引陣列 [0, 1, 2, ... n-1]
                const newDeck = Array.from({length: notes.length}, (_, i) => i);
                
                // Fisher-Yates 洗牌演算法
                for (let i = newDeck.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
                }
                
                currentDeck = newDeck;
                currentPointer = 0;
                // 如果剛洗完牌的第一張剛好跟現在顯示的一樣，為了避免重複感，將第一張跟最後一張交換
                if (notes[currentDeck[0]].id === (currentNote ? currentNote.id : null)) {
                    [currentDeck[0], currentDeck[currentDeck.length - 1]] = [currentDeck[currentDeck.length - 1], currentDeck[0]];
                }
            }

            // 抽出下一張
            const newIndex = currentDeck[currentPointer];

            // 更新狀態
            setShuffleDeck(currentDeck);
            setDeckPointer(currentPointer + 1);

            // 為了支援「上一張」功能，我們仍然需要維護 recentIndices
            setRecentIndices(prev => {
                const updated = [newIndex, ...prev];
                // 這裡可以保留較多的歷史紀錄以便回溯
                if (updated.length > 50) updated.pop();
                return updated;
            });

            setCurrentIndex(newIndex);
            addToHistory(notes[newIndex]);
            
            setIsAnimating(false);
            window.scrollTo(0,0);
        }, 300);
    };

    // [新增] 回到上一張筆記
    const handlePreviousNote = () => {
        // [新增] 使用者主動切換卡片，清除恢復標記
        localStorage.removeItem('echoScript_ResumeNoteId');

        // 檢查是否有上一張紀錄 (recentIndices[0] 是當前，recentIndices[1] 是上一張)
        if (recentIndices.length < 2) {
            showNotification("沒有上一個筆記了");
            return;
        }

        setIsAnimating(true);
        setTimeout(() => {
            const prevIndex = recentIndices[1]; // 取得上一張的索引
            
            // 更新狀態：移除最上層的「當前」紀錄，退回到上一層
            setRecentIndices(prev => prev.slice(1));
            setCurrentIndex(prevIndex);
            
            // 為了讓歷史紀錄完整，這邊也可以選擇是否要再次加入 History Tab (視需求而定，這邊選擇加入以保持軌跡)
            addToHistory(notes[prevIndex]);

            setIsAnimating(false);
            window.scrollTo(0,0);
        }, 300);
    };

    const handleSaveNote = (updatedNote) => {
        const now = new Date().toISOString();
        let targetId;
        let nextNotes;
        
        // 取得當前的洗牌狀態 (因初始化已修復，保證正確)
        let nextDeck = [...shuffleDeck];
        let nextPointer = deckPointer;

        if (isCreatingNew) {
            // 1. 準備新筆記資料 (使用 modal 傳來的 ID 或當下產生)
            const newId = updatedNote.id || Date.now();
            const newNote = { ...updatedNote, id: newId, createdDate: now, modifiedDate: now };
            
            // 2. 更新筆記列表 (新筆記加入最前面，Index 變為 0)
            nextNotes = [newNote, ...notes];
            targetId = newId;
            
            // 3. [智慧插入] 
            
            // A. 【關鍵】原本洗牌堆裡的所有號碼都要 +1 (因為 0 號被新筆記拿走了)
            // 這就是確保 "9號" 會自動變成 "10號" 的關鍵代碼！
            nextDeck = nextDeck.map(i => i + 1);
            
            // B. 將新筆記 (Index 0) 隨機插入到「還沒抽完的未來牌堆」中
            const futureSlots = nextDeck.length - nextPointer;
            // 隨機選一個插入點 (範圍：目前指標位置 ~ 最後)
            // 確保新筆記一定會出現在未來，且不影響已經看過的歷史
            const insertOffset = Math.floor(Math.random() * (futureSlots + 1));
            const insertPos = nextPointer + insertOffset;
            
            nextDeck.splice(insertPos, 0, 0);
            
            setCurrentIndex(0); 
            showNotification("新筆記已建立");

        } else {
            // 修改模式：內容更新，順序不動
            const editedNote = { 
                ...updatedNote, 
                createdDate: updatedNote.createdDate || now, 
                modifiedDate: now 
            };
            nextNotes = notes.map(n => n.id === editedNote.id ? editedNote : n);
            setFavorites(prev => prev.map(f => f.id === editedNote.id ? { ...f, ...editedNote } : f));
            targetId = editedNote.id;
            
            showNotification("筆記已更新");
        }
        
        // 4. 同步更新所有狀態與儲存
        setNotes(nextNotes);
        setShuffleDeck(nextDeck);
        setDeckPointer(nextPointer);
        
        localStorage.setItem('echoScript_AllNotes', JSON.stringify(nextNotes));
        localStorage.setItem('echoScript_ShuffleDeck', JSON.stringify(nextDeck));
        localStorage.setItem('echoScript_DeckPointer', nextPointer.toString());
        localStorage.setItem('echoScript_ResumeNoteId', String(targetId));
        
        setHasDataChangedInSession(true); // [新增] 標記資料已變更
        setShowEditModal(false);
    };

    const handleDeleteNote = (id) => {
        if (confirm("確定要刪除這則筆記嗎？此動作無法復原。")) {
            // 1. 先找出這張筆記「刪除前」的 Index
            const deletedIndex = notes.findIndex(n => n.id === id);

            // 2. 執行刪除 (更新筆記列表)
            const newNotes = notes.filter(n => n.id !== id);
            setNotes(newNotes);
            
            // 3. 處理畫面顯示
            if (currentNote && currentNote.id === id) {
                const nextIdx = newNotes.length > 0 ? 0 : -1;
                setCurrentIndex(nextIdx);
            }

            // 4. [智慧校正] 
            if (deletedIndex !== -1) {
                // A. 修正洗牌堆：
                //    - 移除被刪除的 index
                //    - 所有 > deletedIndex 的號碼都 -1 (因為陣列縮短了)
                const newDeck = shuffleDeck
                    .filter(i => i !== deletedIndex)
                    .map(i => i > deletedIndex ? i - 1 : i);

                // B. 修正指標：
                //    如果被刪除的牌是在「過去」(指標之前)，指標需要 -1，才不會跳過下一張
                const indexInDeck = shuffleDeck.indexOf(deletedIndex);
                let newPointer = deckPointer;
                
                if (indexInDeck !== -1 && indexInDeck < deckPointer) {
                    newPointer = Math.max(0, deckPointer - 1);
                }
                newPointer = Math.min(newPointer, newDeck.length);

                // C. 寫入狀態與硬碟
                setShuffleDeck(newDeck);
                setDeckPointer(newPointer);
                localStorage.setItem('echoScript_ShuffleDeck', JSON.stringify(newDeck));
                localStorage.setItem('echoScript_DeckPointer', newPointer.toString());
            }
            
            // 確保資料庫同步
            localStorage.setItem('echoScript_AllNotes', JSON.stringify(newNotes));

            setHasDataChangedInSession(true); // [新增] 標記資料已變更
            showNotification("筆記已刪除");
        }
    };

    const handleToggleFavorite = () => {
        if (isFavorite) {
            setFavorites(prev => prev.filter(f => f.id !== currentNote.id));
            showNotification("已移除收藏");
        } else {
            setFavorites(prev => [currentNote, ...prev]);
            showNotification("已加入收藏");
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
            newNoteResponses = [newResponse, ...noteResponses];
        }

        const nextAllResponses = { ...prevResponses, [currentNote.id]: newNoteResponses };
        
        // 更新 React 狀態
        setAllResponses(nextAllResponses);
        
        // [關鍵修正] 強制同步寫入 LocalStorage
        localStorage.setItem('echoScript_AllResponses', JSON.stringify(nextAllResponses));
        // [新增] 只要有編輯或新增回應，就表示使用者正在關注此筆記，鎖定它！
        localStorage.setItem('echoScript_ResumeNoteId', currentNote.id);

        setHasDataChangedInSession(true); // [新增] 標記資料已變更
        showNotification("回應已儲存");
    };

    const handleDeleteResponse = (responseId) => {
        if(confirm("確定要刪除這則回應嗎？")) {
            setAllResponses(prev => {
                const noteResponses = prev[currentNote.id] || [];
                const newNoteResponses = noteResponses.filter(r => r.id !== responseId);
                return { ...prev, [currentNote.id]: newNoteResponses };
            });
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
        <div className="min-h-screen bg-stone-50 text-stone-800 font-sans pb-20">
            <nav className="sticky top-0 z-30 bg-stone-50/90 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-stone-200/50">
                <div className="flex items-center gap-2">
                    <img src="icon.png" className="w-8 h-8 rounded-lg object-cover" alt="App Icon" />
                    <h1 className="text-lg font-bold tracking-tight text-stone-800">EchoScript</h1>
                </div>
                <div className="flex gap-2">
                     <button onClick={() => { setIsCreatingNew(true); setShowEditModal(true); }} className="bg-white border border-stone-200 text-stone-600 p-2 rounded-full shadow-sm active:bg-stone-100" title="新增筆記">
                        <Plus className="w-5 h-5" />
                    </button>
                    <button onClick={() => { setShowAllNotesModal(true); setAllNotesViewLevel('categories'); }} className="bg-white border border-stone-200 text-stone-600 p-2 rounded-full shadow-sm active:bg-stone-100" title="所有筆記">
                        <List className="w-5 h-5" />
                    </button>
                    <button onClick={handleNextNote} disabled={isAnimating || notes.length <= 1} className="bg-[#2c3e50] text-stone-50 px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-stone-300 active:scale-95 transition-transform flex items-center gap-2">
                        <RefreshCw className={`w-3 h-3 ${isAnimating ? 'animate-spin' : ''}`}/> 下一張
                    </button>
                </div>
            </nav>

            <main className="px-6 py-6 max-w-lg mx-auto" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                {currentNote ? (
                    <div className={`transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                        {/* 主卡片區域 (包含內容與按鈕) */}
                        <div className="bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden relative min-h-[400px] flex flex-col">
                            
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="mb-2">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <div className="flex items-baseline gap-2 text-sm font-bold text-stone-400 tracking-widest uppercase">
                                            <h2>{currentNote.category || "未分類"}</h2>
                                            <span className="text-stone-300">|</span>
                                            <h3>{currentNote.subcategory}</h3>
                                        </div>
                                        <span className="text-xs text-stone-300 font-sans">#{currentNote.id}</span>
                                    </div>
                                </div>
                                
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-stone-900 mb-4">{currentNote.title}</h1>
                                    
                                    {/* 日期顯示區 - 移至主旨語下方 */}
                                    <div className="flex gap-4 mb-6 text-[10px] text-stone-400 font-mono border-y border-stone-100 py-2 w-full">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> 建立日期: {currentNote.createdDate ? new Date(currentNote.createdDate).toLocaleDateString() : '預設資料'}</span>
                                        <span className="flex items-center gap-1"><Edit className="w-3 h-3"/> 修改日期: {currentNote.modifiedDate ? new Date(currentNote.modifiedDate).toLocaleDateString() : (currentNote.createdDate ? new Date(currentNote.createdDate).toLocaleDateString() : '預設資料')}</span>
                                    </div>

                                    <div className="-mt-5 text-lg leading-loose text-stone-700 font-sans text-justify whitespace-pre-wrap">
                                        <MarkdownRenderer content={currentNote.content} />
                                    </div>
                                </div>
                            </div>

                            {/* 操作按鈕區 (位於卡片內部底部) */}
                            <div className="bg-stone-50 px-12 py-4 border-t border-stone-100 flex justify-between items-center">
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

                                <button onClick={handleToggleFavorite} className="flex flex-col items-center gap-1 text-stone-400 hover:scale-110 transition-transform duration-200">
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
            
            <button onClick={() => setShowMenuModal(true)} className="fixed bottom-6 right-6 bg-white border border-stone-200 text-stone-600 p-3 rounded-full shadow-lg active:scale-95 z-20">
                <BookOpen className="w-6 h-6" />
            </button>

            {showMenuModal && (
                <div className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm flex justify-end" onClick={(e) => { if(e.target === e.currentTarget) setShowMenuModal(false); }}>
                    <div className="w-full max-w-sm bg-stone-50 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-5 border-b border-stone-200 bg-white flex justify-between items-center">
                            <h2 className="font-bold text-lg">我的資料庫</h2>
                            <button onClick={() => setShowMenuModal(false)}><X className="w-6 h-6 text-gray-400" /></button>
                        </div>
                       <div className="flex p-2 gap-2 bg-white border-b border-stone-100">
                            {['favorites', 'history', 'settings'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === tab ? 'bg-[#2c3e50] text-white' : 'text-stone-500 hover:bg-stone-100'}`}>
                                    {tab === 'favorites' ? '收藏筆記' : tab === 'history' ? '歷史紀錄' : '備份設定'}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {activeTab === 'favorites' && favorites.map(item => (
                                <NoteListItem 
                                    key={item.id} 
                                    item={item} 
                                    allResponses={allResponses} 
                                />
                            ))}
                            {activeTab === 'favorites' && favorites.length === 0 && <div className="text-center text-stone-400 mt-10 text-xs">暫無收藏</div>}
                            
                            {activeTab === 'history' && history.map((item, i) => (
                                <NoteListItem 
                                    key={i} 
                                    item={item} 
                                    isHistory 
                                    allResponses={allResponses} 
                                />
                            ))}
                            
                            {activeTab === 'settings' && (
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-xl border border-stone-200">
                                        <h3 className="font-bold mb-2 flex items-center gap-2"><Download className="w-4 h-4"/> 匯出資料</h3>
                                        <p className="text-xs text-gray-500 mb-3">包含所有新增的筆記與回應。</p>
                                        <button onClick={handleBackup} className="w-full bg-stone-100 text-stone-800 text-sm font-bold py-2 rounded-lg border border-stone-200">下載 JSON</button>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-stone-200">
                                        <h3 className="font-bold mb-2 flex items-center gap-2"><Upload className="w-4 h-4"/> 匯入資料</h3>
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
                />
            )}

            {showAllNotesModal && (
                <AllNotesModal 
                    notes={notes}
                    setNotes={setNotes} 
                    categoryMap={categoryMap}
                    setCategoryMap={setCategoryMap}
                    setHasDataChangedInSession={setHasDataChangedInSession} // [新增] 傳遞狀態設定器
                    // 關閉時重置狀態
                    onClose={() => { 
                        setShowAllNotesModal(false); 
                        setAllNotesViewLevel('categories'); 
                    }}
                    onItemClick={(item) => {
                        const idx = notes.findIndex(n => n.id === item.id);
                        if(idx !== -1) {
                            setCurrentIndex(idx);
                            setShowAllNotesModal(false);
                            setAllNotesViewLevel('categories'); // 關閉時重置狀態
                            window.scrollTo(0,0);
                        }
                    }}
                    onDelete={handleDeleteNote}
                    // 傳遞狀態與設定器
                    viewLevel={allNotesViewLevel}
                    setViewLevel={setAllNotesViewLevel}
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
                />
            )}

            {notification && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#2c3e50] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-2 z-50">
                    {notification}
                </div>
            )}
        </div>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<ErrorBoundary><EchoScriptApp /></ErrorBoundary>);

























































































































