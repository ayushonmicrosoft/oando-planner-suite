"use client";
import { useParams } from "next/navigation";
import ProjectDetail from "@/views/project-detail";

export default function ProjectDetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string, 10);

  if (isNaN(id)) {
    return <div className="p-8 text-center text-muted-foreground">Invalid project ID</div>;
  }

  return <ProjectDetail projectId={id} />;
}
