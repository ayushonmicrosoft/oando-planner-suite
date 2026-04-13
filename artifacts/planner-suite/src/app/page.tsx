"use client";

import { useAuth } from "@/hooks/use-auth";
import Landing from "@/views/landing";
import Home from "@/views/home";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <>
        <h1 className="sr-only">One&amp;Only — Office Planner &amp; Workspace Design Tool</h1>
        <main className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="sr-only">
            <h2>One&amp;Only Office Planner — India&apos;s Leading Workspace Design Software</h2>
            <p>
              One&amp;Only is India&apos;s premier office furniture planning and workspace design platform built for architects,
              interior designers, facility managers, and business owners. Our comprehensive suite of tools empowers professionals
              to plan, design, and visualize complete office environments from concept to execution. Whether you are designing
              a small startup workspace or a large corporate campus, One&amp;Only provides the precision and flexibility you need.
            </p>
            <h3>Powerful Design Tools</h3>
            <p>
              Our platform includes a full-featured 2D canvas planner for creating detailed office layouts with drag-and-drop
              furniture placement. The blueprint wizard generates professional architectural drawings with accurate dimensions
              and annotations. Use our CAD drawing tool for technical precision, or start with the floor plan creator to quickly
              sketch room outlines and partition walls. The site plan designer helps you plan entire building floors and campuses
              with outdoor areas, parking, and landscaping. Import existing floor plans, scale them accurately, and overlay your
              new designs with our import and scale utility.
            </p>
            <h3>3D Visualization and Collaboration</h3>
            <p>
              Bring your designs to life with the integrated 3D viewer that renders realistic perspectives of your planned spaces.
              Walk through your office virtually before any furniture is ordered or walls are built. Share interactive plan links
              with clients and stakeholders for real-time feedback. Collaborate with team members simultaneously using our
              real-time collaboration features with live cursors and version history.
            </p>
            <h3>Extensive Furniture Catalog</h3>
            <p>
              Browse our extensive catalog of office furniture from leading Indian manufacturers including workstations, desks,
              executive chairs, conference tables, storage units, reception counters, and soft seating. Each item includes
              detailed specifications, dimensions, pricing, and 3D models. Filter by category, series, price range, or brand
              to find exactly what your project needs. Generate accurate bills of quantities and professional quotations directly
              from your plans to streamline the procurement process.
            </p>
            <h3>Templates and Projects</h3>
            <p>
              Start faster with professionally designed templates for common office configurations including open-plan offices,
              private cabins, meeting rooms, cafeterias, and co-working spaces. Organize your work into projects with multiple
              plans, track revisions, and manage client relationships all in one place. Export your designs as high-resolution
              images or share them via secure links with customizable access permissions.
            </p>
          </div>
        </main>
      </>
    );
  }

  if (isSignedIn) {
    return <Home />;
  }

  return <Landing />;
}
