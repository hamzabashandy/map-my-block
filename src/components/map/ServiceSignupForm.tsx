import { ArrowLeft } from "lucide-react";
import { useState } from "react";

type Values = Record<string, string>;

const FIELDS: {
  name: string;
  label: string;
  type: "text" | "tel" | "email" | "textarea";
  required?: boolean;
}[] = [
  { name: "name", label: "Name of your service or business", type: "text", required: true },
  { name: "description_short", label: "What you do, in a few words", type: "text", required: true },
  { name: "description_long", label: "Tell us more", type: "textarea" },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "website", label: "Website or social handle", type: "text" },
  { name: "address", label: 'Where you work — address, or "mobile"', type: "text" },
  { name: "hours", label: "When you're available", type: "text" },
  { name: "offer", label: "What could you share with the neighbourhood?", type: "textarea" },
  { name: "looking_for", label: "What are you looking for?", type: "textarea" },
];

const inputClass =
  "w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[13px] text-foreground outline-none transition-colors placeholder:text-white/25 focus:border-white/20";

export function ServiceSignupForm({ onBack }: { onBack: () => void }) {
  const [values, setValues] = useState<Values>({});
  const [consent, setConsent] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: string, v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const canSubmit =
    consent &&
    FIELDS.filter((f) => f.required).every((f) => (values[f.name] ?? "").trim());

  if (sent) {
    return (
      <div className="thin-scroll h-full overflow-y-auto px-3 pb-4">
        <h3 className="font-serif text-[19px] leading-tight">
          Thanks — we'll be in touch
        </h3>
        <p className="mt-2 text-[12.5px] leading-relaxed text-white/50">
          A person reviews every listing before it appears in the directory.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 text-[12.5px] text-white/70 underline underline-offset-2 hover:text-white"
        >
          Back to services
        </button>
      </div>
    );
  }

  return (
    <div className="thin-scroll h-full overflow-y-auto px-3 pb-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1.5 text-[12.5px] text-white/55 transition-colors hover:text-white/90"
      >
        <ArrowLeft size={13} />
        Back to services
      </button>

      <p className="mb-4 rounded-lg bg-white/[0.04] px-2.5 py-2 text-[11.5px] leading-snug text-white/45">
        This form isn't connected yet — nothing is saved.
      </p>

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
      >
        {FIELDS.map((f) => (
          <label key={f.name} className="block">
            <span className="mb-1 block text-[11.5px] text-white/55">
              {f.label}
              {f.required && <span className="text-white/30"> *</span>}
            </span>
            {f.type === "textarea" ? (
              <textarea
                rows={3}
                required={f.required}
                value={values[f.name] ?? ""}
                onChange={(e) => set(f.name, e.target.value)}
                className={inputClass}
              />
            ) : (
              <input
                type={f.type}
                required={f.required}
                value={values[f.name] ?? ""}
                onChange={(e) => set(f.name, e.target.value)}
                className={inputClass}
              />
            )}
          </label>
        ))}

        <label className="flex items-start gap-2 pt-1">
          <input
            type="checkbox"
            checked={consent}
            required
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-[3px]"
          />
          <span className="text-[11.5px] leading-snug text-white/55">
            I'm happy for these details to appear in the public directory.
          </span>
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-white/[0.1] py-2 text-[12.5px] font-medium text-foreground transition-colors hover:bg-white/[0.16] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
