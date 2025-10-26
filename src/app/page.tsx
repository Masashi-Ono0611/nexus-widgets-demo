"use client";
import React from "react";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a
          href="/payroll"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#1565C0] text-white hover:bg-[#1976D2] hover:border-[#1565C0] h-12 px-6 py-3"
        >
          Payroll
        </a>
        <a
          href="/gifting"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#1565C0] text-white hover:bg-[#1976D2] hover:border-[#1565C0] h-12 px-6 py-3"
        >
          Gifting
        </a>
      </div>
    </main>
  );
}

