import { ReactNode } from "react";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  intro: ReactNode;
  image?: string;
  imageAlt?: string;
  children?: ReactNode;
}

/** Shared top section for content pages: one H1 per page, short keyword-rich intro. */
const PageHero = ({ eyebrow, title, intro, image, imageAlt = "", children }: PageHeroProps) => (
  <section className="relative overflow-hidden bg-blue-950 text-white">
    {image && (
      <img
        src={image}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover opacity-35"
        fetchPriority="high"
      />
    )}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-950/80 to-blue-900/40" />
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      {eyebrow && (
        <p className="text-sky-300 font-semibold tracking-wide uppercase text-sm mb-3">{eyebrow}</p>
      )}
      <h1 className="text-4xl md:text-6xl font-bold max-w-3xl text-balance">{title}</h1>
      <div className="mt-6 text-lg md:text-xl text-blue-100 max-w-2xl leading-relaxed">{intro}</div>
      {children && <div className="mt-8 flex flex-wrap gap-4">{children}</div>}
    </div>
  </section>
);

export default PageHero;
