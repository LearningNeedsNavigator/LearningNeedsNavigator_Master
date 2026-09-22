import { Link } from "react-router-dom";
import arnaLogoAsset from "@/assets/arna-logo-dark.png.asset.json";

const arnaLogo = arnaLogoAsset.url;

const FALLBACK_URL = "https://arnaintelligence.com/";

// Routes that actually exist in the app (see src/App.tsx).
// Anything not in this set falls back to the external Arna site.
const VALID_INTERNAL_ROUTES = new Set<string>([
  "/",
  "/login",
  "/signup",
  "/reset-password",
  "/assessment",
  "/results",
  "/admin",
]);

const footerLinks = {
  services: [
    { name: "Learning Intelligence (LIaaS)", href: "/services/learning-intelligence" },
    { name: "LearnTech (LTaaS)", href: "/services/learntech-ai" },
    { name: "Design (DaaS)", href: "/services/experience-design" },
  ],
  company: [
    { name: "Framework", href: "/intelligence-engine" },
    { name: "Insights", href: "/insights" },
    { name: "Contact", href: "/contact" },
  ],
  products: [
    { name: "Globiculum", href: "/globiculum-preview", newTab: true },
    { name: "AI Learning Assistants", href: "https://discover-design-map.lovable.app/" },
    { name: "Workflow Engines & Dashboards", href: null, comingSoon: true },
  ],
} as const;

type FooterLink = {
  name: string;
  href: string | null;
  newTab?: boolean;
  comingSoon?: boolean;
};

function resolveHref(link: FooterLink): string {
  if (!link.href) return FALLBACK_URL;
  if (link.href.startsWith("http")) return link.href;
  return VALID_INTERNAL_ROUTES.has(link.href) ? link.href : FALLBACK_URL;
}

function FooterLinkItem({ link }: { link: FooterLink }) {
  const className = "text-sm text-white hover:text-primary transition-colors";

  if (link.comingSoon) {
    return (
      <div>
        <a
          href={FALLBACK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-white/70 hover:text-primary transition-colors block"
        >
          {link.name}
        </a>
        <span className="text-sm text-amber-500">Coming Soon</span>
      </div>
    );
  }

  const resolved = resolveHref(link);
  const isExternal = resolved.startsWith("http");

  if (isExternal) {
    return (
      <a href={resolved} target="_blank" rel="noopener noreferrer" className={className}>
        {link.name}
      </a>
    );
  }

  return (
    <Link to={resolved} className={className}>
      {link.name}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white">
      {" "}
      <div className="max-w-7xl mx-auto px-8 lg:px-12 py-12">
        {" "}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[320px_220px_220px_220px_280px] justify-between gap-y-10">
          {/* Brand Column */}
          <div className="max-w-[380px] flex flex-col -mt-10">
            <Link to="/" className="inline-block">
              <img src={arnaLogo} alt="Arna Intelligence" className="h-32 md:h-36 w-auto object-contain" />
            </Link>

            <p className="-mt-2 text-sm text-white/90 leading-6 max-w-[320px]">
              Grounded in learning science. Accelerated by AI systems. Humanized through experience design. Creating
              connected learning ecosystems that deliver measurable business outcomes.
            </p>

            <p className="mt-6 text-base font-medium text-primary">Where Learning Meets Intelligence.</p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-5 text-white">Services</h3>

            <ul className="space-y-4">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <FooterLinkItem link={link} />
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-5 text-white">Products</h3>

            <ul className="space-y-4">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <FooterLinkItem link={link} />
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-5 text-white">Company</h3>

            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <FooterLinkItem link={link} />
                </li>
              ))}
            </ul>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-5 text-white">Address</h3>

            <div className="text-sm text-white leading-7">
              <p>Plot No: 802 &amp; 803,</p>
              <p>Ayyappa Society,</p>
              <p>Madhapur,</p>
              <p>Hyderabad – 500081</p>
            </div>
            <a
              href="mailto:info_arnaintelligence@alis-global.com"
              className="text-sm text-white hover:text-primary transition-colors block mb-4 break-words"
            >
              info_arnaintelligence@alis-global.com
            </a>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-secondary-foreground/10">
          <p className="text-sm text-white/70 text-center">
            &copy; 2026 Arnas Learning Intelligence Studio Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
