
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Heart, Waves, Recycle, Users } from "lucide-react";
import heroOceanScene from "@/assets/hero-ocean-scene.jpg";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />
      
      <div className="flex flex-col">
        {/* Hero Section */}
        <section 
          className="relative text-white py-32 min-h-[80vh] flex items-center"
          style={{
            backgroundImage: `linear-gradient(rgba(29, 78, 216, 0.4), rgba(59, 130, 246, 0.6)), url(${heroOceanScene})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg animate-fade-in">
                Restoring the Ocean, Rebuilding the Future
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto drop-shadow-md animate-fade-in">
                Ocean Tribe Foundation is a Ghana-based NGO dedicated to ocean restoration, 
                waste management, and recycling. Join us in protecting our oceans and empowering coastal communities.
              </p>
              {!user ? (
                <Link to="/auth">
                  <Button size="lg" variant="ocean" className="animate-scale-in hover-scale">
                    Join Our Mission
                  </Button>
                </Link>
              ) : (
                <Button size="lg" variant="ocean" className="animate-scale-in hover-scale">
                  Welcome back, {user.user_metadata?.full_name || 'Ocean Guardian'}!
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We work tirelessly to restore marine ecosystems, reduce ocean pollution, 
                and create sustainable solutions for coastal communities in Ghana and beyond.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <Waves className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ocean Restoration</h3>
                <p className="text-gray-600">
                  Protecting marine habitats and restoring damaged ecosystems through 
                  science-based conservation efforts.
                </p>
              </div>
              
              <div className="text-center p-6">
                <Recycle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Waste Management</h3>
                <p className="text-gray-600">
                  Implementing innovative recycling programs and reducing plastic pollution 
                  in our oceans and coastal areas.
                </p>
              </div>
              
              <div className="text-center p-6">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Community Empowerment</h3>
                <p className="text-gray-600">
                  Educating and empowering local communities to become stewards 
                  of their marine environment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of ocean guardians who are working together to create 
              a sustainable future for our planet's most precious resource.
            </p>
            {!user ? (
              <Link to="/auth">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Heart className="mr-2 h-4 w-4" />
                  Get Involved Today
                </Button>
              </Link>
            ) : (
              <Link to="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Heart className="mr-2 h-4 w-4" />
                  Explore Your Dashboard
                </Button>
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
