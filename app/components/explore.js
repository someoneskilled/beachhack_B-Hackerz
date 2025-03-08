// pages/index.js
import Head from 'next/head';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>NFT Marketplace</title>
        <meta name="description" content="Connect with art through NFTs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-8">
            <button className="text-purple-700 font-semibold">Connect</button>
            <button className="text-gray-500 hover:text-gray-700">Marketplace</button>
            <button className="text-gray-500 hover:text-gray-700">Resource</button>
            <button className="text-gray-500 hover:text-gray-700">About</button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search" 
                className="pl-3 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
              />
              <div className="absolute right-3 top-2.5">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
            <button className="bg-purple-700 text-white px-6 py-2 rounded-full font-medium">Login</button>
            <button className="border border-purple-700 text-purple-700 px-6 py-2 rounded-full font-medium">Dashboard</button>
          </div>
        </nav>

        {/* Hero Banner */}
        <div className="relative w-full h-64 rounded-lg overflow-hidden mb-12">
          <Image
            src="/api/placeholder/1440/256"
            alt="Art collectibles"
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute bottom-12 left-12 text-white text-3xl font-bold">
            <span>We </span>
            <span className="text-purple-500">Connect</span>
            <span> the world with ART</span>
          </div>
        </div>
        
        {/* About Us Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">About Us</h2>
          <p className="text-gray-600 text-center max-w-4xl mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, facilisi ac pharetra placerat a pellentesque tellus sed egestas. Et tristique 
            dictum sit tristique sed non. Lacinia lorem id consectetur pretium diam ut. Pellentesque eu sit blandit fringilla risus faucibus. Lorem 
            ipsum dolor sit amet, consectetur adipiscing elit, facilisi ac pharetra placerat a pellentesque tellus sed egestas. Et tristique dictum sit 
            tristique sed non. Lacinia lorem id consectetur pretium diam ut. Pellentesque eu sit blandit fringilla risus faucibus.
          </p>
        </div>
        
        {/* Create and Sell NFTs Section */}
        <div className="flex justify-between items-center">
          {/* Left Images */}
          <div className="relative w-1/3 space-y-4">
            <div className="relative h-56 rounded-lg overflow-hidden bg-gradient-to-r from-purple-400 to-pink-500">
              <div className="absolute -bottom-4 right-4">
                <div className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-gray-300">
                  <Image
                    src="/api/placeholder/48/48"
                    alt="User avatar"
                    width={48}
                    height={48}
                  />
                </div>
              </div>
            </div>
            <div className="relative h-28 rounded-lg overflow-hidden bg-gradient-to-r from-red-400 to-yellow-500">
              <div className="absolute -bottom-4 left-4">
                <div className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-gray-300">
                  <Image
                    src="/api/placeholder/48/48"
                    alt="User avatar"
                    width={48}
                    height={48}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Center Image */}
          <div className="relative w-1/4 h-72 mx-4">
            <div className="relative h-full rounded-lg overflow-hidden bg-gradient-to-r from-orange-400 to-pink-500">
              <div className="absolute -bottom-4 right-4">
                <div className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-gray-300">
                  <Image
                    src="/api/placeholder/48/48"
                    alt="User avatar"
                    width={48}
                    height={48}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Content */}
          <div className="w-1/3">
            <h3 className="text-2xl font-black mb-4">CREATE AND SELL YOUR NFTS</h3>
            <p className="text-gray-600 mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, facilisi ac pharetra placerat a pellentesque tellus sed 
              egestas. Et tristique dictum sit tristique sed non. Lacinia lorem 
              id consectetur pretium diam ut. Pellentesque eu sit blandit 
              fringilla risus faucibus.
            </p>
            <button className="bg-purple-700 text-white px-6 py-3 rounded-full font-medium">Sign Up Now</button>
          </div>
        </div>
      </main>
    </div>
  );
}