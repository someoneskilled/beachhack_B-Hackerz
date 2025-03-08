// NFTersFooter.jsx
import React from 'react';
import Link from 'next/link';

const NFTersFooter = () => {
  return (
    <footer className="w-full bg-white shadow-sm py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* NFTers Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold uppercase">NFTers</h2>
            <p className="text-gray-600 text-sm">
              The world's first and largest digital marketplace for crypto collectibles and non-fungible tokens (NFTs). 
              Buy, sell and discover exclusive digital items.
            </p>
            <div className="flex space-x-3">
              <Link href="#" className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </Link>
              <Link href="#" className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </Link>
              <Link href="#" className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Market Place Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Market Place</h2>
            <ul className="space-y-2 text-gray-600">
              <li><Link href="#" className="hover:text-blue-600">All NFTs</Link></li>
              <li><Link href="#" className="hover:text-blue-600">New</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Art</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Sports</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Utility</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Music</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Domain Name</Link></li>
            </ul>
          </div>

          {/* My Account and Stay In The Loop Sections */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">My Account</h2>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="#" className="hover:text-blue-600">Profile</Link></li>
                <li><Link href="#" className="hover:text-blue-600">Favorite</Link></li>
                <li><Link href="#" className="hover:text-blue-600">My Collections</Link></li>
                <li><Link href="#" className="hover:text-blue-600">Settings</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Stay In The Loop</h2>
              <p className="text-gray-600 text-sm">
                Join our mailing list to stay in the loop with our newest feature releases, NFT drops, and tips and tricks for navigating NFTs.
              </p>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="absolute right-0 top-0 bg-blue-600 text-white rounded-full px-3 py-2 text-xs h-full">
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-center text-gray-500">
          Copyright © 2023 by Nfters
        </div>
      </div>
    </footer>
  );
};

export default NFTersFooter;