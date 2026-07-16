import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const messages = [
  "5% Extra OFF on Prepaid Orders",
  "Free Shipping Across India",
  "Easy 7 Days Return Policy"
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const prev = () => {
    setIndex(index === 0 ? messages.length - 1 : index - 1);
  };

  const next = () => {
    setIndex((index + 1) % messages.length);
  };

  return (
    <div className="announcementBar">
      <button onClick={prev} className="arrowBtn">
        <ChevronLeft size={18} />
      </button>

      <div className="announcementText">
        {messages[index]}
      </div>

      <button onClick={next} className="arrowBtn">
        <ChevronRight size={18} />
      </button>
    </div>
  );
}