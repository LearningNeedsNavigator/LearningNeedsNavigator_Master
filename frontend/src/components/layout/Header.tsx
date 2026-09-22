import React from "react";
import { BarChart, Shield, Menu, HelpCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import UserMenu from "./UserMenu";
import { useAuth } from "@/context/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
type HeaderProps = {
  className?: string;
};

const Header = ({ className }: HeaderProps) => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/assessment", label: "Assessment" },
    { to: "/results", label: "Results", icon: BarChart },
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/60 bg-gradient-to-b from-background/90 to-primary/[0.04] backdrop-blur-md supports-[backdrop-filter]:bg-background/70 shadow-[0_1px_0_0_hsl(var(--primary)/0.04)] overflow-visible",
        className,
      )}
    >
      <div className="container px-3 sm:px-6 py-2 sm:py-2.5 mx-auto max-w-7xl overflow-visible">
        <div className="flex items-center justify-between gap-3 sm:gap-6 h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group transition-opacity hover:opacity-95 min-w-0">
            <BookOpen
              className="h-8 w-8 sm:h-9 sm:w-9 text-primary flex-shrink-0 transition-transform duration-300 group-hover:scale-[1.05]"
              strokeWidth={2}
            />
            <div className="min-w-0">
              <h1 className="text-base sm:text-[1.4rem] font-bold tracking-tight text-primary leading-snug sm:leading-tight pb-0.5 whitespace-nowrap">
                Learning Needs Navigator
              </h1>
              <p className="hidden sm:block text-xs text-muted-foreground/70 mt-0.5 tracking-wide leading-snug">
                Smarter learning decisions for better outcomes
              </p>
            </div>
          </Link>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-5 sm:gap-7">
            <nav className="flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="relative px-3 py-2 text-sm font-medium text-foreground/75 hover:text-primary transition-colors duration-200 flex items-center gap-1.5 after:content-[''] after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-px after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {label}
                </Link>
              ))}
            </nav>
            <UserMenu />
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden shrink-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu" className="h-12 w-12">
                  <Menu className="h-7 w-7 text-primary" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-2">
                  {navItems.map(({ to, label, icon: Icon }) => (
                    <SheetClose asChild key={to}>
                      <Link
                        to={to}
                        className="flex items-center gap-2 px-3 py-3 rounded-md text-sm font-medium text-foreground/80 hover:bg-primary/5 hover:text-primary"
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        {label}
                      </Link>
                    </SheetClose>
                  ))}
                  <SheetClose asChild>
                    <a
                      href={`mailto:info_arnaintelligence@alis-global.com?subject=${encodeURIComponent("Learning Needs Navigator Support")}`}
                      className="flex items-center gap-2 px-3 py-3 rounded-md text-sm font-medium text-foreground/80 hover:bg-primary/5 hover:text-primary"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Need Help?
                    </a>
                  </SheetClose>
                </nav>
                <div className="border-t p-4 space-y-3">
                  <UserMenu />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
