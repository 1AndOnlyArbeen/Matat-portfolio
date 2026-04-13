import mongoose from 'mongoose';

const app = new mongoose.Schema(
  {
    appName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    appIcon: {
      type: String,
      required: true,
    },
    appIconId: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    // extra screenshots — managed by the screenshot helpers in app.controller.js
    screenshots: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
  },
  { timestamps: true },
);

const App = mongoose.model('App', app);
export { App };
