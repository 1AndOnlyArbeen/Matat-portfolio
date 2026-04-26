import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import About from "../components/About";

function AllAbout() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-2">
        <Link to="/" className="inline-flex items-center gap-2 text-[#0075ff] hover:text-[#051229] font-bold text-sm transition-colors">
          <FiArrowLeft size={16} /> Back to Home
        </Link>
      </div>
      <About />
    </div>
  );
}

export default AllAbout;
