import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Heart, Waves, Recycle, Users, ArrowRight, Handshake } from "lucide-react";
import Logo from "@/components/Logo";
import DonateDialog from "@/components/DonateDialog";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const Index = () => {
  const { user } = useAuth();
  
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 60, rotateX: -15, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0, 
      scale: 1,
      transition: { duration: 0.8, type: "spring", bounce: 0.4 } 
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.2 } 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />
      
      <main className="flex flex-col">
        {/* Hero Section */}
        <section 
          className="relative text-white py-32 min-h-[80vh] flex items-center hero-bg"
        >
          {/* Darker gradient overlay for better contrast and readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-blue-900/60 to-sky-900/50" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={staggerContainer}
              className="text-center w-full"
              style={{ perspective: "1000px" }}
            >
              <motion.h1 
                variants={fadeUpVariant}
                className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-xl text-balance"
              >
                Restoring the Ocean,<br className="hidden md:block"/> Rebuilding the Future
              </motion.h1>
              <motion.p 
                variants={fadeUpVariant}
                className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto drop-shadow-lg text-blue-50"
              >
                Ocean Tribe is a Ghana-based NGO dedicated to ocean restoration, 
                waste management, and recycling. Join us in protecting our oceans and empowering coastal communities.
              </motion.p>
              <motion.div variants={fadeUpVariant} className="flex justify-center gap-4 flex-wrap">
                {!user ? (
                  <Link to="/auth">
                    <Button size="lg" variant="ocean" className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all">
                      Join Our Mission
                    </Button>
                  </Link>
                ) : (
                  <Link to="/dashboard">
                    <Button size="lg" variant="ocean" className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all">
                      Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'Guardian'}!
                    </Button>
                  </Link>
                )}
                <DonateDialog
                  trigger={
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 hover:bg-white/20 text-white border-white/50 backdrop-blur-sm">
                      <Heart className="mr-2 h-5 w-5 text-red-400" />
                      Donate Now
                    </Button>
                  }
                />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* What We Do Section - Blended with Activity Photo Slides */}
        <section className="py-24 bg-gradient-to-b from-white via-blue-50/30 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUpVariant}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-4">
                <Waves className="h-4 w-4" />
                Our Core Pillars in Action
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                What We Do
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Explore our hands-on operations across Ghana. From restoring damaged marine ecosystems 
                to large-scale plastic recovery and empowering youth through school educational tours.
              </p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid lg:grid-cols-3 gap-8"
              style={{ perspective: "1000px" }}
            >
              {/* 1. Ocean Restoration */}
              <motion.div 
                variants={fadeUpVariant} 
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100/80 flex flex-col group"
              >
                {/* Photo Carousel for Ocean Restoration */}
                <div className="relative h-64 bg-slate-900 overflow-hidden">
                  <ActivitySlides 
                    category="ocean-restoration" 
                    delay={3500}
                    defaultImages={[
                      { id: '1', title: 'Laboma Beach Restoration & Shoreline Cleanup', image_url: 'https://tdvvvwgdabvdmeouonki.supabase.co/storage/v1/object/public/gallery/b83f5313-bf1e-49db-85b5-e0fa26abc578/1768051254512-q7k02mh0inh.jpg' },
                      { id: '2', title: 'Beach Please Marine Conservation Activity', image_url: 'https://tdvvvwgdabvdmeouonki.supabase.co/storage/v1/object/public/gallery/b83f5313-bf1e-49db-85b5-e0fa26abc578/1768051355443-8xlzi7zh9bk.jpg' },
                      { id: '3', title: 'Mayekoo & Ahaban Ecosystem Partnership', image_url: 'https://tdvvvwgdabvdmeouonki.supabase.co/storage/v1/object/public/gallery/b83f5313-bf1e-49db-85b5-e0fa26abc578/1768110422792-dp63k5ki6lo.jpg' },
                      { id: '4', title: 'Coastal Shoreline Restoration Effort', image_url: 'https://tdvvvwgdabvdmeouonki.supabase.co/storage/v1/object/public/gallery/b83f5313-bf1e-49db-85b5-e0fa26abc578/1768065886487-pi4p7n8a89.jpg' }
                    ]}
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-600/90 text-white backdrop-blur-md shadow-md flex items-center gap-1.5">
                      <Waves className="h-3.5 w-3.5" /> Ocean Restoration
                    </span>
                  </div>
                </div>

                <div className="p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-blue-100 p-2.5 rounded-xl text-blue-700">
                        <Waves className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Ocean Restoration</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      Protecting marine habitats and restoring damaged coastal ecosystems through science-based 
                      conservation efforts, shoreline rehabilitation, and active coastal monitoring.
                    </p>
                  </div>
                  <div className="space-y-2.5 pt-4 border-t border-gray-100 text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>Shoreline rehabilitation & protection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>Marine ecosystem health assessment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>Collaborative conservation partnerships</span>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* 2. Waste Management */}
              <motion.div 
                variants={fadeUpVariant} 
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100/80 flex flex-col group"
              >
                {/* Photo Carousel for Waste Management */}
                <div className="relative h-64 bg-slate-900 overflow-hidden">
                  <ActivitySlides 
                    category="waste-management" 
                    delay={4200}
                    defaultImages={[
                      { id: '1', title: 'Teshie Cantane Plastic Recovery Campaign 1', image_url: 'https://tdvvvwgdabvdmeouonki.supabase.co/storage/v1/object/public/gallery/b83f5313-bf1e-49db-85b5-e0fa26abc578/1782818645457-ya9ud5vdxvf.jpg' },
                      { id: '2', title: 'Teshie Cantane Cleanup & Sorting 2', image_url: 'https://tdvvvwgdabvdmeouonki.supabase.co/storage/v1/object/public/gallery/b83f5313-bf1e-49db-85b5-e0fa26abc578/1782818707457-02pywe71hqqx.jpg' },
                      { id: '3', title: 'Coastal Plastic Waste Bagging & Evacuation', image_url: 'https://tdvvvwgdabvdmeouonki.supabase.co/storage/v1/object/public/gallery/b83f5313-bf1e-49db-85b5-e0fa26abc578/1782818738130-wc5k3u983wk.jpg' },
                      { id: '4', title: 'Beach Cleanup & Waste Collection Operation', image_url: 'https://tdvvvwgdabvdmeouonki.supabase.co/storage/v1/object/public/gallery/b83f5313-bf1e-49db-85b5-e0fa26abc578/1768065955517-ee00dui7zyd.jpg' },
                      { id: '5', title: 'Beach Cleanup Waste Retrieval', image_url: 'https://tdvvvwgdabvdmeouonki.supabase.co/storage/v1/object/public/gallery/b83f5313-bf1e-49db-85b5-e0fa26abc578/1768066022264-43szm1hkk5u.jpg' }
                    ]}
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-600/90 text-white backdrop-blur-md shadow-md flex items-center gap-1.5">
                      <Recycle className="h-3.5 w-3.5" /> Waste Management
                    </span>
                  </div>
                </div>

                <div className="p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-green-100 p-2.5 rounded-xl text-green-700">
                        <Recycle className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Waste Management</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      Conducting high-impact coastal cleanups, implementing plastic recovery systems, and segregating 
                      ocean-bound waste to divert tonnes of plastics from entering the sea.
                    </p>
                  </div>
                  <div className="space-y-2.5 pt-4 border-t border-gray-100 text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Intensive beach cleanups & plastic collection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Sorting & sustainable recycling supply chains</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Preventing plastics from entering marine waters</span>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* 3. Community Empowerment */}
              <motion.div 
                variants={fadeUpVariant} 
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100/80 flex flex-col group"
              >
                {/* Photo Carousel for Community Empowerment */}
                <div className="relative h-64 bg-slate-900 overflow-hidden">
                  <ActivitySlides 
                    category="community-empowerment" 
                    delay={4900}
                    defaultImages={[
                      { id: '1', title: 'School Plastic Recovery Project & Educational Tour', image_url: 'https://tdvvvwgdabvdmeouonki.supabase.co/storage/v1/object/public/gallery/b83f5313-bf1e-49db-85b5-e0fa26abc578/1782818509019-rso1a62xiok.jpg' },
                      { id: '2', title: 'Student Environmental Education & Sensitization', image_url: 'https://tdvvvwgdabvdmeouonki.supabase.co/storage/v1/object/public/gallery/b83f5313-bf1e-49db-85b5-e0fa26abc578/1782818561729-k2yao752fxl.jpg' },
                      { id: '3', title: 'Armed Forces Basic School Educational Outreach', image_url: 'https://tdvvvwgdabvdmeouonki.supabase.co/storage/v1/object/public/gallery/b83f5313-bf1e-49db-85b5-e0fa26abc578/1782819065084-c5xmavhznk9.jpg' },
                      { id: '4', title: 'Armed Forces School Youth Engagement Tour', image_url: 'https://tdvvvwgdabvdmeouonki.supabase.co/storage/v1/object/public/gallery/b83f5313-bf1e-49db-85b5-e0fa26abc578/1782863583775-7sns4l7xw2s.jpg' },
                      { id: '5', title: "O'Reilly Senior High Plastic Recovery & School Tour", image_url: 'https://tdvvvwgdabvdmeouonki.supabase.co/storage/v1/object/public/gallery/b83f5313-bf1e-49db-85b5-e0fa26abc578/1782863730503-i8m7f71lwzi.jpg' },
                      { id: '6', title: 'Odorgonor Senior High School Students Engagement', image_url: 'https://tdvvvwgdabvdmeouonki.supabase.co/storage/v1/object/public/gallery/b83f5313-bf1e-49db-85b5-e0fa26abc578/1782864640497-e5raatpbzn.jpg' }
                    ]}
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-600/90 text-white backdrop-blur-md shadow-md flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> Community Empowerment
                    </span>
                  </div>
                </div>

                <div className="p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-purple-100 p-2.5 rounded-xl text-purple-700">
                        <Users className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Community Empowerment</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      Hosting school educational tours, student plastic recovery challenges, and community workshops 
                      to nurture the next generation of eco-guardians and environmental stewards.
                    </p>
                  </div>
                  <div className="space-y-2.5 pt-4 border-t border-gray-100 text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      <span>School educational tours & youth seminars</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      <span>Student plastic recovery competitions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      <span>Community workshops & awareness drives</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Volunteer & Partner Section */}
        <section className="py-24 bg-blue-900 text-white relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500 blur-[120px]" />
            <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-sky-400 blur-[120px]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid md:grid-cols-2 gap-12 lg:gap-20"
              style={{ perspective: "1000px" }}
            >
              {/* Volunteer */}
              <motion.div variants={fadeUpVariant} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-10 flex flex-col items-start">
                <div className="bg-white/20 p-4 rounded-2xl mb-6">
                  <Heart className="h-8 w-8 text-blue-200" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Volunteer With Us</h2>
                <p className="text-blue-100 text-lg mb-8 leading-relaxed flex-grow">
                  Whether you're interested in joining a local beach cleanup, helping with community education, 
                  or supporting our digital operations, your time and skills can make a real difference for our oceans.
                </p>
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 transition-colors w-full sm:w-auto">
                    Become a Volunteer <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>

              {/* Partner */}
              <motion.div variants={fadeUpVariant} className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl p-10 flex flex-col items-start shadow-xl">
                <div className="bg-white/20 p-4 rounded-2xl mb-6">
                  <Handshake className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Partner With Us</h2>
                <p className="text-blue-50 text-lg mb-8 leading-relaxed flex-grow">
                  We collaborate with businesses, schools, and other organizations to amplify our impact. 
                  Sponsor a cleanup, implement corporate sustainability initiatives, or fund critical restoration projects.
                </p>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600 transition-colors w-full sm:w-auto">
                    Explore Partnerships <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

      </main>
    </div>
  );
};

interface ActivityImage {
  id: string;
  title: string;
  image_url: string;
}

interface ActivitySlidesProps {
  category: 'ocean-restoration' | 'waste-management' | 'community-empowerment';
  delay: number;
  defaultImages: ActivityImage[];
}

const ActivitySlides = ({ category, delay, defaultImages }: ActivitySlidesProps) => {
  const [items, setItems] = useState<ActivityImage[]>(defaultImages);

  useEffect(() => {
    const loadCategoryImages = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery')
          .select('id,title,image_url')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          const filtered = data.filter((item) => {
            const t = (item.title || '').toLowerCase();
            if (category === 'ocean-restoration') {
              return t.includes('laboma') || t.includes('mayekoo') || t.includes('ahaban') || t.includes('beach please') || (t.includes('beach cleanup') && !t.includes('02') && !t.includes('03') && !t.includes('04'));
            } else if (category === 'waste-management') {
              return t.includes('teshie') || t.includes('cleanup 02') || t.includes('cleanup 03') || t.includes('cleanup 04') || t.includes('bech cleanup');
            } else if (category === 'community-empowerment') {
              return t.includes('school') || t.includes('armed forces') || t.includes("o'reilly") || t.includes('odorgonor') || t.includes('plastic recovery');
            }
            return false;
          });

          if (filtered.length > 0) {
            setItems(filtered);
          }
        }
      } catch (err) {
        // Fallback to defaultImages on error
        console.error(`Failed to load images for ${category}:`, err);
      }
    };

    loadCategoryImages();
  }, [category]);

  return (
    <Carousel
      className="w-full h-full"
      opts={{ loop: true, duration: 25, align: "start" }}
      plugins={[
        Autoplay({ delay: delay, stopOnInteraction: false, stopOnMouseEnter: true }),
        Fade(),
      ]}
    >
      <CarouselContent className="h-64 m-0 p-0">
        {items.map((item, idx) => (
          <CarouselItem key={item.id || idx} className="relative h-64 p-0">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 z-10 pointer-events-none">
              <p className="text-white text-xs font-semibold drop-shadow line-clamp-1">
                {item.title}
              </p>
            </div>
            {/* Slide indicator pill */}
            <div className="absolute top-4 right-4 z-20 pointer-events-none">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white/90 backdrop-blur-md">
                {idx + 1}/{items.length}
              </span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export default Index;
