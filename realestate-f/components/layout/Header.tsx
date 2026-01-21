'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const navLinks = [
        { name: 'Properties', href: '/properties' },
        { name: 'Agents', href: '/agents' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
        { name: 'Diaspora Services', href: '/diaspora-services' },
    ];

    const propertyMenuItems = {
        sale: [
            { label: 'Houses for Sale', href: '/properties?listing_type=sale&property_type=house' },
            { label: 'Apartments for Sale', href: '/properties?listing_type=sale&property_type=apartment' },
            { label: 'Land for Sale', href: '/properties?listing_type=sale&property_type=land' },
            { label: 'Commercial for Sale', href: '/properties?listing_type=sale&property_type=commercial' },
        ],
        rent: [
            { label: 'Houses for Rent', href: '/properties?listing_type=rent&property_type=house' },
            { label: 'Apartments for Rent', href: '/properties?listing_type=rent&property_type=apartment' },
            { label: 'Commercial for Rent', href: '/properties?listing_type=rent&property_type=commercial' },
            { label: 'Bedsitters for Rent', href: '/properties?listing_type=rent&property_type=bed_sitter' },
        ],
        projects: [
            { label: 'Development Projects', href: '/properties?is_development=true' },
            { label: 'Developments Map', href: '/map?type=development' },
        ]
    };

    const isActive = (href: string) => {
        if (href === '/diaspora-services') {
            return pathname === '/diaspora-services';
        }
        return pathname === href;
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-gray-100 dark:border-gray-800'
                : 'bg-white dark:bg-gray-900'
                }`}
        >
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-10 h-10 lg:w-12 lg:h-12 transition-transform duration-300 group-hover:scale-105">
                            <Image
                                src="/KenyaPrime.png"
                                alt="KenyaPrime Logo"
                                fill
                                className="object-contain"
                                priority
                                sizes="(max-width: 768px) 40px, 48px"
                            />
                        </div>
                        <div className="hidden sm:block">
                            <div className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                KenyaPrime
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1">Properties</div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {/* Properties Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className={`flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${pathname.startsWith('/properties')
                                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    Properties
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className="w-72 p-2 rounded-xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800"
                            >
                                {/* For Sale Section */}
                                <div className="px-3 py-2">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        For Sale
                                    </p>
                                </div>
                                {propertyMenuItems.sale.map((item) => (
                                    <DropdownMenuItem key={item.label} asChild className="px-3 py-2.5 rounded-lg cursor-pointer">
                                        <Link href={item.href} className="w-full text-sm text-gray-700 dark:text-gray-300">
                                            {item.label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}

                                <DropdownMenuSeparator className="my-2" />

                                {/* For Rent Section */}
                                <div className="px-3 py-2">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        For Rent
                                    </p>
                                </div>
                                {propertyMenuItems.rent.map((item) => (
                                    <DropdownMenuItem key={item.label} asChild className="px-3 py-2.5 rounded-lg cursor-pointer">
                                        <Link href={item.href} className="w-full text-sm text-gray-700 dark:text-gray-300">
                                            {item.label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}

                                <DropdownMenuSeparator className="my-2" />

                                {/* Projects Section */}
                                <div className="px-3 py-2">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Real Estate Projects
                                    </p>
                                </div>
                                {propertyMenuItems.projects.map((item) => (
                                    <DropdownMenuItem key={item.label} asChild className="px-3 py-2.5 rounded-lg cursor-pointer">
                                        <Link href={item.href} className="w-full text-sm text-gray-700 dark:text-gray-300">
                                            {item.label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Other Navigation Links */}
                        {navLinks
                            .filter((link) => link.name !== 'Properties')
                            .map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.href)
                                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
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
                                    <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 font-medium group">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                            <span className="text-sm font-semibold text-white">
                                                {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                                                {user.username || user.email?.split('@')[0]}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                {user.user_type}
                                            </span>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56 p-2 rounded-xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800"
                                >
                                    <DropdownMenuItem asChild className="px-3 py-2.5 rounded-lg cursor-pointer">
                                        <Link
                                            href={
                                                user.user_type === 'agent'
                                                    ? '/dashboard/agent'
                                                    : '/dashboard'
                                            }
                                            className="w-full text-sm text-gray-700 dark:text-gray-300"
                                        >
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="px-3 py-2.5 rounded-lg cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <span className="text-sm">Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
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
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
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
                    className={`lg:hidden fixed inset-x-0 top-16 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-2xl transition-all duration-300 ease-in-out ${mobileMenuOpen
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 -translate-y-4 pointer-events-none'
                        }`}
                >
                    <div className="container mx-auto px-4 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
                        <nav className="flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.href)
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {/* Mobile Auth Section */}
                            <div className="border-t border-gray-100 dark:border-gray-800 mt-4 pt-4 space-y-1">
                                {user ? (
                                    <>
                                        <div className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                                    <span className="text-sm font-semibold text-white">
                                                        {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {user.username || user.email}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                        {user.user_type}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            href={
                                                user.user_type === 'agent'
                                                    ? '/dashboard/agent'
                                                    : '/dashboard'
                                            }
                                            className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="block px-4 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300 text-center shadow-md"
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