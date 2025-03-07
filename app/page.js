"use client"
import React from 'react';
import Link from 'next/link';

export default function Home() {
  

  return (
    <div>
      <Link href={"/signup"}><button className='bg-black p-6 cursor-pointer text-white rounded-md m-8'>Go to Sign up page</button></Link>
    </div>
  );
}