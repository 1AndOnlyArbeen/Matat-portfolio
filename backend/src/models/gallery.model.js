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

// single document that stores the gallery section heading text
const galleryHeadingSchema = new mongoose.Schema(
  {
    label: bilingualText('✦ Our Story In Photos', '✦ הסיפור שלנו בתמונות'),
    title: bilingualText('Memories from', 'זיכרונות מ'),
    titleHighlight: bilingualText('the road', 'הדרך'),
    subtitle: bilingualText(
      "Glimpses of moments — events, trips, milestones — across the places we've been.",
      'הצצות לרגעים — אירועים, טיולים, אבני דרך — במקומות שבהם היינו.',
    ),
  },
  { timestamps: true },
);

const GalleryHeading = mongoose.model('GalleryHeading', galleryHeadingSchema);

export { Gallery, GalleryHeading };
