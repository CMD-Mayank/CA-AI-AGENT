
import { jsPDF } from "jspdf";
import { ClientDocument, FirmProfile, Client, Invoice } from "../types";

export const generateDocumentPDF = (doc: ClientDocument, firm: FirmProfile | undefined, client: Client) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  let yPos = 20;

  // --- Header (Firm Details) ---
  pdf.setFontSize(18);
  pdf.setTextColor(13, 148, 136); // Teal color
  pdf.setFont("helvetica", "bold");
  pdf.text(firm?.name || "CA Firm", margin, yPos);
  
  yPos += 8;
  pdf.setFontSize(10);
  pdf.setTextColor(80);
  pdf.setFont("helvetica", "normal");
  if(firm?.frn) {
      pdf.text(`FRN: ${firm.frn}`, margin, yPos);
      yPos += 5;
  }
  if(firm?.address) {
      pdf.text(firm.address, margin, yPos);
      yPos += 10;
  }

  // Divider Line
  pdf.setDrawColor(200);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;

  // --- Document Title ---
  pdf.setFontSize(14);
  pdf.setTextColor(0);
  pdf.setFont("helvetica", "bold");
  pdf.text(doc.title.toUpperCase(), pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // --- Client Details Box ---
  pdf.setFillColor(245, 247, 250);
  pdf.roundedRect(margin, yPos, pageWidth - (margin * 2), 25, 3, 3, 'F');
  
  pdf.setFontSize(10);
  pdf.setTextColor(60);
  pdf.text("Client Name:", margin + 5, yPos + 8);
  pdf.text("PAN:", margin + 5, yPos + 16);
  
  pdf.setTextColor(0);
  pdf.setFont("helvetica", "bold");
  pdf.text(client.name, margin + 40, yPos + 8);
  pdf.text(client.pan, margin + 40, yPos + 16);

  pdf.setTextColor(60);
  pdf.setFont("helvetica", "normal");
  pdf.text("Date:", pageWidth - margin - 50, yPos + 8);
  pdf.text(new Date(doc.createdAt).toLocaleDateString(), pageWidth - margin - 20, yPos + 8);
  
  yPos += 40;

  // --- Content ---
  pdf.setFontSize(11);
  pdf.setTextColor(30);
  pdf.setFont("helvetica", "normal");
  
  // Clean content (remove markdown symbols that look bad in basic PDF text)
  const cleanContent = doc.content
    .replace(/\*\*/g, '')
    .replace(/#/g, '')
    .replace(/---/g, '');

  const splitText = pdf.splitTextToSize(cleanContent, pageWidth - (margin * 2));
  
  // Check for page breaks
  if (yPos + (splitText.length * 7) > pdf.internal.pageSize.height - 40) {
      // Simple logic: just write what fits or let jsPDF handle basics, 
      // but for this demo we'll just write it. 
      // A full implementation handles multi-page text loops.
  }
  
  pdf.text(splitText, margin, yPos);

  // --- Footer / Signature ---
  if (doc.status === 'Signed') {
      const pageHeight = pdf.internal.pageSize.height;
      yPos = pageHeight - 40;
      
      pdf.setDrawColor(22, 163, 74); // Green
      pdf.setLineWidth(1);
      pdf.rect(margin, yPos, 60, 25);
      
      pdf.setTextColor(22, 163, 74);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text("DIGITALLY SIGNED", margin + 5, yPos + 8);
      
      pdf.setTextColor(0);
      pdf.setFont("helvetica", "normal");
      pdf.text(`By: ${doc.signedBy || 'Partner'}`, margin + 5, yPos + 15);
      pdf.text(`Date: ${new Date(doc.signedAt || Date.now()).toLocaleDateString()}`, margin + 5, yPos + 20);
  }

  pdf.save(`${doc.title.replace(/\s+/g, '_')}.pdf`);
};

export const generateInvoicePDF = (inv: Invoice, firm: FirmProfile | undefined, client: Client) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    let yPos = 20;

    // --- Header ---
    pdf.setFontSize(22);
    pdf.setTextColor(13, 148, 136);
    pdf.setFont("helvetica", "bold");
    pdf.text("INVOICE", pageWidth - margin, yPos, { align: "right" });
    
    pdf.setFontSize(16);
    pdf.text(firm?.name || "CA Firm", margin, yPos);
    yPos += 8;
    
    pdf.setFontSize(10);
    pdf.setTextColor(80);
    pdf.setFont("helvetica", "normal");
    pdf.text(firm?.address || "", margin, yPos);
    yPos += 20;

    // --- Bill To & Details ---
    const startY = yPos;
    
    // Bill To
    pdf.setFont("helvetica", "bold");
    pdf.text("Bill To:", margin, yPos);
    yPos += 6;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0);
    pdf.text(client.name, margin, yPos);
    yPos += 5;
    pdf.text(client.address || "Address on file", margin, yPos);
    yPos += 5;
    pdf.text(`PAN: ${client.pan}`, margin, yPos);

    // Invoice Details (Right Side)
    yPos = startY;
    pdf.text(`Invoice #: ${inv.number}`, pageWidth - margin, yPos, { align: "right" });
    yPos += 6;
    pdf.text(`Date: ${inv.date}`, pageWidth - margin, yPos, { align: "right" });
    yPos += 6;
    pdf.text(`Due Date: ${inv.dueDate}`, pageWidth - margin, yPos, { align: "right" });
    
    yPos += 30;

    // --- Table Header ---
    pdf.setFillColor(240);
    pdf.rect(margin, yPos, pageWidth - (margin*2), 10, 'F');
    pdf.setFont("helvetica", "bold");
    pdf.text("Description", margin + 5, yPos + 7);
    pdf.text("Amount", pageWidth - margin - 5, yPos + 7, { align: "right" });
    yPos += 10;

    // --- Items ---
    pdf.setFont("helvetica", "normal");
    inv.items.forEach(item => {
        yPos += 8;
        pdf.text(item.description, margin + 5, yPos);
        pdf.text(item.amount.toLocaleString('en-IN', {style: 'currency', currency: 'INR'}), pageWidth - margin - 5, yPos, { align: "right" });
        yPos += 2;
        pdf.setDrawColor(240);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
    });

    yPos += 15;

    // --- Total ---
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Total: ${inv.total.toLocaleString('en-IN', {style: 'currency', currency: 'INR'})}`, pageWidth - margin, yPos, { align: "right" });

    // --- Footer ---
    yPos = pdf.internal.pageSize.height - 20;
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(150);
    pdf.text("This is a computer generated invoice.", pageWidth / 2, yPos, { align: "center" });

    pdf.save(`Invoice_${inv.number}.pdf`);
}
