import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const milestones = [
  { date: "2025", title: "Ocean Tribe Foundation formed", text: "Registered in Ghana and began building partnerships with Mayekoo, the Ahaban Green Leaf Foundation, recyclers and local assemblies." },
  { date: "Sept 2025", title: "First beach cleanup at Laboma", text: "Our launch cleanup brought volunteers and partners together and gave us baseline data on the waste reaching Accra's beaches." },
  { date: "Jan 2026", title: "Teshie community cleanup", text: "A community cleanup at Teshie Harbor with local residents and youth groups." },
  { date: "May 2026", title: "Trainer of Trainers launch", text: "With OmniBSIC Bank and CSIR, we launched a Trainer of Trainers programme in plastic waste management for basic and secondary school teachers." },
  { date: "May 2026", title: "Nungua beach cleanup", text: "A large-scale cleanup of the Nungua coastline with Mayekoo and local fishing community leaders." },
  { date: "Jun–Jul 2026", title: "School plastic recovery tours", text: "Educational tours and 'Drop Plastics Here' bin installations in schools across Greater Accra, including Odorgonor and O'Reilly senior high schools." },
];

const targets = [
  { value: "100 t", label: "of ocean-bound plastic recovered each year" },
  { value: "200+", label: "coastal households earning from plastic collection" },
  { value: "2,000", label: "students trained a year across 50 schools" },
  { value: "10 ha", label: "of mangrove habitat under restoration" },
  { value: "40%", label: "less plastic on our target beaches" },
];

const roadmap = [
  { year: "2025", title: "Launch pad", text: "Beach cleanups, key partnerships and baseline waste data." },
  { year: "2026", title: "Education & bootcamps", text: "School programmes, teacher training and Plastic Bootcamps." },
  { year: "2027", title: "Plastic buy-back pilot", text: "First community buy-back centres and local jobs." },
  { year: "2028", title: "Fishing & biodiversity", text: "Eco-fishing practices and ecosystem monitoring." },
  { year: "2029", title: "Habitat restoration", text: "Mangrove restoration and coral pilot projects." },
  { year: "2030", title: "Research & policy", text: "Evidence-based advocacy for stronger coastal protection." },
];

const Impact = () => (
  <div className="min-h-screen bg-white">
    <Navigation />
    <main>
      <PageHero
        eyebrow="Impact"
        title="Our Impact & Strategic Plan"
        intro="What we have achieved on Ghana's coast so far, and our 2025–2030 plan to cut ocean plastic, create green jobs and restore coastal ecosystems."
        image="/images/school-tour-presentation.webp"
        imageAlt="Ocean Tribe Foundation educator presenting to students in a school hall"
      />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">What we've done so far</h2>
        <ol className="relative border-l-2 border-blue-200 space-y-10 ml-3">
          {milestones.map((m) => (
            <li key={m.title} className="pl-8 relative">
              <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-blue-600 ring-4 ring-blue-100" aria-hidden />
              <p className="text-sm font-semibold text-blue-700">{m.date}</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">{m.title}</h3>
              <p className="text-gray-700 mt-2 leading-relaxed">{m.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-blue-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Where we're heading</h2>
          <p className="text-blue-200 mb-10 max-w-2xl">Targets from our 2025–2030 strategic plan.</p>
          <dl className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {targets.map((t) => (
              <div key={t.label} className="rounded-2xl bg-white/5 border border-white/10 p-6">
                <dt className="sr-only">{t.label}</dt>
                <dd className="text-4xl font-bold text-sky-300">{t.value}</dd>
                <dd className="text-sm text-blue-100 mt-2 leading-snug">{t.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">Our 2025–2030 roadmap</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmap.map((r) => (
            <div key={r.year} className="rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-3xl font-bold text-blue-600">{r.year}</p>
              <h3 className="text-lg font-bold text-gray-900 mt-2">{r.title}</h3>
              <p className="text-gray-600 mt-1">{r.text}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-600 mt-10 max-w-3xl">
          Our work contributes to the UN Sustainable Development Goals, especially SDG 14 (Life Below Water), SDG 12
          (Responsible Consumption and Production), SDG 13 (Climate Action) and SDG 4 (Quality Education).
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button asChild size="lg" variant="ocean">
            <Link to="/partner-with-us">Fund the next phase <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/programs">Explore our programs</Link>
          </Button>
        </div>
      </section>
    </main>
  </div>
);

export default Impact;
