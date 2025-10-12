"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Upload, FileText, HelpCircle } from "lucide-react";
import { cn } from "@/app/utils/cn";

export default function PDFQuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    {
      id: "upload",
      label: "Upload PDF",
      href: "/pdf-quiz/upload",
      icon: <Upload className="w-5 h-5" />,
    },
    {
      id: "pdfs",
      label: "My PDFs",
      href: "/pdf-quiz/pdfs",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: "quizzes",
      label: "My Quizzes",
      href: "/pdf-quiz/quizzes",
      icon: <HelpCircle className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-slate-800 px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white">PDF Quiz Generator</h1>
          <p className="text-slate-300 text-sm mt-1">
            Upload PDFs and generate AI-powered quizzes
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <Link key={tab.id} href={tab.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center space-x-2 px-4 py-4 border-b-2 rounded-none h-auto",
                    pathname === tab.href
                      ? "border-slate-800 text-slate-900 bg-transparent"
                      : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-transparent"
                  )}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
