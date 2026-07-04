import "./styles.css";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

let lang = "en";
let category = "All";
let query = "";
let currentTool = null;

const tools = [
  { id: "merge-pdf", title: "Merge PDF", ar: "دمج PDF", icon: "🗂️", status: "Available", category: "PDF", desc: "Combine multiple PDF files in your browser.", arDesc: "ادمج أكثر من ملف PDF مباشرة داخل المتصفح." },
  { id: "split-pdf", title: "Split PDF", ar: "تقسيم PDF", icon: "✂️", status: "Available", category: "PDF", desc: "Extract selected pages into a new PDF.", arDesc: "استخرج صفحات محددة في ملف PDF جديد." },
  { id: "remove-pages", title: "Remove Pages", ar: "حذف صفحات", icon: "🗑️", status: "Available", category: "PDF", desc: "Remove unwanted pages from a PDF.", arDesc: "احذف صفحات غير مرغوبة من ملف PDF." },
  { id: "rotate-pdf", title: "Rotate PDF", ar: "تدوير PDF", icon: "🔄", status: "Available", category: "PDF", desc: "Rotate all pages or selected pages.", arDesc: "دوّر كل صفحات PDF أو صفحات محددة." },
  { id: "reorder-pages", title: "Reorder Pages", ar: "ترتيب الصفحات", icon: "🔢", status: "Available", category: "PDF", desc: "Reorder pages using a custom order like 3,1,2.", arDesc: "أعد ترتيب الصفحات بترتيب مخصص مثل 3,1,2." },
  { id: "page-numbers", title: "Add Page Numbers", ar: "ترقيم الصفحات", icon: "#", status: "Available", category: "PDF", desc: "Add page numbers to the bottom of each page.", arDesc: "أضف أرقام صفحات أسفل كل صفحة." },
  { id: "pdf-summarizer", title: "PDF Summarizer", ar: "تلخيص PDF", icon: "✨", status: "Beta", category: "AI", desc: "AI summary workflow interface.", arDesc: "واجهة تجريبية لتلخيص PDF بالذكاء الاصطناعي." },
  { id: "extract-questions", title: "Extract Questions", ar: "استخراج أسئلة", icon: "❓", status: "Beta", category: "AI", desc: "Create review questions from study files.", arDesc: "إنشاء أسئلة مراجعة من ملفات الدراسة." },
  { id: "student-mode", title: "Student Mode", ar: "وضع الطالب", icon: "📚", status: "Beta", category: "AI", desc: "Summary, key terms, questions, and revision notes.", arDesc: "ملخص، مصطلحات، أسئلة، وملاحظات مراجعة." },
  { id: "pdf-translator", title: "PDF Translator", ar: "ترجمة PDF", icon: "🌐", status: "Beta", category: "AI", desc: "Translation interface for small text-based PDFs.", arDesc: "واجهة ترجمة تجريبية لملفات PDF النصية الصغيرة." },
  { id: "word-translator", title: "Word Translator", ar: "ترجمة Word", icon: "🌐", status: "Beta", category: "AI", desc: "Translation interface for DOCX files.", arDesc: "واجهة ترجمة تجريبية لملفات Word." },
  { id: "create-ppt", title: "Create PowerPoint", ar: "توليد عرض", icon: "📊", status: "Coming Soon", category: "AI", desc: "Generate slides from documents.", arDesc: "توليد عرض تقديمي من المستندات." },
  { id: "word-to-pdf", title: "Word to PDF", ar: "Word إلى PDF", icon: "📄", status: "Coming Soon", category: "Convert", desc: "Convert DOCX files to PDF.", arDesc: "حوّل ملفات DOCX إلى PDF." },
  { id: "pdf-to-word", title: "PDF to Word", ar: "PDF إلى Word", icon: "📄", status: "Coming Soon", category: "Convert", desc: "Convert PDFs into editable Word files.", arDesc: "حوّل PDF إلى Word قابل للتعديل." },
  { id: "pdf-to-ppt", title: "PDF to PowerPoint", ar: "PDF إلى PowerPoint", icon: "📊", status: "Coming Soon", category: "Convert", desc: "Convert PDFs into editable slides.", arDesc: "حوّل PDF إلى شرائح قابلة للتعديل." },
  { id: "ppt-to-pdf", title: "PowerPoint to PDF", ar: "PowerPoint إلى PDF", icon: "📊", status: "Coming Soon", category: "Convert", desc: "Export presentations into PDF.", arDesc: "حوّل العروض التقديمية إلى PDF." },
  { id: "compress-pdf", title: "Compress PDF", ar: "ضغط PDF", icon: "🗜️", status: "Beta", category: "PDF", desc: "Compression workflow interface.", arDesc: "واجهة تجريبية لضغط PDF." }
];

const t = {
  ar: {
    beta: "نسخة تجريبية — أدوات PDF الحالية تعمل داخل المتصفح.",
    heroPill: "وصول مجاني للنسخة التجريبية",
    heroTitle: "ترجم، حوّل، ولخّص ملفاتك بالذكاء الاصطناعي",
    heroDesc: "منصة عالمية لأدوات PDF وWord وPowerPoint، مع أدوات PDF تعمل داخل المتصفح.",
    uploadTitle: "جرّب نموذج الرفع",
    search: "ابحث عن أداة",
    allTools: "كل أدوات المستندات في مكان واحد",
    allToolsDesc: "متاح، تجريبي، وقادم قريبًا.",
    privacy: "خصوصية",
    browser: "داخل المتصفح",
    free: "تجريبي مجاني",
    join: "انضم للنسخة التجريبية",
    process: "معالجة وتحميل",
    processing: "جاري المعالجة...",
    gotIt: "تمام"
  },
  en: {
    beta: "Beta version — current PDF tools run in your browser.",
    heroPill: "Free beta access",
    heroTitle: "Translate, convert, and summarize documents with AI",
    heroDesc: "A global toolkit for PDF, Word, and PowerPoint, with PDF tools running in-browser.",
    uploadTitle: "Try the upload flow",
    search: "Search tools",
    allTools: "All document tools in one place",
    allToolsDesc: "Available, beta, and coming soon.",
    privacy: "Privacy",
    browser: "In-browser",
    free: "Free beta",
    join: "Join beta",
    process: "Process and download",
    processing: "Processing...",
    gotIt: "Got it"
  }
};

function isRTL() { return lang === "ar"; }
function label(tool) { return isRTL() ? tool.ar : tool.title; }
function desc(tool) { return isRTL() ? tool.arDesc : tool.desc; }
function $id(id) { return document.getElementById(id); }
function escapeHtml(s) { return String(s || "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])); }


function getCredits() {
  const saved = localStorage.getItem("doclingo_credits");
  if (saved === null) {
    localStorage.setItem("doclingo_credits", "10");
    return 10;
  }
  return Number(saved || "0");
}
function addCredits(amount) {
  const next = getCredits() + Number(amount || 0);
  localStorage.setItem("doclingo_credits", String(next));
  return next;
}
function spendCredits(amount) {
  const current = getCredits();
  if (current < amount) return false;
  localStorage.setItem("doclingo_credits", String(current - amount));
  return true;
}
function setCredits(amount) {
  localStorage.setItem("doclingo_credits", String(amount));
}
function getUsageCount() {
  return Number(localStorage.getItem("doclingo_tool_uses") || "0");
}
function recordToolUse(toolId) {
  localStorage.setItem("doclingo_tool_uses", String(getUsageCount() + 1));
  localStorage.setItem("doclingo_last_tool", toolId || "unknown");
}
function toolCost(toolId) {
  const costs = {
    "merge-pdf": 1,
    "split-pdf": 1,
    "remove-pages": 1,
    "rotate-pdf": 1,
    "reorder-pages": 1,
    "page-numbers": 1,
    "compress-pdf": 1,
    "pdf-summarizer": 2,
    "extract-questions": 3,
    "student-mode": 4,
    "pdf-translator": 5,
    "word-translator": 5,
    "create-ppt": 8
  };
  return costs[toolId] || 1;
}
function costLabel(toolId) {
  const cost = toolCost(toolId);
  return isRTL() ? `${cost} رصيد` : `${cost} credit${cost === 1 ? "" : "s"}`;
}

function render() {
  document.documentElement.lang = lang;
  document.body.dir = isRTL() ? "rtl" : "ltr";
  const copy = t[lang];
  const filtered = tools.filter(tool => {
    const q = query.trim().toLowerCase();
    const matchCategory = category === "All" || tool.category === category;
    const matchQuery = !q || tool.title.toLowerCase().includes(q) || tool.ar.includes(q);
    return matchCategory && matchQuery;
  });

  $id("app").innerHTML = `
    <div class="beta-banner">${copy.beta}</div>
    <header class="site-header">
      <div class="container header-inner">
        <div class="brand"><div class="brand-mark">✦</div><div><strong>DocLingo AI</strong><small>doclingo-ai.netlify.app</small></div></div>
        <div class="header-actions"><button class="btn btn-secondary" data-modal="credits">${isRTL()?"الرصيد":"Credits"}: ${getCredits()}</button><button class="btn btn-secondary" data-action="toggle-lang">${isRTL() ? "English" : "العربية"}</button><button class="btn btn-primary hide-mobile" data-modal="beta">${copy.join}</button></div>
      </div>
    </header>
    <main>
      <section class="hero container">
        <div class="hero-copy"><span class="pill">${copy.heroPill}</span><h1>${copy.heroTitle}</h1><p>${copy.heroDesc}</p><div class="trust-grid"><div>🛡️ ${copy.privacy}</div><div>🔒 ${copy.browser}</div><div>⏱️ ${copy.free}</div></div></div>
        <div class="upload-card"><div class="upload-icon">⇧</div><h2>${copy.uploadTitle}</h2><input type="file" id="demoUpload"/><div id="selectedFile"></div><div class="quick-actions"><button class="btn btn-secondary" data-tool="split-pdf">✂️ ${isRTL()?"تقسيم":"Split"}</button><button class="btn btn-secondary" data-tool="rotate-pdf">🔄 ${isRTL()?"تدوير":"Rotate"}</button><button class="btn btn-secondary" data-tool="merge-pdf">⬇️ ${isRTL()?"دمج":"Merge"}</button></div></div>
      </section>
      <section class="container tools-section"><div class="section-head"><div><h2>${copy.allTools}</h2><p>${copy.allToolsDesc}</p></div><div class="filters"><label class="search-box">⌕<input id="searchInput" value="${escapeHtml(query)}" placeholder="${copy.search}"/></label><div class="tabs">${["All","PDF","AI","Convert"].map(cat=>`<button class="${category===cat?'active':''}" data-category="${cat}">${cat}</button>`).join("")}</div></div></div><div class="tools-grid">${filtered.map(toolCard).join("")}</div></section>
      <section class="container credits-section">
        <div class="growth-card"><strong>${isRTL()?"كيف يعمل الرصيد؟":"How credits work"}</strong><p>${isRTL()?"كل أداة تستهلك رصيدًا بسيطًا. يمكنك كسب المزيد بمشاهدة إعلان تجريبي، وسيتم ربط الإعلانات الحقيقية لاحقًا.":"Each tool uses a small amount of credits. Earn more by watching a demo ad now; real rewarded ads will be connected later."}</p></div>
        <div class="growth-card"><strong>${isRTL()?"إعلانات للأدوات":"Ads for tools"}</strong><p>${isRTL()?"أدوات PDF تستهلك رصيدًا حتى نجهز نموذج الربح. عند نقص الرصيد يظهر خيار مشاهدة إعلان للحصول على رصيد.":"PDF tools use credits to prepare the monetization model. When credits are low, users can watch an ad to earn more."}</p></div>
        <div class="growth-card"><strong>${isRTL()?"جاهز للمرحلة القادمة":"Ready for the next phase"}</strong><p>${isRTL()?"بعد تثبيت الرصيد، نربط أول أداة AI حقيقية مثل تلخيص PDF واستخراج الأسئلة.":"After credits are stable, we can connect the first real AI tool such as PDF summarization and question extraction."}</p></div>
      </section>
    </main>
    <footer class="site-footer"><div class="container footer-inner"><span>© 2026 DocLingo AI</span><nav><button data-modal="pricing">Pricing</button><button data-modal="privacy">Privacy</button><button data-modal="terms">Terms</button><button data-modal="contact">Contact</button></nav></div></footer>
    <div id="modalRoot"></div>`;

  attachEvents();
}

function toolCard(tool) {
  const statusClass = tool.status.toLowerCase().replaceAll(" ", "-");
  return `<article class="tool-card"><div class="tool-header"><span class="status ${statusClass}">${tool.status}</span><div class="tool-icon">${tool.icon}</div></div><div class="tool-body"><h3>${label(tool)}</h3><p>${desc(tool)}</p></div><button class="btn btn-primary full" data-tool="${tool.id}">${tool.status === "Coming Soon" ? (isRTL()?"تفاصيل":"Details") : (isRTL()?"جرّب الآن":"Try now")}</button></article>`;
}

function attachEvents() {
  document.querySelectorAll("[data-action='toggle-lang']").forEach(btn => btn.onclick = () => { lang = isRTL() ? "en" : "ar"; render(); });
  document.querySelectorAll("[data-category]").forEach(btn => btn.onclick = () => { category = btn.dataset.category; render(); });
  document.querySelectorAll("[data-tool]").forEach(btn => btn.onclick = () => openTool(btn.dataset.tool));
  document.querySelectorAll("[data-modal]").forEach(btn => btn.onclick = () => openInfo(btn.dataset.modal));
  const search = $id("searchInput"); if (search) search.oninput = e => { query = e.target.value; render(); };
  const upload = $id("demoUpload"); if (upload) upload.onchange = e => { const f = e.target.files?.[0]; $id("selectedFile").innerHTML = f ? `<div class="file-line">✔ ${escapeHtml(f.name)}</div>` : ""; };
}

function modal(title, icon, body) {
  $id("modalRoot").innerHTML = `<div class="modal-backdrop"><section class="modal"><button class="modal-close" id="closeModal">×</button><div class="modal-icon">${icon}</div><h2>${title}</h2>${body}</section></div>`;
  $id("closeModal").onclick = closeModal;
  document.querySelector(".modal-backdrop").onclick = e => { if (e.target.classList.contains("modal-backdrop")) closeModal(); };
}
function closeModal(){ $id("modalRoot").innerHTML = ""; currentTool = null; }
function errBox(msg){ return msg ? `<div class="error-note">${escapeHtml(msg)}</div>` : ""; }
function fileLine(file){ return file ? `<div class="file-line">✔ ${escapeHtml(file.name)}</div>` : ""; }


async function submitNetlifyForm(formName, data) {
  const body = new URLSearchParams({ "form-name": formName, ...data }).toString();
  const response = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!response.ok) throw new Error("Form submission failed");
}


function startRewardedAd(afterDone) {
  let seconds = 5;
  const title = isRTL() ? "مشاهدة إعلان لكسب رصيد" : "Watch ad to earn credits";
  const draw = () => {
    modal(title, "🎬", `<p class="muted">${isRTL()?"هذا إعلان تجريبي. لاحقًا سيتم استبداله بإعلان حقيقي. كل مشاهدة تضيف +2 Credits.":"This is a demo ad. Later it will be replaced with a real rewarded ad. Every view adds +2 credits."}</p><div class="ad-box"><strong>${seconds}</strong><span>${isRTL()?"ثواني متبقية":"seconds left"}</span></div><button class="btn btn-secondary full" id="cancelAd">${isRTL()?"إلغاء":"Cancel"}</button>`);
    const cancel = $id("cancelAd");
    if (cancel) cancel.onclick = closeModal;
  };
  draw();
  const timer = setInterval(() => {
    seconds -= 1;
    if (seconds > 0) {
      draw();
      return;
    }
    clearInterval(timer);
    addCredits(2);
    modal(title, "✔", `<div class="preview-box"><div>✔ ${isRTL()?"تمت إضافة +2 Credits":"+2 credits added"}</div></div><button class="btn btn-primary full" id="okModal">${t[lang].gotIt}</button>`);
    setTimeout(() => {
      const ok = $id("okModal");
      if (ok) ok.onclick = () => { closeModal(); render(); if (afterDone) afterDone(); };
    }, 0);
  }, 1000);
}
function creditsModal() {
  const credits = getCredits();
  const used = getUsageCount();
  modal(isRTL()?"الرصيد والاستخدام":"Credits & Usage", "💳", `<p class="muted">${isRTL()?"الرصيد تجريبي ومحلي الآن. يمكنك كسب رصيد غير محدود بمشاهدة إعلان تجريبي.":"Credits are local for now. You can earn unlimited demo credits by watching a demo ad."}</p><div class="usage-meter"><div><strong>${credits}</strong><span>${isRTL()?"رصيد حالي":"current credits"}</span></div><div><strong>${used}</strong><span>${isRTL()?"عمليات مستخدمة":"actions used"}</span></div></div><div class="cost-list"><strong>${isRTL()?"تكلفة الأدوات":"Tool costs"}</strong><p>PDF tools: 1 credit</p><p>${isRTL()?"تلخيص PDF: 2، استخراج أسئلة: 3، وضع الطالب: 4، الترجمة: 5":"PDF Summary: 2, Questions: 3, Student Mode: 4, Translation: 5"}</p></div><button class="btn btn-primary full" id="watchAdCredit">${isRTL()?"شاهد إعلان واحصل على +2":"Watch ad and earn +2"}</button><button class="btn btn-secondary full" id="resetCredits">${isRTL()?"إعادة ضبط التجربة":"Reset demo"}</button><button class="btn btn-secondary full" id="okModal">${t[lang].gotIt}</button>`);
  setTimeout(()=>{
    const ad=$id("watchAdCredit"); if(ad) ad.onclick=()=>startRewardedAd(()=>creditsModal());
    const reset=$id("resetCredits"); if(reset) reset.onclick=()=>{ setCredits(10); localStorage.setItem("doclingo_tool_uses","0"); closeModal(); render(); };
    const ok=$id("okModal"); if(ok) ok.onclick=closeModal;
  },0);
}
function needCreditsModal(tool) {
  modal(isRTL()?"الرصيد غير كافٍ":"Not enough credits", "💳", `<p class="muted">${isRTL()?`تحتاج ${toolCost(tool.id)} رصيد لاستخدام ${label(tool)}. شاهد إعلانًا لتحصل على +2 Credits.`:`You need ${toolCost(tool.id)} credits to use ${label(tool)}. Watch an ad to earn +2 credits.`}</p><button class="btn btn-primary full" id="earnForTool">${isRTL()?"شاهد إعلان واحصل على +2":"Watch ad and earn +2"}</button><button class="btn btn-secondary full" id="okModal">${t[lang].gotIt}</button>`);
  setTimeout(()=>{
    const earn=$id("earnForTool"); if(earn) earn.onclick=()=>startRewardedAd(()=>openTool(tool.id));
    const ok=$id("okModal"); if(ok) ok.onclick=closeModal;
  },0);
}

function openInfo(type) {
  const names = {
    privacy: isRTL()?"سياسة الخصوصية":"Privacy Policy",
    terms: isRTL()?"شروط الاستخدام":"Terms of Use",
    contact: isRTL()?"تواصل معنا":"Contact",
    pricing: isRTL()?"الأسعار والرصيد":"Pricing & Credits",
    beta: isRTL()?"انضم للنسخة التجريبية":"Join Beta"
  };
  if (type === "credits") {
    creditsModal();
    return;
  }
  if (type === "pricing") {
    modal(names[type], "✨", `<p class="muted">${isRTL()?"واجهة مبدئية فقط. الدفع غير مفعل الآن.":"Initial interface only. Payments are not enabled yet."}</p><div class="pricing-grid"><div class="plan-card"><strong>Free</strong><span>${isRTL()?"مجاني":"Free"}</span><ul><li>${isRTL()?"أدوات PDF داخل المتصفح":"Browser PDF tools"}</li><li>${isRTL()?"بدون حساب الآن":"No account required now"}</li></ul></div><div class="plan-card"><strong>Credits</strong><span>${isRTL()?"لاحقًا":"Soon"}</span><ul><li>${isRTL()?"رصيد للتلخيص والترجمة":"Credits for AI tools"}</li><li>${isRTL()?"تحكم في التكلفة":"Control cost"}</li></ul></div><div class="plan-card"><strong>Pro</strong><span>${isRTL()?"لاحقًا":"Soon"}</span><ul><li>${isRTL()?"حدود أعلى":"Higher limits"}</li><li>${isRTL()?"أولوية في المعالجة":"Priority processing"}</li></ul></div></div><button class="btn btn-primary full" id="okModal">${t[lang].gotIt}</button>`);
  } else if (type === "beta") {
    modal(names[type], "✉️", `<p class="muted">${isRTL()?"اترك بريدك لتكون من أوائل المستخدمين عند تفعيل AI والدفع.":"Leave your email for early access when AI and payments are enabled."}</p><input class="modal-input" id="betaEmail" type="email" placeholder="${isRTL()?"بريدك الإلكتروني":"Your email"}"/><button class="btn btn-primary full" id="saveBeta">${isRTL()?"انضم للقائمة":"Join list"}</button>`);
    setTimeout(()=>{ const btn=$id("saveBeta"); if(btn) btn.onclick=async()=>{ const email=$id("betaEmail").value; try { await submitNetlifyForm("beta-access", { email, source: "site-beta-modal" }); localStorage.setItem("doclingo_beta_email", email); modal(names[type], "✔", `<div class="preview-box"><div>✔ ${isRTL()?"تم إرسال طلب الانضمام بنجاح":"Beta request sent successfully"}</div></div><button class="btn btn-primary full" id="okModal">${t[lang].gotIt}</button>`); } catch(e) { modal(names[type], "✔", `<div class="preview-box"><div>✔ ${isRTL()?"تم حفظ الطلب محليًا، وسيتم ربط الحفظ السحابي لاحقًا":"Saved locally; cloud form will be finalized later"}</div></div><button class="btn btn-primary full" id="okModal">${t[lang].gotIt}</button>`); } setTimeout(()=>{ const ok=$id("okModal"); if(ok) ok.onclick=closeModal; },0); }; },0);
    return;
  } else if (type === "contact") {
    modal(names[type], "💬", `<p class="muted">${isRTL()?"أرسل اقتراحك أو مشكلتك. النموذج مهيأ لـ Netlify Forms.":"Send your suggestion or issue. The form is prepared for Netlify Forms."}</p><input class="modal-input" id="contactEmail" placeholder="${isRTL()?"بريدك الإلكتروني":"Your email"}"/><textarea class="modal-input textarea" id="contactMessage" placeholder="${isRTL()?"اكتب رسالتك":"Write your message"}"></textarea><button class="btn btn-primary full" id="sendContact">${isRTL()?"إرسال":"Send"}</button>`);
    setTimeout(()=>{ const btn=$id("sendContact"); if(btn) btn.onclick=async()=>{ const email=$id("contactEmail").value; const message=$id("contactMessage").value; try { await submitNetlifyForm("contact", { email, message }); modal(names[type], "✔", `<div class="preview-box"><div>✔ ${isRTL()?"تم إرسال الرسالة بنجاح":"Message sent successfully"}</div></div><button class="btn btn-primary full" id="okModal">${t[lang].gotIt}</button>`); } catch(e) { modal(names[type], "✔", `<div class="preview-box"><div>✔ ${isRTL()?"تم تجهيز الرسالة محليًا، وسيتم ربط الإرسال السحابي لاحقًا":"Message prepared locally; cloud submission will be finalized later"}</div></div><button class="btn btn-primary full" id="okModal">${t[lang].gotIt}</button>`); } setTimeout(()=>{ const ok=$id("okModal"); if(ok) ok.onclick=closeModal; },0); }; },0);
    return;
  } else {
    const items = type === "privacy" ? (isRTL()? ["أدوات PDF تعمل داخل المتصفح ولا ترفع الملفات إلى خادم.","لا نستخدم ملفات المستخدمين لتدريب النماذج.","سيتم توضيح معالجة AI عند تفعيلها."] : ["PDF tools run in-browser without server upload.","User files are not used to train models.","AI processing details will be disclosed when enabled."]) : (isRTL()? ["الخدمة في مرحلة تجريبية.","راجع النتائج قبل الاستخدام الرسمي.","ارفع الملفات التي تملك حق استخدامها فقط."] : ["The service is currently beta.","Review outputs before official use.","Only upload files you have rights to use."]);
    modal(names[type], type === "privacy" ? "🛡️" : "📄", `<ul class="info-list">${items.map(i=>`<li>${i}</li>`).join("")}</ul><button class="btn btn-primary full" id="okModal">${t[lang].gotIt}</button>`);
  }
  setTimeout(()=>{ const ok=$id("okModal"); if(ok) ok.onclick=closeModal; },0);
}

function openTool(id) {
  const tool = tools.find(t => t.id === id);
  if (!tool) return;
  if (tool.status !== "Available") return openAiOrPlaceholder(tool);
  currentTool = { id, file: null, files: [], pages: id === "split-pdf" || id === "remove-pages" ? "1" : id === "reorder-pages" ? "1,2,3" : "", angle: "90", start: "1", error: "", busy: false };
  renderToolModal(tool);
}

function renderToolModal(tool) {
  const state = currentTool;
  let fields = "";
  if (tool.id === "merge-pdf") {
    fields = `<input class="modal-input" id="toolFiles" type="file" accept="application/pdf,.pdf" multiple/>${state.files.map(fileLine).join("")}${state.files.length ? `<button class="btn btn-secondary full" id="clearFiles">${isRTL()?"مسح الملفات":"Clear files"}</button>` : ""}`;
  } else {
    fields = `<input class="modal-input" id="toolFile" type="file" accept="application/pdf,.pdf"/>${fileLine(state.file)}`;
    if (["split-pdf","remove-pages","reorder-pages"].includes(tool.id)) fields += `<input class="modal-input" id="pagesInput" value="${escapeHtml(state.pages)}" placeholder="${isRTL()?"مثال: 1-3,5":"Example: 1-3,5"}"/>`;
    if (tool.id === "rotate-pdf") fields += `<input class="modal-input" id="pagesInput" value="${escapeHtml(state.pages)}" placeholder="${isRTL()?"فارغ لكل الصفحات أو 1-3":"Empty for all pages or 1-3"}"/><select class="modal-input" id="angleInput"><option value="90">90°</option><option value="180">180°</option><option value="270">270°</option></select>`;
    if (tool.id === "page-numbers") fields += `<input class="modal-input" id="startInput" value="${escapeHtml(state.start)}" placeholder="${isRTL()?"ابدأ من رقم":"Start number"}"/>`;
  }
  modal(label(tool), tool.icon, `<p class="muted">${desc(tool)}</p><div class="cost-badge">${isRTL()?"التكلفة":"Cost"}: ${costLabel(tool.id)}</div>${fields}${errBox(state.error)}<button class="btn btn-primary full" id="processTool">${state.busy ? t[lang].processing : t[lang].process}</button>`);
  bindToolModal(tool);
}

function bindToolModal(tool) {
  const state = currentTool;
  const fileInput = $id("toolFile");
  if (fileInput) fileInput.onchange = e => { state.file = e.target.files?.[0] || null; renderToolModal(tool); };
  const filesInput = $id("toolFiles");
  if (filesInput) filesInput.onchange = e => { state.files = [...state.files, ...Array.from(e.target.files || [])]; renderToolModal(tool); };
  const clear = $id("clearFiles");
  if (clear) clear.onclick = () => { state.files = []; state.error = ""; renderToolModal(tool); };
  const pagesInput = $id("pagesInput");
  if (pagesInput) pagesInput.oninput = e => { state.pages = e.target.value; };
  const angleInput = $id("angleInput");
  if (angleInput) { angleInput.value = state.angle; angleInput.onchange = e => { state.angle = e.target.value; }; }
  const startInput = $id("startInput");
  if (startInput) startInput.oninput = e => { state.start = e.target.value; };
  const process = $id("processTool");
  if (process) process.onclick = () => processTool(tool);
}

function parsePages(value, totalPages, allowEmptyAll = true) {
  const rtl = isRTL();
  const text = String(value || "").trim();
  if (!text && allowEmptyAll) return [...Array(totalPages)].map((_, i) => i);
  if (!text) throw new Error(rtl ? "اكتب الصفحات المطلوبة." : "Enter pages.");
  const nums = [];
  for (const part of text.split(",").map(x => x.trim()).filter(Boolean)) {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map(Number);
      if (!a || !b || a > b) throw new Error(rtl ? "صيغة الصفحات غير صحيحة." : "Invalid page range.");
      for (let n=a; n<=b; n++) nums.push(n);
    } else {
      const n = Number(part);
      if (!n) throw new Error(rtl ? "رقم صفحة غير صحيح." : "Invalid page number.");
      nums.push(n);
    }
  }
  const unique = [...new Set(nums)];
  if (unique.some(n => n < 1 || n > totalPages)) throw new Error(rtl ? `أدخل صفحات بين 1 و ${totalPages}.` : `Enter pages between 1 and ${totalPages}.`);
  return unique.map(n => n - 1);
}

async function processTool(tool) {
  const s = currentTool;
  const cost = toolCost(tool.id);
  if (getCredits() < cost) { needCreditsModal(tool); return; }
  try {
    s.error = ""; s.busy = true; renderToolModal(tool);
    if (tool.id === "merge-pdf") {
      if (s.files.length < 2) throw new Error(isRTL()?"اختر ملفين PDF على الأقل.":"Choose at least two PDF files.");
      const output = await PDFDocument.create();
      for (const file of s.files) {
        const pdf = await PDFDocument.load(await file.arrayBuffer());
        const pages = await output.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => output.addPage(page));
      }
      downloadPdf(await output.save(), "doclingo-merged.pdf");
      spendCredits(cost);
      recordToolUse(tool.id);
      closeModal(); render(); return;
    }
    if (!s.file) throw new Error(isRTL()?"اختر ملف PDF أولًا.":"Choose a PDF file first.");
    const pdf = await PDFDocument.load(await s.file.arrayBuffer());
    const count = pdf.getPageCount();
    if (tool.id === "split-pdf") {
      const selected = parsePages(s.pages, count, false);
      const output = await PDFDocument.create();
      const pages = await output.copyPages(pdf, selected);
      pages.forEach(page => output.addPage(page));
      downloadPdf(await output.save(), "doclingo-split.pdf");
    }
    if (tool.id === "remove-pages") {
      const remove = new Set(parsePages(s.pages, count, false));
      const keep = pdf.getPageIndices().filter(i => !remove.has(i));
      if (!keep.length) throw new Error(isRTL()?"لا يمكن حذف كل الصفحات.":"You cannot remove all pages.");
      const output = await PDFDocument.create();
      const pages = await output.copyPages(pdf, keep);
      pages.forEach(page => output.addPage(page));
      downloadPdf(await output.save(), "doclingo-pages-removed.pdf");
    }
    if (tool.id === "rotate-pdf") {
      parsePages(s.pages, count, true).forEach(i => pdf.getPage(i).setRotation(degrees(Number(s.angle))));
      downloadPdf(await pdf.save(), "doclingo-rotated.pdf");
    }
    if (tool.id === "reorder-pages") {
      const order = parsePages(s.pages, count, false);
      const output = await PDFDocument.create();
      const pages = await output.copyPages(pdf, order);
      pages.forEach(page => output.addPage(page));
      downloadPdf(await output.save(), "doclingo-reordered.pdf");
    }
    if (tool.id === "page-numbers") {
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      pdf.getPages().forEach((page, i) => {
        const { width } = page.getSize();
        page.drawText(String(Number(s.start || 1) + i), { x: width / 2 - 6, y: 22, size: 11, font, color: rgb(.15,.15,.15) });
      });
      downloadPdf(await pdf.save(), "doclingo-numbered.pdf");
    }
    spendCredits(cost);
    recordToolUse(tool.id);
    closeModal(); render();
  } catch (e) {
    s.error = e?.message || "Error"; s.busy = false; renderToolModal(tool);
  }
}

function openAiOrPlaceholder(tool) {
  if (["pdf-summarizer", "extract-questions", "student-mode"].includes(tool.id)) {
    const list = tool.id === "pdf-summarizer" ? (isRTL()? ["ملخص سريع", "أهم النقاط", "اقتراحات للمراجعة"] : ["Quick summary", "Key points", "Revision suggestions"]) : tool.id === "extract-questions" ? (isRTL()? ["اختيار من متعدد", "صح وخطأ", "أسئلة قصيرة"] : ["Multiple choice", "True or false", "Short questions"]) : (isRTL()? ["ملخص", "مصطلحات", "أسئلة", "خطة مذاكرة"] : ["Summary", "Key terms", "Questions", "Study plan"]);
    modal(label(tool), tool.icon, `<p class="muted">${isRTL()?"واجهة تجريبية. سيتم ربط الذكاء الاصطناعي في المرحلة القادمة.":"Beta interface. AI processing will be connected in the next phase."}</p><div class="cost-badge">${isRTL()?"التكلفة القادمة":"Upcoming cost"}: ${costLabel(tool.id)}</div><input class="modal-input" type="file" accept="application/pdf,.pdf,.docx,.txt"/><div class="preview-box">${list.map(x=>`<div>✔ ${x}</div>`).join("")}</div><button class="btn btn-primary full" id="okModal">${t[lang].gotIt}</button>`);
  } else {
    modal(label(tool), tool.icon, `<p class="muted">${isRTL()?"هذه الأداة ضمن خطة التفعيل القادمة.":"This tool is on the activation roadmap."}</p><button class="btn btn-primary full" id="okModal">${t[lang].gotIt}</button>`);
  }
  setTimeout(()=>{ const ok=$id("okModal"); if(ok) ok.onclick=closeModal; },0);
}

render();
