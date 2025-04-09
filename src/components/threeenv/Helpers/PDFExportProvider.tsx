import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import jsPDF from "jspdf";

function PDFExportProvider({ setPDFExportFn }: { setPDFExportFn: (fn: () => void) => void }) {
  const { scene } = useThree();

  useEffect(() => {
    const exportPDF = () => {
      const doc = new jsPDF();

      // Example: Traverse scene and draw circles for each Mesh (position only)
      scene.traverse((obj) => {
        if (obj.type === "Mesh") {
          const pos = obj.position;
          // Convert to PDF coordinates (arbitrary scaling and centering)
          const x = pos.x * 1 + 105; // 105 = center of 210mm wide A4
          const y = pos.y * 1 + 148; // 148 = center of 297mm high A4
          doc.circle(x, y, 3, 'S'); // 'S' for stroke only
        }
      });

      doc.save("scene.pdf");
    };

    setPDFExportFn(() => exportPDF);
  }, [scene, setPDFExportFn]);

  return null;
}

export default PDFExportProvider;
