"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <div className="my-8 md:my-16">
      <div className="relative max-w-[90vw] mx-auto overflow-hidden rounded-2xl border border-[var(--ch-sage-light)]/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.18)] hover:shadow-[inset_0_3px_10px_rgba(0,0,0,0.22)]">
        {/* Decorative Gradient Background (wave-like layered blobs) */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-1/3 top-0 w-[60%] h-full rounded-full bg-gradient-to-br from-[var(--ch-sage-light)]/70 to-white opacity-90 transform -skew-y-12 blur-3xl" />
          <div className="absolute right-0 -bottom-8 w-[50%] h-[70%] rounded-full bg-gradient-to-tr from-white to-[var(--ch-sage-light)]/70 opacity-80 transform rotate-12 blur-2xl" />
        </div>

        {/* Overlay Content (motion: slide up from bottom) */}
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center px-4 py-12 sm:px-8 sm:py-16 md:py-20"
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="mb-8 text-center text-2xl font-bold text-black sm:text-3xl md:text-3xl">
            Ready to transform your productivity?
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link href="/login">
              <Button variant="white">GET STARTED</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
