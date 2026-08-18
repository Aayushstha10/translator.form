import { Fragment, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
const SECTIONS = [
  {
    title: { en: "Personal Details", ja: "個人情報" },
    cols: 3,
    fields: [
      { name: "fullNameEnglish", en: "Full Name", ja: "フルネーム", required: true, translate: true},
      { name: "dateOfBirth", en: "Date of Birth (B.S.)", ja: "生年月日", required: true, translate: false, placeholder: "2058-04-12" },
      { name: "gender", en: "Gender", ja: "性別", required: true, translate: true, type: "select", options: [
        { value: "", label: "Select" },
        { value: "Male", label: "Male (男性)" },
        { value: "Female", label: "Female (女性)" },
        { value: "Other", label: "Other (その他)" },
      ] },
    ],
  },
  {
    title: { en: "Family Details", ja: "家族情報" },
    cols: 2,
    fields: [
      { name: "fatherName", en: "Father's Name", ja: "父の名前", required: true, translate: true },
      { name: "motherName", en: "Mother's Name", ja: "母の名前", required: true, translate: true },
      { name: "grandfatherName", en: "Grandfather's Name (optional)", ja: "祖父の名前", required: false, translate: true },
      { name: "spouseName", en: "Spouse's Name (if married)", ja: "配偶者の名前", required: false, translate: true },
    ],
  },
  {
    title: { en: "Permanent Address", ja: "現住所" },
    cols: 3,
    fields: [
      { name: "permanentDistrict", en: "District", ja: "郡", required: true, translate: true, placeholder: "Kathmandu" },
      { name: "municipality", en: "Municipality / VDC", ja: "市町村", required: true, translate: true },
      { name: "wardNo", en: "Ward No.", ja: "区番号", required: true, translate: false, numeric: true },
    ],
  },
  {
    title: { en: "Citizenship Certificate", ja: "市民権証明書" },
    cols: 3,
    fields: [
      { name: "citizenshipNumber", en: "Certificate Number", ja: "証明書番号", required: true, translate: false, numeric: true },
      { name: "issuedDistrict", en: "Issued District", ja: "発行地区", required: true, translate: true },
      { name: "issuedDate", en: "Issued Date (B.S.)", ja: "発行日", required: true, translate: false },
    ],
  },
  {
    title: { en: "Purpose of Application", ja: "申請目的" },
    cols: 1,
    fields: [
      { name: "purposeEnglish", en: "Purpose", ja: "目的", required: false, translate: true, type: "textarea"},
    ],
  },
];

const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields);
const initialState = Object.fromEntries(ALL_FIELDS.map((f) => [f.name, ""]));
async function translateText(text, fieldName) {
  const response = await fetch("http://localhost:5000/api/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      field: fieldName,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || data.error || "Translation failed"
    );
  }

  if (!data.translated) {
    throw new Error("No translation returned");
  }

  return data.translated;
}

function GateDivider() {
  return (
    <svg className="w-full h-10 sm:h-11 mx-auto mt-3" viewBox="0 0 600 60" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Nepal pagoda silhouette merging into a Japanese torii gate">
      <line x1="0" y1="52" x2="600" y2="52" stroke="#e7e2d6" strokeWidth="1" />
      <g fill="#c99a2e"><path d="M60 52 L60 30 L52 30 L75 14 L98 30 L90 30 L90 52 Z" /><path d="M56 30 L94 30 L94 24 L56 24 Z" /></g>
      <g fill="#dc143c"><rect x="180" y="18" width="4" height="34" /><rect x="230" y="18" width="4" height="34" /><rect x="172" y="18" width="70" height="5" /><rect x="168" y="26" width="78" height="4" /></g>
      <g fill="#003893"><rect x="330" y="18" width="4" height="34" /><rect x="380" y="18" width="4" height="34" /><rect x="322" y="18" width="70" height="5" /><rect x="318" y="26" width="78" height="4" /></g>
      <g fill="#e3444a"><rect x="470" y="16" width="5" height="36" /><rect x="522" y="16" width="5" height="36" /><rect x="462" y="16" width="70" height="6" /><rect x="458" y="25" width="78" height="5" /></g>
    </svg>
  );
}

function ToriiMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 26 26" className="flex-shrink-0 mt-0.5" role="img" aria-label="Japanese translation">
      <rect x="10.5" y="9" width="1.6" height="14" fill="#e3444a" />
      <rect x="14" y="9" width="1.6" height="14" fill="#e3444a" />
      <rect x="6" y="6" width="14" height="2.2" fill="#e3444a" />
      <rect x="4" y="9.5" width="18" height="1.8" fill="#e3444a" />
    </svg>
  );
}
function useLiveTranslation({
  debounce = 600,
  fieldName,
  onTranslationUpdate,
} = {}) {
  const [state, setState] = useState({ text: "", status: "idle" }); 
  const timerRef = useRef(null);
  const seqRef = useRef(0);

  const trigger = (text) => {
    clearTimeout(timerRef.current);
    if (!text.trim()) {
      setState({ text: "", status: "idle" });
      if (onTranslationUpdate) onTranslationUpdate("");
      return;
    }
    const run = async () => {
      const thisSeq = ++seqRef.current;
      setState({ text: "", status: "loading" });
      try {
        const translated = await translateText(text, fieldName);
        if (thisSeq !== seqRef.current) return;
        setState({ text: translated, status: "done" });
        if (onTranslationUpdate) onTranslationUpdate(translated);
      } catch (err) {
        if (thisSeq !== seqRef.current) return;
        setState({ text: err.message, status: "error" });
        if (onTranslationUpdate) onTranslationUpdate("");
      }
    };
    if (debounce) {
      timerRef.current = setTimeout(run, debounce);
    } else {
      run();
    }
  };

  return { ...state, trigger };
}

function TranslatePanel({ status, text }) {
  return (
    <div className="mt-2 flex items-start gap-1.5">
      <ToriiMark />
      {status === "loading" && <p className="mt-text loading">Translating…</p>}
      {status === "error" && <p className="mt-text error">Translation failed: {text}</p>}
      {status === "done" && <p className="mt-text result font-ja">{text}</p>}
      {status === "idle" && <p className="mt-text placeholder">Japanese translation will appear here.</p>}
    </div>
  );
}

function Field({ field, value, onChange, error, onTranslationUpdate }) {
  const live = useLiveTranslation({
    debounce: field.type === "select" ? 0 : 600,
    fieldName: field.name,
    onTranslationUpdate,
  });

  const handleChange = (e) => {
    onChange(field.name, e.target.value);
    if (field.translate) live.trigger(e.target.value);
  };

  const label = (
    <label className="block text-sm font-medium text-slate-600 mb-1">
      {field.en} <span className="font-ja text-rose-600">({field.ja})</span>
    </label>
  );

  let control;
  if (field.type === "select") {
    control = (
      <select className="field-input" value={value} onChange={handleChange}>
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  } else if (field.type === "textarea") {
    control = (
      <textarea
        className="field-input min-h-[84px] resize-y"
        value={value}
        onChange={handleChange}
        placeholder={field.placeholder}
      />
    );
  } else {
    control = (
      <input
        className="field-input"
        inputMode={field.numeric ? "numeric" : undefined}
        value={value}
        onChange={handleChange}
        placeholder={field.placeholder}
      />
    );
  }

  return (
    <div className={field.type === "textarea" ? "sm:col-span-full" : ""}>
      {label}
      {control}
      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
      {field.translate && <TranslatePanel status={live.status} text={live.text} />}
    </div>
  );
}

export default function CitizenshipForm() {
  const [form, setForm] = useState(initialState);
  const [translations, setTranslations] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const printableRef = useRef(null);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const handleTranslationUpdate = (fieldName, translatedText) => {
    setTranslations((prev) => ({ ...prev, [fieldName]: translatedText }));
  };

  const validate = () => {
    const missing = ALL_FIELDS.filter((f) => f.required && !form[f.name]?.trim());
    const next = {};
    missing.forEach((f) => { next[f.name] = "This field is required."; });
    setErrors(next);
    return missing;
  };
  const gridCols = (n) => (n === 1 ? "grid-cols-1" : n === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3");

  const buildPrintableRows = () =>
    SECTIONS.map((section) => ({
      title: section.title,
      rows: section.fields.map((f) => ({
        label: f.en,
        jaLabel: f.ja,
        value: form[f.name]?.trim() || "—",
        jaValue: f.translate ? (translations[f.name] || "—") : (form[f.name]?.trim() || "—"),
      })),
    }));

  const handleDownloadPdf = async () => {
    const missing = validate();
    if (missing.length) {
      setStatus({ type: "error", message: `Please fill in: ${missing.map((f) => f.en).join(", ")}` });
      return;
    }
    setStatus({ type: "success", message: "Generating PDF…" });
    const node = printableRef.current;
    node.style.display = "block";
    const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff" });
    node.style.display = "none";

    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 60;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 30, 30, imgWidth, imgHeight);
    pdf.save("nepali-citizenship-application.pdf");
    setStatus({ type: "success", message: "PDF downloaded." });
  };

  const handleDownloadWord = () => {
    const missing = validate();
    if (missing.length) {
      setStatus({ type: "error", message: `Please fill in: ${missing.map((f) => f.en).join(", ")}` });
      return;
    }
    const node = printableRef.current;
    const html =
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
      '<head><meta charset="utf-8"><title>Nepali Citizenship Application</title></head><body>' +
      node.innerHTML +
      "</body></html>";
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "nepali-citizenship-application.doc";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatus({ type: "success", message: "Word document downloaded." });
  };

  return (
    <div className="w-full max-w-4xl">
      <header className="text-center mb-6 sm:mb-7">
        <h1 className="font-display font-semibold text-xl sm:text-2xl md:text-3xl mb-1 px-2">
          Nepali Citizenship Application <span className="font-ja text-rose-600">(ネパール市民権申請書)</span>
        </h1>
        <GateDivider />
      </header>

      <form className="bg-white border border-stone-200 rounded-2xl shadow-sm p-4 sm:p-6 md:p-8" onSubmit={(e) => e.preventDefault()}>
        {SECTIONS.map((section) => (
          <section className="mb-7 sm:mb-8" key={section.title.en}>
            <h2 className="font-display font-semibold text-base sm:text-lg text-blue-900 pb-2 mb-4 inline-block section-title">
              {section.title.en} <span className="font-ja text-sm sm:text-base text-rose-600">({section.title.ja})</span>
            </h2>
            <div className={`grid ${gridCols(section.cols)} gap-4`}>
              {section.fields.map((field) => (
                <Field
                  key={field.name}
                  field={field}
                  value={form[field.name]}
                  onChange={handleChange}
                  error={errors[field.name]}
                  onTranslationUpdate={(translated) => handleTranslationUpdate(field.name, translated)}
                />
              ))}
            </div>
          </section>
        ))}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-end border-t border-stone-200 pt-5">
          {status && (
            <span className={`text-sm sm:mr-auto ${status.type === "error" ? "text-red-700" : "text-emerald-700"}`}>
              {status.message}
            </span>
          )}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="px-5 py-2.5 rounded-lg font-semibold text-white bg-blue-900 hover:bg-blue-950 transition text-sm sm:text-base"
          >
            Download PDF <span className="font-ja">(PDF)</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadWord}
            className="px-5 py-2.5 rounded-lg font-semibold text-white bg-red-700 hover:bg-red-800 transition text-sm sm:text-base"
          >
            Download Word <span className="font-ja">(Word)</span>
          </button>
        </div>
      </form>

      <div ref={printableRef} style={{ display: "none", width: 700 }} className="bg-white p-10">
        <h1 className="font-display font-semibold text-2xl mb-1">
          Nepali Citizenship Application <span className="font-ja text-rose-600">(ネパール市民権申請書)</span>
        </h1>
        <p className="text-xs text-slate-500 mb-6">Details</p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {buildPrintableRows().map((section) => (
              <Fragment key={section.title.en}>
                <tr>
                  <td colSpan={4} style={{ padding: "10px 0 6px", fontWeight: 600, fontSize: 14, color: "#003893", borderBottom: "2px solid #c99a2e" }}>
                    {section.title.en} ({section.title.ja})
                  </td>
                </tr>
                {section.rows.map((row) => (
                  <tr key={row.label}>
                    <td style={{ padding: "6px 12px 6px 0", fontSize: 11, color: "#5a5f6d", width: "20%", verticalAlign: "top", fontWeight: 500 }}>{row.label}</td>
                    <td style={{ padding: "6px 12px 6px 12px", fontSize: 12, color: "#1b1f2a", width: "30%", verticalAlign: "top", borderRight: "1px solid #e0e0e0" }}>{row.value}</td>
                    <td style={{ padding: "6px 12px 6px 12px", fontSize: 10, color: "#5a5f6d", width: "20%", verticalAlign: "top", fontWeight: 500, fontFamily: "serif" }}>{row.jaLabel}</td>
                    <td style={{ padding: "6px 0", fontSize: 12, color: "#1b1f2a", width: "30%", verticalAlign: "top", fontFamily: "serif" }}>{row.jaValue}</td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}