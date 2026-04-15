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
    // Hebrew translations
    titleHe:       { type: String, default: '' },
    descriptionHe: { type: String, default: '' },
    missionHe:     { type: String, default: '' },
    stats: [
      {
        value: String,
        label: String,
        valueHe: { type: String, default: '' },
        labelHe: { type: String, default: '' },
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
