import mongoose, { model } from 'mongoose';

const hero = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      required: true,
    },
    buttonLink: {
      type: String,
      required: true,
    },
    // Hebrew translations
    titleHe:      { type: String, default: '' },
    subtitleHe:   { type: String, default: '' },
    buttonTextHe: { type: String, default: '' },
    backgroundImage: {
      type: String,
      required: true,
    },
    badgeImage1: {
      type: String,
      default: '',
    },
    badgeImage2: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true },
);

const Hero = mongoose.model('Hero', hero);
export { Hero };
