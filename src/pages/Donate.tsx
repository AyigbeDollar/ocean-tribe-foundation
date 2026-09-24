import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import PageHero from "@/components/PageHero";
import DonateDialog from "@/components/DonateDialog";
import { Button } from "@/components/ui/button";
import { Heart, ShieldCheck, Smartphone, CreditCard, Landmark } from "lucide-react";
import { SITE } from "@/lib/site";

const uses = [
  { amount: "GHS 50", text: "Gloves, sacks and water for a beach cleanup volunteer team." },
  { amount: "GHS 100", text: "Printed 'Story of Plastic' learning materials for a classroom." },
  { amount: "GHS 250", text: "Helps fund a 'Drop Plastics Here' recovery bin for a school." },
  { amount: "GHS 500", text: "Contributes to heavy-equipment hire to clear waste from the beach." },
];

const Donate = () => (
  <div className="min-h-screen bg-white">
    <Navigation />
    <main>
      <PageHero
        eyebrow="Donate"
        title="Donate to protect Ghana's ocean"
        intro="Your gift funds beach cleanups, plastic recovery bins for schools and ocean education for young people in Greater Accra. Give securely in Ghana cedis by card, mobile money or bank transfer."
        image="/images/students-engaged-plastic-education.webp"
        imageAlt="Students taking part in an Ocean Tribe plastic education session"
      >
        <DonateDialog
          trigger={
            <Button size="lg" variant="ocean" className="text-lg px-8">
              <Heart className="mr-2 h-5 w-5" /> Donate now
            </Button>
          }
        />
      </PageHero>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">What your donation can do</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {uses.map((u) => (
            <div key={u.amount} className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
              <p className="text-2xl font-bold text-blue-700">{u.amount}</p>
              <p className="text-gray-700 mt-2 text-sm leading-relaxed">{u.text}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4">Examples are illustrative; all gifts support our programmes where the need is greatest.</p>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Safe and simple</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3"><ShieldCheck className="h-5 w-5 text-green-600 shrink-0" aria-hidden />Payments are processed securely by Paystack.</li>
              <li className="flex gap-3"><Smartphone className="h-5 w-5 text-blue-600 shrink-0" aria-hidden />Mobile money (MTN, Telecel, AirtelTigo).</li>
              <li className="flex gap-3"><CreditCard className="h-5 w-5 text-blue-600 shrink-0" aria-hidden />Visa and Mastercard.</li>
              <li className="flex gap-3"><Landmark className="h-5 w-5 text-blue-600 shrink-0" aria-hidden />Bank transfer.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Giving as an organisation?</h2>
            <p className="text-gray-700 mb-6">
              For corporate gifts, sponsorships or in-kind support, contact us at{" "}
              <a href={`mailto:${SITE.email}`} className="text-blue-700 underline">{SITE.email}</a> and we'll send
              a tailored proposal and impact report.
            </p>
            <Button asChild variant="outline">
              <Link to="/partner-with-us">See partnership options</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  </div>
);

export default Donate;
