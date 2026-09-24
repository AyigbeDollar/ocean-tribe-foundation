
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, NavLink } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { NAV_LINKS } from '@/lib/site';
import { LogOut, User, Settings, Heart, Menu } from 'lucide-react';
import Logo from './Logo';
import DonateDialog from './DonateDialog';

const linkClass =
  "font-medium transition-all duration-300 hover:text-primary relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full";

const Navigation = () => {
  const { user, signOut, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="sticky top-0 z-40 bg-card/95 shadow-wave border-b border-border backdrop-blur-sm" aria-label="Main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="group">
              <Logo size="md" className="group-hover:text-primary transition-colors duration-300" />
            </Link>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden lg:flex items-center space-x-5">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `${linkClass} ${isActive ? "text-primary after:w-full" : "text-foreground"}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              {user && (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `${linkClass} ${isActive ? "text-primary after:w-full" : "text-foreground"}`
                  }
                >
                  Dashboard
                </NavLink>
              )}
            </div>
            
            <DonateDialog
              trigger={
                <Button variant="ocean" size="sm" className="hidden sm:inline-flex">
                  <Heart className="mr-2 h-4 w-4" />
                  Donate
                </Button>
              }
            />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:shadow-wave transition-all duration-300">
                    <Avatar className="h-8 w-8 ring-2 ring-transparent hover:ring-primary/20 transition-all duration-300">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card border-border shadow-ocean" align="end" forceMount>
                  <DropdownMenuItem className="font-normal hover:bg-accent">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">
                        {user.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="hover:bg-destructive/10 text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="hover:bg-accent">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth" className="hidden sm:block">
                <Button variant="outline" className="animate-shimmer bg-transparent text-foreground hover:bg-accent border-primary/20">
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="mt-8 flex flex-col gap-1">
                  {[{ to: "/", label: "Home" }, ...NAV_LINKS, { to: "/partner-with-us", label: "Partner With Us" }, { to: "/communities", label: "Communities" }].map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === "/"}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `rounded-md px-3 py-2.5 text-base font-medium ${isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                  {user ? (
                    <NavLink to="/dashboard" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2.5 text-base font-medium text-foreground hover:bg-muted">
                      Dashboard
                    </NavLink>
                  ) : (
                    <NavLink to="/auth" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2.5 text-base font-medium text-foreground hover:bg-muted">
                      Sign In
                    </NavLink>
                  )}
                  <div className="mt-4 px-3">
                    <DonateDialog
                      trigger={
                        <Button variant="ocean" className="w-full">
                          <Heart className="mr-2 h-4 w-4" />
                          Donate
                        </Button>
                      }
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
