"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Project uses HugeiconsIcon wrapper and icons data from core-free-icons
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Home01Icon, 
  Briefcase02Icon, 
  InformationCircleIcon, 
  Menu01Icon, 
  UserCircleIcon,
  Sun01Icon,
  Moon01Icon,
  Logout01Icon,
  UserIcon,
  Settings02Icon
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { logout } from "@/store/authSlice";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: any; // Icon data type from @hugeicons/core-free-icons
}

// ─── Configuration ───────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: Home01Icon },
  { label: "Jobs", href: "/jobs", icon: Briefcase02Icon },
  { label: "About", href: "/about", icon: InformationCircleIcon },
];

const MOBILE_EXTRA_ITEMS: NavItem[] = [
  { label: "Profile", href: "/profile", icon: UserCircleIcon },
  { label: "Settings", href: "/settings", icon: Settings02Icon },
  { label: "logout", href: "", icon: Logout01Icon },
];

// ─── Components ──────────────────────────────────────────────────────────────

/**
 * Brand Logo component
 */
const Logo = () => (
  <Link 
    href="/" 
    className="flex items-center gap-0 text-xl font-bold tracking-tight select-none"
    aria-label="HireHeaven - Home"
  >
    <span className="text-blue-600">Hire</span>
    <span className="text-red-500">Heaven</span>
  </Link>
);

/**
 * Main Navbar Component
 */
export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);
  
  // Dummy authentication state
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "??";

  return (
    <header 
      className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200/80"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Center: Desktop Navigation */}
          <nav 
            className="hidden md:flex items-center gap-1"
            aria-label="Desktop navigation"
          >
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                    active 
                      ? "text-blue-600 bg-blue-50/50" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <HugeiconsIcon icon={item.icon} size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: User Actions & Mobile Nav */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-gray-500 hover:text-gray-900"
                onClick={() => setIsDark(!isDark)}
                aria-label="Toggle theme"
              >
                <HugeiconsIcon icon={isDark ? Moon01Icon : Sun01Icon} size={20} />
              </Button>

              {isAuthenticated ? (
                /* User Avatar with Popover */
                <Popover>
                  <PopoverTrigger
                    nativeButton={false}
                    render={
                      <Avatar className="h-9 w-9 border border-gray-100 cursor-pointer hover:ring-2 hover:ring-blue-100 transition-all select-none">
                        <AvatarImage src={user?.profile_pic} alt={user?.name} />
                        <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    }
                  />
                  <PopoverContent align="end" className="w-56 p-2">
                    <div className="p-2 space-y-1">
                      <div className="px-2 py-1.5 mb-1">
                        <p className="text-sm font-medium leading-none truncate">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground mt-1 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <div className="h-px bg-muted mx-2 my-1" />
                      <Link href="/profile" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors">
                        <HugeiconsIcon icon={UserIcon} size={16} />
                        Profile
                      </Link>
                      <Link href="/settings" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors">
                        <HugeiconsIcon icon={Settings02Icon} size={16} />
                        Settings
                      </Link>
                      <div className="h-px bg-muted mx-2 my-1" />
                      <Button
                       variant={"destructive"}
                        onClick={handleLogout}
                        className="w-full flex justify-start gap-2 px-2 py-1.5 bg-white text-sm rounded-md hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
                      >
                        <HugeiconsIcon icon={Logout01Icon} size={16} />
                        Logout
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                /* Sign In Button */
                <Link href="/login">
                  <Button className="bg-[#0f172a] hover:bg-[#1e293b] text-white flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm">
                    <HugeiconsIcon icon={UserIcon} size={18} />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Navigation Trigger */}
            <div className="md:hidden flex items-center gap-2">
              <Button
                variant="ghost"
                size="default"
                className="rounded-full text-gray-500"
                onClick={() => setIsDark(!isDark)}
              >
                <HugeiconsIcon icon={isDark ? Moon01Icon : Sun01Icon} size={20} />
              </Button>

              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger 
                  render={
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-600 hover:bg-gray-100"
                      aria-label="Open Menu"
                    />
                  }
                >
                  <HugeiconsIcon icon={Menu01Icon} size={24} />
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0">
                  <SheetHeader className="p-6 border-b text-left">
                    <SheetTitle 
                      render={
                        <div className="flex items-center">
                          <Logo />
                        </div>
                      }
                    />
                  </SheetHeader>
                  <div className="flex flex-col gap-1 p-4">
                    {NAV_ITEMS.map((item) => {
                      const active = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            active 
                              ? "text-blue-600 bg-blue-50" 
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          )}
                        >
                          <HugeiconsIcon icon={item.icon} size={20} />
                          {item.label}
                        </Link>
                      );
                    })}
                    
                    <div className="my-2 h-px bg-gray-100" />
                    
                    {isAuthenticated ? (
                      MOBILE_EXTRA_ITEMS.map((item) => {
                        if (item.label.toLowerCase() === "logout") {
                          return (
                            <button
                              key={item.label}
                              onClick={() => {
                                handleLogout();
                                setIsOpen(false);
                              }}
                              className="flex  items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                            >
                              <HugeiconsIcon icon={item.icon} size={20} />
                              <span className="capitalize">{item.label}</span>
                            </button>
                          );
                        }
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          >
                            <HugeiconsIcon icon={item.icon} size={20} />
                            {item.label}
                          </Link>
                        );
                      })
                    ) : (
                      <Link
                        href="/signin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-blue-600 bg-blue-50"
                      >
                        <HugeiconsIcon icon={UserIcon} size={20} />
                        Sign In
                      </Link>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}