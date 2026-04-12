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
  },
  { timestamps: true },
);

const Project = mongoose.model('Project', project);

export { Project };
