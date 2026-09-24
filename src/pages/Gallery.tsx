import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import PageHero from "@/components/PageHero";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

type Photo = { id: string; title: string; description?: string | null; image_url: string };

// Local school-tour photos are always shown; uploads from the admin gallery are added on top.
const LOCAL_PHOTOS: Photo[] = [
  { id: "l1", title: "Schools plastic recovery bin handover", image_url: "/images/school-plastic-bins-handover.webp" },
  { id: "l2", title: "Partners and teachers at a school launch", image_url: "/images/school-tour-partners.webp" },
  { id: "l3", title: "Plastic education session in a school hall", image_url: "/images/school-tour-presentation.webp" },
  { id: "l4", title: "A student speaks about plastic pollution", image_url: "/images/student-speaks-plastic-pollution.webp" },
  { id: "l5", title: "Students engaged in a plastic pollution session", image_url: "/images/students-engaged-plastic-education.webp" },
  { id: "l6", title: "'Drop Plastics Here' bins installed at a senior high school", image_url: "/images/school-drop-plastics-bins.webp" },
  { id: "l7", title: "Teacher-led plastic waste session", image_url: "/images/teacher-training-plastic-waste.webp" },
];

const tidy = (t: string) => t.replace(/\bBech\b/i, "Beach");

const Gallery = () => {
  const [photos, setPhotos] = useState<Photo[]>(LOCAL_PHOTOS);
  const [active, setActive] = useState<Photo | null>(null);

  useEffect(() => {
    supabase
      .from("gallery")
      .select("id,title,description,image_url")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data?.length) setPhotos([...data, ...LOCAL_PHOTOS]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <PageHero
          eyebrow="Gallery"
          title="Our work in pictures"
          intro="Beach cleanups at Teshie, Nungua and Laboma, plastic recovery projects and school educational tours across Greater Accra, Ghana."
        />
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {photos.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setActive(p)}
                  className="group block w-full overflow-hidden rounded-xl bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400"
                >
                  <img
                    src={p.image_url}
                    alt={tidy(p.title)}
                    loading="lazy"
                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="block px-2 py-2 text-left text-xs md:text-sm text-gray-700 line-clamp-1">{tidy(p.title)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-4xl p-2 sm:p-4">
          {active && (
            <>
              <DialogTitle className="px-2 pt-2 text-base">{tidy(active.title)}</DialogTitle>
              <img src={active.image_url} alt={tidy(active.title)} className="w-full max-h-[75vh] object-contain rounded-lg" />
              {active.description && <p className="px-2 pb-2 text-sm text-gray-600">{active.description}</p>}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
