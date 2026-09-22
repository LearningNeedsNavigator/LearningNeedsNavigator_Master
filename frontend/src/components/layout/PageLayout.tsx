
import React from "react";
import { cn } from "@/lib/utils";
import Header from "./Header";
import HelpButton from "@/components/HelpButton";
import Footer from "./Footer";

type PageLayoutProps = {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
};

const PageLayout = ({ children, className, showHeader = true }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      {showHeader && <Header />}
      <main className={cn("container px-4 py-6 mx-auto max-w-7xl overflow-x-hidden flex-1 w-full", className)}>
        {children}
      </main>
      {showHeader && <HelpButton variant="floating" />}
      <Footer />
    </div>
  );
};

export default PageLayout;
