import mongoose from 'mongoose';

const message = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const Message = mongoose.model('Message', message);
export { Message };
