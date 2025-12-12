import { Request, Response } from 'express';
import { DesignService } from '../services/designService';

export class DesignController {
  /**
   * Get all designs
   */
  static async getAllDesigns(req: Request, res: Response): Promise<void> {
    try {
      const designs = await DesignService.getAllDesigns();
      
      const designsList = designs.map(design => ({
        id: design._id,
        filename: design.filename,
        status: design.status,
        itemsCount: design.itemsCount,
        createdAt: design.createdAt,
        issues: design.issues,
      }));

      res.json(designsList);
    } catch (error: any) {
      console.error('Error fetching designs:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch designs' });
    }
  }

  /**
   * Get a single design by ID
   */
  static async getDesignById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const design = await DesignService.getDesignById(id);

      if (!design) {
        res.status(404).json({ error: 'Design not found' });
        return;
      }

      res.json({
        id: design._id,
        filename: design.filename,
        status: design.status,
        createdAt: design.createdAt,
        metadata: {
          svgWidth: design.svgWidth,
          svgHeight: design.svgHeight,
        },
        items: design.items,
        itemsCount: design.itemsCount,
        coverageRatio: design.coverageRatio,
        issues: design.issues,
      });
    } catch (error: any) {
      console.error('Error fetching design:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch design' });
    }
  }
}

