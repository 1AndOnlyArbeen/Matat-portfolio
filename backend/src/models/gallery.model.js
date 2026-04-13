import mongoose from 'mongoose';

// gallery is now an album — thumbnail is the cover photo shown on the public site,
// images is the array of photos displayed inside the album when opened
const gallery = new mongoose.Schema(
  {
    caption: {
      type: String,
      required: true,
    },
    place: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
    },
    // cover photo shown on the gallery card
    thumbnail: {
      type: String,
      default: '',
    },
    thumbnailId: {
      type: String,
      default: '',
    },
    // photos inside the album (up to 12)
    images: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
  },
  { timestamps: true },
);

const Gallery = mongoose.model('Gallery', gallery);
export { Gallery };
