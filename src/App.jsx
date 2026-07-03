import React, { useMemo, useState } from "react";
import {
  Archive,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileQuestion,
  FileText,
  FileUp,
  Globe2,
  Languages,
  Layers3,
  Lock,
  Mail,
  MessageCircle,
  Presentation,
  Scissors,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wand2,
  Zap,
  BookOpenCheck,
  SplitSquareHorizontal,
  X,
} from "lucide-react";

const tools = [
  { id: "pdf-translator", title: "PDF Translator", ar: "ترجمة PDF", icon: Languages, status: "Beta", category: "AI", desc: "Beta translation for small text-based PDFs. Layout-preserving full translation is on the roadmap.", arDesc: "ترجمة تجريبية لملفات PDF النصية الصغيرة. الترجمة الكاملة مع الحفاظ على التنسيق ضمن الخطة." },
  { id: "word-translator", title: "Word Translator", ar: "ترجمة Word", icon: Languages, status: "Beta", category: "AI", desc: "Translate DOCX documents with smart paragraph handling for small files.", arDesc: "ترجمة ملفات DOCX الصغيرة مع معالجة ذكية للفقرات." },
  { id: "pdf-summarizer", title: "PDF Summarizer", ar: "تلخيص PDF", icon: Sparkles, status: "Available", category: "AI", desc: "Get a clean summary, key points, and action items from text-based PDFs.", arDesc: "احصل على ملخص واضح ونقاط مهمة ومهام من ملفات PDF النصية." },
  { id: "extract-questions", title: "Extract Questions", ar: "استخراج أسئلة", icon: FileQuestion, status: "Beta", category: "AI", desc: "Turn study files into quizzes and review questions.", arDesc: "حوّل ملفات الدراسة إلى أسئلة مراجعة واختبارات قصيرة." },
  { id: "study-mode", title: "Student Mode", ar: "وضع الطالب", icon: BookOpenCheck, status: "Beta", category: "AI", desc: "Summary, key terms, questions, and revision notes in one flow.", arDesc: "ملخص، مصطلحات، أسئلة، وملاحظات مراجعة في خطوة واحدة." },
  { id: "compare-view", title: "Original vs Output", ar: "مقارنة قبل وبعد", icon: SplitSquareHorizontal, status: "Coming Soon", category: "AI", desc: "Preview original and translated/summarized content side by side.", arDesc: "معاينة المحتوى الأصلي والنتيجة جنبًا إلى جنب." },
  { id: "create-ppt", title: "Create PowerPoint", ar: "توليد عرض", icon: Presentation, status: "Coming Soon", category: "AI", desc: "Generate a presentation from text, PDF, or notes.", arDesc: "توليد عرض تقديمي من نص أو PDF أو ملاحظات." },
  { id: "word-to-pdf", title: "Word to PDF", ar: "Word إلى PDF", icon: FileText, status: "Available", category: "Convert", desc: "Convert DOCX files into clean PDF documents.", arDesc: "حوّل ملفات DOCX إلى PDF بشكل سريع ومنظم." },
  { id: "pdf-to-word", title: "PDF to Word", ar: "PDF إلى Word", icon: FileText, status: "Coming Soon", category: "Convert", desc: "Convert PDF documents into editable Word files.", arDesc: "حوّل PDF إلى ملف Word قابل للتعديل." },
  { id: "pdf-to-ppt", title: "PDF to PowerPoint", ar: "PDF إلى PowerPoint", icon: Presentation, status: "Coming Soon", category: "Convert", desc: "Convert PDFs into editable slides.", arDesc: "حوّل ملفات PDF إلى شرائح قابلة للتعديل." },
  { id: "ppt-to-pdf", title: "PowerPoint to PDF", ar: "PowerPoint إلى PDF", icon: Presentation, status: "Coming Soon", category: "Convert", desc: "Export presentations into shareable PDFs.", arDesc: "حوّل العروض التقديمية إلى PDF جاهز للمشاركة." },
  { id: "merge-pdf", title: "Merge PDF", ar: "دمج PDF", icon: Archive, status: "Available", category: "PDF", desc: "Combine multiple PDFs into one file.", arDesc: "ادمج أكثر من ملف PDF في ملف واحد." },
  { id: "split-pdf", title: "Split PDF", ar: "تقسيم PDF", icon: Scissors, status: "Available", category: "PDF", desc: "Split pages into separate PDF files.", arDesc: "قسّم صفحات PDF إلى ملفات منفصلة." },
  { id: "compress-pdf", title: "Compress PDF", ar: "ضغط PDF", icon: Archive, status: "Beta", category: "PDF", desc: "Reduce file size for easier sharing.", arDesc: "قلّل حجم الملف لتسهيل مشاركته." },
];

const categories = ["All", "AI", "Convert", "PDF"];

function InfoModal({ type, lang, onClose }) {
  if (!type) return null;
  const isRTL = lang === "ar";
  const content = {
    privacy: {
      icon: ShieldCheck,
      title: isRTL ? "سياسة الخصوصية" : "Privacy Policy",
      body: isRTL
        ? [
            "نستخدم الملفات فقط لتنفيذ الأداة التي تختارها.",
            "يتم حذف الملفات المرفوعة تلقائيًا بعد ساعة، ويتم حذف النتائج بعد 24 ساعة في النسخة المستقبلية.",
            "لا نستخدم محتوى ملفاتك لتدريب النماذج.",
            "قد يتم استخدام خدمات معالجة خارجية عند تفعيل أدوات الذكاء الاصطناعي، وسيتم توضيح ذلك قبل الإطلاق الرسمي.",
          ]
        : [
            "We use uploaded files only to perform the tool you choose.",
            "Uploaded files are designed to be deleted after 1 hour, and generated results after 24 hours in future production releases.",
            "We do not use your document content to train models.",
            "External processing providers may be used when AI tools are activated, and this will be clarified before public launch.",
          ],
    },
    terms: {
      icon: FileText,
      title: isRTL ? "شروط الاستخدام" : "Terms of Use",
      body: isRTL
        ? [
            "DocLingo AI حاليًا في نسخة تجريبية، وبعض الأدوات قد تكون محدودة أو قيد التفعيل.",
            "لا ينبغي الاعتماد على مخرجات الذكاء الاصطناعي أو التحويلات للاستخدام الرسمي دون مراجعة بشرية.",
            "يجب ألا ترفع ملفات لا تملك حق استخدامها أو معالجتها.",
            "قد تتغير الحدود والميزات والأسعار عند الانتقال من النسخة التجريبية إلى النسخة الرسمية.",
          ]
        : [
            "DocLingo AI is currently in beta, and some tools may be limited or under activation.",
            "AI and conversion outputs should be reviewed before official use.",
            "Do not upload files you do not have rights to use or process.",
            "Limits, features, and pricing may change when moving from beta to production.",
          ],
    },
    contact: {
      icon: MessageCircle,
      title: isRTL ? "تواصل معنا" : "Contact Us",
      body: isRTL
        ? [
            "للاقتراحات أو الإبلاغ عن مشكلة، استخدم زر الانضمام للنسخة التجريبية.",
            "سنضيف نموذج تواصل كامل في المرحلة القادمة.",
          ]
        : [
            "For suggestions or issue reports, use the beta access form.",
            "A full contact form will be added in the next phase.",
          ],
    },
  }[type];
  const Icon = content.icon;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" dir={isRTL ? "rtl" : "ltr"} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
        <div className="modal-icon"><Icon size={24} /></div>
        <h2>{content.title}</h2>
        <ul className="info-list">
          {content.body.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
        <button className="btn btn-primary full" onClick={onClose}>{isRTL ? "موافق" : "Got it"}</button>
      </div>
    </div>
  );
}

function BetaModal({ lang, onClose }) {
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const isRTL = lang === "ar";

  if (saved) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" dir={isRTL ? "rtl" : "ltr"} onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
          <div className="modal-icon success"><CheckCircle2 size={24} /></div>
          <h2>{isRTL ? "تم تسجيل اهتمامك" : "You're on the beta list"}</h2>
          <p className="muted">{isRTL ? "في المرحلة القادمة سنربط النموذج بقاعدة بيانات أو خدمة بريد لحفظ الطلبات فعليًا." : "In the next phase, this form will connect to a database or email service to save requests."}</p>
          <button className="btn btn-primary full" onClick={onClose}>{isRTL ? "تمام" : "Done"}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" dir={isRTL ? "rtl" : "ltr"} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
        <div className="modal-icon"><Mail size={24} /></div>
        <h2>{isRTL ? "انضم للوصول المبكر" : "Join early access"}</h2>
        <p className="muted">{isRTL ? "سجّل بريدك لتكون من أوائل المستخدمين عند تفعيل أدوات المعالجة الحقيقية." : "Enter your email to be among the first users when real processing tools go live."}</p>
        <input className="modal-input" type="email" placeholder={isRTL ? "بريدك الإلكتروني" : "Your email"} value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn btn-primary full" onClick={() => setSaved(true)} disabled={!email.includes("@")}>{isRTL ? "انضم للقائمة" : "Join list"}</button>
      </div>
    </div>
  );
}

function ToolModal({ selectedTool, lang, onClose }) {
  if (!selectedTool) return null;
  const isRTL = lang === "ar";
  const comingSoon = selectedTool.status === "Coming Soon";
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" dir={isRTL ? "rtl" : "ltr"} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
        <div className="modal-icon"><selectedTool.icon size={24} /></div>
        <h2>{isRTL ? selectedTool.ar : selectedTool.title}</h2>
        <p className="muted">
          {comingSoon
            ? isRTL ? "هذه الأداة قادمة قريبًا. يمكنك الانضمام لقائمة الوصول المبكر ليصلك إشعار عند تفعيلها." : "This tool is coming soon. Join the early access list to be notified when it goes live."
            : isRTL ? "هذه الأداة في النسخة التجريبية. قريبًا سيتم تفعيل المعالجة الكاملة للملفات الصغيرة مجانًا مع نتائج قابلة للتحميل." : "This tool is currently in beta. Full processing for small files will be available soon with downloadable results."}
        </p>
        <div className="result-box"><CheckCircle2 size={18} /><span>{isRTL ? "تم تجهيز الواجهة وربط المعالجة هو الخطوة التالية" : "The interface is ready; backend processing is the next step"}</span></div>
        <button className="btn btn-primary full" onClick={onClose}>{isRTL ? "تمام" : "Got it"}</button>
      </div>
    </div>
  );
}

function ToolCard({ tool, lang, onTry, onJoinBeta }) {
  const Icon = tool.icon;
  const isComingSoon = tool.status === "Coming Soon";
  return (
    <article className="tool-card fade-in">
      <div className="tool-header">
        <div className="tool-icon"><Icon size={20} /></div>
        <span className={`status ${tool.status.toLowerCase().replaceAll(" ", "-")}`}>{tool.status}</span>
      </div>
      <div className="tool-body">
        <h3>{lang === "ar" ? tool.ar : tool.title}</h3>
        <p>{lang === "ar" ? tool.arDesc : tool.desc}</p>
      </div>
      <div className="tool-actions">
        <button className="btn btn-primary full" onClick={() => onTry(tool)}>{isComingSoon ? (lang === "ar" ? "تفاصيل" : "Details") : (lang === "ar" ? "جرّب الآن" : "Try now")}</button>
        {isComingSoon && <button className="btn btn-secondary" onClick={onJoinBeta}>{lang === "ar" ? "نبّهني" : "Notify"}</button>}
      </div>
    </article>
  );
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
  const filteredTools = useMemo(() => tools.filter((tool) => {
    const matchCategory = category === "All" || tool.category === category;
    const q = query.trim().toLowerCase();
    const matchQuery = !q || tool.title.toLowerCase().includes(q) || tool.ar.includes(q);
    return matchCategory && matchQuery;
  }), [category, query]);

  return (
    <div className="app" dir={isRTL ? "rtl" : "ltr"}>
      <div className="beta-banner">{isRTL ? "نسخة تجريبية — يتم تفعيل الأدوات تدريجيًا مع الحفاظ على الخصوصية." : "Beta version — tools are being activated gradually with privacy-first processing."}</div>

      <header className="site-header">
        <div className="container header-inner">
          <div className="brand">
            <div className="brand-mark"><Wand2 size={20} /></div>
            <div><strong>DocLingo AI</strong><small>doclingo-ai.netlify.app</small></div>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => setLang(lang === "en" ? "ar" : "en")}><Globe2 size={16} /> {lang === "en" ? "العربية" : "English"}</button>
            <button className="btn btn-primary hide-mobile" onClick={() => setBetaOpen(true)}>{isRTL ? "انضم للنسخة التجريبية" : "Join beta"}</button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero container">
          <div className="hero-copy slide-up">
            <span className="pill">{isRTL ? "وصول مجاني للنسخة التجريبية للمستخدمين الأوائل" : "Free beta access for early users"}</span>
            <h1>{isRTL ? "ترجم، حوّل، ولخّص ملفاتك بالذكاء الاصطناعي" : "Translate, convert, and summarize documents with AI"}</h1>
            <p>{isRTL ? "منصة عالمية لأدوات PDF وWord وPowerPoint. سريعة، بسيطة، وتركّز على الخصوصية بحذف الملفات تلقائيًا بعد المعالجة." : "A global document toolkit for PDF, Word, and PowerPoint. Fast, simple, and privacy-focused with automatic file deletion after processing."}</p>
            <div className="hero-buttons">
              <a href="#upload" className="btn btn-primary large"><FileUp size={18} /> {isRTL ? "ارفع ملفك الآن" : "Upload your file"}</a>
              <a href="#tools" className="btn btn-secondary large"><Eye size={18} /> {isRTL ? "شاهد الأدوات" : "Explore tools"}</a>
            </div>
            <div className="trust-grid">
              <div><ShieldCheck size={16} /> {isRTL ? "حذف تلقائي" : "Auto deletion"}</div>
              <div><Lock size={16} /> {isRTL ? "تشفير أثناء الرفع" : "Encrypted upload"}</div>
              <div><Clock size={16} /> {isRTL ? "معالجة محدودة مجانًا" : "Limited free processing"}</div>
            </div>
          </div>

          <div className="upload-card slide-up" id="upload">
            <div className="dropzone">
              <FileUp size={46} />
              <h2>{isRTL ? "جرّب نموذج الرفع" : "Try the upload flow"}</h2>
              <p>{isRTL ? "اختر ملف PDF أو Word أو PowerPoint للتجربة." : "Choose a PDF, Word, or PowerPoint file for the beta demo."}</p>
              <input type="file" onChange={(e) => setUploaded(e.target.files?.[0]?.name || null)} />
              {uploaded && <div className="file-selected"><CheckCircle2 size={16} /> {uploaded}</div>}
            </div>
            <div className="quick-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedTool(tools.find((t) => t.id === "pdf-summarizer"))}><Sparkles size={16} /> {isRTL ? "تلخيص" : "Summarize"}</button>
              <button className="btn btn-secondary" onClick={() => setSelectedTool(tools.find((t) => t.id === "pdf-translator"))}><Languages size={16} /> {isRTL ? "ترجمة" : "Translate"}</button>
              <button className="btn btn-secondary" onClick={() => setSelectedTool(tools.find((t) => t.id === "word-to-pdf"))}><Download size={16} /> {isRTL ? "تحويل" : "Convert"}</button>
            </div>
            <div className="privacy-note">
              <div><strong>{isRTL ? "خصوصية من البداية" : "Private by design"}</strong><p>{isRTL ? "تتم معالجة ملفاتك بأمان ويتم حذفها تلقائيًا بعد انتهاء المعالجة." : "Your files are processed securely and deleted automatically after processing."}</p></div>
              <Trash2 size={20} />
            </div>
          </div>
        </section>

        <section className="container tools-section" id="tools">
          <div className="section-head">
            <div><h2>{isRTL ? "كل أدوات المستندات في مكان واحد" : "All document tools in one place"}</h2><p>{isRTL ? "متاح، تجريبي، وقادم قريبًا — واجهة مشروع عالمي جاهز للتوسع." : "Available, beta, and coming soon — a global product interface ready to scale."}</p></div>
            <div className="filters">
              <label className="search-box"><Search size={16} /><input placeholder={isRTL ? "ابحث عن أداة" : "Search tools"} value={query} onChange={(e) => setQuery(e.target.value)} /></label>
              <div className="tabs">{categories.map((cat) => <button key={cat} className={category === cat ? "active" : ""} onClick={() => setCategory(cat)}>{cat}</button>)}</div>
            </div>
          </div>
          <div className="tools-grid">{filteredTools.map((tool) => <ToolCard key={tool.id} tool={tool} lang={lang} onTry={setSelectedTool} onJoinBeta={() => setBetaOpen(true)} />)}</div>
        </section>

        <section className="container features-grid">
          <div className="feature-card"><ShieldCheck size={32} /><h3>{isRTL ? "خصوصية واضحة" : "Clear privacy"}</h3><p>{isRTL ? "حذف الملفات بعد ساعة، والنتائج بعد 24 ساعة، وعدم استخدام محتواك للتدريب." : "Delete uploads after 1 hour, results after 24 hours, and do not use content for training."}</p></div>
          <div className="feature-card"><Zap size={32} /><h3>{isRTL ? "تجربة سريعة" : "Fast experience"}</h3><p>{isRTL ? "واجهة بسيطة: ارفع الملف، اختر الأداة، ثم حمّل النتيجة عند اكتمال المعالجة." : "Simple flow: upload a file, choose a tool, then download the result when processing is done."}</p></div>
          <div className="feature-card"><Layers3 size={32} /><h3>{isRTL ? "جاهز للتوسع" : "Ready to scale"}</h3><p>{isRTL ? "واجهة إنجليزية وعربية كبداية، مع قابلية إضافة لغات وصفحات SEO لكل أداة." : "English and Arabic first, with room for more languages and SEO pages per tool."}</p></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <span>© 2026 DocLingo AI. Built for beta launch.</span>
          <nav>
            <button onClick={() => setInfoModal("privacy")}>Privacy</button>
            <button onClick={() => setInfoModal("terms")}>Terms</button>
            <button onClick={() => setInfoModal("contact")}>Contact</button>
          </nav>
        </div>
      </footer>

      <ToolModal selectedTool={selectedTool} lang={lang} onClose={() => setSelectedTool(null)} />
      <InfoModal type={infoModal} lang={lang} onClose={() => setInfoModal(null)} />
      {betaOpen && <BetaModal lang={lang} onClose={() => setBetaOpen(false)} />}
    </div>
  );
}
