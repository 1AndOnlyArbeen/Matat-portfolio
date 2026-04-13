import mongoose from 'mongoose';

const testimonial = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    reviewText: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    avatar: {
      type: String,
      required: true,
    },
    avatarId: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);
const Testimonial = mongoose.model('Testimonial', testimonial);
export { Testimonial };
