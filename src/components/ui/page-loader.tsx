"use client";

import React from 'react';
import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  message?: string;
  subMessage?: string;
}

export function PageLoader({ 
  message = "Loading...", 
  subMessage = "Please wait while we prepare your experience" 
}: PageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center gradient-bg">
      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent opacity-50" />
      
      <div className="relative w-full max-w-md backdrop-blur-sm bg-white/10 rounded-lg shadow-2xl border border-white/20 p-10">
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute -inset-[100%] opacity-20 animate-[spin_3s_linear_infinite] bg-gradient-conic from-primary via-primary/0 to-primary/70" />
        </div>
        
        <div className="relative flex flex-col items-center justify-center space-y-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white">{message}</h2>
            <p className="text-white/70 mt-2">{subMessage}</p>
          </div>
          
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full w-1/3 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 