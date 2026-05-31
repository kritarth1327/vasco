import { jsPDF } from "jspdf";

/**
 * Render a markdown-ish itinerary into a clean, branded PDF.
 * Keeps it simple: title page + body with H1/H2/bullets/paragraphs.
 */
export function exportItineraryPDF(title: string, markdown: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 56;
  const contentW = pageW - margin * 2;

  // ---------- COVER ----------
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, pageH, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("VASCO  ·  AI TRAVEL COMPANION", margin, 90);

  doc.setFontSize(34);
  const titleLines = doc.splitTextToSize(stripMd(title), contentW);
  doc.text(titleLines, margin, pageH / 2 - 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(200, 210, 225);
  doc.text(
    `Crafted on ${new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    margin,
    pageH / 2 + 16,
  );

  doc.setFontSize(9);
  doc.setTextColor(150, 165, 185);
  doc.text("Itinerary is AI-generated — verify bookings and timings before travel.", margin, pageH - 60);

  // ---------- BODY ----------
  doc.addPage();
  doc.setTextColor(20, 20, 25);

  let y = margin;
  const lineGap = 4;

  const writeBlock = (text: string, size: number, bold = false, color = [20, 20, 25]) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, contentW);
    for (const line of lines) {
      if (y + size + lineGap > pageH - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += size + lineGap;
    }
  };

  const blocks = markdown.split(/\n+/);
  for (const raw of blocks) {
    const line = raw.trim();
    if (!line) {
      y += 6;
      continue;
    }
    if (line.startsWith("# ")) {
      y += 8;
      writeBlock(stripMd(line.slice(2)), 20, true);
      y += 4;
    } else if (line.startsWith("## ")) {
      y += 10;
      writeBlock(stripMd(line.slice(3)), 14, true, [37, 99, 235]);
      y += 2;
    } else if (line.startsWith("### ")) {
      y += 6;
      writeBlock(stripMd(line.slice(4)), 12, true);
    } else if (/^[-*]\s+/.test(line)) {
      writeBlock("•  " + stripMd(line.replace(/^[-*]\s+/, "")), 10);
    } else if (/^---+$/.test(line)) {
      y += 4;
      doc.setDrawColor(220, 224, 230);
      doc.line(margin, y, pageW - margin, y);
      y += 8;
    } else {
      writeBlock(stripMd(line), 10.5);
      y += 3;
    }
  }

  // ---------- FOOTER on every page ----------
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 158, 170);
    doc.text(`Vasco · AI Travel Companion`, margin, pageH - 24);
    doc.text(`Page ${i} of ${pages}`, pageW - margin, pageH - 24, { align: "right" });
  }

  const fname = stripMd(title).replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 60) || "vasco-itinerary";
  doc.save(`${fname}.pdf`);
}

function stripMd(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .trim();
}
