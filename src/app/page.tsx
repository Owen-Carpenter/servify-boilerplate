"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { MessageSquare, Star, MapPin, Mail, Phone, Shield, Clock } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect } from "react";
import { initScrollAnimations } from "@/lib/scroll-animations";

export default function HomePage() {
  // Initialize scroll animations
  useEffect(() => {
    const cleanup = initScrollAnimations();
    return cleanup;
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
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
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
      <section className="py-24 bg-white">
        <div className="container mx-auto">
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
      <section className="relative py-32 gradient-bg text-white">
        {/* Top wave shape */}
        <div className="wave-shape-top">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
          </svg>
        </div>
        
        <div className="container mx-auto">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl font-bold mb-4 text-white">Popular Services</h2>
            <p className="text-white/90 max-w-2xl mx-auto">
              Book appointments for a wide range of professional services with our easy-to-use platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicePreviewData.map((service, index) => (
              <div key={service.id} className={`relative h-full reveal ${index === 0 ? 'reveal-left' : index === 2 ? 'reveal-right' : ''} delay-${index * 100}`}>
                <Link href={`/services/${service.id}`} className="absolute inset-0 z-10" aria-label={`View ${service.name} details`}>
                  <span className="sr-only">View {service.name} details</span>
                </Link>
                <Card className="h-full border-0 shadow-md card-hover backdrop-blur-sm bg-white/10 border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white">{service.name}</CardTitle>
                    <CardDescription className="text-white/80">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm text-white/80">
                      <span>Duration: {service.duration}</span>
                      <span className="font-medium text-accent">${service.price}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-white/10 pt-4 relative">
                    <Button 
                      className="w-full servify-btn-secondary"
                    >
                      Book Now
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ))}
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
      <section className="py-24 bg-white">
        <div className="container mx-auto">
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
      <section className="py-32 pb-24 gradient-bg text-white relative">
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
        <div className="container mx-auto relative z-10">
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
      <footer className="bg-gray-950 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6E3FC9] to-[#FF8A4C]"></div>
          <div className="absolute top-40 -left-20 w-60 h-60 rounded-full bg-[#6E3FC9]/20 blur-3xl"></div>
          <div className="absolute bottom-20 -right-20 w-80 h-80 rounded-full bg-[#FF8A4C]/20 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 gradient-text hover-scale">Servify</h3>
              <p className="text-gray-400 mb-4">
                Modern solutions for service-based businesses.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-[#FF8A4C] transition-colors duration-300 hover-scale">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-[#FF8A4C] transition-colors duration-300 hover-scale">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-[#FF8A4C] transition-colors duration-300 hover-scale">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="reveal-left">
              <h3 className="text-lg font-semibold mb-4 text-[#6E3FC9]">Services</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover-lift">Consultations</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover-lift">Beauty & Wellness</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover-lift">Home Services</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover-lift">Professional Services</a></li>
              </ul>
            </div>
            <div className="reveal">
              <h3 className="text-lg font-semibold mb-4 text-[#6E3FC9]">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover-lift">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover-lift">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover-lift">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover-lift">Press</a></li>
              </ul>
            </div>
            <div className="reveal-right">
              <h3 className="text-lg font-semibold mb-4 text-[#6E3FC9]">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover-lift">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover-lift">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover-lift">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover-lift">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 reveal">
            <p className="mb-4">© {new Date().getFullYear()} Servify. All rights reserved.</p>
            <div className="flex justify-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#6E3FC9] transition-colors duration-300 hover-lift">Support</a>
              <span className="text-gray-600">•</span>
              <a href="#" className="text-gray-400 hover:text-[#FF8A4C] transition-colors duration-300 hover-lift">Contact</a>
              <span className="text-gray-600">•</span>
              <a href="#" className="text-gray-400 hover:text-[#6E3FC9] transition-colors duration-300 hover-lift">FAQ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sample data for service preview
const servicePreviewData = [
  {
    id: 1,
    name: "Business Consultation",
    description: "Strategic guidance for your business from experienced professionals.",
    duration: "60 min",
    price: 150,
    category: "consultation"
  },
  {
    id: 2,
    name: "Hair Styling",
    description: "Get a fresh new look with our expert hair stylists.",
    duration: "45 min",
    price: 85,
    category: "beauty"
  },
  {
    id: 3,
    name: "Home Cleaning",
    description: "Professional cleaning services for a spotless home.",
    duration: "120 min",
    price: 120,
    category: "home"
  }
];

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
