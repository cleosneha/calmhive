"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GUIDE_SECTIONS } from "@/utils/guide-data";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function GuideContent() {
  const [activeSection, setActiveSection] = useState<string>(
    GUIDE_SECTIONS[0].id,
  );
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const activeSectionData = GUIDE_SECTIONS.find(
    (section) => section.id === activeSection,
  );

  const currentIndex = GUIDE_SECTIONS.findIndex(
    (section) => section.id === activeSection,
  );
  const prevIndex = GUIDE_SECTIONS.findIndex(
    (section) =>
      section.id ===
      GUIDE_SECTIONS[
        currentIndex > 0 ? currentIndex - 1 : GUIDE_SECTIONS.length - 1
      ].id,
  );

  const slideDirection = currentIndex > prevIndex ? 1 : -1;

  const handlePrevSection = () => {
    const newIndex =
      currentIndex > 0 ? currentIndex - 1 : GUIDE_SECTIONS.length - 1;
    handleSectionClick(GUIDE_SECTIONS[newIndex].id);
  };

  const handleNextSection = () => {
    const newIndex =
      currentIndex < GUIDE_SECTIONS.length - 1 ? currentIndex + 1 : 0;
    handleSectionClick(GUIDE_SECTIONS[newIndex].id);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="text-center px-4 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--ch-text)] mb-4">
          Complete Guide to{" "}
          <span className="text-[var(--ch-sage-dark)]">CalmHive</span>
        </h1>
        <p className="text-sm md:text-base text-[var(--ch-muted)] max-w-2xl mx-auto">
          Everything you need to know about using CalmHive, from basic setup to
          advanced features.
        </p>
      </div>

      {/* Horizontal Navigation Badges */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm  py-4 px-4 overflow-x-auto">
        <div className="flex items-center justify-center md:justify-center gap-3 md:gap-4 max-w-6xl mx-auto min-w-max md:min-w-0">
          {GUIDE_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className={`
                  flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full 
                  transition-all duration-300 whitespace-nowrap
                  ${
                    isActive
                      ? "bg-[var(--ch-sage-dark)] text-white shadow-md scale-105"
                      : "bg-gray-100 text-[var(--ch-text)] hover:bg-gray-200 hover:scale-102"
                  }
                `}
              >
                <Icon
                  className={`text-lg md:text-xl ${isActive ? "text-white" : "text-[var(--ch-sage-dark)]"}`}
                />
                <span className="hidden md:inline text-sm font-medium">
                  {section.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Section with Box Container */}
      <div
        ref={contentRef}
        className="max-w-6xl mx-auto px-4 py-8 md:py-12 scroll-mt-20"
      >
        <AnimatePresence mode="wait">
          {activeSectionData && (
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: slideDirection * 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDirection * -100 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="border-2 border-[var(--ch-sage-dark)]/30 rounded-2xl bg-white/50 backdrop-blur-sm p-6 md:p-8 relative"
            >
              {/* Section Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--ch-sage-dark)]/10">
                    <activeSectionData.icon className="text-2xl text-[var(--ch-sage-dark)]" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[var(--ch-text)]">
                    {activeSectionData.title}
                  </h2>
                </div>
                <p className="text-sm md:text-base text-[var(--ch-muted)] ml-0 md:ml-15">
                  {activeSectionData.description}
                </p>
              </div>

              {/* Accordion Items */}
              <Accordion type="single" collapsible className="space-y-0">
                {activeSectionData.items.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border-b border-[var(--ch-border-muted)] px-0 py-0"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4 md:py-4">
                      <div className="flex items-start gap-3 w-full pr-4">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--ch-sage-dark)]/10 text-[var(--ch-sage-dark)] font-semibold text-xs flex-shrink-0 mt-0">
                          ✓
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base md:text-lg font-semibold text-[var(--ch-text)] mb-1">
                            {item.title}
                          </h3>
                          <p className="text-xs md:text-sm text-[var(--ch-muted)]">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-4 md:pb-4">
                      <ul className="space-y-2 ml-10 md:ml-10">
                        {item.steps.map((step, stepIndex) => (
                          <li
                            key={stepIndex}
                            className="flex items-start gap-3 text-xs md:text-sm text-[var(--ch-text)]"
                          >
                            <span className="text-[var(--ch-sage-dark)] mt-0.5 flex-shrink-0">
                              ▸
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* Navigation Arrows at Bottom */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--ch-border-muted)]">
                <button
                  onClick={handlePrevSection}
                  className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-[var(--ch-sage-dark)]/30 text-[var(--ch-sage-dark)] hover:bg-[var(--ch-sage-dark)]/10 hover:border-[var(--ch-sage-dark)] transition-all"
                  aria-label="Previous section"
                >
                  <FiChevronLeft className="text-2xl" />
                </button>
                <div className="flex gap-2">
                  {GUIDE_SECTIONS.map((section) => (
                    <div
                      key={section.id}
                      className={`w-2 h-2 rounded-full transition-all ${
                        activeSection === section.id
                          ? "bg-[var(--ch-sage-dark)] w-6"
                          : "bg-[var(--ch-sage-dark)]/30"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNextSection}
                  className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-[var(--ch-sage-dark)]/30 text-[var(--ch-sage-dark)] hover:bg-[var(--ch-sage-dark)]/10 hover:border-[var(--ch-sage-dark)] transition-all"
                  aria-label="Next section"
                >
                  <FiChevronRight className="text-2xl" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
