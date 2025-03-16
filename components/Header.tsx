"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: 'For Teachers', href: 'https://diplomacollective.com/home/for-teachers/' },
    { label: 'For Students', href: 'https://diplomacollective.com/home/for-students/' },
    { label: 'Contact', href: 'https://diplomacollective.com/contact/' },
  ];

  return (
    <header className="bg-[#4895EF] shadow-sm">
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center py-4">
            {/* Logo Section */}
            <div className="col-span-1">
              <Link href="https://diplomacollective.com" className="block">
                <Image
                  src="https://diplomacollective.com/wp-content/uploads/2024/08/DC-Logo-Landscape-e1724943475917.png"
                  alt="Diploma Collective"
                  width={200}
                  height={110}
                  className="h-12 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* Middle Section (Empty) */}
            <div className="col-span-1"></div>

            {/* Navigation Section */}
            <div className="col-span-1">
              <nav className="hidden md:block">
                <ul className="flex justify-end items-center space-x-8">
                  {menuItems.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="text-white hover:text-gray-100 transition-colors duration-200 text-sm font-medium"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex justify-end">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-white hover:text-gray-100 focus:outline-none"
                  aria-label="Toggle menu"
                >
                  {!isMenuOpen ? (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-[#4895EF] shadow-lg z-50">
              <nav className="px-4 py-2">
                <ul className="space-y-2">
                  {menuItems.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="block px-4 py-2 text-white hover:text-gray-100 hover:bg-[#3784de] transition-colors duration-200"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          )}
        </div>
      </section>
    </header>
  );
} 