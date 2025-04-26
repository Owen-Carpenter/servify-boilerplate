import { mockServices } from "@/lib/services";
import ServiceDetailClient from "./ServiceDetailClient";

// This is a Server Component
export default function ServiceDetailPage({ params }: { params: { id: string } }) {
  // Find the service by ID
  const service = mockServices.find((service) => service.id === params.id) || null;
  
  // Pass the service data to the client component
  return <ServiceDetailClient service={service} />;
} 