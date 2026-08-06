import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import type { Business } from "../../data/businesses";

type Values = Record<string, string>;

const inputClass =
  "w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[13px] text-foreground outline-none transition-colors placeholder:text-white/25 focus:border-white/20";

export function EventProposalForm({
  onBack,
  venues,
  projects,
}: {
  onBack: () => void;
  venues: Business[];
  projects: Business[];
}) {
  const [values, setValues] = useState<Values>({});
  const [sent, setSent] = useState(false);
  const set = (k: string, v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const whereOther = values.where === "__other";
  const required = [
    "title",
    "description",
    "where",
    "date",
    "frequency",
    "your_name",
    "your_email",
  ];
  const canSubmit =
    required.every((k) => (values[k] ?? "").trim()) &&
    (!whereOther || (values.where_other ?? "").trim());

  if (sent) {
    return (
      <div className="thin-scroll h-full overflow-y-auto px-3 pb-4">
        <h3 className="font-serif text-[19px] leading-tight">
          Thanks — we'll check it with the venue
        </h3>
        <p className="mt-2 text-[12.5px] leading-relaxed text-white/50">
          Every event is confirmed with the host before it appears.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 text-[12.5px] text-white/70 underline underline-offset-2 hover:text-white"
        >
          Back to calendar
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
        Back to calendar
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
        <Field label="Event name" required>
          <input
            type="text"
            required
            value={values.title ?? ""}
            onChange={(e) => set("title", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="What is it?" required>
          <textarea
            rows={3}
            required
            value={values.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Where is it?" required>
          <select
            required
            value={values.where ?? ""}
            onChange={(e) => set("where", e.target.value)}
            className={inputClass}
          >
            <option value="">Choose a place</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
            <option value="__other">Somewhere else</option>
          </select>
          {whereOther && (
            <input
              type="text"
              required
              placeholder="Where?"
              value={values.where_other ?? ""}
              onChange={(e) => set("where_other", e.target.value)}
              className={`${inputClass} mt-2`}
            />
          )}
        </Field>

        <Field label="Part of a project?">
          <select
            value={values.project ?? ""}
            onChange={(e) => set("project", e.target.value)}
            className={inputClass}
          >
            <option value="">No</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Date" required>
          <input
            type="date"
            required
            value={values.date ?? ""}
            onChange={(e) => set("date", e.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="flex gap-2">
          <div className="flex-1">
            <Field label="Start time">
              <input
                type="time"
                value={values.start_time ?? ""}
                onChange={(e) => set("start_time", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="flex-1">
            <Field label="End time">
              <input
                type="time"
                value={values.end_time ?? ""}
                onChange={(e) => set("end_time", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        <Field label="Does it repeat?" required>
          <select
            required
            value={values.frequency ?? ""}
            onChange={(e) => set("frequency", e.target.value)}
            className={inputClass}
          >
            <option value="">Choose</option>
            <option value="once">Once</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </Field>

        <Field label="Cost">
          <input
            type="text"
            value={values.cost ?? ""}
            onChange={(e) => set("cost", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Booking link">
          <input
            type="url"
            value={values.registration_url ?? ""}
            onChange={(e) => set("registration_url", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Your name" required>
          <input
            type="text"
            required
            value={values.your_name ?? ""}
            onChange={(e) => set("your_name", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Your email" required>
          <input
            type="email"
            required
            value={values.your_email ?? ""}
            onChange={(e) => set("your_email", e.target.value)}
            className={inputClass}
          />
        </Field>

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

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11.5px] text-white/55">
        {label}
        {required && <span className="text-white/30"> *</span>}
      </span>
      {children}
    </label>
  );
}
