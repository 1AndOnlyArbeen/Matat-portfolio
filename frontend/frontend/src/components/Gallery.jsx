import { useState, useEffect } from "react";
import { getGallery } from "../api";
import { galleryData as fallback } from "../data/placeholders";
import { FiX } from "react-icons/fi";
import useScrollAnimation from "../hooks/useScrollAnimation";

// photo gallery section with lightbox
// clicking an image opens it full-screen in a modal
function Gallery() {
  const [images, setImages] = useState(fallback);
  const [selectedImage, setSelectedImage] = useState(null); // currently opened image in lightbox
  const [headingRef, headingVisible] = useScrollAnimation();
  const [gridRef, gridVisible] = useScrollAnimation(0.1);

  // load gallery images from backend
  useEffect(() => {
    getGallery().then((res) => {
      if (res && res.length > 0) setImages(res);
    });
  }, []);

  return (
    <section id="gallery" className="py-20 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* section heading */}
        <div ref={headingRef} className={`text-center mb-12 animate-fade-up ${headingVisible ? "visible" : ""}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-3">Gallery</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            A glimpse into our work culture and environment.
          </p>
        </div>

        {/* image grid - hover shows caption overlay */}
        <div ref={gridRef} className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger-children ${gridVisible ? "visible" : ""}`}>
          {images.map((item) => (
            <div
              key={item._id}
              className="relative group cursor-pointer rounded-lg overflow-hidden aspect-square"
              onClick={() => setSelectedImage(item)}
            >
              <img
                src={item.image}
                alt={item.caption}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* hover overlay with caption */}
              <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/60 transition-all duration-300 flex items-end">
                <p className="text-white text-sm font-medium p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  {item.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* lightbox modal - shows selected image full screen */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-zoom-in visible"
          onClick={() => setSelectedImage(null)}
        >
          {/* close button */}
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 cursor-pointer transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <FiX size={28} />
          </button>

          {/* image display */}
          <div className="max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.image}
              alt={selectedImage.caption}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            <p className="text-white text-center mt-3 text-lg">{selectedImage.caption}</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default Gallery;
