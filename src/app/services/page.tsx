"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, DollarSign, ChevronRight, Filter, ArrowUpDown } from "lucide-react";
import { initScrollAnimations } from "@/lib/scroll-animations";
import { Service } from "@/lib/services";
import { getServices } from "@/lib/supabase-services";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

// FAQ Data
const faqItems = [
  {
    question: "How do I book a service?",
    answer: "Booking a service is easy! Simply browse our services, select the one you're interested in, choose your preferred date and time, and complete the booking process. You'll receive a confirmation email with all the details."
  },
  {
    question: "Can I reschedule or cancel my appointment?",
    answer: "Yes, you can reschedule or cancel your appointment up to 24 hours before the scheduled time without any charge. Please contact our customer service or use the reschedule function in your account dashboard."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers. Payment is processed securely at the time of booking to confirm your appointment."
  },
  {
    question: "Are your service providers licensed and insured?",
    answer: "Absolutely! All our service providers are fully licensed, insured, and have undergone thorough background checks. We only work with experienced professionals who meet our high quality standards."
  },
  {
    question: "Do you offer any discounts or loyalty programs?",
    answer: "Yes, we offer a loyalty program where you earn points for each booking which can be redeemed for discounts on future services. New customers may also receive a special discount on their first booking."
  }
];

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("default");
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [loading, setLoading] = useState(true);
  
  // Initialize scroll animations - only on initial mount
  useEffect(() => {
    const cleanup = initScrollAnimations();
    return cleanup;
  }, []);

  // Fetch services from Supabase
  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      try {
        const services = await getServices();
        setAllServices(services);
        
        // Extract unique categories
        const uniqueCategories = ["all", ...Array.from(new Set(services.map(service => service.category)))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching services:", error);
        setLoading(false);
      }
    }
    
    fetchServices();
  }, []);
  
  // Apply filtering and sorting whenever dependencies change
  useEffect(() => {
    // Start with all services
    let result = [...allServices];
    
    // Filter by category (case-insensitive comparison for safety)
    if (activeCategory !== "all") {
      result = result.filter(service => 
        service.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }
    
    // Apply sorting
    result = result.sort((a, b) => {
      switch (sortOption) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "duration":
          // Extract numeric values from duration strings (e.g., "60 min" → 60)
          const durationA = parseInt(a.time.split(" ")[0]);
          const durationB = parseInt(b.time.split(" ")[0]);
          return durationA - durationB;
        default:
          return 0;
      }
    });
    
    // Update state with filtered & sorted services
    setFilteredServices(result);
  }, [activeCategory, sortOption, allServices]);
  
  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };
  
  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };
  
  // Format category name for display
  const formatCategoryName = (category: string) => {
    if (category === "all") return "All Services";
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <main className="gradient-bg pt-32 pb-20">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-white blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-white blur-3xl animate-pulse delay-300"></div>
      </div>
      
      <div className="content-container relative z-10">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-3 gradient-text">Our Services</h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Browse through our range of professional services and book your appointment today.
          </p>
        </div>

        {/* Filtering Options */}
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Filter className="w-5 h-5 text-white mr-2" />
              <h2 className="text-lg text-white font-medium">Filter Services</h2>
            </div>
            
            <div className="flex items-center">
              <ArrowUpDown className="w-4 h-4 text-white mr-2" />
              <select 
                className="bg-white/20 text-white border-0 rounded-md p-2 text-sm backdrop-blur-sm focus:ring-2 focus:ring-white/50 focus:outline-none"
                value={sortOption}
                onChange={handleSortChange}
                style={{ color: "white", background: "rgba(255, 255, 255, 0.2)" }}
              >
                <option value="default" style={{ color: "black", background: "white" }}>Sort by: Default</option>
                <option value="price-low" style={{ color: "black", background: "white" }}>Price: Low to High</option>
                <option value="price-high" style={{ color: "black", background: "white" }}>Price: High to Low</option>
                <option value="duration" style={{ color: "black", background: "white" }}>Duration: Short to Long</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              onClick={() => handleCategoryChange("all")}
              className={`
                ${activeCategory === "all" 
                  ? "bg-white/20 backdrop-blur-md text-white border-white/20"
                  : "bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border-white/10"
                } transition-all duration-300
              `}
              size="sm"
            >
              All Services
            </Button>
            {categories.filter(category => category !== "all").map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => handleCategoryChange(category)}
                className={`
                  ${activeCategory === category 
                    ? "bg-white/20 backdrop-blur-md text-white border-white/20"
                    : "bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border-white/10"
                  } transition-all duration-300
                `}
                size="sm"
              >
                {formatCategoryName(category)}
              </Button>
            ))}
          </div>
        </div>

        {/* Services Grid - SIMPLIFIED ANIMATIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 flex justify-center items-center py-20">
              <div className="text-white text-lg">Loading services...</div>
            </div>
          ) : filteredServices.length > 0 ? (
            filteredServices.map((service, index) => (
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
              <p className="text-white text-lg">No services found for the selected category.</p>
              <Button 
                variant="outline" 
                className="mt-4 border-white text-white hover:bg-white hover:text-primary"
                onClick={() => setActiveCategory("all")}
              >
                View All Services
              </Button>
            </div>
          )}
        </div>
        
        {/* FAQ Section */}
        <div className="mt-20 bg-white/10 backdrop-blur-sm p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-8 text-center text-white">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-b border-white/20 last:border-0"
              >
                <AccordionTrigger className="text-white font-medium text-left hover:text-accent transition-colors duration-200">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/80">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        {/* Contact CTA */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Need Help Choosing a Service?</h2>
          <p className="max-w-xl mx-auto text-white/80 mb-8">
            Our experts are ready to help you find the perfect service for your needs.
          </p>
          <Button 
            size="lg"
            className="bg-accent hover:bg-accent/90 text-white hover:shadow-lg transition-all duration-300"
            asChild
          >
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </main>
  );
} 