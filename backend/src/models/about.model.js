import mongoose, { mongo } from 'mongoose';

const about = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    mission: {
      type: String,
      required: true,
    },
    // big editorial heading shown at the top of the public About section
    // (split into two lines, e.g. line1="About" / line2="Us.")
    headingLine1: { type: String, default: '' },
    headingLine2: { type: String, default: '' },
    // CTA button label + small note next to it
    ctaLabel: { type: String, default: '' },
    ctaNote:  { type: String, default: '' },
    // Hebrew translations
    titleHe:        { type: String, default: '' },
    descriptionHe:  { type: String, default: '' },
    missionHe:      { type: String, default: '' },
    headingLine1He: { type: String, default: '' },
    headingLine2He: { type: String, default: '' },
    ctaLabelHe:     { type: String, default: '' },
    ctaNoteHe:      { type: String, default: '' },
    stats: [
      {
        value: String,
        label: String,
        valueHe: { type: String, default: '' },
        labelHe: { type: String, default: '' },
        order: Number,
      },
    ],
    // marquee/ticker shown at the bottom of the public About section
    // managed from admin: each item is one chip on the running ticker
    tickerItems: [
      {
        text: String,
        textHe: { type: String, default: '' },
        order: Number,
      },
    ],
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true },
);
const About = mongoose.model('About', about);
export { About };
