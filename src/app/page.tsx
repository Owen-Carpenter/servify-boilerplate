"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { MessageSquare, Star, MapPin, Mail, Phone, Shield, Clock, DollarSign, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { initScrollAnimations } from "@/lib/scroll-animations";
import { Service } from "@/lib/services";
import { getServices } from "@/lib/supabase-services";
import { Footer } from "@/components/ui/footer";

// Format category name for display
const formatCategoryName = (category: string) => {
  if (category === "all") return "All Services";
  return category.charAt(0).toUpperCase() + category.slice(1);
};

export default function HomePage() {
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize scroll animations
  useEffect(() => {
    const cleanup = initScrollAnimations();
    return cleanup;
  }, []);

  // Fetch popular services
  useEffect(() => {
    async function fetchPopularServices() {
      setLoading(true);
      try {
        const services = await getServices();
        // Get first 3 services as popular services
        setPopularServices(services.slice(0, 3));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching services:", error);
        setLoading(false);
      }
    }
    
    fetchPopularServices();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Gradient Background */}
      <section className="relative py-24 gradient-bg text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-white rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-10 left-1/4 w-20 h-20 bg-white rounded-full animate-pulse delay-200"></div>
          <div className="absolute -bottom-10 right-1/3 w-30 h-30 bg-white rounded-full animate-pulse delay-400"></div>
        </div>
        <div className="content-container grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <h1 className="text-6xl font-bold leading-tight animate-fadeInLeft">
              Your Services, <span className="text-secondary font-bold">Simplified</span>
            </h1>
            <p className="text-xl opacity-90 max-w-md animate-fadeInLeft delay-200">
              Servify helps service-based businesses manage appointments, payments, and customer relationships with a modern, user-friendly platform.
            </p>
            <div className="flex gap-4 pt-4 animate-fadeInLeft delay-300">
              <Link href="/services">
                <Button size="lg" className="servify-btn-secondary hover-scale">Browse Services</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" className="servify-btn-primary hover-glow">Create Account</Button>
              </Link>
            </div>
          </div>
          <div className="relative animate-fadeInRight">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-300 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-orange-300 rounded-full filter blur-3xl opacity-20 animate-pulse delay-300"></div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 shadow-xl border border-white/10 h-[450px] flex items-center justify-center relative overflow-hidden">
              {/* Animated Booking Calendar */}
              <div className="w-full max-w-[360px] h-[380px] bg-white rounded-xl shadow-2xl overflow-hidden relative z-20">
                {/* Calendar Header */}
                <div className="bg-primary w-full p-4 text-white">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-xl">Book a Service</h3>
                    <div className="flex items-center space-x-1">
                      <button className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <span className="text-sm font-medium">October 2023</span>
                      <button className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Week Days */}
                  <div className="grid grid-cols-7 gap-1 mt-4 text-xs text-white/80">
                    <div className="text-center">Sun</div>
                    <div className="text-center">Mon</div>
                    <div className="text-center">Tue</div>
                    <div className="text-center">Wed</div>
                    <div className="text-center">Thu</div>
                    <div className="text-center">Fri</div>
                    <div className="text-center">Sat</div>
                  </div>
                </div>
                
                {/* Calendar Body */}
                <div className="p-2 bg-white">
                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Previous Month */}
                    {[25, 26, 27, 28, 29, 30].map(day => (
                      <div key={`prev-${day}`} className="aspect-square flex items-center justify-center text-gray-400 text-sm">
                        {day}
                      </div>
                    ))}
                    
                    {/* Current Month - First Row */}
                    {[1, 2, 3, 4, 5, 6, 7].map(day => (
                      <div key={day} className={`aspect-square rounded-full flex items-center justify-center text-sm 
                        ${day === 3 ? 'bg-accent text-white font-bold scale-110 transition-all duration-500 animate-pulse' : 'hover:bg-gray-100'}`}>
                        {day}
                      </div>
                    ))}
                    
                    {/* Current Month - Second Row */}
                    {[8, 9, 10, 11, 12, 13, 14].map(day => (
                      <div key={day} className={`aspect-square rounded-full flex items-center justify-center text-sm 
                        ${day === 12 ? 'bg-primary text-white font-bold' : 'hover:bg-gray-100'}`}>
                        {day}
                      </div>
                    ))}
                    
                    {/* Rest of the days */}
                    {[15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map(day => (
                      <div key={day} className="aspect-square rounded-full flex items-center justify-center text-sm hover:bg-gray-100">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Time Slot Selection */}
                  <div className="mt-4 p-2 border-t">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Times for Oct 12</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center py-1 px-2 bg-gray-100 rounded text-xs text-gray-800">09:00 AM</div>
                      <div className="text-center py-1 px-2 bg-primary/10 rounded text-xs text-primary font-medium border border-primary/30 animate-pulse">10:30 AM</div>
                      <div className="text-center py-1 px-2 bg-gray-100 rounded text-xs text-gray-800">12:00 PM</div>
                      <div className="text-center py-1 px-2 bg-gray-100 rounded text-xs text-gray-800">01:30 PM</div>
                      <div className="text-center py-1 px-2 bg-gray-100 rounded text-xs text-gray-800">03:00 PM</div>
                      <div className="text-center py-1 px-2 bg-gray-100 rounded text-xs text-gray-800">04:30 PM</div>
                    </div>
                  </div>
                  
                  {/* Selected Service */}
                  <div className="mt-4 px-3 py-2 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-sm text-gray-900">Business Consultation</h5>
                      <p className="text-xs text-gray-500">60 min • $150</p>
                    </div>
                    <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">Selected</span>
                  </div>
                  
                  {/* Book Button */}
                  <button className="mt-4 w-full py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors">
                    Confirm Booking
                  </button>
                </div>
                
                {/* Animated Elements */}
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-accent rounded-full opacity-30 animate-ping-slow"></div>
                <div className="absolute -bottom-5 -left-5 w-10 h-10 bg-primary rounded-full opacity-20 animate-ping-slow delay-1000"></div>
              </div>
              
              {/* Floating Service Cards */}
              <div className="absolute top-16 -left-10 w-48 h-auto p-3 bg-white rounded-lg shadow-lg transform rotate-[-15deg] z-10 animate-float-slow">
                <h4 className="font-semibold text-sm text-gray-900">Hair Styling</h4>
                <p className="text-xs text-gray-500 mb-2">Professional hair styling services</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-primary font-medium">$85</span>
                  <span className="text-gray-500">45 min</span>
                </div>
              </div>
              
              <div className="absolute bottom-20 -right-14 w-48 h-auto p-3 bg-white rounded-lg shadow-lg transform rotate-[10deg] z-10 animate-float-slow delay-700">
                <h4 className="font-semibold text-sm text-gray-900">Home Cleaning</h4>
                <p className="text-xs text-gray-500 mb-2">Professional cleaning services</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-primary font-medium">$120</span>
                  <span className="text-gray-500">120 min</span>
                </div>
              </div>
              
              {/* Confirmation Check Animation */}
              <div className="absolute -bottom-2 -right-2 w-20 h-20 overflow-hidden">
                <div className="animate-slide-up-fade delay-2000 bg-accent/80 w-full h-full rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white animate-scale-up delay-2000" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="wave-shape">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="content-container">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Why Choose Servify</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              We&apos;re on a mission to revolutionize how service-based businesses operate and grow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center p-8 bg-white rounded-2xl shadow-md card-hover reveal-left">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-xl font-bold mb-3">Save Time</h3>
              <p className="text-slate-600">
                Automated scheduling and reminders save you hours of administrative work each week.
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-md card-hover reveal delay-200">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Platform</h3>
              <p className="text-slate-600">
                Enterprise-grade security keeps your business and customer data protected at all times.
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-md card-hover reveal-right">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h3 className="text-xl font-bold mb-3">Client Engagement</h3>
              <p className="text-slate-600">
                Built-in communication tools help you stay connected with your clients from booking to follow-up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Preview Section */}
      <section id="popular-services" className="relative py-32 gradient-bg text-white">
        {/* Top wave shape */}
        <div className="wave-shape-top">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
          </svg>
        </div>
        
        <div className="content-container">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl font-bold mb-4 text-white">Popular Services</h2>
            <p className="text-white/90 max-w-2xl mx-auto">
              Book appointments for a wide range of professional services with our easy-to-use platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-3 flex justify-center items-center py-20">
                <div className="text-white text-lg">Loading services...</div>
              </div>
            ) : popularServices.length > 0 ? (
              popularServices.map((service, index) => (
                <Link href={`/services/${service.id}`} key={service.id} className="transition-transform hover:scale-[1.02] duration-300">
                  <Card className="h-full overflow-hidden transition-all duration-300
                    border border-white/20 shadow-xl
                    bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md
                    hover:shadow-[0_10px_40px_rgba(255,255,255,0.15)] hover:border-white/30 relative group">
                    <div className="absolute inset-0 flex items-center justify-center text-[250px] font-bold opacity-[0.15] pointer-events-none select-none z-0 animate-float-slow bg-clip-text text-transparent bg-gradient-to-br from-white to-white/30" style={{ '--rotation': `${(index % 3) - 1}deg` } as React.CSSProperties}>
                      {(index + 1).toString().padStart(2, '0')}
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl text-primary font-bold group-hover:text-primary/80 transition-colors">{service.title}</CardTitle>
                          <CardDescription className="mt-1 text-white/80">{service.details}</CardDescription>
                        </div>
                        <span className="text-xs px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white">
                          {formatCategoryName(service.category)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="flex justify-between text-sm text-white/70 mt-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-white/90" />
                          <span>{service.time}</span>
                        </div>
                        <div className="flex items-center font-medium">
                          <DollarSign className="h-4 w-4 mr-1 text-accent group-hover:text-accent/80 transition-colors" />
                          <span className="text-accent group-hover:text-accent/80 transition-colors">{service.price}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-white/10 pt-4 relative z-10">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white 
                        backdrop-blur-sm transition-all duration-200 group-hover:shadow-lg group-hover:scale-[1.02]">
                        <span>Book Now</span>
                        <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 bg-white/10 backdrop-blur-sm rounded-lg">
                <p className="text-white text-lg">No services available at the moment.</p>
              </div>
            )}
          </div>
          
          <div className="mt-12 text-center reveal">
            <Button 
              className="mt-6 servify-btn-secondary hover-glow"
              asChild
            >
              <Link href="/services">
                View All Services
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Bottom wave shape */}
        <div className="wave-shape">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
          </svg>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="content-container">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl font-bold mb-4 gradient-text">What Our Clients Say</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Hear from businesses and customers who have transformed their service experience with Servify.
            </p>
          </div>
          
          <div className="relative px-12 reveal-scale">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card className="bg-white p-8 rounded-2xl shadow-md h-full card-hover">
                        <CardContent className="p-0">
                          <div className="flex items-center mb-4">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                            ))}
                          </div>
                          <p className="text-slate-600 italic mb-6">&quot;{testimonial.quote}&quot;</p>
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white mr-4 hover-rotate">
                              <span className="font-bold">{testimonial.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium">{testimonial.name}</p>
                              <p className="text-sm text-slate-500">{testimonial.title}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-4 bg-white hover-scale" />
              <CarouselNext className="-right-4 bg-white hover-scale" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 pb-24 gradient-bg text-white relative">
        {/* Top wave shape */}
        <div className="wave-shape-top">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
          </svg>
        </div>

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-60 h-60 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-40 right-20 w-40 h-40 bg-white rounded-full animate-pulse delay-300"></div>
        </div>
        <div className="content-container">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Have questions about our platform? We&apos;re here to help.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="space-y-8">
                <div className="flex items-center reveal-left">
                  <div className="bg-white/10 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mr-6 hover-scale">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1 text-xl">Our Location</h3>
                    <p className="text-white/80">123 Business Avenue, San Francisco, CA 94107</p>
                  </div>
                </div>
                
                <div className="flex items-center reveal-left delay-200">
                  <div className="bg-white/10 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mr-6 hover-scale">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1 text-xl">Email Us</h3>
                    <p className="text-white/80">support@servify.com</p>
                  </div>
                </div>
                
                <div className="flex items-center reveal-left delay-300">
                  <div className="bg-white/10 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mr-6 hover-scale">
                    <Phone className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1 text-xl">Call Us</h3>
                    <p className="text-white/80">(555) 123-4567</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 reveal-right">
              <Card className="bg-white/10 backdrop-blur-sm border-white/10 hover-glow">
                <CardContent className="p-8">
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          className="w-full p-3 border-0 bg-white/20 rounded-md focus:ring-2 focus:ring-white text-white placeholder:text-white/50 hover-bright"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="w-full p-3 border-0 bg-white/20 rounded-md focus:ring-2 focus:ring-white text-white placeholder:text-white/50 hover-bright"
                          placeholder="Your email"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        className="w-full p-3 border-0 bg-white/20 rounded-md focus:ring-2 focus:ring-white text-white placeholder:text-white/50 hover-bright"
                        placeholder="Subject"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        className="w-full p-3 border-0 bg-white/20 rounded-md focus:ring-2 focus:ring-white text-white placeholder:text-white/50 hover-bright"
                        placeholder="Your message"
                      ></textarea>
                    </div>
                    <Button 
                      className="w-full servify-btn-primary"
                      type="submit"
                    >
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Sample testimonials data
const testimonials = [
  {
    name: "Sarah Johnson",
    title: "Salon Owner",
    quote: "Servify completely transformed how I manage my salon. Bookings are up 30% and I can finally take a day off!"
  },
  {
    name: "Mark Davis",
    title: "Consulting Firm CEO",
    quote: "The client management features have helped us maintain stronger relationships with our key accounts."
  },
  {
    name: "Elena Rodriguez",
    title: "Yoga Studio Manager",
    quote: "Setting up classes and managing memberships is now seamless. Our students love the easy booking process."
  },
  {
    name: "James Wilson",
    title: "Plumbing Business Owner",
    quote: "As a small business, I needed something simple yet powerful. Servify delivers exactly that."
  },
  {
    name: "Michelle Lee",
    title: "Massage Therapist",
    quote: "The automated reminders have cut my no-shows by half! My schedule stays fuller and more profitable."
  }
];
