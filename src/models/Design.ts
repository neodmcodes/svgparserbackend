import mongoose, { Schema, Document } from 'mongoose';

export interface IRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}

export type IssueType = 'EMPTY' | 'OUT_OF_BOUNDS';

export interface IIssue {
  type: IssueType;
  message: string;
  rectangleId?: string | null;
}

export interface IDesign extends Document {
  filename: string;
  status: 'PENDING' | 'PROCESSED';
  createdAt: Date;
  svgWidth?: number;
  svgHeight?: number;
  items: IRectangle[];
  itemsCount: number;
  coverageRatio: number;
  issues: IIssue[];
}

const RectangleSchema = new Schema<IRectangle>({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  fill: { type: String, required: true },
}, { _id: false });

const DesignSchema = new Schema<IDesign>({
  filename: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'PROCESSED'], 
    default: 'PENDING',
    required: true 
  },
  createdAt: { type: Date, default: Date.now },
  svgWidth: { type: Number },
  svgHeight: { type: Number },
  items: [RectangleSchema],
  itemsCount: { type: Number, default: 0 },
  coverageRatio: { type: Number, default: 0 },
  issues: [
    new Schema<IIssue>(
      {
        type: { type: String, enum: ['EMPTY', 'OUT_OF_BOUNDS'], required: true },
        message: { type: String, required: true },
        rectangleId: { type: String, required: false },
      },
      { _id: false }
    ),
  ],
});

export const Design = mongoose.model<IDesign>('Design', DesignSchema);

