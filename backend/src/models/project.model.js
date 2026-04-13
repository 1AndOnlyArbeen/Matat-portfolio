import mongoose from 'mongoose';

const project = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    tags: {
      type: String,
      required: true,
    },
    projectLink: {
      type: String,
      required: true,
    },
    projectImage: {
      type: String,
      required: true,
    },
    // extra screenshots — managed by the screenshot helpers in project.controller.js
    // each entry stores the cloudinary url + publicId so we can delete from cloud later
    screenshots: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
  },
  { timestamps: true },
);

const Project = mongoose.model('Project', project);

export { Project };
