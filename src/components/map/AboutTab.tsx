export function AboutTab() {
  return (
    <div className="space-y-5 px-5 py-4 text-[13.5px] leading-relaxed text-foreground/80">
      <p>
        iCBIG is an NGO working to strengthen local neighbourhoods and local
        economies by fostering collaboration between businesses, community
        organizations, residents, and students — through networking, knowledge
        exchange, community initiatives, neighbourhood-based action projects,
        and the development of shared local resource and skills databases.
      </p>
      <p>
        iCBIG serves as a connector and collaborative platform that supports
        more resilient, engaged, and sustainable local communities.
      </p>

      <div className="rounded-xl bg-white/[0.04] p-4">
        <h3 className="font-serif text-[15px] text-foreground">How this works</h3>
        <p className="mt-2 text-[13px] text-muted-foreground">
          This directory is community-maintained. Listings are added by
          neighbours, makers, and businesses themselves. If something is out of
          date, or you'd like your space included, get in touch — we update it
          together.
        </p>
      </div>
    </div>
  );
}
