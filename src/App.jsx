import React, { useMemo, useState } from "react";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import {
  Archive, BookOpenCheck, CheckCircle2, Clock, Download, Eye, FileQuestion,
  FileText, FileUp, Globe2, Languages, Layers3, Lock, Mail, MessageCircle,
  Presentation, RotateCw, Scissors, Search, ShieldCheck, Sparkles, Trash2,
  Wand2, X
} from "lucide-react";

const categories = ["All", "PDF", "AI", "Convert"];

const tools = [
  { id: "merge-pdf", title: "Merge PDF", ar: "دمج PDF", icon: Archive, status: "Available", category: "PDF", desc: "Combine multiple PDF files in your browser.", arDesc: "ادمج أكثر من ملف PDF مباشرة داخل المتصفح." },
  { id: "split-pdf", title: "Split PDF", ar: "تقسيم PDF", icon: Scissors, status: "Available", category: "PDF", desc: "Extract selected pages into a new PDF.", arDesc: "استخرج صفحات محددة في ملف PDF جديد." },
  { id: "remove-pages", title: "Remove Pages", ar: "حذف صفحات", icon: Trash2, status: "Available", category: "PDF", desc: "Remove unwanted pages from a PDF.", arDesc: "احذف صفحات غير مرغوبة من ملف PDF." },
  { id: "rotate-pdf", title: "Rotate PDF", ar: "تدوير PDF", icon: RotateCw, status: "Available", category: "PDF", desc: "Rotate all pages or selected pages.", arDesc: "دوّر كل صفحات PDF أو صفحات محددة." },
  { id: "reorder-pages", title: "Reorder Pages", ar: "ترتيب الصفحات", icon: FileText, status: "Available", category: "PDF", desc: "Reorder pages using a custom order like 3,1,2.", arDesc: "أعد ترتيب الصفحات بترتيب مخصص مثل 3,1,2." },
  { id: "page-numbers", title: "Add Page Numbers", ar: "ترقيم الصفحات", icon: FileQuestion, status: "Available", category: "PDF", desc: "Add page numbers to the bottom of each page.", arDesc: "أضف أرقام صفحات أسفل كل صفحة." },
  { id: "pdf-summarizer", title: "PDF Summarizer", ar: "تلخيص PDF", icon: Sparkles, status: "Beta", category: "AI", desc: "AI summary workflow interface.", arDesc: "واجهة تجريبية لتلخيص PDF بالذكاء الاصطناعي." },
  { id: "extract-questions", title: "Extract Questions", ar: "استخراج أسئلة", icon: FileQuestion, status: "Beta", category: "AI", desc: "Create review questions from study files.", arDesc: "إنشاء أسئلة مراجعة من ملفات الدراسة." },
  { id: "student-mode", title: "Student Mode", ar: "وضع الطالب", icon: BookOpenCheck, status: "Beta", category: "AI", desc: "Summary, key terms, questions, and revision notes.", arDesc: "ملخص، مصطلحات، أسئلة، وملاحظات مراجعة." },
  { id: "pdf-translator", title: "PDF Translator", ar: "ترجمة PDF", icon: Languages, status: "Beta", category: "AI", desc: "Translation interface for small text-based PDFs.", arDesc: "واجهة ترجمة تجريبية لملفات PDF النصية الصغيرة." },
  { id: "word-translator", title: "Word Translator", ar: "ترجمة Word", icon: Languages, status: "Beta", category: "AI", desc: "Translation interface for DOCX files.", arDesc: "واجهة ترجمة تجريبية لملفات Word." },
  { id: "create-ppt", title: "Create PowerPoint", ar: "توليد عرض", icon: Presentation, status: "Coming Soon", category: "AI", desc: "Generate slides from documents.", arDesc: "توليد عرض تقديمي من المستندات." },
  { id: "word-to-pdf", title: "Word to PDF", ar: "Word إلى PDF", icon: FileText, status: "Coming Soon", category: "Convert", desc: "Convert DOCX files to PDF.", arDesc: "حوّل ملفات DOCX إلى PDF." },
  { id: "pdf-to-word", title: "PDF to Word", ar: "PDF إلى Word", icon: FileText, status: "Coming Soon", category: "Convert", desc: "Convert PDFs into editable Word files.", arDesc: "حوّل PDF إلى Word قابل للتعديل." },
  { id: "pdf-to-ppt", title: "PDF to PowerPoint", ar: "PDF إلى PowerPoint", icon: Presentation, status: "Coming Soon", category: "Convert", desc: "Convert PDFs into editable slides.", arDesc: "حوّل PDF إلى شرائح قابلة للتعديل." },
  { id: "ppt-to-pdf", title: "PowerPoint to PDF", ar: "PowerPoint إلى PDF", icon: Presentation, status: "Coming Soon", category: "Convert", desc: "Export presentations into PDF.", arDesc: "حوّل العروض التقديمية إلى PDF." },
  { id: "compress-pdf", title: "Compress PDF", ar: "ضغط PDF", icon: Archive, status: "Beta", category: "PDF", desc: "Compression workflow interface.", arDesc: "واجهة تجريبية لضغط PDF." }
];

function downloadPdf(bytes, fileName) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function parsePages(value, totalPages, isRTL, allowEmptyAll = true) {
  const text = String(value || "").trim();
  if (!text && allowEmptyAll) return Array.from({ length: totalPages }, (_, index) => index);
  if (!text) throw new Error(isRTL ? "اكتب الصفحات المطلوبة." : "Enter the required pages.");
  const pages = [];
  const chunks = text.split(",").map((item) => item.trim()).filter(Boolean);
  for (const chunk of chunks) {
    if (chunk.includes("-")) {
      const [start, end] = chunk.split("-").map((item) => Number(item.trim()));
      if (!start || !end || start > end) throw new Error(isRTL ? "صيغة الصفحات غير صحيحة." : "Invalid page range.");
      for (let page = start; page <= end; page += 1) pages.push(page);
    } else {
      const page = Number(chunk);
      if (!page) throw new Error(isRTL ? "رقم صفحة غير صحيح." : "Invalid page number.");
      pages.push(page);
    }
  }
  const uniquePages = [...new Set(pages)];
  if (uniquePages.some((page) => page < 1 || page > totalPages)) {
    throw new Error(isRTL ? `أدخل صفحات بين 1 و ${totalPages}.` : `Enter pages between 1 and ${totalPages}.`);
  }
  return uniquePages.map((page) => page - 1);
}

function ModalShell({ lang, title, icon: Icon, description, children, onClose }) {
  const isRTL = lang === "ar";
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal" dir={isRTL ? "rtl" : "ltr"} onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
        <div className="modal-icon"><Icon size={24} /></div>
        <h2>{title}</h2>
        {description && <p className="muted">{description}</p>}
        {children}
      </section>
    </div>
  );
}

function FileLine({ file }) {
  if (!file) return null;
  return <div className="file-line"><CheckCircle2 size={15} /> {file.name}</div>;
}

function ErrorBox({ error }) {
  if (!error) return null;
  return <div className="error-note">{error}</div>;
}

function SinglePdfInput({ file, setFile }) {
  return (
    <>
      <input className="modal-input" type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} />
      <FileLine file={file} />
    </>
  );
}

function PdfToolModal({ tool, lang, onClose }) {
  const isRTL = lang === "ar";
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [pages, setPages] = useState(tool.id === "split-pdf" || tool.id === "remove-pages" ? "1" : tool.id === "reorder-pages" ? "1,2,3" : "");
  const [angle, setAngle] = useState("90");
  const [startNumber, setStartNumber] = useState("1");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function processPdf() {
    setError("");
    try {
      setBusy(true);
      if (tool.id === "merge-pdf") {
        if (files.length < 2) throw new Error(isRTL ? "اختر ملفين PDF على الأقل." : "Choose at least two PDF files.");
        const output = await PDFDocument.create();
        for (const selectedFile of files) {
          const pdf = await PDFDocument.load(await selectedFile.arrayBuffer());
          const copiedPages = await output.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => output.addPage(page));
        }
        downloadPdf(await output.save(), "doclingo-merged.pdf");
        return;
      }
      if (!file) throw new Error(isRTL ? "اختر ملف PDF أولًا." : "Choose a PDF file first.");
      const sourcePdf = await PDFDocument.load(await file.arrayBuffer());
      const pageCount = sourcePdf.getPageCount();
      if (tool.id === "split-pdf") {
        const selectedPages = parsePages(pages, pageCount, isRTL, false);
        const output = await PDFDocument.create();
        const copiedPages = await output.copyPages(sourcePdf, selectedPages);
        copiedPages.forEach((page) => output.addPage(page));
        downloadPdf(await output.save(), "doclingo-split.pdf");
      }
      if (tool.id === "remove-pages") {
        const removedPages = new Set(parsePages(pages, pageCount, isRTL, false));
        const keptPages = sourcePdf.getPageIndices().filter((pageIndex) => !removedPages.has(pageIndex));
        if (!keptPages.length) throw new Error(isRTL ? "لا يمكن حذف كل الصفحات." : "You cannot remove all pages.");
        const output = await PDFDocument.create();
        const copiedPages = await output.copyPages(sourcePdf, keptPages);
        copiedPages.forEach((page) => output.addPage(page));
        downloadPdf(await output.save(), "doclingo-pages-removed.pdf");
      }
      if (tool.id === "rotate-pdf") {
        const selectedPages = parsePages(pages, pageCount, isRTL, true);
        selectedPages.forEach((pageIndex) => sourcePdf.getPage(pageIndex).setRotation(degrees(Number(angle))));
        downloadPdf(await sourcePdf.save(), "doclingo-rotated.pdf");
      }
      if (tool.id === "reorder-pages") {
        const orderedPages = parsePages(pages, pageCount, isRTL, false);
        const output = await PDFDocument.create();
        const copiedPages = await output.copyPages(sourcePdf, orderedPages);
        copiedPages.forEach((page) => output.addPage(page));
        downloadPdf(await output.save(), "doclingo-reordered.pdf");
      }
      if (tool.id === "page-numbers") {
        const font = await sourcePdf.embedFont(StandardFonts.Helvetica);
        sourcePdf.getPages().forEach((page, index) => {
          const { width } = page.getSize();
          const label = String(Number(startNumber || 1) + index);
          page.drawText(label, { x: width / 2 - 6, y: 22, size: 11, font, color: rgb(0.15, 0.15, 0.15) });
        });
        downloadPdf(await sourcePdf.save(), "doclingo-numbered.pdf");
      }
    } catch (err) {
      setError(err?.message || (isRTL ? "حدث خطأ أثناء المعالجة." : "Something went wrong."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalShell lang={lang} title={isRTL ? tool.ar : tool.title} icon={tool.icon} description={isRTL ? tool.arDesc : tool.desc} onClose={onClose}>
      {tool.id === "merge-pdf" ? (
        <>
          <input className="modal-input" type="file" accept="application/pdf,.pdf" multiple onChange={(event) => { const selectedFiles = Array.from(event.target.files || []); setFiles((previousFiles) => [...previousFiles, ...selectedFiles]); event.target.value = ""; }} />
          {files.length > 0 && <div className="file-list">{files.map((selectedFile, index) => <FileLine key={selectedFile.name + index} file={selectedFile} />)}</div>}
          {files.length > 0 && <button className="btn btn-secondary full" onClick={() => { setFiles([]); setError(""); }}>{isRTL ? "مسح الملفات" : "Clear files"}</button>}
        </>
      ) : (
        <>
          <SinglePdfInput file={file} setFile={setFile} />
          {(tool.id === "split-pdf" || tool.id === "remove-pages" || tool.id === "reorder-pages") && <input className="modal-input" value={pages} onChange={(event) => setPages(event.target.value)} placeholder={isRTL ? "مثال: 1-3,5" : "Example: 1-3,5"} />}
          {tool.id === "rotate-pdf" && <><input className="modal-input" value={pages} onChange={(event) => setPages(event.target.value)} placeholder={isRTL ? "فارغ لكل الصفحات أو 1-3" : "Empty for all pages or 1-3"} /><select className="modal-input" value={angle} onChange={(event) => setAngle(event.target.value)}><option value="90">90°</option><option value="180">180°</option><option value="270">270°</option></select></>}
          {tool.id === "page-numbers" && <input className="modal-input" value={startNumber} onChange={(event) => setStartNumber(event.target.value)} placeholder={isRTL ? "ابدأ من رقم" : "Start number"} />}
        </>
      )}
      <ErrorBox error={error} />
      <button className="btn btn-primary full" disabled={busy} onClick={processPdf}>{busy ? (isRTL ? "جاري المعالجة..." : "Processing...") : (isRTL ? "معالجة وتحميل" : "Process and download")}</button>
    </ModalShell>
  );
}

function AiToolModal({ tool, lang, onClose }) {
  const isRTL = lang === "ar";
  const [file, setFile] = useState(null);
  const title = isRTL ? tool.ar : tool.title;
  const description = isRTL ? "هذه واجهة تجريبية. سيتم ربط الذكاء الاصطناعي في المرحلة القادمة." : "This is a beta interface. AI processing will be connected in the next phase.";
  const sample = {
    "pdf-summarizer": isRTL ? ["ملخص سريع", "أهم النقاط", "اقتراحات للمراجعة"] : ["Quick summary", "Key points", "Revision suggestions"],
    "extract-questions": isRTL ? ["أسئلة اختيار من متعدد", "أسئلة صح وخطأ", "أسئلة قصيرة"] : ["Multiple-choice questions", "True or false", "Short questions"],
    "student-mode": isRTL ? ["ملخص", "مصطلحات", "أسئلة", "خطة مذاكرة"] : ["Summary", "Key terms", "Questions", "Study plan"]
  }[tool.id] || (isRTL ? ["سيتم ربط الأداة قريبًا"] : ["Tool will be connected soon"]);
  return (
    <ModalShell lang={lang} title={title} icon={tool.icon} description={description} onClose={onClose}>
      <input className="modal-input" type="file" accept="application/pdf,.pdf,.docx,.txt" onChange={(event) => setFile(event.target.files?.[0] || null)} />
      <FileLine file={file} />
      <div className="preview-box">{sample.map((item) => <div key={item}><CheckCircle2 size={15} /> {item}</div>)}</div>
      <button className="btn btn-primary full" onClick={onClose}>{isRTL ? "جاهز للمرحلة القادمة" : "Ready for next phase"}</button>
    </ModalShell>
  );
}

function InfoModal({ type, lang, onClose }) {
  const isRTL = lang === "ar";
  const info = {
    privacy: {
      icon: ShieldCheck,
      title: isRTL ? "سياسة الخصوصية" : "Privacy Policy",
      items: isRTL ? ["أدوات PDF الحالية تعمل داخل المتصفح ولا ترفع الملفات إلى خادم.", "لا نستخدم ملفات المستخدمين لتدريب النماذج.", "عند تفعيل أدوات AI سيتم توضيح طريقة المعالجة بوضوح."] : ["Current PDF tools run in the browser without server upload.", "User files are not used to train models.", "AI processing details will be clearly disclosed when enabled."]
    },
    terms: {
      icon: FileText,
      title: isRTL ? "شروط الاستخدام" : "Terms of Use",
      items: isRTL ? ["الخدمة في مرحلة تجريبية.", "راجع النتائج قبل الاستخدام الرسمي.", "ارفع الملفات التي تملك حق استخدامها فقط."] : ["The service is currently beta.", "Review outputs before official use.", "Only upload files you have rights to use."]
    },
    contact: {
      icon: MessageCircle,
      title: isRTL ? "تواصل معنا" : "Contact",
      items: isRTL ? ["للاقتراحات أو المشاكل استخدم زر الانضمام للنسخة التجريبية لاحقًا.", "سيتم إضافة نموذج تواصل كامل في نسخة قادمة."] : ["For suggestions or issues, use the beta access form later.", "A full contact form will be added in a future version."]
    }
  }[type];
  if (!info) return null;
  return (
    <ModalShell lang={lang} title={info.title} icon={info.icon} onClose={onClose}>
      <ul className="info-list">{info.items.map((item) => <li key={item}>{item}</li>)}</ul>
      <button className="btn btn-primary full" onClick={onClose}>{isRTL ? "موافق" : "Got it"}</button>
    </ModalShell>
  );
}

function PlaceholderModal({ tool, lang, onClose }) {
  const isRTL = lang === "ar";
  return <ModalShell lang={lang} title={isRTL ? tool.ar : tool.title} icon={tool.icon} description={isRTL ? "هذه الأداة ضمن خطة التفعيل القادمة." : "This tool is on the activation roadmap."} onClose={onClose}><button className="btn btn-primary full" onClick={onClose}>{isRTL ? "تمام" : "Got it"}</button></ModalShell>;
}

function ToolCard({ tool, lang, onClick }) {
  const isRTL = lang === "ar";
  const Icon = tool.icon;
  const statusClass = tool.status.toLowerCase().replaceAll(" ", "-");
  return (
    <article className="tool-card fade-in">
      <div className="tool-header"><span className={`status ${statusClass}`}>{tool.status}</span><div className="tool-icon"><Icon size={20} /></div></div>
      <div className="tool-body"><h3>{isRTL ? tool.ar : tool.title}</h3><p>{isRTL ? tool.arDesc : tool.desc}</p></div>
      <button className="btn btn-primary full" onClick={onClick}>{tool.status === "Coming Soon" ? (isRTL ? "تفاصيل" : "Details") : (isRTL ? "جرّب الآن" : "Try now")}</button>
    </article>
  );
}

export default function App() {
  const [lang, setLang] = useState("en");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [modalTool, setModalTool] = useState(null);
  const [infoType, setInfoType] = useState(null);
  const [uploadedName, setUploadedName] = useState("");
  const isRTL = lang === "ar";

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((tool) => (category === "All" || tool.category === category) && (!q || tool.title.toLowerCase().includes(q) || tool.ar.includes(q)));
  }, [category, query]);

  function renderModal() {
    if (!modalTool) return null;
    if (modalTool.status === "Available") return <PdfToolModal tool={modalTool} lang={lang} onClose={() => setModalTool(null)} />;
    if (["pdf-summarizer", "extract-questions", "student-mode"].includes(modalTool.id)) return <AiToolModal tool={modalTool} lang={lang} onClose={() => setModalTool(null)} />;
    return <PlaceholderModal tool={modalTool} lang={lang} onClose={() => setModalTool(null)} />;
  }

  return (
    <div className="app" dir={isRTL ? "rtl" : "ltr"}>
      <div className="beta-banner">{isRTL ? "نسخة تجريبية — أدوات PDF الحالية تعمل داخل المتصفح." : "Beta version — current PDF tools run in your browser."}</div>
      <header className="site-header"><div className="container header-inner"><div className="brand"><div className="brand-mark"><Wand2 size={20} /></div><div><strong>DocLingo AI</strong><small>doclingo-ai.netlify.app</small></div></div><button className="btn btn-secondary" onClick={() => setLang(isRTL ? "en" : "ar")}><Globe2 size={16}/>{isRTL ? "English" : "العربية"}</button></div></header>
      <main>
        <section className="hero container"><div className="hero-copy slide-up"><span className="pill">{isRTL ? "وصول مجاني للنسخة التجريبية" : "Free beta access"}</span><h1>{isRTL ? "ترجم، حوّل، ولخّص ملفاتك بالذكاء الاصطناعي" : "Translate, convert, and summarize documents with AI"}</h1><p>{isRTL ? "منصة عالمية لأدوات PDF وWord وPowerPoint، مع أدوات PDF تعمل داخل المتصفح." : "A global toolkit for PDF, Word, and PowerPoint, with PDF tools running in-browser."}</p><div className="trust-grid"><div><ShieldCheck size={16}/>{isRTL ? "خصوصية" : "Privacy"}</div><div><Lock size={16}/>{isRTL ? "داخل المتصفح" : "In-browser"}</div><div><Clock size={16}/>{isRTL ? "تجريبي مجاني" : "Free beta"}</div></div></div><div className="upload-card slide-up"><FileUp size={46}/><h2>{isRTL ? "جرّب نموذج الرفع" : "Try the upload flow"}</h2><input type="file" onChange={(event) => setUploadedName(event.target.files?.[0]?.name || "")} />{uploadedName && <div className="file-line"><CheckCircle2 size={15}/>{uploadedName}</div>}<div className="quick-actions"><button className="btn btn-secondary" onClick={() => setModalTool(tools.find((tool) => tool.id === "split-pdf"))}><Scissors size={16}/>{isRTL ? "تقسيم" : "Split"}</button><button className="btn btn-secondary" onClick={() => setModalTool(tools.find((tool) => tool.id === "rotate-pdf"))}><RotateCw size={16}/>{isRTL ? "تدوير" : "Rotate"}</button><button className="btn btn-secondary" onClick={() => setModalTool(tools.find((tool) => tool.id === "merge-pdf"))}><Download size={16}/>{isRTL ? "دمج" : "Merge"}</button></div></div></section>
        <section className="container tools-section" id="tools"><div className="section-head"><div><h2>{isRTL ? "كل أدوات المستندات في مكان واحد" : "All document tools in one place"}</h2><p>{isRTL ? "متاح، تجريبي، وقادم قريبًا." : "Available, beta, and coming soon."}</p></div><div className="filters"><label className="search-box"><Search size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isRTL ? "ابحث عن أداة" : "Search tools"}/></label><div className="tabs">{CATEGORIES.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div></div></div><div className="tools-grid">{filteredTools.map((tool) => <ToolCard key={tool.id} tool={tool} lang={lang} onClick={() => setModalTool(tool)} />)}</div></section>
      </main>
      <footer className="site-footer"><div className="container footer-inner"><span>© 2026 DocLingo AI</span><nav><button onClick={() => setInfoType("privacy")}>Privacy</button><button onClick={() => setInfoType("terms")}>Terms</button><button onClick={() => setInfoType("contact")}>Contact</button></nav></div></footer>
      {renderModal()}
      <InfoModal type={infoType} lang={lang} onClose={() => setInfoType(null)} />
    </div>
  );
}
