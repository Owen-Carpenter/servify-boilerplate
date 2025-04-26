"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, DollarSign, ChevronRight, Filter, ArrowUpDown, Plus, Minus } from "lucide-react";
import { initScrollAnimations } from "@/lib/scroll-animations";
import { Service } from "@/lib/services";
import { getServices } from "@/lib/supabase-services";

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
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
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

  // Toggle FAQ expansion
  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <main className="gradient-bg pt-32 pb-20">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-white blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-white blur-3xl animate-pulse delay-300"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-3 gradient-text">Our Services</h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Browse through our range of professional services and book your appointment today.
          </p>
        </div>

        {/* Filtering Options */}
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg shadow-md mb-10">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-white mr-2" />
            <h2 className="text-lg text-white font-medium">Filter Services</h2>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <Button 
                key={category}
                variant={activeCategory === category ? "default" : "outline"} 
                className={activeCategory === category 
                  ? "bg-white text-primary shadow-md border-0" 
                  : "bg-white/20 text-white border-0 hover:bg-white hover:text-primary"}
                onClick={() => handleCategoryChange(category)}
              >
                {formatCategoryName(category)}
              </Button>
            ))}
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

        {/* Services Grid - SIMPLIFIED ANIMATIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 flex justify-center items-center py-20">
              <div className="text-white text-lg">Loading services...</div>
            </div>
          ) : filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <Link href={`/services/${service.id}`} key={service.id} className="transition-transform hover:scale-[1.02] duration-300">
                <Card className="h-full border-0 shadow-lg bg-white/95 backdrop-blur-sm overflow-hidden hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl gradient-text">{service.title}</CardTitle>
                        <CardDescription className="mt-1">{service.details}</CardDescription>
                      </div>
                      <span className="text-xs px-2 py-1 bg-primary/10 rounded-full text-primary">
                        {formatCategoryName(service.category)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-primary" />
                        <span>{service.time}</span>
                      </div>
                      <div className="flex items-center font-medium text-foreground">
                        <DollarSign className="h-4 w-4 mr-1 text-primary" />
                        <span>{service.price}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button className="w-full bg-[#6E3FC9] hover:bg-[#5931A9] transition-all duration-200 text-white">
                      <span>Book Now</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
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
        <div className="mt-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3 gradient-text">Frequently Asked Questions</h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Find answers to common questions about our services and booking process.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {faqItems.map((item, index) => (
              <div 
                key={index} 
                className="mb-4 bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden transition-all duration-300"
              >
                <button 
                  className="w-full p-4 text-left flex justify-between items-center"
                  onClick={() => toggleFaq(index)}
                >
                  <h3 className="text-white font-medium text-lg">{item.question}</h3>
                  <div className="bg-white/20 rounded-full p-1">
                    {expandedFaq === index ? (
                      <Minus size={18} className="text-white" />
                    ) : (
                      <Plus size={18} className="text-white" />
                    )}
                  </div>
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 text-white/80">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="text-center mt-10 bg-white/10 backdrop-blur-sm p-6 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-2 text-white">Still have questions?</h3>
            <p className="text-white/80 mb-4">
              Our team is ready to help you with any other questions you may have about our services.
            </p>
            <Button 
              className="bg-white text-primary hover:bg-white/90 shadow-md transition-all duration-200"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
} 