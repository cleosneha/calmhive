import React from "react";

export default function ThreeDotAnimation({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span className={"inline-block " + className}>
      <span
        className="dot-animate inline-block w-1 h-1 bg-white rounded-full mr-1 align-middle animate-bounce"
        style={{ animationDelay: "0s" }}
      ></span>
      <span
        className="dot-animate inline-block w-1 h-1 bg-white rounded-full mr-1 align-middle animate-bounce"
        style={{ animationDelay: "0.2s" }}
      ></span>
      <span
        className="dot-animate inline-block w-1 h-1 bg-white rounded-full align-middle animate-bounce"
        style={{ animationDelay: "0.4s" }}
      ></span>
      <style jsx global>{`
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
        }
        .dot-animate {
          animation-name: bounce;
          animation-duration: 1s;
          animation-iteration-count: infinite;
        }
      `}</style>
    </span>
  );
}
