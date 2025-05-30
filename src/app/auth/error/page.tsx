"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Home, LogIn } from "lucide-react";

const errorMessages = {
  AccessDenied: "Access was denied. You may have cancelled the sign-in process or the provider rejected the request.",
  Configuration: "There is a configuration problem with the authentication provider.",
  Verification: "The verification token has expired or is invalid.",
  Default: "An unexpected error occurred during authentication.",
};

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error") || "Default";
  const errorMessage = errorMessages[error as keyof typeof errorMessages] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg py-12">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-white rounded-full mix-blend-overlay blur-3xl"></div>
        <div className="absolute bottom-40 right-1/4 w-56 h-56 bg-white rounded-full mix-blend-overlay blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full mix-blend-overlay blur-3xl opacity-20"></div>
      </div>
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-5xl font-bold gradient-text">Servify</h1>
            <p className="mt-2 text-white/70">Your Service Marketplace</p>
          </Link>
        </div>
        
        <Card className="w-full backdrop-blur-sm bg-white/90 shadow-2xl border-0 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-red-500/30 rounded-full"></div>
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-orange-500/30 rounded-full"></div>
          </div>
          
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl text-center text-red-600 flex items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Authentication Error
            </CardTitle>
            <CardDescription className="text-center">
              There was a problem signing you in
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 relative z-10">
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {errorMessage}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <Button 
                asChild
                className="w-full bg-primary hover:bg-primary/90 text-white transition-colors duration-200"
              >
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Try Again
                </Link>
              </Button>
              
              <Button 
                variant="outline"
                asChild
                className="w-full"
              >
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
            </div>
            
            {error && (
              <div className="text-xs text-muted-foreground text-center">
                Error code: {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 