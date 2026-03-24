import { NextRequest, NextResponse } from "next/server";
import pptxgen from "pptxgenjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kr, objectiveTitle } = body;

    const pptx = new pptxgen();
    pptx.layout = "LAYOUT_16x9";
    const slide = pptx.addSlide();

    // ── Slide dimensions: 10 x 5.625 inches ──────────────────────────────
    const W = 10;
    const H = 5.625;

    // Colours matching the reference screenshot
    const ORANGE     = "F5A623";  // title orange
    const AMBER_HDR  = "FAC858";  // column header bar background (amber/gold)
    const BODY_BG    = "FFF8EC";  // content area fill (very light amber)
    const BLACK_TEXT = "1A1A1A";

    const MARGIN  = 0.3;          // left/right margin
    const GAP     = 0.25;         // gap between columns
    const colW    = (W - 2 * MARGIN - GAP) / 2;
    const leftX   = MARGIN;
    const rightX  = MARGIN + colW + GAP;

    // ── WHITE BACKGROUND ─────────────────────────────────────────────────
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: "FFFFFF" } });

    // ── OBJECTIVE TITLE (large orange bold, left-aligned) ────────────────
    slide.addText(objectiveTitle || "Objective", {
      x: MARGIN, y: 0.15, w: W - 2 * MARGIN, h: 0.55,
      fontSize: 24,
      bold: true,
      color: ORANGE,
      fontFace: "Arial",
      align: "left",
    });

    // ── KR SUBTITLE (medium orange bold, centered) ───────────────────────
    slide.addText(kr.title || "", {
      x: MARGIN, y: 0.72, w: W - 2 * MARGIN, h: 0.38,
      fontSize: 14,
      bold: true,
      color: ORANGE,
      fontFace: "Arial",
      align: "center",
    });

    // ── HORIZONTAL RULE under subtitle ───────────────────────────────────
    slide.addShape(pptx.ShapeType.rect, {
      x: MARGIN, y: 1.13, w: W - 2 * MARGIN, h: 0.025,
      fill: { color: AMBER_HDR },
    });

    // ── COLUMN HEADER BARS ───────────────────────────────────────────────
    const hdrY  = 1.2;
    const hdrH  = 0.38;
    const bodyY = hdrY + hdrH;

    // Before header
    slide.addShape(pptx.ShapeType.rect, {
      x: leftX, y: hdrY, w: colW, h: hdrH,
      fill: { color: AMBER_HDR },
    });
    slide.addText("Before", {
      x: leftX, y: hdrY, w: colW, h: hdrH,
      fontSize: 14, bold: true, color: BLACK_TEXT,
      fontFace: "Arial", align: "center", valign: "middle",
    });

    // After header
    slide.addShape(pptx.ShapeType.rect, {
      x: rightX, y: hdrY, w: colW, h: hdrH,
      fill: { color: AMBER_HDR },
    });
    slide.addText("After", {
      x: rightX, y: hdrY, w: colW, h: hdrH,
      fontSize: 14, bold: true, color: BLACK_TEXT,
      fontFace: "Arial", align: "center", valign: "middle",
    });

    // ── CONTENT AREA BACKGROUNDS ─────────────────────────────────────────
    const contentH = H - bodyY - 0.15;

    slide.addShape(pptx.ShapeType.rect, {
      x: leftX, y: bodyY, w: colW, h: contentH,
      fill: { color: BODY_BG },
      line: { color: "E8D5A3", width: 0.75 },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: rightX, y: bodyY, w: colW, h: contentH,
      fill: { color: BODY_BG },
      line: { color: "E8D5A3", width: 0.75 },
    });

    // ── TEXT CONTENT ─────────────────────────────────────────────────────
    const textPad  = 0.12;
    const textH    = 0.9;    // reserve this much for text at the top of content area

    if (kr.beforeText) {
      slide.addText(kr.beforeText, {
        x: leftX + textPad, y: bodyY + textPad,
        w: colW - textPad * 2, h: textH,
        fontSize: 10, color: "3D3D3D", fontFace: "Arial",
        valign: "top", wrap: true,
      });
    }
    if (kr.afterText) {
      slide.addText(kr.afterText, {
        x: rightX + textPad, y: bodyY + textPad,
        w: colW - textPad * 2, h: textH,
        fontSize: 10, color: "3D3D3D", fontFace: "Arial",
        valign: "top", wrap: true,
      });
    }

    // ── IMAGE GRID HELPER ─────────────────────────────────────────────────
    const imgAreaY = bodyY + textPad + textH + 0.08;
    const imgAreaH = H - imgAreaY - 0.2;

    const placeImages = (imgs: any[], originX: number) => {
      if (!imgs || imgs.length === 0) return;
      const cols = imgs.length === 1 ? 1 : 2;
      const rows = Math.ceil(imgs.length / cols);
      const cellW = (colW - textPad * 2 - (cols - 1) * 0.06) / cols;
      const cellH = (imgAreaH - (rows - 1) * 0.06) / rows;
      imgs.forEach((img: any, i: number) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = originX + textPad + col * (cellW + 0.06);
        const y = imgAreaY + row * (cellH + 0.06);
        try {
          if (img.dataUrl && img.dataUrl.startsWith("data:image")) {
            slide.addImage({
              data: img.dataUrl,
              x, y, w: cellW, h: cellH,
              sizing: { type: "contain", w: cellW, h: cellH },
            });
          }
        } catch (_) { /* skip corrupt images */ }
      });
    };

    const beforeImgs = (kr.images || []).filter((i: any) => i.section === "before");
    const afterImgs  = (kr.images || []).filter((i: any) => i.section === "after");

    placeImages(beforeImgs, leftX);
    placeImages(afterImgs,  rightX);

    // ── EXPORT ───────────────────────────────────────────────────────────
    const base64 = await pptx.write({ outputType: "base64" });
    const cleanTitle = (kr.title || "KR").replace(/[^a-zA-Z0-9]/g, "_").substring(0, 24);

    return new NextResponse(Buffer.from(base64 as string, "base64"), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="KR_${cleanTitle}.pptx"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
