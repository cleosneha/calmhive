"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Purpose() {
  const words = ["Noise", "Pressure", "Overthinking"];

  return (
    <section id="purpose" className="w-full py-16 bg-transparent">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-lg text-[var(--ch-muted)] mb-3 md:mb-6 text-center">
          What we help you let go of
        </p>
        <div className="hidden md:flex items-center justify-center gap-4 md:gap-12 max-w-4xl mx-auto">
          {/* Left: Vertical stack with indicators and animated connectors */}
          <div className="flex-1 h-full max-w-xl">
            <div className="flex flex-col gap-8 h-full justify-center">
              {words.map((w, i) => (
                <div key={w} className="flex items-center gap-2 md:gap-4">
                  {/* Word and connector */}
                  <div className="flex-1 flex items-center gap-6">
                    <div className="text-xl md:text-4xl lg:text-6xl font-extrabold tracking-wide text-[var(--ch-bluegrey)]">
                      {w}
                    </div>

                    {/* Animated horizontal connecting line to the right (hidden on small screens) */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.9, delay: i * 0.12 }}
                      className="hidden md:block h-[2px] bg-[var(--ch-sage-dark)] origin-left flex-1"
                      aria-hidden
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Right: Bold but calm sentence */}
          <div className="flex-0 flex items-center justify-center h-full">
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              whileHover={{ scale: 1.03 }}
              className="w-full flex items-center justify-center md:justify-center h-full"
            >
              <div className="w-32 h-32 md:w-72 md:h-72 overflow-hidden mx-auto">
                <Image
                  src="/assets/landing-page/purpose.png"
                  alt="So you can find clarity and balance again."
                  width={288}
                  height={288}
                  className="object-cover w-full h-full"
                  priority={false}
                  quality={90}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile View: small uniform pop-in images in a full-screen section */}
        <div className="md:hidden w-full h-screen flex flex-col justify-start items-center pt-4">
          <div className="flex flex-col items-center gap-4 w-full">
            {[
              "/assets/landing-page/purpose-1.png",
              "/assets/landing-page/purpose-2.png",
              "/assets/landing-page/purpose-3.png",
            ].map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40, scale: 0.8 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5, delay: i * 0.25 }}
                className={`w-full flex ${
                  i % 2 === 0 ? "justify-start pl-6" : "justify-end pr-6"
                }`}
              >
                <div className="w-35 h-35 overflow-hidden rounded-full shadow-lg">
                  <Image
                    src={src}
                    alt={`purpose ${i + 1}`}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </div>
              </motion.div>
            ))}

            {/* Final image centered */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "0%" }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="w-full flex justify-center mt-4"
            >
              <div className="w-40 h-40 overflow-hidden shadow-lg rounded-full">
                <Image
                  src="/assets/landing-page/purpose.png"
                  alt="So you can find clarity and balance again."
                  width={160}
                  height={160}
                  className="object-cover w-full h-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
