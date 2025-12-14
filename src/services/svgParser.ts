import { parseStringPromise } from "xml2js";
import { IRectangle, IssueType, IIssue } from "../models/Design";

// xml2js returns unknown; cast to a loose record for our use-case.
const parseXML = (xml: string) =>
  parseStringPromise(xml) as Promise<Record<string, any>>;

interface SVGMetadata {
  width: number;
  height: number;
}

interface ParsedSVG {
  metadata: SVGMetadata;
  rectangles: IRectangle[];
}

export class SvgParserService {
  /**
   * Parse SVG file content and extract metadata and rectangles
   */
  static async parseSVG(svgContent: string): Promise<ParsedSVG> {
    const parsed = await parseXML(svgContent);
    const svg = parsed.svg || {};

    // Extract SVG dimensions
    const metadata = this.extractMetadata(svg);

    // Extract all rectangle elements
    const rectangles = this.extractRectangles(svg);

    return {
      metadata,
      rectangles,
    };
  }

  /**
   * Extract SVG width and height from the root SVG element
   */
  private static extractMetadata(svg: any): SVGMetadata {
    const attrs = svg.$ || {};

    // Handle viewBox if width/height are not directly specified
    let width = this.parseDimension(attrs.width);
    let height = this.parseDimension(attrs.height);

    // If viewBox is present, use it as fallback
    if ((!width || !height) && attrs.viewBox) {
      const viewBoxParts = attrs.viewBox.split(/\s+/);
      if (viewBoxParts.length >= 4) {
        width = width || parseFloat(viewBoxParts[2]);
        height = height || parseFloat(viewBoxParts[3]);
      }
    }

    return {
      width: width || 0,
      height: height || 0,
    };
  }

  /**
   * Parse dimension value (handles units like "100px", "100", etc.)
   */
  private static parseDimension(value: string | undefined): number {
    if (!value) return 0;
    const numStr = value.toString().replace(/[^\d.]/g, "");
    return parseFloat(numStr) || 0;
  }

  /**
   * Extract all rectangle elements from SVG
   */
  private static extractRectangles(svg: any): IRectangle[] {
    const rectangles: IRectangle[] = [];

    // Handle both single rect and array of rects
    const rects = svg.rect || [];
    const rectArray = Array.isArray(rects) ? rects : [rects];

    for (const rect of rectArray) {
      if (!rect || !rect.$) continue;

      const attrs = rect.$;
      const rectangle: IRectangle = {
        x: parseFloat(attrs.x || "0"),
        y: parseFloat(attrs.y || "0"),
        width: parseFloat(attrs.width || "0"),
        height: parseFloat(attrs.height || "0"),
        fill: attrs.fill || "#000000",
      };

      rectangles.push(rectangle);
    }

    return rectangles;
  }

  /**
   * Calculate coverage ratio (total rectangles area / SVG area)
   */
  static calculateCoverageRatio(
    rectangles: IRectangle[],
    svgWidth: number,
    svgHeight: number
  ): number {
    if (svgWidth === 0 || svgHeight === 0) return 0;

    const totalRectanglesArea = rectangles.reduce((sum, rect) => {
      return sum + rect.width * rect.height;
    }, 0);

    const svgArea = svgWidth * svgHeight;
    return svgArea > 0 ? totalRectanglesArea / svgArea : 0;
  }

  /**
   * Detect issues in the SVG design
   */
  static detectIssues(
    rectangles: IRectangle[],
    svgWidth: number,
    svgHeight: number
  ): IIssue[] {
    const issues: IIssue[] = [];

    // Check for EMPTY issue
    if (rectangles.length === 0) {
      issues.push({
        type: "EMPTY",
        message: "No rectangle elements were found in the SVG.",
        rectangleId: null,
      });
      return issues; // Return early if empty
    }

    // Check for OUT_OF_BOUNDS issue per rectangle
    rectangles.forEach((rect, index) => {
      const isOutOfBounds =
        rect.x + rect.width > svgWidth || rect.y + rect.height > svgHeight;

      if (isOutOfBounds) {
        issues.push({
          type: "OUT_OF_BOUNDS",
          message:
            "Rectangle extends beyond SVG boundaries (x + width or y + height exceeds canvas).",
          rectangleId: `${index}`,
        });
      }
    });

    return issues;
  }
}
