"use client";

import { useRouter } from "next/navigation";
import { PDFUpload } from "../../components/pdf_upload/PDFUpload";
import { usePDFUpload } from "../../hooks/usePDFUpload.hook";
import { motion } from "framer-motion";

export default function UploadPage() {
  const router = useRouter();
  const { uploadPDF, isUploading } = usePDFUpload();

  const handleUpload = async (file: File, title?: string) => {
    try {
      await uploadPDF(file, title);
      router.push("/pdf-quiz/pdfs");
    } catch (error) {
      // Error handling - could be extended with toast notifications
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PDFUpload onUpload={handleUpload} isUploading={isUploading} />
    </motion.div>
  );
}
