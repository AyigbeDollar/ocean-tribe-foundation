import Navigation from "@/components/Navigation";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Waves, GraduationCap, Recycle, Filter, Users, Package, CheckCircle2, Mail } from "lucide-react";
import { PARTNERS, SITE } from "@/lib/site";

const mailto = `mailto:${SITE.email}?subject=${encodeURIComponent("Partnership with Ocean Tribe Foundation")}`;

const options = [
  { icon: Waves, title: "Sponsor a beach cleanup", text: "Fund equipment hire, safety gear and volunteer support for a community cleanup at Teshie, Nungua or Laboma." },
  { icon: GraduationCap, title: "Adopt a school", text: "Fund plastic recovery bins, teacher training and student education sessions for a school in Greater Accra." },
  { icon: Recycle, title: "Back a buy-back centre", text: "Help set up a community plastic buy-back centre that turns collected plastic into income for coastal families." },
  { icon: Filter, title: "Fund a trash boom", text: "Support trash booms that catch plastic in drains and canals before it reaches the ocean." },
  { icon: Users, title: "Employee volunteering", text: "Bring your team for a cleanup or maintenance day: a hands-on, measurable team-building experience." },
  { icon: Package, title: "In-kind support", text: "Equipment, transport, printing, media or technical expertise all help us go further." },
];

const benefits = [
  "Recognition on banners, signage and branded volunteer T-shirts",
  "Coverage across our social media channels and in media outreach",
  "A post-event impact report: plastic collected, volunteers engaged, before-and-after photos",
  "Clear alignment with your CSR, ESG and Extended Producer Responsibility goals",
  "An invitation for your team to take part on the day",
];

const PartnerWithUs = () => (
  <div className="min-h-screen bg-white">
    <Navigation />
    <main>
      <PageHero
        eyebrow="Partnerships"
        title="Partner with us to protect Ghana's ocean"
        intro="We work with businesses, schools, recyclers, researchers and development partners to tackle plastic pollution on Ghana's coast. Choose a focus that fits your CSR or ESG goals, and we'll report back on the impact."
        image="/images/school-tour-partners.webp"
        imageAlt="Partners, teachers and Ocean Tribe team members at a school plastic recovery launch"
      >
        <Button asChild size="lg" variant="ocean">
          <a href={mailto}><Mail className="mr-2 h-4 w-4" />Start a conversation</a>
        </Button>
      </PageHero>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">Ways to partner</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-gray-100 p-6 shadow-sm">
              <Icon className="h-7 w-7 text-blue-600 mb-4" aria-hidden />
              <h3 className="font-bold text-lg text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-blue-50/60 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What partners receive</h2>
            <ul className="space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex gap-3 text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <img
            src="/images/school-plastic-bins-handover.webp"
            alt="Plastic recovery bins handed over to a school with partner support"
            loading="lazy"
            width={1200}
            height={900}
            className="rounded-3xl shadow-lg w-full object-cover aspect-[4/3]"
          />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Who we work with</h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PARTNERS.map((p) => (
            <li key={p.name} className="rounded-xl border border-gray-100 p-5">
              <p className="font-semibold text-gray-900">{p.name}</p>
              <p className="text-sm text-gray-600">{p.role}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Let's plan your impact</h2>
          <p className="text-blue-100 text-lg mb-8">
            Email {SITE.email} or call {SITE.phones[0].display}. We'll share our concept note and a tailored proposal.
          </p>
          <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
            <a href={mailto}>Email our partnerships team</a>
          </Button>
        </div>
      </section>
    </main>
  </div>
);

export default PartnerWithUs;
