import { Design, IDesign, IRectangle } from '../models/Design';
import { SvgParserService } from './svgParser';
import { FileService } from './fileService';

export class DesignService {
  /**
   * Create a new design record
   */
  static async createDesign(filename: string): Promise<IDesign> {
    const design = new Design({
      filename,
      status: 'PENDING',
      createdAt: new Date(),
    });
    
    return await design.save();
  }

  /**
   * Process an uploaded SVG file
   */
  static async processDesign(designId: string, filePath: string): Promise<IDesign> {
    // Read SVG file content
    const svgContent = await FileService.readFile(filePath);
    
    // Parse SVG
    const { metadata, rectangles } = await SvgParserService.parseSVG(svgContent);
    
    // Calculate coverage ratio
    const coverageRatio = SvgParserService.calculateCoverageRatio(
      rectangles,
      metadata.width,
      metadata.height
    );
    
    // Detect issues
    const issues = SvgParserService.detectIssues(
      rectangles,
      metadata.width,
      metadata.height
    );
    
    // Update design record
    const design = await Design.findByIdAndUpdate(
      designId,
      {
        status: 'PROCESSED',
        svgWidth: metadata.width,
        svgHeight: metadata.height,
        items: rectangles,
        itemsCount: rectangles.length,
        coverageRatio,
        issues,
      },
      { new: true }
    );
    
    if (!design) {
      throw new Error('Design not found');
    }
    
    return design;
  }

  /**
   * Get all designs
   */
  static async getAllDesigns(): Promise<IDesign[]> {
    return await Design.find().sort({ createdAt: -1 });
  }

  /**
   * Get a single design by ID
   */
  static async getDesignById(id: string): Promise<IDesign | null> {
    return await Design.findById(id);
  }
}

