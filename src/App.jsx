import React, { useMemo, useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  Archive, CheckCircle2, Clock, Download, Eye, FileQuestion, FileText,
  FileUp, Globe2, Languages, Layers3, Lock, Mail, MessageCircle,
  Presentation, Scissors, Search, ShieldCheck, Sparkles, Trash2, Wand2,
  Zap, BookOpenCheck, SplitSquareHorizontal, X
} from "lucide-react";

const tools = [
  { id: "pdf-translator", title: "PDF Translator", ar: "ترجمة PDF", icon: Languages, status: "Beta", category: "AI", desc: "Beta translation for small text-based PDFs.", arDesc: "ترجمة تجريبية لملفات PDF النصية الصغيرة." },
  { id: "word-translator", title: "Word Translator", ar: "ترجمة Word", icon: Languages, status: "Beta", category: "AI", desc: "Translate DOCX documents with smart paragraph handling.", arDesc: "ترجمة ملفات DOCX الصغيرة مع معالجة ذكية للفقرات." },
  { id: "pdf-summarizer", title: "PDF Summarizer", ar: "تلخيص PDF", icon: Sparkles, status: "Available", category: "AI", desc: "Get a summary and key points from text-based PDFs.", arDesc: "احصل على ملخص واضح ونقاط مهمة من ملفات PDF النصية." },
  { id: "extract-questions", title: "Extract Questions", ar: "استخراج أسئلة", icon: FileQuestion, status: "Beta", category: "AI", desc: "Turn study files into review questions.", arDesc: "حوّل ملفات الدراسة إلى أسئلة مراجعة." },
  { id: "study-mode", title: "Student Mode", ar: "وضع الطالب", icon: BookOpenCheck, status: "Beta", category: "AI", desc: "Summary, key terms, questions, and notes.", arDesc: "ملخص، مصطلحات، أسئلة، وملاحظات مراجعة." },
  { id: "compare-view", title: "Original vs Output", ar: "مقارنة قبل وبعد", icon: SplitSquareHorizontal, status: "Coming Soon", category: "AI", desc: "Preview original and output side by side.", arDesc: "معاينة المحتوى الأصلي والنتيجة جنبًا إلى جنب." },
  { id: "create-ppt", title: "Create PowerPoint", ar: "توليد عرض", icon: Presentation, status: "Coming Soon", category: "AI", desc: "Generate slides from text or PDF.", arDesc: "توليد عرض تقديمي من نص أو PDF." },
  { id: "word-to-pdf", title: "Word to PDF", ar: "Word إلى PDF", icon: FileText, status: "Available", category: "Convert", desc: "Convert DOCX files into PDF documents.", arDesc: "حوّل ملفات DOCX إلى PDF." },
  { id: "pdf-to-word", title: "PDF to Word", ar: "PDF إلى Word", icon: FileText, status: "Coming Soon", category: "Convert", desc: "Convert PDFs into editable Word files.", arDesc: "حوّل PDF إلى ملف Word قابل للتعديل." },
  { id: "pdf-to-ppt", title: "PDF to PowerPoint", ar: "PDF إلى PowerPoint", icon: Presentation, status: "Coming Soon", category: "Convert", desc: "Convert PDFs into editable slides.", arDesc: "حوّل PDF إلى شرائح قابلة للتعديل." },
  { id: "ppt-to-pdf", title: "PowerPoint to PDF", ar: "PowerPoint إلى PDF", icon: Presentation, status: "Coming Soon", category: "Convert", desc: "Export presentations into PDFs.", arDesc: "حوّل العروض التقديمية إلى PDF." },
  { id: "merge-pdf", title: "Merge PDF", ar: "دمج PDF", icon: Archive, status: "Available", category: "PDF", desc: "Combine multiple PDFs in your browser.", arDesc: "ادمج أكثر من ملف PDF مباشرة داخل المتصفح." },
  { id: "split-pdf", title: "Split PDF", ar: "تقسيم PDF", icon: Scissors, status: "Available", category: "PDF", desc: "Extract selected pages into a new PDF.", arDesc: "استخرج صفحات محددة في ملف PDF جديد." },
  { id: "compress-pdf", title: "Compress PDF", ar: "ضغط PDF", icon: Archive, status: "Beta", category: "PDF", desc: "Reduce file size for easier sharing.", arDesc: "قلّل حجم الملف لتسهيل مشاركته." },
];
const categories = ["All", "AI", "Convert", "PDF"];

function saveBlob(bytes, fileName) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function parsePages(input, totalPages, isRTL) {
  const result = [];
  const chunks = input.split(",").map((x) => x.trim()).filter(Boolean);
  if (!chunks.length) throw new Error(isRTL ? "اكتب الصفحات المطلوبة." : "Enter the pages you want.");
  for (const chunk of chunks) {
    if (chunk.includes("-")) {
      const [startRaw, endRaw] = chunk.split("-").map((x) => Number(x.trim()));
      if (!startRaw || !endRaw || startRaw > endRaw) throw new Error(isRTL ? "صيغة الصفحات غير صحيحة." : "Invalid page range.");
      for (let p = startRaw; p <= endRaw; p++) result.push(p);
    } else {
      const page = Number(chunk);
      if (!page) throw new Error(isRTL ? "صيغة الصفحات غير صحيحة." : "Invalid page number.");
      result.push(page);
    }
  }
  const unique = [...new Set(result)];
  if (unique.some((p) => p < 1 || p > totalPages)) throw new Error(isRTL ? `أدخل صفحات بين 1 و ${totalPages}.` : `Enter pages between 1 and ${totalPages}.`);
  return unique.map((p) => p - 1);
}

function InfoModal({ type, lang, onClose }) {
  if (!type) return null;
  const isRTL = lang === "ar";
  const content = {
    privacy: { icon: ShieldCheck, title: isRTL ? "سياسة الخصوصية" : "Privacy Policy", body: isRTL ? ["نستخدم الملفات فقط لتنفيذ الأداة التي تختارها.", "أدوات PDF الحالية تعمل داخل المتصفح ولا ترفع الملفات إلى خادم.", "لا نستخدم محتوى ملفاتك لتدريب النماذج."] : ["We use uploaded files only to perform the selected tool.", "The current PDF tools run in your browser without server upload.", "We do not use your document content to train models."] },
    terms: { icon: FileText, title: isRTL ? "شروط الاستخدام" : "Terms of Use", body: isRTL ? ["DocLingo AI حاليًا في نسخة تجريبية.", "راجع النتائج قبل الاستخدام الرسمي.", "ارفع الملفات التي تملك حق استخدامها فقط."] : ["DocLingo AI is currently in beta.", "Review outputs before official use.", "Only upload files you have rights to process."] },
    contact: { icon: MessageCircle, title: isRTL ? "تواصل معنا" : "Contact Us", body: isRTL ? ["للاقتراحات أو الإبلاغ عن مشكلة، استخدم زر الانضمام للنسخة التجريبية.", "سنضيف نموذج تواصل كامل لاحقًا."] : ["For suggestions or issue reports, use the beta access button.", "A full contact form will be added later."] },
  }[type];
  const Icon = content.icon;
  return <div className="modal-backdrop" onClick={onClose}><div className="modal" dir={isRTL ? "rtl" : "ltr"} onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X size={18} /></button><div className="modal-icon"><Icon size={24} /></div><h2>{content.title}</h2><ul className="info-list">{content.body.map((item, index) => <li key={index}>{item}</li>)}</ul><button className="btn btn-primary full" onClick={onClose}>{isRTL ? "موافق" : "Got it"}</button></div></div>;
}

function BetaModal({ lang, onClose }) {
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const isRTL = lang === "ar";
  return <div className="modal-backdrop" onClick={onClose}><div className="modal" dir={isRTL ? "rtl" : "ltr"} onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X size={18} /></button>{saved ? <><div className="modal-icon success"><CheckCircle2 size={24} /></div><h2>{isRTL ? "تم تسجيل اهتمامك" : "You're on the beta list"}</h2><p className="muted">{isRTL ? "سنربط النموذج بقاعدة بيانات في المرحلة القادمة." : "This form will connect to a database in the next phase."}</p><button className="btn btn-primary full" onClick={onClose}>{isRTL ? "تمام" : "Done"}</button></> : <><div className="modal-icon"><Mail size={24} /></div><h2>{isRTL ? "انضم للوصول المبكر" : "Join early access"}</h2><p className="muted">{isRTL ? "سجّل بريدك لتكون من أوائل المستخدمين عند تفعيل أدوات جديدة." : "Enter your email to be among the first users when new tools go live."}</p><input className="modal-input" type="email" placeholder={isRTL ? "بريدك الإلكتروني" : "Your email"} value={email} onChange={(e) => setEmail(e.target.value)} /><button className="btn btn-primary full" onClick={() => setSaved(true)} disabled={!email.includes("@")}>{isRTL ? "انضم للقائمة" : "Join list"}</button></>}</div></div>;
}

function MergePdfModal({ lang, onClose }) {
  const isRTL = lang === "ar";
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function mergeFiles() {
    setError("");
    if (files.length < 2) return setError(isRTL ? "اختر ملفين PDF على الأقل." : "Choose at least two PDF files.");
    try {
      setBusy(true);
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      saveBlob(await mergedPdf.save(), "doclingo-merged.pdf");
    } catch (err) { setError(err.message || (isRTL ? "تعذر دمج الملفات." : "Could not merge files.")); }
    finally { setBusy(false); }
  }
  return <div className="modal-backdrop" onClick={onClose}><div className="modal" dir={isRTL ? "rtl" : "ltr"} onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X size={18} /></button><div className="modal-icon"><Archive size={24} /></div><h2>{isRTL ? "دمج PDF" : "Merge PDF"}</h2><p className="muted">{isRTL ? "اختر ملفين PDF أو أكثر. يمكنك إضافتها مرة واحدة أو ملفًا بعد ملف." : "Choose two or more PDFs. You can add them all at once or one by one."}</p><input className="modal-input" type="file" accept="application/pdf,.pdf" multiple onChange={(e) => { const selectedFiles = Array.from(e.target.files || []); setFiles((previous) => [...previous, ...selectedFiles]); e.target.value = ""; }} />{files.length > 0 && <div className="file-list">{files.map((file, idx) => <div key={file.name + idx}><CheckCircle2 size={15} /> {file.name}</div>)}</div>}{files.length > 0 && <button className="btn btn-secondary full" onClick={() => { setFiles([]); setError(""); }}>{isRTL ? "مسح الملفات المختارة" : "Clear selected files"}</button>}{error && <div className="error-note">{error}</div>}<button className="btn btn-primary full" onClick={mergeFiles} disabled={busy}>{busy ? (isRTL ? "جاري الدمج..." : "Merging...") : (isRTL ? "دمج وتحميل" : "Merge and download")}</button></div></div>;
}

function SplitPdfModal({ lang, onClose }) {
  const isRTL = lang === "ar";
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState("1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function splitFile() {
    setError("");
    if (!file) return setError(isRTL ? "اختر ملف PDF أولًا." : "Choose a PDF file first.");
    try {
      setBusy(true);
      const srcPdf = await PDFDocument.load(await file.arrayBuffer());
      const selectedPageIndexes = parsePages(pages, srcPdf.getPageCount(), isRTL);
      const newPdf = await PDFDocument.create();
      const copied = await newPdf.copyPages(srcPdf, selectedPageIndexes);
      copied.forEach((page) => newPdf.addPage(page));
      saveBlob(await newPdf.save(), "doclingo-split.pdf");
    } catch (err) { setError(err.message || (isRTL ? "تعذر تقسيم الملف." : "Could not split file.")); }
    finally { setBusy(false); }
  }
  return <div className="modal-backdrop" onClick={onClose}><div className="modal" dir={isRTL ? "rtl" : "ltr"} onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X size={18} /></button><div className="modal-icon"><Scissors size={24} /></div><h2>{isRTL ? "تقسيم PDF" : "Split PDF"}</h2><p className="muted">{isRTL ? "اختر ملف PDF ثم اكتب الصفحات المطلوبة مثل: 1-3 أو 2,5,7." : "Choose a PDF file, then enter pages like: 1-3 or 2,5,7."}</p><input className="modal-input" type="file" accept="application/pdf,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />{file && <div className="file-list"><div><CheckCircle2 size={15} /> {file.name}</div></div>}<input className="modal-input" value={pages} onChange={(e) => setPages(e.target.value)} placeholder={isRTL ? "مثال: 1-3,5" : "Example: 1-3,5"} />{error && <div className="error-note">{error}</div>}<button className="btn btn-primary full" onClick={splitFile} disabled={busy}>{busy ? (isRTL ? "جاري التقسيم..." : "Splitting...") : (isRTL ? "تقسيم وتحميل" : "Split and download")}</button></div></div>;
}

function ToolModal({ selectedTool, lang, onClose }) {
  if (!selectedTool) return null;
  if (selectedTool.id === "merge-pdf") return <MergePdfModal lang={lang} onClose={onClose} />;
  if (selectedTool.id === "split-pdf") return <SplitPdfModal lang={lang} onClose={onClose} />;
  const isRTL = lang === "ar";
  const comingSoon = selectedTool.status === "Coming Soon";
  return <div className="modal-backdrop" onClick={onClose}><div className="modal" dir={isRTL ? "rtl" : "ltr"} onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={onClose}><X size={18} /></button><div className="modal-icon"><selectedTool.icon size={24} /></div><h2>{isRTL ? selectedTool.ar : selectedTool.title}</h2><p className="muted">{comingSoon ? (isRTL ? "هذه الأداة قادمة قريبًا." : "This tool is coming soon.") : (isRTL ? "هذه الأداة في النسخة التجريبية وسيتم تفعيلها قريبًا." : "This tool is in beta and will be activated soon.")}</p><div className="result-box"><CheckCircle2 size={18} /><span>{isRTL ? "تم تجهيز الواجهة وربط المعالجة هو الخطوة التالية" : "The interface is ready; backend processing is next"}</span></div><button className="btn btn-primary full" onClick={onClose}>{isRTL ? "تمام" : "Got it"}</button></div></div>;
}

function ToolCard({ tool, lang, onTry, onJoinBeta }) {
  const Icon = tool.icon;
  const isComingSoon = tool.status === "Coming Soon";
  return <article className="tool-card fade-in"><div className="tool-header"><div className="tool-icon"><Icon size={20} /></div><span className={`status ${tool.status.toLowerCase().replaceAll(" ", "-")}`}>{tool.status}</span></div><div className="tool-body"><h3>{lang === "ar" ? tool.ar : tool.title}</h3><p>{lang === "ar" ? tool.arDesc : tool.desc}</p></div><div className="tool-actions"><button className="btn btn-primary full" onClick={() => onTry(tool)}>{isComingSoon ? (lang === "ar" ? "تفاصيل" : "Details") : (lang === "ar" ? "جرّب الآن" : "Try now")}</button>{isComingSoon && <button className="btn btn-secondary" onClick={onJoinBeta}>{lang === "ar" ? "نبّهني" : "Notify"}</button>}</div></article>;
}

export default function App() {
  const [lang, setLang] = useState("en");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [uploaded, setUploaded] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [infoModal, setInfoModal] = useState(null);
  const [betaOpen, setBetaOpen] = useState(false);
  const isRTL = lang === "ar";
  const filteredTools = useMemo(() => tools.filter((tool) => { const q = query.trim().toLowerCase(); return (category === "All" || tool.category === category) && (!q || tool.title.toLowerCase().includes(q) || tool.ar.includes(q)); }), [category, query]);
  return <div className="app" dir={isRTL ? "rtl" : "ltr"}><div className="beta-banner">{isRTL ? "نسخة تجريبية — يتم تفعيل الأدوات تدريجيًا مع الحفاظ على الخصوصية." : "Beta version — tools are being activated gradually with privacy-first processing."}</div><header className="site-header"><div className="container header-inner"><div className="brand"><div className="brand-mark"><Wand2 size={20} /></div><div><strong>DocLingo AI</strong><small>doclingo-ai.netlify.app</small></div></div><div className="header-actions"><button className="btn btn-secondary" onClick={() => setLang(lang === "en" ? "ar" : "en")}><Globe2 size={16} /> {lang === "en" ? "العربية" : "English"}</button><button className="btn btn-primary hide-mobile" onClick={() => setBetaOpen(true)}>{isRTL ? "انضم للنسخة التجريبية" : "Join beta"}</button></div></div></header><main><section className="hero container"><div className="hero-copy slide-up"><span className="pill">{isRTL ? "وصول مجاني للنسخة التجريبية للمستخدمين الأوائل" : "Free beta access for early users"}</span><h1>{isRTL ? "ترجم، حوّل، ولخّص ملفاتك بالذكاء الاصطناعي" : "Translate, convert, and summarize documents with AI"}</h1><p>{isRTL ? "منصة عالمية لأدوات PDF وWord وPowerPoint. سريعة، بسيطة، وتركّز على الخصوصية بحذف الملفات تلقائيًا بعد المعالجة." : "A global document toolkit for PDF, Word, and PowerPoint. Fast, simple, and privacy-focused with automatic file deletion after processing."}</p><div className="hero-buttons"><a href="#upload" className="btn btn-primary large"><FileUp size={18} /> {isRTL ? "ارفع ملفك الآن" : "Upload your file"}</a><a href="#tools" className="btn btn-secondary large"><Eye size={18} /> {isRTL ? "شاهد الأدوات" : "Explore tools"}</a></div><div className="trust-grid"><div><ShieldCheck size={16} /> {isRTL ? "حذف تلقائي" : "Auto deletion"}</div><div><Lock size={16} /> {isRTL ? "تشفير أثناء الرفع" : "Encrypted upload"}</div><div><Clock size={16} /> {isRTL ? "معالجة محدودة مجانًا" : "Limited free processing"}</div></div></div><div className="upload-card slide-up" id="upload"><div className="dropzone"><FileUp size={46} /><h2>{isRTL ? "جرّب نموذج الرفع" : "Try the upload flow"}</h2><p>{isRTL ? "اختر ملف PDF أو Word أو PowerPoint للتجربة." : "Choose a PDF, Word, or PowerPoint file for the beta demo."}</p><input type="file" onChange={(e) => setUploaded(e.target.files?.[0]?.name || null)} />{uploaded && <div className="file-selected"><CheckCircle2 size={16} /> {uploaded}</div>}</div><div className="quick-actions"><button className="btn btn-secondary" onClick={() => setSelectedTool(tools.find((t) => t.id === "pdf-summarizer"))}><Sparkles size={16} /> {isRTL ? "تلخيص" : "Summarize"}</button><button className="btn btn-secondary" onClick={() => setSelectedTool(tools.find((t) => t.id === "split-pdf"))}><Scissors size={16} /> {isRTL ? "تقسيم PDF" : "Split PDF"}</button><button className="btn btn-secondary" onClick={() => setSelectedTool(tools.find((t) => t.id === "merge-pdf"))}><Download size={16} /> {isRTL ? "دمج PDF" : "Merge PDF"}</button></div><div className="privacy-note"><div><strong>{isRTL ? "خصوصية من البداية" : "Private by design"}</strong><p>{isRTL ? "أدوات PDF الحالية تعمل داخل المتصفح بدون رفع الملفات." : "Current PDF tools run in the browser without uploading files."}</p></div><Trash2 size={20} /></div></div></section><section className="container tools-section" id="tools"><div className="section-head"><div><h2>{isRTL ? "كل أدوات المستندات في مكان واحد" : "All document tools in one place"}</h2><p>{isRTL ? "متاح، تجريبي، وقادم قريبًا — واجهة مشروع عالمي جاهز للتوسع." : "Available, beta, and coming soon — a global product interface ready to scale."}</p></div><div className="filters"><label className="search-box"><Search size={16} /><input placeholder={isRTL ? "ابحث عن أداة" : "Search tools"} value={query} onChange={(e) => setQuery(e.target.value)} /></label><div className="tabs">{categories.map((cat) => <button key={cat} className={category === cat ? "active" : ""} onClick={() => setCategory(cat)}>{cat}</button>)}</div></div></div><div className="tools-grid">{filteredTools.map((tool) => <ToolCard key={tool.id} tool={tool} lang={lang} onTry={setSelectedTool} onJoinBeta={() => setBetaOpen(true)} />)}</div></section><section className="container features-grid"><div className="feature-card"><ShieldCheck size={32} /><h3>{isRTL ? "خصوصية واضحة" : "Clear privacy"}</h3><p>{isRTL ? "دمج وتقسيم PDF يعملان داخل المتصفح. أدوات الذكاء الاصطناعي ستعمل لاحقًا بحدود واضحة." : "Merge and Split PDF run in the browser. AI tools will be enabled later with clear limits."}</p></div><div className="feature-card"><Zap size={32} /><h3>{isRTL ? "تجربة سريعة" : "Fast experience"}</h3><p>{isRTL ? "واجهة بسيطة: اختر الأداة، ارفع الملف، ثم حمّل النتيجة." : "Simple flow: choose a tool, upload files, then download the result."}</p></div><div className="feature-card"><Layers3 size={32} /><h3>{isRTL ? "جاهز للتوسع" : "Ready to scale"}</h3><p>{isRTL ? "واجهة إنجليزية وعربية كبداية، مع قابلية إضافة لغات وصفحات SEO لكل أداة." : "English and Arabic first, with room for more languages and SEO pages per tool."}</p></div></section></main><footer className="site-footer"><div className="container footer-inner"><span>© 2026 DocLingo AI. Built for beta launch.</span><nav><button onClick={() => setInfoModal("privacy")}>Privacy</button><button onClick={() => setInfoModal("terms")}>Terms</button><button onClick={() => setInfoModal("contact")}>Contact</button></nav></div></footer><ToolModal selectedTool={selectedTool} lang={lang} onClose={() => setSelectedTool(null)} /><InfoModal type={infoModal} lang={lang} onClose={() => setInfoModal(null)} />{betaOpen && <BetaModal lang={lang} onClose={() => setBetaOpen(false)} />}</div>;
}
