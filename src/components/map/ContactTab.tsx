import { Mail, Phone, Plus } from "lucide-react";

export function ContactTab() {
  return (
    <div className="space-y-2 px-3 py-4 text-[14px]">
      <a
        href="tel:+16135550100"
        className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.04]"
      >
        <Phone className="h-4 w-4 text-white/40" />
        <span className="flex-1">(613) 555-0100</span>
      </a>
      <a
        href="mailto:hello@betweenthebridges.ca"
        className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.04]"
      >
        <Mail className="h-4 w-4 text-white/40" />
        <span className="flex-1">hello@betweenthebridges.ca</span>
      </a>
      <a
        href="mailto:hello@betweenthebridges.ca?subject=Suggest%20a%20business"
        className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.04]"
      >
        <Plus className="h-4 w-4 text-white/40" />
        <span className="flex-1">Suggest a business</span>
      </a>
    </div>
  );
}
