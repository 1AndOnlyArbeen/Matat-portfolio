import mongoose from 'mongoose';

// one document per section key (e.g. 'projects', 'apps', 'team', ...)
// each row stores the eyebrow label, the heading split into (titlePlain + titleHighlight)
// where titleHighlight is the part rendered in the blue accent colour, and a subtitle
const sectionHeadingSchema = new mongoose.Schema(
  {
    section: { type: String, required: true, unique: true, index: true },
    label:          { type: String, default: '' },
    titlePlain:     { type: String, default: '' },
    titleHighlight: { type: String, default: '' },
    subtitle:       { type: String, default: '' },
    labelHe:          { type: String, default: '' },
    titlePlainHe:     { type: String, default: '' },
    titleHighlightHe: { type: String, default: '' },
    subtitleHe:       { type: String, default: '' },
  },
  { timestamps: true },
);

const SectionHeading = mongoose.model('SectionHeading', sectionHeadingSchema);
export { SectionHeading };
