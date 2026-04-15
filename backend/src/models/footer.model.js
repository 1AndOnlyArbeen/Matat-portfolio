import mongoose from 'mongoose';

// single document — stores footer content for the public site
const footerSchema = new mongoose.Schema(
  {
    tagline:      { type: String, default: 'Developed by Matat Technologies LTD' },
    taglineHe:    { type: String, default: '' },
    email:        { type: String, default: 'hello@portfolio.com' },
    phone:        { type: String, default: '+977 9800000000' },
    location:     { type: String, default: 'Kathmandu, Nepal' },
    locationHe:   { type: String, default: '' },
    copyright:    { type: String, default: 'Matat. All rights reserved.' },
    copyrightHe:  { type: String, default: '' },
    githubUrl:    { type: String, default: '' },
    linkedinUrl:  { type: String, default: '' },
    twitterUrl:   { type: String, default: '' },
  },
  { timestamps: true },
);

const Footer = mongoose.model('Footer', footerSchema);
export { Footer };
