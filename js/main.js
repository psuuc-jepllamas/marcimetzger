const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

function initLoader() {
  const loader = document.getElementById("page-loader");
  const hide = () => loader?.classList.add("is-done");
  window.setTimeout(hide, 700);
  window.addEventListener("load", hide);
}

function initHeader() {
  const header = document.getElementById("site-header");

  window.addEventListener(
    "scroll",
    () => {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    },
    { passive: true }
  );
}

function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const drawer = document.getElementById("mobile-nav");
  const backdrop = document.getElementById("nav-backdrop");

  const setOpen = (open) => {
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    drawer.hidden = false;
    backdrop.hidden = false;
    drawer.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) {
      window.setTimeout(() => {
        drawer.hidden = true;
        backdrop.hidden = true;
      }, 320);
    }
  };

  toggle.addEventListener("click", () => {
    setOpen(!toggle.classList.contains("is-open"));
  });
  backdrop.addEventListener("click", () => setOpen(false));
  drawer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });
}

function initActiveNav() {
  const links = document.querySelectorAll(".desktop-nav a");
  const sections = ["top", "listings", "move", "about"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        const href = id === "top" ? "#top" : `#${id}`;
        links.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === href);
        });
      });
    },
    { rootMargin: "-40% 0px -50% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

function animateCount(el) {
  const end = Number(el.dataset.count);
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";
  const decimals = Number(el.dataset.decimal || 0);
  const duration = 1400;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = end * eased;
    el.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function initReveals() {
  const nodes = document.querySelectorAll(".reveal");
  if (prefersReducedMotion) {
    nodes.forEach((node) => {
      node.style.opacity = "1";
      node.style.transform = "none";
    });
    document.querySelectorAll("[data-count]").forEach(animateCount);
    return;
  }

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    nodes.forEach((node) => {
      gsap.to(node, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: node,
          start: "top 88%",
        },
      });
    });

    document.querySelectorAll("[data-count]").forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => animateCount(el),
      });
    });

    gsap.to(".hero__image", {
      yPercent: 8,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.transition = "opacity 0.7s ease, transform 0.7s ease";
        entry.target.style.opacity = "1";
        entry.target.style.transform = "none";
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.16 }
  );
  nodes.forEach((node) => observer.observe(node));
}

function initGallery() {
  const swiper = new Swiper(".gallery-swiper", {
    slidesPerView: 1.08,
    spaceBetween: 14,
    centeredSlides: true,
    loop: true,
    autoplay: prefersReducedMotion
      ? false
      : { delay: 3600, disableOnInteraction: false },
    pagination: { el: ".swiper-pagination", clickable: true },
    navigation: { nextEl: ".gallery-next", prevEl: ".gallery-prev" },
    breakpoints: {
      700: { slidesPerView: 1.4, spaceBetween: 18 },
      1024: { slidesPerView: 1.7, spaceBetween: 22 },
    },
  });

  const lightbox = document.getElementById("lightbox");
  const image = lightbox.querySelector("img");
  const close = () => {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  };

  document.querySelectorAll(".gallery-item").forEach((button) => {
    button.addEventListener("click", () => {
      image.src = button.dataset.src;
      image.alt = button.querySelector("img")?.alt || "";
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });

  lightbox.querySelector(".lightbox__close").addEventListener("click", close);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) close();
  });

  return swiper;
}

function initSearchForm() {
  const form = document.getElementById("search-form");
  const note = document.getElementById("search-note");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const location = data.get("location") || "Pahrump";
    const type = data.get("type") || "any type";
    note.hidden = false;
    note.textContent = `We’ll match ${type.toString().toLowerCase()} listings near ${location}. Call (206) 919-6886 and Marci will walk you through current inventory.`;
  });
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  const note = document.getElementById("contact-note");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    note.hidden = false;
    note.textContent =
      "Thank you. Your message is ready to send — please call or email the office if you need a same-day reply.";
    form.reset();
  });
}

function initCookieBanner() {
  const banner = document.getElementById("cookie");
  const accept = document.getElementById("cookie-accept");
  if (localStorage.getItem("mm-cookies") === "accepted") return;
  banner.hidden = false;
  accept.addEventListener("click", () => {
    localStorage.setItem("mm-cookies", "accepted");
    banner.hidden = true;
  });
}

function initHeroIntro() {
  if (prefersReducedMotion || !window.gsap) return;
  const timeline = gsap.timeline({ delay: 0.45 });
  timeline.from(".hero .eyebrow", { y: 24, opacity: 0, duration: 0.7 });
  timeline.from(
    ".hero__title span",
    { y: 50, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power3.out" },
    "-=0.3"
  );
  timeline.from(".hero__lede, .hero__actions", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4");
}

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initHeader();
  initMobileNav();
  initActiveNav();
  initReveals();
  initGallery();
  initSearchForm();
  initContactForm();
  initCookieBanner();
  initHeroIntro();
});
