"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type HeroMotionProps = {
  title: string;
  tagline: string;
};

type HeroSlide = {
  id: string;
  src: string;
  type: "image" | "video";
};

type TransitionState = {
  fromIndex: number;
  toIndex: number;
};

type MediaPhase = "active" | "incoming" | "outgoing";

const HERO_MEDIA: HeroSlide[] = [
  {
    id: "first-film",
    src: "https://ik.imagekit.io/1pscfy7oah/kiarova/first-hero-section-video.mp4",
    type: "video",
  },
  {
    id: "second-film",
    src: "https://ik.imagekit.io/1pscfy7oah/kiarova/second-hero-section-video.mp4",
    type: "video",
  },
  {
    id: "legacy-still",
    src: "https://ik.imagekit.io/1pscfy7oah/kiarova/hero-section-pic.png",
    type: "image",
  },
];

const IMAGE_DURATION_MS = 6000;
const MEDIA_FADE_DURATION_MS = 900;

function getNextSlideIndex(index: number) {
  return (index + 1) % HERO_MEDIA.length;
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  return prefersReducedMotion;
}

type HeroMediaLayerProps = {
  phase: MediaPhase;
  onVideoEnded: () => void;
  slide: HeroSlide;
};

function HeroMediaLayer({ onVideoEnded, phase, slide }: HeroMediaLayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (slide.type !== "video") {
      return;
    }

    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.currentTime = 0;
    video.muted = true;

    const playback = video.play();

    if (playback) {
      void playback.catch(() => {
        // Muted autoplay should pass; ignore browser interruptions during swaps.
      });
    }
  }, [slide.id, slide.type]);

  return (
    <div className="kairova-hero-media-layer absolute inset-0" data-phase={phase}>
      {slide.type === "video" ? (
        <video
          ref={videoRef}
          aria-hidden="true"
          autoPlay
          className="h-full w-full object-cover object-center"
          disablePictureInPicture
          muted
          onEnded={onVideoEnded}
          playsInline
          preload="auto"
          src={slide.src}
        />
      ) : (
        <Image
          fill
          priority
          alt=""
          aria-hidden="true"
          className="object-cover object-center"
          sizes="100vw"
          src={slide.src}
        />
      )}
    </div>
  );
}

export default function HeroMotion({ title, tagline }: HeroMotionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const copyRef = useRef<HTMLDivElement | null>(null);
  const currentIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const transitionTimeoutRef = useRef<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCopyIntersecting, setIsCopyIntersecting] = useState(false);
  const [transitionState, setTransitionState] =
    useState<TransitionState | null>(null);

  const clearTransitionTimeout = useCallback(() => {
    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, []);

  const advanceToNextSlide = useCallback(() => {
    if (isTransitioningRef.current) {
      return;
    }

    const fromIndex = currentIndexRef.current;
    const toIndex = getNextSlideIndex(fromIndex);

    if (prefersReducedMotion) {
      currentIndexRef.current = toIndex;
      setCurrentIndex(toIndex);
      return;
    }

    isTransitioningRef.current = true;
    clearTransitionTimeout();
    setTransitionState({ fromIndex, toIndex });

    transitionTimeoutRef.current = window.setTimeout(() => {
      currentIndexRef.current = toIndex;
      setCurrentIndex(toIndex);
      setTransitionState(null);
      isTransitioningRef.current = false;
      transitionTimeoutRef.current = null;
    }, MEDIA_FADE_DURATION_MS);
  }, [clearTransitionTimeout, prefersReducedMotion]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    return () => {
      clearTransitionTimeout();
    };
  }, [clearTransitionTimeout]);

  useEffect(() => {
    const nextSlide = HERO_MEDIA[getNextSlideIndex(currentIndex)];

    if (nextSlide.type === "video") {
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.src = nextSlide.src;
      video.load();

      return () => {
        video.removeAttribute("src");
        video.load();
      };
    }

    const image = new window.Image();
    image.src = nextSlide.src;

    return undefined;
  }, [currentIndex]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const copyNode = copyRef.current;

    if (!copyNode) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCopyIntersecting(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "0px 0px -50% 0px",
        threshold: 0.05,
      },
    );

    observer.observe(copyNode);

    return () => {
      observer.disconnect();
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const slide = HERO_MEDIA[currentIndex];

    if (slide.type !== "image" || transitionState) {
      return;
    }

    const imageTimeout = window.setTimeout(() => {
      advanceToNextSlide();
    }, IMAGE_DURATION_MS);

    return () => {
      window.clearTimeout(imageTimeout);
    };
  }, [advanceToNextSlide, currentIndex, transitionState]);

  const activeSlide = HERO_MEDIA[currentIndex];
  const isCopyVisible = prefersReducedMotion || isCopyIntersecting;

  return (
    <section
      className="relative flex h-[112svh] min-h-[700px] max-h-[1040px] overflow-hidden bg-bg-primary ps-6 pe-6 text-fg-primary"
      data-section="hero"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        {transitionState ? (
          <>
            <HeroMediaLayer
              key={HERO_MEDIA[transitionState.fromIndex].id}
              onVideoEnded={advanceToNextSlide}
              phase="outgoing"
              slide={HERO_MEDIA[transitionState.fromIndex]}
            />
            <HeroMediaLayer
              key={HERO_MEDIA[transitionState.toIndex].id}
              onVideoEnded={advanceToNextSlide}
              phase="incoming"
              slide={HERO_MEDIA[transitionState.toIndex]}
            />
          </>
        ) : (
          <HeroMediaLayer
            key={activeSlide.id}
            onVideoEnded={advanceToNextSlide}
            phase="active"
            slide={activeSlide}
          />
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-10 bg-black/25"
        aria-hidden="true"
      />

      <div className="relative z-20 mx-auto flex h-full w-full max-w-[var(--max-content)] flex-col items-center justify-center pt-[36svh] pb-[4svh] text-center">
        <div
          ref={copyRef}
          className={`kairova-hero-copy flex max-w-4xl flex-col items-center gap-5 ${
            isCopyVisible ? "is-visible" : ""
          }`}
        >
          <h1 className="max-w-4xl text-h2 leading-display text-fg-primary [font-family:var(--font-display-en)] sm:text-h1 lg:text-display">
            {title}
          </h1>
          <p className="max-w-xl text-body-lg leading-body text-border-light">
            {tagline}
          </p>
        </div>
      </div>
    </section>
  );
}
