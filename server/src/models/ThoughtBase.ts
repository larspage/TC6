import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ThoughtBaseAttrs {
  user_id: string;
  mindmap_id?: string | null;
  title: string;
  description?: string;
  active?: boolean;
  tags?: string[];
  color?: string;
}

export interface ThoughtBaseDoc extends Document {
  user_id: mongoose.Types.ObjectId;
  mindmap_id?: mongoose.Types.ObjectId | null;
  title: string;
  description?: string;
  active: boolean;
  tags: string[];
  color: string;
  kind: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThoughtBaseModel extends Model<ThoughtBaseDoc> {}

const baseSchema = new Schema<ThoughtBaseDoc>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mindmap_id: { type: Schema.Types.ObjectId, ref: 'MindMap', default: null, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', trim: true, maxlength: 2000 },
    active: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
    color: { type: String, default: '#007bff' },
  },
  { timestamps: true, discriminatorKey: 'kind' },
);

baseSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const ThoughtBase = mongoose.model<ThoughtBaseDoc, ThoughtBaseModel>('Thought', baseSchema);

// --------------------
// ContactThought subtype
// --------------------
export interface ContactThoughtDoc extends ThoughtBaseDoc {
  address?: string;
  phone?: string;
  company?: string;
}

const contactSchema = new Schema<ContactThoughtDoc>({
  address: { type: String },
  phone: { type: String },
  company: { type: String },
});

export const ContactThought = ThoughtBase.discriminator<ContactThoughtDoc>('contact', contactSchema);

// Additional subtypes can be defined similarly:
// ReferenceMaterialThought, TaskThought, etc.
