import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Eye, Flag, Users, Recycle, GraduationCap, Handshake, ArrowRight } from "lucide-react";
import { PARTNERS, SITE } from "@/lib/site";

const values = [
  {
    icon: Users,
    title: "Community-led",
    text: "We work hand in hand with fishing communities, chiefs, assembly members, youth groups and schools along the Teshie–Nungua coast.",
  },
  {
    icon: Recycle,
    title: "Waste into wealth",
    text: "Plastic has value. Our model links collection to recyclers so cleaning the coast can create income for coastal households.",
  },
  {
    icon: GraduationCap,
    title: "Education first",
    text: "Lasting change starts in the classroom. We train teachers and equip schools to separate and recover plastic.",
  },
  {
    icon: Handshake,
    title: "Built on partnership",
    text: "We bring together businesses, recyclers, researchers and community groups to tackle ocean plastic at the source and on the shore.",
  },
];

const About = () => (
  <div className="min-h-screen bg-white">
    <Navigation />
    <main>
      <PageHero
        eyebrow="About us"
        title="About Ocean Tribe Foundation"
        intro="We are a Ghanaian non-profit protecting Greater Accra's coastline from plastic pollution through beach cleanups, plastic recovery, environmental education and coastal restoration."
        image="/images/school-tour-partners.webp"
        imageAlt="Ocean Tribe Foundation team with partners and teachers at a school plastic recovery launch"
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-5 text-lg text-gray-700 leading-relaxed">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our story</h2>
          <p>
            Ghana produces around 0.8 million tonnes of plastic waste every year, and in Greater Accra about 30% of
            waste is never collected. With every rainstorm, sachets, bottles and bags wash through open gutters onto
            our beaches and into the Atlantic, harming fisheries that support millions of livelihoods.
          </p>
          <p>
            Ocean Tribe Foundation was formed in 2025 to respond. We started with a beach cleanup at Laboma and have
            since organised cleanups at Teshie and Nungua, and taken plastic recovery and ocean education into schools
            across Greater Accra.
          </p>
          <p>
            Beach cleanups are our entry point. Our long-term goal is a self-sustaining coastal economy where recovered
            plastic creates jobs, young people lead on the environment, and Ghana's coast is healthier for the next
            generation.
          </p>
        </div>
        <img
          src="/images/school-plastic-bins-handover.webp"
          alt="Students standing behind 'Drop Plastics Here' recovery bins donated by Ocean Tribe Foundation"
          className="rounded-3xl shadow-xl w-full object-cover aspect-[4/3]"
          loading="lazy"
          width={1200}
          height={900}
        />
      </section>

      <section className="bg-blue-50/60 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-blue-100">
            <Eye className="h-8 w-8 text-blue-600 mb-4" aria-hidden />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our vision</h2>
            <p className="text-gray-700 leading-relaxed">
              To restore and protect Ghana's coastlines through community-driven conservation, circular economy
              initiatives and sustainable livelihoods, creating cleaner beaches and healthier marine ecosystems for
              future generations.
            </p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-blue-100">
            <Flag className="h-8 w-8 text-blue-600 mb-4" aria-hidden />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our mission</h2>
            <p className="text-gray-700 leading-relaxed">
              To use beach cleanups as an entry point for long-term coastal management, expanding into plastic
              recovery, buy-back centres, environmental education, habitat restoration and community-based job
              creation.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">How we work</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-gray-100 p-6 shadow-sm">
              <Icon className="h-7 w-7 text-blue-600 mb-4" aria-hidden />
              <h3 className="font-bold text-lg text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Leadership & governance</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ocean Tribe Foundation is led by <strong>Bright Selorm Elikem</strong>, Executive Director and Project
              Lead, with a board of directors that oversees our programmes and finances.
            </p>
            <p className="text-gray-700 leading-relaxed">{SITE.registration}.</p>
          </div>
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Partners & collaborators</h2>
            <ul className="grid sm:grid-cols-2 gap-4">
              {PARTNERS.map((p) => (
                <li key={p.name} className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-sm text-gray-600">{p.role}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Help us protect Ghana's coast</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Volunteer at a beach cleanup, bring our plastic education programme to your school, or partner with us.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" variant="ocean">
            <Link to="/get-involved">Get involved <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/programs">See our programs</Link>
          </Button>
        </div>
      </section>
    </main>
  </div>
);

export default About;
