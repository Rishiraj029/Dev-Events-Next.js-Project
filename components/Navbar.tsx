'use client';

import React from 'react'
import Link from "next/link";
import Image from "next/image";
import posthog from 'posthog-js';

const Navbar = () => {
  return (
    <header>
      <nav>
        <Link href="/" className="logo">
          <Image src="/icons/logo.png" alt="logo" width={24} height={24} /> 
        
        <p>DevEvent</p>
        </Link>

        <ul>
          <Link href="/" onClick={() => posthog.capture('nav_link_clicked', { link_label: 'Home', href: '/' })}>Home</Link>
          <Link href="/" onClick={() => posthog.capture('nav_link_clicked', { link_label: 'Event', href: '/' })}>Event</Link>
          <Link href="/" onClick={() => posthog.capture('nav_link_clicked', { link_label: 'Create Event', href: '/' })}>Create Event</Link>
        </ul>

      </nav>
    </header>
  )
}

export default Navbar