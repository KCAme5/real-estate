"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, ChevronDown, User } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobilePropertiesOpen, setMobilePropertiesOpen] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setMobilePropertiesOpen(false);
    }, [pathname]);

    const navLinks = [
        { name: "Properties", href: "/properties" },
        { name: "Agents", href: "/agents" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Diaspora Services", href: "/diaspora-services" },
    ];

    const propertyMenuItems = {
        sale: [
            {
                label: "Houses for Sale",
                href: "/properties?listing_type=sale&property_type=house",
            },
            {
                label: "Apartments for Sale",
                href: "/properties?listing_type=sale&property_type=apartment",
            },
            {
                label: "Land for Sale",
                href: "/properties?listing_type=sale&property_type=land",
            },
            {
                label: "Commercial for Sale",
                href: "/properties?listing_type=sale&property_type=commercial",
            },
        ],
        rent: [
            {
                label: "Houses for Rent",
                href: "/properties?listing_type=rent&property_type=house",
            },
            {
                label: "Apartments for Rent",
                href: "/properties?listing_type=rent&property_type=apartment",
            },
            {
                label: "Commercial for Rent",
                href: "/properties?listing_type=rent&property_type=commercial",
            },
            {
                label: "Bedsitters for Rent",
                href: "/properties?listing_type=rent&property_type=bed_sitter",
            },
        ],
        projects: [
            {
                label: "Development Projects",
                href: "/properties?is_development=true",
            },
            { label: "Developments Map", href: "/map?type=development" },
        ],
    };

    const isActive = (href: string) => {
        if (href === "/diaspora-services") {
            return pathname === "/diaspora-services";
        }
        return pathname === href;
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? "bg-card/95 backdrop-blur-xl shadow-lg border-b border-border"
                : "bg-card"
                }`}
        >
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-20 lg:h-24">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-24 h-24 lg:w-20 lg:h-20 transition-transform duration-300 group-hover:scale-105">
                            <Image
                                src="/KenyaPrime.png"
                                alt="KenyaPrime Logo"
                                fill
                                className="object-contain"
                                priority
                                sizes="(max-width: 768px) 64px, 80px"
                            />
                        </div>
                        <div className="hidden sm:block">
                            <div className="text-xl lg:text-2xl font-bold text-foreground transition-colors group-hover:text-primary leading-none">
                                KenyaPrime
                            </div>
                            <div className="text-sm text-primary font-medium tracking-wide">
                                Properties
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {/* Properties Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className={`flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${pathname.startsWith("/properties")
                                        ? "text-primary bg-primary/10"
                                        : "text-muted-foreground hover:text-primary hover:bg-muted"
                                        }`}
                                >
                                    Properties
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className="w-72 p-2 rounded-xl bg-card/95 backdrop-blur-md shadow-xl border border-border"
                            >
                                {/* For Sale Section */}
                                <div className="px-3 py-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        For Sale
                                    </p>
                                </div>
                                {propertyMenuItems.sale.map((item) => (
                                    <DropdownMenuItem
                                        key={item.label}
                                        asChild
                                        className="px-3 py-2.5 rounded-lg cursor-pointer"
                                    >
                                        <Link
                                            href={item.href}
                                            className="w-full text-sm text-foreground"
                                        >
                                            {item.label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}

                                <DropdownMenuSeparator className="my-2" />

                                {/* For Rent Section */}
                                <div className="px-3 py-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        For Rent
                                    </p>
                                </div>
                                {propertyMenuItems.rent.map((item) => (
                                    <DropdownMenuItem
                                        key={item.label}
                                        asChild
                                        className="px-3 py-2.5 rounded-lg cursor-pointer"
                                    >
                                        <Link
                                            href={item.href}
                                            className="w-full text-sm text-foreground"
                                        >
                                            {item.label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}

                                <DropdownMenuSeparator className="my-2" />

                                {/* Projects Section */}
                                <div className="px-3 py-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Real Estate Projects
                                    </p>
                                </div>
                                {propertyMenuItems.projects.map((item) => (
                                    <DropdownMenuItem
                                        key={item.label}
                                        asChild
                                        className="px-3 py-2.5 rounded-lg cursor-pointer"
                                    >
                                        <Link
                                            href={item.href}
                                            className="w-full text-sm text-foreground"
                                        >
                                            {item.label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Other Navigation Links */}
                        {navLinks
                            .filter((link) => link.name !== "Properties")
                            .map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.href)
                                        ? "text-primary bg-primary/10"
                                        : "text-muted-foreground hover:text-primary hover:bg-muted"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden lg:flex items-center gap-3">
                        {/* Theme Toggle */}
                        <div className="relative">
                            <ThemeToggle />
                        </div>

                        {/* Auth Buttons */}
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-muted hover:bg-accent transition-all duration-200 font-medium group">
                                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                            <span className="text-sm font-semibold text-white">
                                                {user.username?.[0]?.toUpperCase() ||
                                                    user.email?.[0]?.toUpperCase() ||
                                                    "U"}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                                                {user.username || user.email?.split("@")[0]}
                                            </span>
                                            <span className="text-xs text-muted-foreground capitalize">
                                                {user.user_type}
                                            </span>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56 p-2 rounded-xl bg-card/95 backdrop-blur-md shadow-xl border border-border"
                                >
                                    <DropdownMenuItem
                                        asChild
                                        className="px-3 py-2.5 rounded-lg cursor-pointer"
                                    >
                                        <Link
                                            href={
                                                user.user_type === "agent"
                                                    ? "/dashboard/agent"
                                                    : "/dashboard"
                                            }
                                            className="w-full text-sm text-foreground"
                                        >
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="px-3 py-2.5 rounded-lg cursor-pointer text-destructive hover:bg-destructive/10"
                                    >
                                        <span className="text-sm">Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-5 py-2.5 text-sm font-medium bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex lg:hidden items-center gap-3">
                        <ThemeToggle />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={`p-2 rounded-lg transition-all duration-200 ${mobileMenuOpen
                                ? "bg-muted text-foreground"
                                : "hover:bg-muted text-muted-foreground"
                                }`}
                            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`lg:hidden fixed inset-x-0 top-16 bg-card border-t border-border shadow-2xl transition-all duration-300 ease-in-out ${mobileMenuOpen
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-4 pointer-events-none"
                        }`}
                >
                    <div className="container mx-auto px-4 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
                        <nav className="flex flex-col gap-1">
                            {navLinks.map((link) => {
                                if (link.name === "Properties") {
                                    return (
                                        <div key={link.name} className="flex flex-col">
                                            <button
                                                onClick={() =>
                                                    setMobilePropertiesOpen(!mobilePropertiesOpen)
                                                }
                                                className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/properties")
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-muted-foreground hover:bg-muted"
                                                    }`}
                                            >
                                                {link.name}
                                                <ChevronDown
                                                    className={`w-4 h-4 transition-transform duration-200 ${mobilePropertiesOpen ? "rotate-180" : ""
                                                        }`}
                                                />
                                            </button>

                                            {mobilePropertiesOpen && (
                                                <div className="flex flex-col gap-1 pl-4 mt-1 mb-2 bg-muted/50 rounded-lg p-2">
                                                    {/* Sale Section */}
                                                    <div className="px-4 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                        For Sale
                                                    </div>
                                                    {propertyMenuItems.sale.map((item) => (
                                                        <Link
                                                            key={item.label}
                                                            href={item.href}
                                                            className="px-4 py-2.5 rounded-md text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                                                        >
                                                            {item.label}
                                                        </Link>
                                                    ))}

                                                    <div className="h-px bg-border my-1 mx-4" />

                                                    {/* Rent Section */}
                                                    <div className="px-4 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                        For Rent
                                                    </div>
                                                    {propertyMenuItems.rent.map((item) => (
                                                        <Link
                                                            key={item.label}
                                                            href={item.href}
                                                            className="px-4 py-2.5 rounded-md text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                                                        >
                                                            {item.label}
                                                        </Link>
                                                    ))}

                                                    <div className="h-px bg-border my-1 mx-4" />

                                                    {/* Projects Section */}
                                                    <div className="px-4 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                        Projects
                                                    </div>
                                                    {propertyMenuItems.projects.map((item) => (
                                                        <Link
                                                            key={item.label}
                                                            href={item.href}
                                                            className="px-4 py-2.5 rounded-md text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                                                        >
                                                            {item.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.href)
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted"
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}

                            {/* Mobile Auth Section */}
                            <div className="border-t border-border mt-4 pt-4 space-y-1">
                                {user ? (
                                    <>
                                        <div className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                                    <span className="text-sm font-semibold text-white">
                                                        {user.username?.[0]?.toUpperCase() ||
                                                            user.email?.[0]?.toUpperCase() ||
                                                            "U"}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {user.username || user.email}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground capitalize">
                                                        {user.user_type}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            href={
                                                user.user_type === "agent"
                                                    ? "/dashboard/agent"
                                                    : "/dashboard"
                                            }
                                            className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors text-center"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="block px-4 py-3 rounded-lg text-sm font-medium bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300 text-center shadow-md"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    );
}
