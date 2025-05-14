import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Dice5, ScanSearch } from "lucide-react";

export default function GameNavigation() {
  const [location] = useLocation();

  const navItems = [
    {
      name: "Crash Game",
      path: "/",
      icon: <Dice5 className="mr-2 h-5 w-5" />,
    },
    {
      name: "Slot Machine",
      path: "/slots",
      icon: <ScanSearch className="mr-2 h-5 w-5" />,
    }
  ];

  return (
    <nav className="flex space-x-1 p-2 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {navItems.map((item) => (
        <Link key={item.path} href={item.path}>
          <a
            className={cn(
              "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
              "hover:bg-gray-200 dark:hover:bg-gray-700",
              location === item.path
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-gray-800 dark:text-gray-200"
            )}
          >
            {item.icon}
            {item.name}
          </a>
        </Link>
      ))}
    </nav>
  );
}