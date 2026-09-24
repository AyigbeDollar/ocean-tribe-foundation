import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import DonateDialog from "@/components/DonateDialog";
import { Waves, GraduationCap, Camera, Laptop, Building2, Heart, ArrowRight } from "lucide-react";
import { SITE } from "@/lib/site";

const roles = [
  { icon: Waves, title: "Beach cleanup volunteer", text: "Join our cleanups at Teshie, Nungua and Laboma. We provide gloves, bags and guidance: just bring your energy." },
  { icon: GraduationCap, title: "School programme volunteer", text: "Help run plastic education sessions, student competitions and bin installations in Greater Accra schools." },
  { icon: Camera, title: "Media & storytelling", text: "Photograph and film our work, write stories and help grow our community on social media." },
  { icon: Laptop, title: "Data & digital", text: "Record waste audit data, maintain our website and help us measure and report impact." },
];

const steps = [
  "Create a free volunteer account on this website.",
  "Browse upcoming beach cleanups on the Events page and tap Join Event.",
  "We'll share the meeting point, time and what to bring before the day.",
];

const GetInvolved = () => (
  <div className="min-h-screen bg-white">
    <Navigation />
    <main>
      <PageHero
        eyebrow="Get involved"
        title="Volunteer for beach cleanups in Accra"
        intro="Whether you have a Saturday morning or a skill to share, there's a place for you in the Ocean Tribe. Join a beach cleanup, support our school programme, or help behind the scenes."
        image="/images/student-speaks-plastic-pollution.webp"
        imageAlt="A student speaking about plastic pollution at an Ocean Tribe school event"
      >
        <Button asChild size="lg" variant="ocean">
          <Link to="/auth?mode=signup">Become a volunteer</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white/50 hover:bg-white/20">
          <Link to="/events">See upcoming cleanups</Link>
        </Button>
      </PageHero>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">Ways to volunteer</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-gray-100 p-6 shadow-sm">
              <Icon className="h-7 w-7 text-blue-600 mb-4" aria-hidden />
              <h3 className="font-bold text-lg text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-blue-50/60 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How to join a beach cleanup</h2>
          <ol className="space-y-4">
            {steps.map((s, i) => (
              <li key={s} className="flex gap-4 items-start bg-white rounded-2xl p-5 border border-blue-100">
                <span className="h-8 w-8 shrink-0 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-gray-700 pt-1">{s}</span>
              </li>
            ))}
          </ol>
          <p className="text-gray-600 mt-6">
            Prefer to talk first? Message us on{" "}
            <a className="text-blue-700 font-medium underline" href={`https://wa.me/${SITE.phones[0].wa}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>{" "}
            or email <a className="text-blue-700 font-medium underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid md:grid-cols-2 gap-8">
        <div className="rounded-3xl bg-gradient-to-br from-sky-500 to-blue-700 text-white p-10">
          <Building2 className="h-8 w-8 mb-4" aria-hidden />
          <h2 className="text-2xl font-bold mb-3">Volunteer as a company or school</h2>
          <p className="text-blue-50 mb-6">
            Bring your team for a corporate cleanup day, or invite us to your school. We handle the planning and
            report back on the impact.
          </p>
          <Button asChild variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-700">
            <Link to="/partner-with-us">Partner with us <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="rounded-3xl bg-slate-900 text-white p-10">
          <Heart className="h-8 w-8 mb-4 text-rose-300" aria-hidden />
          <h2 className="text-2xl font-bold mb-3">Can't make it in person?</h2>
          <p className="text-slate-300 mb-6">
            A donation pays for gloves, bags, equipment hire and school recovery bins, and keeps our cleanups running.
          </p>
          <DonateDialog trigger={<Button className="bg-white text-slate-900 hover:bg-slate-100">Donate now</Button>} />
        </div>
      </section>
    </main>
  </div>
);

export default GetInvolved;
