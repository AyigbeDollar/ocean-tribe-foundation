import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Globe, Heart, Handshake, Users } from "lucide-react";
import DonateDialog from "@/components/DonateDialog";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Join Our Mission
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Together, we can restore our oceans and build sustainable communities. 
            Partner with us or support our cause to make a lasting impact.
          </p>
        </div>

        {/* Call to Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Donate & Support</CardTitle>
              </div>
              <CardDescription className="text-lg">
                Your contribution directly funds ocean cleanup initiatives, community programs, and sustainable development projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full" />
                  Ocean restoration projects
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full" />
                  Community education programs
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full" />
                  Sustainable livelihood initiatives
                </li>
              </ul>
              <DonateDialog
                trigger={<Button className="w-full">Donate Now</Button>}
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Handshake className="h-8 w-8 text-secondary" />
                <CardTitle className="text-2xl">Partnership Opportunities</CardTitle>
              </div>
              <CardDescription className="text-lg">
                Collaborate with us to amplify your environmental impact and reach communities that need it most.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-secondary rounded-full" />
                  Corporate social responsibility
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-secondary rounded-full" />
                  Joint environmental projects
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-secondary rounded-full" />
                  Community outreach programs
                </li>
              </ul>
              <Button variant="secondary" className="w-full" asChild>
                <a href="mailto:oceantribefoundation@gmail.com?subject=Partnership%20Opportunity%20with%20Ocean%20Tribe">
                  Explore Partnerships
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">Get In Touch</CardTitle>
            <CardDescription className="text-lg">
              Ready to make a difference? We'd love to hear from you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Phone */}
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-3">Call Us</h3>
                <div className="space-y-2 text-muted-foreground flex flex-col items-center">
                  <a href="https://wa.me/233243110019" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:underline">
                    +233 243 110 019
                  </a>
                  <a href="https://wa.me/233504991227" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:underline">
                    +233 504 991 227
                  </a>
                  <a href="https://wa.me/233544297508" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:underline">
                    +233 544 297 508
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-3">Email Us</h3>
                <p className="text-muted-foreground">
                  <a 
                    href="mailto:oceantribefoundation@gmail.com" 
                    className="hover:text-primary transition-colors"
                  >
                    oceantribefoundation@gmail.com
                  </a>
                </p>
              </div>

              {/* Website */}
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-3">Visit Our Website</h3>
                <p className="text-muted-foreground">
                  <a 
                    href="https://oceantribefoundation.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    oceantribefoundation.org
                  </a>
                </p>
              </div>
            </div>

            {/* Impact Statement */}
            <div className="mt-12 text-center bg-gradient-to-r from-primary/5 to-secondary/5 p-8 rounded-lg">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-3">Your Impact Matters</h3>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Every donation and partnership helps us reach more communities, clean more coastlines, 
                and create sustainable solutions for our ocean's future. Join thousands of supporters 
                who are already making a difference.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Contact;