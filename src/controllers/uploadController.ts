import { Request, Response } from 'express';
import { DesignService } from '../services/designService';
import { FileService } from '../services/fileService';

export class UploadController {
  /**
   * Handle SVG file upload
   */
  static async uploadSVG(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const file = req.file;
      const filename = `${Date.now()}-${file.originalname}`;

      // Save file to disk
      await FileService.saveFile(filename, file.buffer);

      // Create design record in database
      const design = await DesignService.createDesign(filename);

      // Process design asynchronously
      DesignService.processDesign(design._id.toString(), FileService.getFilePath(filename))
        .catch((error) => {
          console.error('Error processing design:', error);
        });

      res.status(201).json({
        id: design._id,
        filename: design.filename,
        status: design.status,
        createdAt: design.createdAt,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message || 'Failed to upload file' });
    }
  }
}

