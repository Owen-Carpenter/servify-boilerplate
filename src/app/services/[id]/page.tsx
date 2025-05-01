import { getServiceById } from "@/lib/supabase-services";
import ServiceDetailClient from "./ServiceDetailClient";
import { notFound } from "next/navigation";

// This is a Server Component
export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  // Ensure params is resolved before using it
  const id = params?.id;
  
  // Fetch the service from Supabase
  const service = await getServiceById(id);
  
  // If service not found, show 404
  if (!service) {
    notFound();
  }
  
  // Pass the service data to the client component
  return <ServiceDetailClient service={service} />;
} 