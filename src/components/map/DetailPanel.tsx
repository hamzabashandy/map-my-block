import {
  ArrowLeft,
  Clock,
  Globe,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react";
import { CATEGORIES, type Business } from "../../data/businesses";
import { formatHours, hasNoHours, useLiveStatus } from "../../lib/hours";
import { StatusPill } from "./StatusPill";


export function DetailPanel({
  business,
  neighbours = [],
  onSelect,
  onBack,
}: {
  business: Business;
  neighbours?: Business[];
  onSelect?: (id: string) => void;
  onBack: () => void;
}) {
  const cat = CATEGORIES[business.category];
  const Icon = cat.icon;
  const status = useLiveStatus(business.hours);
  const hoursText = hasNoHours(business.hours)
    ? null
    : formatHours(business.hours);
  const directionsUrl = business.mapped
    ? `https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`
    : null;


  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center px-3 pt-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5 pt-3">
        <h2 className="font-serif text-[22px] leading-tight text-foreground">
          {business.name}
        </h2>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium"
            style={{ backgroundColor: cat.bg, color: cat.color }}
          >
            <Icon className="h-3.5 w-3.5" />
            {cat.label}
          </span>
          <StatusPill info={status} />
        </div>

        <dl className="mt-5 space-y-2.5 text-[13.5px]">
          <Row icon={<MapPin className="h-4 w-4" />} text={business.address} />
          {business.phone && (
            <Row
              icon={<Phone className="h-4 w-4" />}
              text={
                <a
                  href={`tel:${business.phone.replace(/[^\d+]/g, "")}`}
                  className="hover:text-foreground"
                >
                  {business.phone}
                </a>
              }
            />
          )}
          {business.website && (
            <Row
              icon={<Globe className="h-4 w-4" />}
              text={
                <a
                  href={business.website}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all hover:text-foreground"
                >
                  {business.website.replace(/^https?:\/\//, "")}
                </a>
              }
            />
          )}
          {hoursText && (
            <Row icon={<Clock className="h-4 w-4" />} text={hoursText} />
          )}

        </dl>

        <div className="mt-6">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            About
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-foreground/85">
            {business.description_long}
          </p>
        </div>

        {neighbours.length > 0 && (
          <div className="mt-6">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Connected to
            </h3>
            <ul className="mt-2 space-y-1">
              {neighbours.map((nb) => {
                const nbCat = CATEGORIES[nb.category];
                return (
                  <li key={nb.id}>
                    <button
                      type="button"
                      onClick={() => onSelect?.(nb.id)}
                      className="flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/[0.05]"
                    >
                      <span
                        className="mt-[6px] h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: nbCat.color }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] text-foreground">
                          {nb.name}
                        </span>
                        {nb.description_short && (
                          <span className="block truncate text-[12px] text-muted-foreground">
                            {nb.description_short}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>


      {directionsUrl && (
      <div className="border-t border-white/[0.06] p-3">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-[14px] font-medium text-background transition-colors hover:bg-foreground/90"
        >
          <Navigation className="h-4 w-4" />
          Get directions
        </a>
      </div>
      )}
    </div>
  );
}

function Row({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 text-muted-foreground">
      <span className="mt-0.5 text-white/40">{icon}</span>
      <span className="flex-1">{text}</span>
    </div>
  );
}
