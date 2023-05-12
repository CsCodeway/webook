import { useEffect } from "react";

const Bubble = () => {
  useEffect(() => {
    function createElement() {
      const bubble = document.querySelector(".bubble");
      const element = document.createElement("span");
      const size = Math.random() * 60;
      element.style.width = 20 + size + "px";
      element.style.height = 20 + size + "px";
      element.style.left = Math.random() * innerWidth + "px";
      bubble.appendChild(element);
      setTimeout(() => {
        element.remove();
      }, 4000);
    }
    const interval = setInterval(createElement, 100);

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default Bubble;
