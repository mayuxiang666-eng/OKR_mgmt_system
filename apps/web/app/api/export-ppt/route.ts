import { NextRequest, NextResponse } from "next/server";
import pptxgen from "pptxgenjs";

export async function POST(req: NextRequest) {
  try {
    const obj = await req.json();

    const pptx = new pptxgen();
    pptx.layout = "LAYOUT_16x9";
    const slide = pptx.addSlide();

    const primaryOrange = "F59E0B";
    const bodyBg = "FFFBEB";
    const cols = { left: 0.2, right: 5.1 };
    const widths = { left: 4.8, right: 4.7 };
    const rows = { top: 0.5, bottom: 3.2 };
    const headerHeight = 0.4;
    const bodyHeightTop = 2.4;
    const bodyHeightBottom = 2.0;

    slide.addShape(pptx.ShapeType.rect, { x: cols.left, y: rows.top, w: widths.left, h: headerHeight, fill: { color: primaryOrange } });
    slide.addText("Focus Item _ Current Month", { x: cols.left + 0.1, y: rows.top + 0.05, w: widths.left, h: headerHeight, color: "FFFFFF", fontSize: 14, bold: true });
    slide.addShape(pptx.ShapeType.rect, { x: cols.left, y: rows.top + headerHeight, w: widths.left, h: bodyHeightTop, fill: { color: bodyBg }, line: { color: "CCCCCC", width: 1 } });
    slide.addText(obj.currentMonthFocus || "No focus items set.", { x: cols.left + 0.1, y: rows.top + headerHeight + 0.1, w: widths.left - 0.2, h: bodyHeightTop - 0.2, fontSize: 12, valign: "top" });

    slide.addShape(pptx.ShapeType.rect, { x: cols.left, y: rows.bottom, w: widths.left, h: headerHeight, fill: { color: primaryOrange } });
    slide.addText("Focus Item _ x + 1 Month", { x: cols.left + 0.1, y: rows.bottom + 0.05, w: widths.left, h: headerHeight, color: "FFFFFF", fontSize: 14, bold: true });
    slide.addShape(pptx.ShapeType.rect, { x: cols.left, y: rows.bottom + headerHeight, w: widths.left, h: bodyHeightBottom, fill: { color: bodyBg }, line: { color: "CCCCCC", width: 1 } });
    slide.addText(obj.nextMonthFocus || "No forward plan submitted.", { x: cols.left + 0.1, y: rows.bottom + headerHeight + 0.1, w: widths.left - 0.2, h: bodyHeightBottom - 0.2, fontSize: 12, valign: "top" });

    slide.addShape(pptx.ShapeType.rect, { x: cols.right, y: rows.top, w: widths.right, h: headerHeight, fill: { color: primaryOrange } });
    slide.addText(`OKR Distribution (${obj.cycle || ""})`, { x: cols.right + 0.1, y: rows.top + 0.05, w: widths.right, h: headerHeight, color: "FFFFFF", fontSize: 14, bold: true });
    slide.addShape(pptx.ShapeType.rect, { x: cols.right, y: rows.top + headerHeight, w: widths.right, h: bodyHeightTop, fill: { color: bodyBg }, line: { color: "CCCCCC", width: 1 } });

    let currentY = rows.top + headerHeight + 0.1;
    slide.addText("Objectives:", { x: cols.right + 0.1, y: currentY, w: widths.right - 0.2, h: 0.3, fontSize: 12, bold: true });
    currentY += 0.3;
    slide.addText(obj.title, { x: cols.right + 0.3, y: currentY, w: widths.right - 0.5, h: 0.4, fontSize: 12, color: "2563EB", bold: true });
    currentY += 0.5;
    slide.addText("Key Results:", { x: cols.right + 0.1, y: currentY, w: widths.right - 0.2, h: 0.3, fontSize: 12, bold: true });
    currentY += 0.3;
    (obj.keyResults || []).slice(0, 4).forEach((kr: any, idx: number) => {
      slide.addText(`${idx + 1}. ${kr.title}`, { x: cols.right + 0.1, y: currentY, w: widths.right - 0.8, h: 0.3, fontSize: 11 });
      slide.addText(`${kr.confidenceScore ?? 5}/10`, { x: cols.right + widths.right - 0.7, y: currentY, w: 0.6, h: 0.3, fontSize: 11, align: "right" });
      currentY += 0.25;
      slide.addText(`     (Target: ${kr.targetValue} ${kr.unit || ""})`, { x: cols.right + 0.1, y: currentY, w: widths.right - 0.2, h: 0.2, fontSize: 10, color: "666666" });
      currentY += 0.25;
    });

    slide.addShape(pptx.ShapeType.rect, { x: cols.right, y: rows.bottom, w: widths.right, h: headerHeight, fill: { color: primaryOrange } });
    slide.addText("Status Indicators", { x: cols.right + 0.1, y: rows.bottom + 0.05, w: widths.right, h: headerHeight, color: "FFFFFF", fontSize: 14, bold: true });
    slide.addShape(pptx.ShapeType.rect, { x: cols.right, y: rows.bottom + headerHeight, w: widths.right, h: bodyHeightBottom, fill: { color: bodyBg }, line: { color: "CCCCCC", width: 1 } });
    slide.addText(obj.statusIndicators || "No indicators captured.", { x: cols.right + 0.1, y: rows.bottom + headerHeight + 0.1, w: widths.right - 0.2, h: bodyHeightBottom - 0.2, fontSize: 12, valign: "top" });

    // Generate as base64 and return
    const base64 = await pptx.write({ outputType: "base64" });
    const cleanTitle = (obj.title || "OKR").replace(/[^a-zA-Z0-9]/g, "_").substring(0, 20);

    return new NextResponse(Buffer.from(base64 as string, "base64"), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="OKR_Export_${cleanTitle}.pptx"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
