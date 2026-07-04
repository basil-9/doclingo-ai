# DocLingo AI - Clean Stable V12

نسخة مستقرة ونظيفة بالكامل.

## سبب الإصلاح

تمت إضافة استيراد ملف التصميم داخل `src/main.js`:

```js
import "./styles.css";
```

هذا يضمن أن Vite يحمّل التصميم ولا تظهر الصفحة بشكل HTML خام.

## الملفات الصحيحة

```text
README.md
index.html
netlify.toml
package.json
src/
  main.js
  styles.css
```

## Included

- Merge PDF
- Split PDF / Extract pages
- Remove pages
- Rotate PDF
- Reorder pages
- Add page numbers
- AI Student Pack placeholder interfaces
- Join Beta modal
- Pricing / Credits UI
- Privacy / Terms / Contact modals
