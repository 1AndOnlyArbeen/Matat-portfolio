import mongoose from "mongoose";

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
    rating:{
        type:Number,
        min:1,
        max:5,
        default:0

    },
    avatar:{
        type:String,
        required:true
    }
  },
  { timestamps: true },
);
const Testimonial = mongoose.model('Testimonial',testimonial)
export{Testimonial}