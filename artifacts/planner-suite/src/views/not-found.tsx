"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="flex flex-col items-center text-center pt-10 pb-8 px-8 space-y-5">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <FileQuestion className="w-8 h-8 text-slate-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
              It may have been moved or no longer exists.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="gap-2" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Button className="gap-2" asChild>
              <Link href="/planners">
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
