
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Waves, 
  Recycle, 
  GraduationCap, 
  Users, 
  Target, 
  Heart,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [email, setEmail] = useState("");
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({
    waste: 0,
    volunteers: 0,
    communities: 0,
    pilots: 0
  });

  // Animated counter effect
  useEffect(() => {
    const targets = { waste: 12000, volunteers: 500, communities: 15, pilots: 3 };
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      setAnimatedStats(prev => ({
        waste: Math.min(prev.waste + targets.waste / steps, targets.waste),
        volunteers: Math.min(prev.volunteers + targets.volunteers / steps, targets.volunteers),
        communities: Math.min(prev.communities + targets.communities / steps, targets.communities),
        pilots: Math.min(prev.pilots + targets.pilots / steps, targets.pilots)
      }));
    }, stepTime);

    setTimeout(() => clearInterval(timer), duration);
    return () => clearInterval(timer);
  }, []);

  const testimonials = [
    {
      text: "Volunteering with Ocean Tribe changed how I see the world. We're not just cleaning beaches — we're saving lives.",
      author: "Ama K.",
      role: "Volunteer"
    },
    {
      text: "Their recycling program gave us tools to manage our waste and create new jobs in our community.",
      author: "Kwame A.",
      role: "Community Leader"
    }
  ];

  const projects = [
    {
      title: "Supporting Mayekoo Beach Cleanups 2024",
      description: "Monthly cleanup drives across Accra's beaches.",
      image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=400&h=250&fit=crop"
    },
    {
      title: "Plastic2Product Recycling Hub",
      description: "Creating job opportunities by turning plastic waste into building materials.",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=250&fit=crop"
    },
    {
      title: "Youth4Ocean Academy",
      description: "Empowering young people through marine conservation training.",
      image: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=400&h=250&fit=crop"
    }
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Thank you for subscribing!",
        description: "You'll receive updates on our ocean restoration projects.",
      });
      setEmail("");
    }
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-green-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1920&h=1080&fit=crop')"
          }}
        ></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Restoring the Ocean.<br />
            <span className="text-green-300">Rebuilding the Future.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 animate-fade-in">
            Join us in protecting our oceans and empowering coastal communities through sustainable solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
              Donate Now
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg">
              Become a Volunteer
            </Button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-50 to-transparent"></div>
      </section>

      {/* Our Mission */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8">Who We Are</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Ocean Tribe Foundation is a non-profit organization dedicated to restoring marine ecosystems, 
              tackling plastic pollution, and promoting sustainable waste management practices across West Africa. 
              We believe in ocean-first solutions that benefit both nature and people.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-100 to-green-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-16">What We Do</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Waves className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Ocean Cleanup</h3>
                <p className="text-gray-600">
                  Removing plastic waste and pollutants from coastal waters and beaches.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Recycle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Recycling & Waste Management</h3>
                <p className="text-gray-600">
                  Transforming plastic, tires, and used oil into useful products.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Education & Youth Empowerment</h3>
                <p className="text-gray-600">
                  Teaching the next generation to become ocean stewards.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Current Projects */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-16">Current Projects</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <Card key={index} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{project.title}</h3>
                  <p className="text-gray-600">{project.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Impact */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-16">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {Math.floor(animatedStats.waste).toLocaleString()}+
              </div>
              <p className="text-blue-100">kg of waste collected</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {Math.floor(animatedStats.volunteers)}+
              </div>
              <p className="text-blue-100">volunteers mobilized</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {Math.floor(animatedStats.communities)}
              </div>
              <p className="text-blue-100">communities impacted</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {Math.floor(animatedStats.pilots)}
              </div>
              <p className="text-blue-100">recycling pilots launched</p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8">Be Part of the Movement</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <Card className="p-8 hover:shadow-xl transition-all duration-300">
              <CardContent className="text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Volunteer With Us</h3>
                <p className="text-gray-600 mb-6">Join our beach cleanups and conservation programs</p>
                <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-300">
              <CardContent className="text-center">
                <Heart className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Donate to the Cause</h3>
                <p className="text-gray-600 mb-6">Support our ocean restoration projects</p>
                <Button className="bg-green-600 hover:bg-green-700">Donate Now</Button>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-300">
              <CardContent className="text-center">
                <Target className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Partner With Us</h3>
                <p className="text-gray-600 mb-6">Collaborate on sustainability initiatives</p>
                <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
                  Contact Us
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-100 to-blue-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-16">What People Say</h2>
          <div className="relative">
            <Card className="p-8 mx-4">
              <CardContent className="text-center">
                <p className="text-xl text-gray-600 italic mb-6">
                  "{testimonials[currentTestimonial].text}"
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <div>
                    <p className="font-bold text-gray-800">{testimonials[currentTestimonial].author}</p>
                    <p className="text-gray-500">{testimonials[currentTestimonial].role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Stay Connected to the Ocean</h2>
          <p className="text-xl mb-8 text-blue-100">
            Subscribe to updates on our projects, events, and impact stories.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white text-gray-800"
              required
            />
            <Button type="submit" className="bg-green-600 hover:bg-green-700 px-8">
              Subscribe
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Ocean Tribe Foundation</h3>
              <p className="text-gray-300 mb-4">
                Restoring the ocean. Rebuilding the future.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Projects</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Volunteer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Donate</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>oceantribefoundation@gmail.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+233 504 991 227</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+233 243 110 019</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Linkedin className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          
          <Separator className="my-8 bg-gray-600" />
          
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Ocean Tribe Foundation. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
