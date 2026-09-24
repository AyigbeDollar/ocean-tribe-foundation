import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Waves, GraduationCap, Recycle, Filter, Fish, Trees, ArrowRight, CheckCircle2 } from "lucide-react";

type Status = "Active" | "Piloting" | "Planned";

const programs: {
  id: string;
  icon: typeof Waves;
  status: Status;
  title: string;
  lead: string;
  points: string[];
  image?: { src: string; alt: string };
}[] = [
  {
    id: "beach-cleanups",
    icon: Waves,
    status: "Active",
    title: "Beach cleanups & waste data in Accra",
    lead:
      "Community beach cleanups are where our work begins. We mobilise volunteers, fishing communities and partners to clear plastic from Laboma, Teshie and Nungua beaches, and record what we collect so every cleanup builds evidence for change.",
    points: [
      "Volunteer beach cleanups along the Teshie–Nungua coastline",
      "Heavy-equipment waste recovery with local partners",
      "Waste audits: types and volumes of plastic collected",
      "Corporate and community sponsorship of each cleanup",
    ],
  },
  {
    id: "schools",
    icon: GraduationCap,
    status: "Active",
    title: "Plastic education & recovery in schools",
    lead:
      "Through school educational tours we teach students how plastic travels from our streets to the sea, and install 'Drop Plastics Here' recovery bins so schools can separate plastic for recycling.",
    points: [
      "School tours and plastic recovery projects in basic and senior high schools",
      "Trainer of Trainers in plastic waste management, launched with OmniBSIC Bank and CSIR",
      "'The Story of Plastic' teaching toolkit for Ghanaian teachers",
      "Student plastic recovery competitions and Plastic Bootcamps",
    ],
    image: {
      src: "/images/students-engaged-plastic-education.webp",
      alt: "Senior high school students raising their hands during an Ocean Tribe plastic pollution session",
    },
  },
  {
    id: "buy-back",
    icon: Recycle,
    status: "Planned",
    title: "Plastic buy-back centres: waste into wealth",
    lead:
      "Community buy-back centres at Laboma, Teshie and Nungua will pay residents for collected plastic, in cash, food, school fees or health insurance, and sell sorted plastic to recyclers such as Coliba and RiverRecycle.",
    points: [
      "Income for coastal households, with a focus on women and youth",
      "Jobs in collection, sorting and logistics",
      "PET bales and HDPE pellets supplied to recyclers",
    ],
  },
  {
    id: "trash-booms",
    icon: Filter,
    status: "Planned",
    title: "Trash booms at drainage points",
    lead:
      "Most beach plastic arrives through Accra's open gutters. We plan to install and maintain trash booms at key drains and canals to stop plastic before it reaches the ocean, maintained by trained community teams.",
    points: [
      "Plastic intercepted at the source, not just on the shore",
      "Fewer blocked drains and less flooding in coastal communities",
      "Data to inform national drainage and waste policy",
    ],
  },
  {
    id: "fishing-biodiversity",
    icon: Fish,
    status: "Planned",
    title: "Sustainable fishing & biodiversity monitoring",
    lead:
      "We will work with local fishers on eco-friendly practices and train them to monitor marine life, building the data needed to protect fisheries that millions of Ghanaians depend on.",
    points: ["Eco-friendly fishing practices", "Fisher-led biodiversity monitoring", "Drone mapping of coastal ecosystems"],
  },
  {
    id: "mangroves",
    icon: Trees,
    status: "Planned",
    title: "Mangrove restoration & coastal protection",
    lead:
      "Mangroves protect the coast from erosion, store carbon and shelter young fish. Our plan targets 10 hectares of community mangrove planting along Ghana's estuaries, alongside advocacy for marine protected areas.",
    points: ["Community mangrove planting", "Coastal erosion protection", "Advocacy for marine protected areas"],
  },
];

const statusStyle: Record<Status, string> = {
  Active: "bg-green-100 text-green-800",
  Piloting: "bg-amber-100 text-amber-800",
  Planned: "bg-slate-100 text-slate-700",
};

const Programs = () => (
  <div className="min-h-screen bg-white">
    <Navigation />
    <main>
      <PageHero
        eyebrow="What we do"
        title="Our Programs"
        intro="Six connected programs to end plastic pollution on Ghana's coast: cleaning beaches today, teaching the next generation, and building the systems that stop plastic reaching the sea."
        image="/images/school-drop-plastics-bins.webp"
        imageAlt="Students and teachers with plastic recovery bins at a Greater Accra school"
      >
        <Button asChild size="lg" variant="ocean">
          <Link to="/get-involved">Volunteer with us</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white/50 hover:bg-white/20">
          <Link to="/partner-with-us">Sponsor a program</Link>
        </Button>
      </PageHero>

      <nav aria-label="Programs" className="border-b bg-white">
        <ul className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-4 overflow-x-auto py-4 text-sm font-medium">
          {programs.map((p) => (
            <li key={p.id} className="shrink-0">
              <a href={`#${p.id}`} className="text-gray-600 hover:text-blue-700">{p.title.split(":")[0]}</a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        {programs.map((p) => (
          <section
            key={p.id}
            id={p.id}
            className={`scroll-mt-24 grid gap-8 rounded-3xl border border-gray-100 p-8 md:p-10 shadow-sm ${p.image ? "lg:grid-cols-2 items-center" : ""}`}
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 text-blue-700 p-2.5 rounded-xl">
                  <p.icon className="h-6 w-6" aria-hidden />
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[p.status]}`}>{p.status}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{p.title}</h2>
              <p className="text-gray-700 leading-relaxed mb-6">{p.lead}</p>
              <ul className="space-y-2">
                {p.points.map((pt) => (
                  <li key={pt} className="flex gap-2 text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" aria-hidden />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
            {p.image && (
              <img
                src={p.image.src}
                alt={p.image.alt}
                loading="lazy"
                width={1200}
                height={900}
                className="rounded-2xl w-full object-cover aspect-[4/3]"
              />
            )}
          </section>
        ))}
      </div>

      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Bring the plastic programme to your school</h2>
          <p className="text-blue-100 text-lg mb-8">
            We work with basic and senior high schools across Greater Accra. Get in touch to book a school tour or
            teacher training session.
          </p>
          <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
            <Link to="/contact">Contact us <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </main>
  </div>
);

export default Programs;
