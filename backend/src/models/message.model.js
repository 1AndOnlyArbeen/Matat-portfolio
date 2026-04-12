import mongoose from 'mongoose';

const message = new mongoose.Schema(
  {
    type: {
      name: String,
      required: true,
    },
    email: {
      name: String,
      required: true,
    },
    subject: {
      name: String,
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
