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
    stats: [
      {
        value: String,
        label: String,
        order: Number,
      },
    ],
  },
  { timestamps: true },
);
const About = mongoose.model('About', about);
export { About };
