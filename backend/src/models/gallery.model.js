import mongoose from 'mongoose';

// gallery is now an album — thumbnail is the cover photo shown on the public site,
// images is the array of photos displayed inside the album when opened
const gallery = new mongoose.Schema(
  {
    caption: {
      type: String,
      required: true,
    },
    captionHe: { type: String, default: '' },
    place: {
      type: String,
      default: '',
    },
    placeHe: { type: String, default: '' },
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

// reusable sub-schema for bilingual text (en + he)
const bilingualText = (enDefault = '', heDefault = '') => ({
  en: { type: String, default: enDefault },
  he: { type: String, default: heDefault },
});

// kept only because old DB rows reference this collection — every text default
// is now empty so nothing static leaks onto the public site. Section headings
// are managed under the unified SectionHeading collection.
const galleryHeadingSchema = new mongoose.Schema(
  {
    label: bilingualText('', ''),
    title: bilingualText('', ''),
    titleHighlight: bilingualText('', ''),
    subtitle: bilingualText('', ''),
  },
  { timestamps: true },
);

const GalleryHeading = mongoose.model('GalleryHeading', galleryHeadingSchema);

export { Gallery, GalleryHeading };
