'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const HistorySidebar = ({ user, navLinks }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-md bg-gray-800 text-white"
        aria-label="Open menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform ease-in-out duration-300 md:translate-x-0 md:static md:h-auto md:w-64 md:flex-shrink-0 z-40`}
      >
        <div className="p-4 border-b border-gray-700">
          {user ? (
            <div className="flex items-center">
              <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                {user.profilePictureUrl ? (
                  <Image
                    src={user.profilePictureUrl}
                    alt={`${user.name}'s profile picture`}
                    layout="fill"
                    objectFit="cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center text-xl font-bold">
                    {user?.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-400">{user.points} points</p>
              </div>
            </div>
          ) : (
            <p>Loading user info...</p> // Or a placeholder/login prompt
          )}
        </div>

        <nav className="mt-4">
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="block py-2 px-4 text-sm text-gray-300 hover:bg-gray-700">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
        ></div>
      )}
    </>
  );
};

export default HistorySidebar;