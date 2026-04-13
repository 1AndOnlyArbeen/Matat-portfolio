import mongoose from 'mongoose';

const team = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: '',
    },
    linkedinUrl: {
      type: String,
      default: null,
    },
    githubUrl: {
      type: String,
      default: null,
    },
    twitterUrl: {
      type: String,
      default: null,
    },
    teamImage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const Team = mongoose.model('Team', team);

export { Team };
