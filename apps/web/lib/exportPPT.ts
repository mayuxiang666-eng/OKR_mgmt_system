import { Objective } from "./types";

export const exportObjectiveToPPT = async (obj: Objective) => {
  const pptxgen = (await import("pptxgenjs")).default;
  const pptx = new pptxgen();
  
  // Set layout to Widescreen 16:9
  pptx.layout = "LAYOUT_16x9";
  
  const slide = pptx.addSlide();
  
  // Theme colors
  const primaryOrange = "F59E0B"; // Amber 500
  const bodyBg = "FFFBEB";        // Amber 50

  // Margins & Dimensions for 10 x 5.625 inches
  const cols = { left: 0.2, right: 5.1 };
  const widths = { left: 4.8, right: 4.7 };
  const rows = { top: 0.5, bottom: 3.2 };
  const headerHeight = 0.4;
  const bodyHeightTop = 2.4;
  const bodyHeightBottom = 2.0;

  // Draw TOP LEFT Quadrant (Current Month)
  slide.addShape(pptx.ShapeType.rect, { x: cols.left, y: rows.top, w: widths.left, h: headerHeight, fill: { color: primaryOrange } });
  slide.addText("Focus Item _ Current Month", { x: cols.left + 0.1, y: rows.top + 0.05, w: widths.left, h: headerHeight, color: "FFFFFF", fontSize: 14, bold: true });
  slide.addShape(pptx.ShapeType.rect, { x: cols.left, y: rows.top + headerHeight, w: widths.left, h: bodyHeightTop, fill: { color: bodyBg }, line: { color: "CCCCCC", width: 1 } });
  slide.addText(obj.currentMonthFocus || "No focus items set.", { x: cols.left + 0.1, y: rows.top + headerHeight + 0.1, w: widths.left - 0.2, h: bodyHeightTop - 0.2, fontSize: 12, valign: "top" });

  // Draw BOTTOM LEFT Quadrant (Next Month)
  slide.addShape(pptx.ShapeType.rect, { x: cols.left, y: rows.bottom, w: widths.left, h: headerHeight, fill: { color: primaryOrange } });
  slide.addText("Focus Item _ x + 1 Month", { x: cols.left + 0.1, y: rows.bottom + 0.05, w: widths.left, h: headerHeight, color: "FFFFFF", fontSize: 14, bold: true });
  slide.addShape(pptx.ShapeType.rect, { x: cols.left, y: rows.bottom + headerHeight, w: widths.left, h: bodyHeightBottom, fill: { color: bodyBg }, line: { color: "CCCCCC", width: 1 } });
  slide.addText(obj.nextMonthFocus || "No forward plan submitted.", { x: cols.left + 0.1, y: rows.bottom + headerHeight + 0.1, w: widths.left - 0.2, h: bodyHeightBottom - 0.2, fontSize: 12, valign: "top" });

  // Draw TOP RIGHT Quadrant (OKR Distribution)
  slide.addShape(pptx.ShapeType.rect, { x: cols.right, y: rows.top, w: widths.right, h: headerHeight, fill: { color: primaryOrange } });
  slide.addText(`OKR Distribution (${obj.cycle})`, { x: cols.right + 0.1, y: rows.top + 0.05, w: widths.right, h: headerHeight, color: "FFFFFF", fontSize: 14, bold: true });
  slide.addShape(pptx.ShapeType.rect, { x: cols.right, y: rows.top + headerHeight, w: widths.right, h: bodyHeightTop, fill: { color: bodyBg }, line: { color: "CCCCCC", width: 1 } });
  
  let currentY = rows.top + headerHeight + 0.1;
  slide.addText("Objectives:", { x: cols.right + 0.1, y: currentY, w: widths.right - 0.2, h: 0.3, fontSize: 12, bold: true });
  
  currentY += 0.3;
  slide.addText(obj.title, { x: cols.right + 0.3, y: currentY, w: widths.right - 0.5, h: 0.4, fontSize: 12, color: "2563EB", bold: true });
  
  currentY += 0.5;
  slide.addText("Key Results:", { x: cols.right + 0.1, y: currentY, w: widths.right - 0.2, h: 0.3, fontSize: 12, bold: true });
  
  currentY += 0.3;
  obj.keyResults.slice(0, 4).forEach((kr, idx) => {
    slide.addText(`${idx + 1}. ${kr.title}`, { x: cols.right + 0.1, y: currentY, w: widths.right - 0.8, h: 0.3, fontSize: 11 });
    slide.addText(`${kr.confidenceScore ?? 5}/10`, { x: cols.right + widths.right - 0.7, y: currentY, w: 0.6, h: 0.3, fontSize: 11, align: "right" });
    currentY += 0.25;
    slide.addText(`     (Target: ${kr.targetValue} ${kr.unit})`, { x: cols.right + 0.1, y: currentY, w: widths.right - 0.2, h: 0.2, fontSize: 10, color: "666666" });
    currentY += 0.25;
  });

  // Draw BOTTOM RIGHT Quadrant (Status Indicators)
  slide.addShape(pptx.ShapeType.rect, { x: cols.right, y: rows.bottom, w: widths.right, h: headerHeight, fill: { color: primaryOrange } });
  slide.addText("Status Indicators", { x: cols.right + 0.1, y: rows.bottom + 0.05, w: widths.right, h: headerHeight, color: "FFFFFF", fontSize: 14, bold: true });
  slide.addShape(pptx.ShapeType.rect, { x: cols.right, y: rows.bottom + headerHeight, w: widths.right, h: bodyHeightBottom, fill: { color: bodyBg }, line: { color: "CCCCCC", width: 1 } });
  slide.addText(obj.statusIndicators || "No indicators captured.", { x: cols.right + 0.1, y: rows.bottom + headerHeight + 0.1, w: widths.right - 0.2, h: bodyHeightBottom - 0.2, fontSize: 12, valign: "top" });

  // Save the PPT
  const cleanTitle = obj.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0,20);
  pptx.writeFile({ fileName: `OKR_Export_${cleanTitle}.pptx` });
};
