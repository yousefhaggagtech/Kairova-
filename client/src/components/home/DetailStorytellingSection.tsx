"use client";

import { motion, MotionConfig, useInView, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

const VIDEO_SRC =
  "/bracelet-section-video.mp4";

const editorialEase = [0.19, 1, 0.22, 1] as const;

export default function DetailStorytellingSection() {
  const t = useTranslations("home.detailStorytelling");
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.8, once: true });
  const [isVideoReady, setIsVideoReady] = useState(false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const videoScale = useTransform(scrollYProgress, [0, 0.55], [1.1, 1]);

  useEffect(() => {
    if (isInView && isVideoReady) {
      void videoRef.current?.play();
    }
  }, [isInView, isVideoReady]);

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        className="relative isolate overflow-hidden bg-bg-secondary text-fg-primary"
        data-section="detail-storytelling"
      >
        <motion.div
          className="relative min-h-[72svh] w-full overflow-hidden sm:min-h-[78svh] lg:min-h-[88svh]"
          style={{ scale: videoScale }}
        >
          {isInView ? (
            <video
              ref={videoRef}
              aria-label={t("videoAlt")}
              autoPlay
              className="absolute inset-0 h-full w-full object-cover [filter:saturate(0.7)_contrast(1.1)_brightness(0.9)]"
              loop
              muted
              onCanPlay={() => setIsVideoReady(true)}
              playsInline
              preload="none"
              src={VIDEO_SRC}
            />
          ) : null}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,10,10,0.2),rgba(120,120,120,0.05)_55%,rgba(10,10,10,0.2))] mix-blend-soft-light"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.08),transparent_35%,rgba(10,10,10,0.34))]"
          />

          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center [will-change:transform,opacity]"
            initial={{ opacity: 0, y: 18 }}
            animate={isInView && isVideoReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ delay: 0.32, duration: 1.8, ease: editorialEase }}
          >
            <motion.h2
              className="max-w-[12ch] text-3xl leading-heading tracking-[0.08em] text-fg-primary sm:text-h1 [will-change:transform,opacity,filter]"
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={isInView && isVideoReady ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 8, filter: "blur(4px)" }}
              transition={{ delay: 0.48, duration: 1.6, ease: editorialEase }}
            >
              {t("heading")}
            </motion.h2>
          </motion.div>
        </motion.div>
      </section>
    </MotionConfig>
  );
}
