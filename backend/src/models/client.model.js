import mongoose from 'mongoose';

const client = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    heading:{
      type:String,
      required:true
    },
    subtitle:{
      type:String,
      required:true
    },
    // Hebrew translations
    clientNameHe: { type: String, default: '' },
    headingHe:    { type: String, default: '' },
    subtitleHe:   { type: String, default: '' },
  },
  { timestamps: true },
);

const Client = mongoose.model('Client', client);
export { Client };
