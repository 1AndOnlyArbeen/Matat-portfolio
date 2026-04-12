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
    backgroundImage: {
      type: String,
      required: true,
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
