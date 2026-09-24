import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import seo from "@/seo/routes.json";

interface SeoProps {
  /** Override the title/description from routes.json (e.g. for pages not listed there). */
  title?: string;
  description?: string;
  /** Keep private or error pages out of search results. */
  noindex?: boolean;
}

const setMeta = (attr: "name" | "property", key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setCanonical = (href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
};

/** Keeps <head> tags in sync with the current route for users and JS-rendering crawlers. */
const Seo = ({ title, description, noindex: forceNoindex }: SeoProps) => {
  const { pathname: rawPath } = useLocation();
  const pathname = rawPath.length > 1 ? rawPath.replace(/\/+$/, "") : rawPath;

  useEffect(() => {
    const route = seo.routes.find((r) => r.path === pathname);
    // Anything not in the public route list (auth, dashboard, admin, 404s) stays out of Google.
    const noindex = forceNoindex || !route;
    const pageTitle = title ?? route?.title ?? seo.siteName;
    const pageDescription = description ?? route?.description ?? seo.routes[0].description;
    const url = seo.siteUrl + (pathname === "/" ? "/" : pathname);
    const image = seo.siteUrl + seo.defaultImage;

    document.title = pageTitle;
    setMeta("name", "description", pageDescription);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    setMeta("property", "og:title", pageTitle);
    setMeta("property", "og:description", pageDescription);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);
    setMeta("name", "twitter:title", pageTitle);
    setMeta("name", "twitter:description", pageDescription);
    setMeta("name", "twitter:image", image);
    setCanonical(url);
  }, [pathname, title, description, forceNoindex]);

  return null;
};

export default Seo;
