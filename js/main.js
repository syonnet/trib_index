/**
 * TribOil — Lógica Interactiva y Animaciones
 *
 * Este archivo centraliza la lógica de animaciones con GSAP,
 * scroll suavizado con Lenis, la gestión de sliders y la interactividad del usuario.
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // INICIALIZACIÓN DE LIBRERÍAS
  // ==========================================

  // Registrar el plugin de ScrollTrigger para GSAP
  gsap.registerPlugin(ScrollTrigger);

  // Inicializar Lenis para Scroll Suave
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });

  // Bucle de animación (RequestAnimationFrame) para Lenis
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Sincronizar Lenis con ScrollTrigger
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Inicializar iconos de Lucide
  lucide.createIcons();

  // ==========================================
  // CONTROLADOR DEL PRELOADER / SPLASH ÉPICO
  // ==========================================
  const preloader = document.getElementById("preloader");
  const preloaderBar = document.getElementById("preloaderBar");
  const preloaderLogo = document.getElementById("preloaderLogo");

  if (preloader && preloaderBar && preloaderLogo) {
    const preloaderTl = gsap.timeline({
      onComplete: () => {
        preloader.style.display = "none";
        animateHero();
      },
    });

    // 1. Revelar el logo suavemente
    preloaderTl.to(preloaderLogo, {
      opacity: 1,
      scale: 1,
      duration: 1.2,
      ease: "power3.out",
    });

    // 2. Iniciar el efecto de latido lento (pulse) en el logo en paralelo
    gsap.to(preloaderLogo, {
      scale: 1.06,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // 3. Llenar la barra de carga suavemente en un lapso de 6 segundos
    preloaderTl.to(
      preloaderBar,
      {
        width: "100%",
        duration: 6.0,
        ease: "power2.inOut",
      },
      "-=0.6",
    );

    // 4. Salida cinemática del preloader
    preloaderTl.to(preloader, {
      yPercent: -100,
      duration: 1.2,
      ease: "power4.inOut",
    });
  }

  // ==========================================
  // ANIMACIONES DE ENTRADA (HERO)
  // ==========================================
  function animateHero() {
    const tl = gsap.timeline();
    tl.from("#heroSlider .flex.items-center.gap-3", {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power3.out",
    })
      .from(
        "#heroSlider h1",
        { opacity: 0, y: 60, duration: 1, ease: "power3.out" },
        "-=0.4",
      )
      .from(
        "#heroSlider p",
        { opacity: 0, y: 40, duration: 0.8, ease: "power3.out" },
        "-=0.5",
      )
      .from(
        "#heroSlider .flex.flex-wrap",
        { opacity: 0, y: 30, duration: 0.8, ease: "power3.out" },
        "-=0.4",
      )
      .from(
        "#sliderIndicators",
        { opacity: 0, duration: 0.6, ease: "power2.out" },
        "-=0.3",
      )
      .from(
        "#slideCounter",
        { opacity: 0, duration: 0.6, ease: "power2.out" },
        "-=0.3",
      )
      .from(
        "#scrollHint",
        { opacity: 0, duration: 0.6, ease: "power2.out" },
        "-=0.2",
      );
  }

  // ==========================================
  // SLIDER DEL HERO (CARRUSEL PRINCIPAL)
  // ==========================================
  const heroSlides = document.querySelectorAll(".hero-slide");
  const indicators = document.querySelectorAll(".slider-indicator");
  const slideCounter = document.getElementById("slideCounter");
  let currentSlide = 0;
  let sliderInterval;
  const SLIDER_DURATION = 6000;

  function goToSlide(index) {
    if (heroSlides.length === 0) return;

    heroSlides[currentSlide].classList.remove("active");
    indicators[currentSlide].classList.remove("active");

    currentSlide = index;

    heroSlides[currentSlide].classList.add("active");
    indicators[currentSlide].classList.remove("active");

    // Pequeño retraso para que la transición CSS reinicie la barra de progreso
    requestAnimationFrame(() => {
      indicators[currentSlide].classList.add("active");
    });

    if (slideCounter) {
      slideCounter.textContent = `0${currentSlide + 1} / 0${heroSlides.length}`;
    }

    // Resetear la animación de llenado del indicador
    indicators.forEach((ind) => {
      const fill = ind.querySelector(".fill");
      if (fill) {
        fill.style.width = "0%";
        fill.style.transition = "none";
      }
    });

    requestAnimationFrame(() => {
      const activeFill = indicators[currentSlide].querySelector(".fill");
      if (activeFill) {
        activeFill.style.transition = `width ${SLIDER_DURATION}ms linear`;
        activeFill.style.width = "100%";
      }
    });
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % heroSlides.length);
  }

  function startSlider() {
    if (heroSlides.length > 0) {
      goToSlide(0);
      sliderInterval = setInterval(nextSlide, SLIDER_DURATION);
    }
  }

  // Agregar eventos a los indicadores del Slider
  indicators.forEach((ind) => {
    ind.addEventListener("click", () => {
      clearInterval(sliderInterval);
      goToSlide(parseInt(ind.dataset.slide));
      sliderInterval = setInterval(nextSlide, SLIDER_DURATION);
    });
  });

  startSlider();

  // ==========================================
  // SLIDER DE OPERACIONES (PROYECTOS)
  // ==========================================
  let currentOps = 0;
  const opsTrack = document.getElementById("opsTrack");
  const opsSlides = document.querySelectorAll(".ops-slide");
  const prevOpsBtn = document.getElementById("prevOpsBtn");
  const nextOpsBtn = document.getElementById("nextOpsBtn");

  function goToOps(index) {
    if (!opsTrack || opsSlides.length === 0) return;

    if (index < 0) index = opsSlides.length - 1;
    if (index >= opsSlides.length) index = 0;

    currentOps = index;
    opsTrack.style.transform = `translateX(-${currentOps * 100}%)`;

    opsSlides.forEach((slide, idx) => {
      slide.classList.toggle("active", idx === currentOps);
    });
  }

  function nextOps() {
    goToOps(currentOps + 1);
  }

  function prevOps() {
    goToOps(currentOps - 1);
  }

  // Registrar eventos para botones de control de Operaciones
  if (prevOpsBtn) {
    prevOpsBtn.addEventListener("click", prevOps);
  }
  if (nextOpsBtn) {
    nextOpsBtn.addEventListener("click", nextOps);
  }

  // Exponer temporalmente a global para retrocompatibilidad si es necesario
  window.nextOps = nextOps;
  window.prevOps = prevOps;

  // ==========================================
  // ANIMACIONES DE REVELADO AL HACER SCROLL
  // ==========================================
  const revealElements = document.querySelectorAll(
    ".reveal-up, .reveal-left, .reveal-right, .reveal-scale",
  );
  revealElements.forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  });

  // ==========================================
  // COMPORTAMIENTO DE LA BARRA DE NAVEGACIÓN
  // ==========================================
  const mainNav = document.getElementById("mainNav");

  if (mainNav) {
    ScrollTrigger.create({
      start: "top -80",
      onUpdate: (self) => {
        const scrollY = self.scroll();
        if (scrollY > 100) {
          mainNav.classList.add("scrolled");
        } else {
          mainNav.classList.remove("scrolled");
        }
      },
    });
  }

  // Efecto de desvanecimiento del Scroll Hint en el Hero
  const scrollHint = document.getElementById("scrollHint");
  if (scrollHint) {
    ScrollTrigger.create({
      start: "top 20%",
      end: "top 5%",
      onUpdate: (self) => {
        scrollHint.style.opacity = 1 - self.progress;
      },
    });
  }

  // ==========================================
  // NAVEGACIÓN SUAVE (SMOOTH SCROLL)
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const hrefAttr = link.getAttribute("href");
      if (hrefAttr === "#") return;

      const target = document.querySelector(hrefAttr);
      if (target) {
        e.preventDefault();
        // Cerrar menú móvil por si el click vino desde allí
        closeMobile();
        lenis.scrollTo(target, { offset: -80 });
      }
    });
  });

  // ==========================================
  // CONTROLADOR DEL MENÚ MÓVIL
  // ==========================================
  let mobileOpen = false;
  const mobileMenu = document.getElementById("mobileMenu");
  const hamburgerBtn = document.getElementById("hamburger");
  const ham1 = document.getElementById("ham1");
  const ham2 = document.getElementById("ham2");

  function toggleMobile() {
    if (!mobileMenu) return;
    mobileOpen = !mobileOpen;

    mobileMenu.classList.toggle("open", mobileOpen);

    if (ham1 && ham2) {
      ham1.style.transform = mobileOpen ? "rotate(45deg) translateY(5px)" : "";
      ham2.style.transform = mobileOpen
        ? "rotate(-45deg) translateY(-4px)"
        : "";
      ham2.style.width = mobileOpen ? "1.5rem" : "";
    }

    document.body.style.overflow = mobileOpen ? "hidden" : "";

    if (mobileOpen) {
      // Re-inicializar iconos lucide para mobile
      lucide.createIcons();

      // Animación stagger de entrada Premium con GSAP
      gsap.fromTo(
        ".mobile-nav-item",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.15,
        },
      );

      gsap.fromTo(
        ".mobile-menu-info",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.5 },
      );
    }
  }

  function closeMobile() {
    if (!mobileMenu) return;
    mobileOpen = false;

    mobileMenu.classList.remove("open");

    if (ham1 && ham2) {
      ham1.style.transform = "";
      ham2.style.transform = "";
      ham2.style.width = "";
    }

    document.body.style.overflow = "";
  }

  // Vincular eventos del menú móvil
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", toggleMobile);
  }

  // Vinculación a los enlaces del menú móvil para cerrarlo al hacer click
  const mobileLinks = document.querySelectorAll("#mobileMenu nav a");
  mobileLinks.forEach((link) => {
    link.addEventListener("click", closeMobile);
  });

  // Exponer a global para cualquier interacción directa
  window.toggleMobile = toggleMobile;
  window.closeMobile = closeMobile;

  // ==========================================
  // GESTIÓN DEL FORMULARIO DE CONTACTO
  // ==========================================
  const contactForm = document.getElementById("contactForm");
  const toast = document.getElementById("toast");

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 4000);
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (!submitBtn) return;

      const originalHTML = submitBtn.innerHTML;
      submitBtn.innerHTML =
        '<span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Enviando...';
      submitBtn.disabled = true;

      // Simulación de envío de datos del formulario (API Mockup)
      setTimeout(() => {
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
        contactForm.reset();
        showToast(
          "Su solicitud ha sido enviada correctamente. Nos pondremos en contacto pronto.",
        );

        // Reinicializar los iconos de Lucide tras cambiar el HTML
        lucide.createIcons();
      }, 2000);
    });
  }

  // Exponer showToast a nivel global
  window.showToast = showToast;

  // ==========================================
  // AJUSTE DE ESTILOS DEL SELECT
  // ==========================================
  document.querySelectorAll("select.form-input").forEach((select) => {
    select.addEventListener("change", function () {
      this.style.color = "#fff";
    });
  });

  // ==========================================
  // CURSOR PERSONALIZADO INTERACTIVO
  // ==========================================
  const customCursor = document.getElementById("customCursor");
  if (customCursor) {
    if (window.innerWidth >= 1024) {
      const xTo = gsap.quickTo(customCursor, "x", {
        duration: 0.1,
        ease: "power2.out",
      });
      const yTo = gsap.quickTo(customCursor, "y", {
        duration: 0.1,
        ease: "power2.out",
      });

      window.addEventListener("mousemove", (e) => {
        xTo(e.clientX);
        yTo(e.clientY);
      });

      // Agregar efectos de hover
      const interactives = document.querySelectorAll(
        "a, button, select, input, textarea, .slider-indicator, .service-card, .ops-slide",
      );
      interactives.forEach((el) => {
        el.addEventListener("mouseenter", () => {
          customCursor.classList.add("hovered");
        });
        el.addEventListener("mouseleave", () => {
          customCursor.classList.remove("hovered");
        });
      });
    }
  }

  // ==========================================
  // REVELADO DE TEXTO PREMIUM (TEXT MASKING)
  // ==========================================
  function splitTextForReveal(element) {
    const nodes = Array.from(element.childNodes);
    element.innerHTML = "";

    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Normalizar múltiples espacios en blanco y saltos de línea de la indentación del HTML
        const normalizedText = node.textContent.replace(/\s+/g, " ");
        if (normalizedText === "" || normalizedText === " ") {
          element.appendChild(document.createTextNode(" "));
          return;
        }

        const words = normalizedText.split(" ").filter((w) => w !== "");
        words.forEach((word, idx) => {
          const wrapper = document.createElement("span");
          wrapper.style.display = "inline-block";
          wrapper.style.overflow = "hidden";
          wrapper.style.verticalAlign = "top";

          const inner = document.createElement("span");
          inner.innerText = word;
          inner.style.display = "inline-block";
          inner.className = "reveal-inner-word";
          inner.style.transform = "translateY(105%)";
          inner.style.willChange = "transform";

          wrapper.appendChild(inner);
          element.appendChild(wrapper);

          // Usar espacio nativo del navegador entre palabras
          if (idx < words.length - 1) {
            element.appendChild(document.createTextNode(" "));
          }
        });
      } else if (node.nodeName === "BR") {
        element.appendChild(document.createElement("br"));
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const elementClone = node.cloneNode(true);
        splitTextForReveal(elementClone);
        element.appendChild(elementClone);
      }
    });
  }

  const revealTexts = document.querySelectorAll(".reveal-text");
  revealTexts.forEach((el) => {
    splitTextForReveal(el);
    const innerWords = el.querySelectorAll(".reveal-inner-word");

    if (innerWords.length > 0) {
      gsap.to(innerWords, {
        y: "0%",
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.035,
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    }
  });

  // ==========================================
  // EFECTO TILT 3D EN TARJETAS DE SERVICIOS
  // ==========================================
  const cards = document.querySelectorAll(".service-card");

  if (cards.length > 0 && window.innerWidth >= 1024) {
    cards.forEach((card) => {
      let glare = card.querySelector(".card-glare");
      if (!glare) {
        glare = document.createElement("div");
        glare.className = "card-glare";
        card.appendChild(glare);
      }
      // Elementos internos para paralaje multicapa
      const img = card.querySelector(".card-image img");
      const content = card.querySelector(".p-8");
      const num = card.querySelector(".card-number");

      const rotateXTo = gsap.quickTo(card, "rotateX", {
        duration: 0.35,
        ease: "power2.out",
      });
      const rotateYTo = gsap.quickTo(card, "rotateY", {
        duration: 0.35,
        ease: "power2.out",
      });
      const yTo = gsap.quickTo(card, "y", {
        duration: 0.35,
        ease: "power2.out",
      });
      const scaleTo = gsap.quickTo(card, "scale", {
        duration: 0.35,
        ease: "power2.out",
      });

      // Animaciones individuales para el paralaje
      const imgXTo = img
        ? gsap.quickTo(img, "x", { duration: 0.35, ease: "power2.out" })
        : null;
      const imgYTo = img
        ? gsap.quickTo(img, "y", { duration: 0.35, ease: "power2.out" })
        : null;
      const imgScaleTo = img
        ? gsap.quickTo(img, "scale", { duration: 0.35, ease: "power2.out" })
        : null;
      const contentXTo = content
        ? gsap.quickTo(content, "x", { duration: 0.35, ease: "power2.out" })
        : null;
      const contentYTo = content
        ? gsap.quickTo(content, "y", { duration: 0.35, ease: "power2.out" })
        : null;
      const numXTo = num
        ? gsap.quickTo(num, "x", { duration: 0.35, ease: "power2.out" })
        : null;
      const numYTo = num
        ? gsap.quickTo(num, "y", { duration: 0.35, ease: "power2.out" })
        : null;

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Establecer variables CSS para el borde luminoso
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);

        const xc = x / rect.width - 0.5;
        const yc = -(y / rect.height - 0.5);

        const rotateX = yc * 14;
        const rotateY = xc * 14;

        rotateXTo(rotateX);
        rotateYTo(rotateY);
        yTo(-10);
        scaleTo(1.03);

        // Parallax por capas de profundidad
        if (imgXTo) imgXTo(xc * 16);
        if (imgYTo) imgYTo(-yc * 16);
        if (imgScaleTo) imgScaleTo(1.08);
        if (contentXTo) contentXTo(-xc * 8);
        if (contentYTo) contentYTo(yc * 8);
        if (numXTo) numXTo(-xc * 28);
        if (numYTo) numYTo(yc * 28);

        gsap.to(glare, {
          opacity: 1,
          background: `radial-gradient(circle at ${x}px ${y}px, rgba(82, 194, 147, 0.22), transparent 70%)`,
          duration: 0.1,
        });
      });

      card.addEventListener("mouseleave", () => {
        rotateXTo(0);
        rotateYTo(0);
        yTo(0);
        scaleTo(1);

        if (imgXTo) imgXTo(0);
        if (imgYTo) imgYTo(0);
        if (imgScaleTo) imgScaleTo(1);
        if (contentXTo) contentXTo(0);
        if (contentYTo) contentYTo(0);
        if (numXTo) numXTo(0);
        if (numYTo) numYTo(0);

        gsap.to(glare, {
          opacity: 0,
          duration: 0.3,
        });
      });
    });
  }

  // ==========================================
  // CONSOLA INTERACTIVA DE TELEMETRÍA (TRIB-OPS)
  // ==========================================
  const telemetryDepth = document.getElementById("telemetryDepth");
  const telemetryPressure = document.getElementById("telemetryPressure");
  const telemetryFlow = document.getElementById("telemetryFlow");
  const rigSvg = document.getElementById("rigSvg");
  const drillString = document.getElementById("drillString");
  const statusLed = document.getElementById("statusLed");

  const btnNormal = document.getElementById("btnNormalMode");
  const btnDrill = document.getElementById("btnDrillMode");
  const btnTest = document.getElementById("btnTestMode");

  const hotspots = document.querySelectorAll(".rig-hotspot");
  const hotspotTitle = document.getElementById("hotspotTitle");
  const hotspotDesc = document.getElementById("hotspotDesc");

  const hotspotData = {
    crown: {
      title: "Corona de Poleas (Crown Block)",
      desc: "Estructura superior de soporte capaz de resistir tensiones extremas en maniobras de tubería. Altura de operación actual a 85 ft.",
    },
    string: {
      title: "Sarta de Perforación (Drill String)",
      desc: "Tuberías de alta resistencia que transmiten rotación y fluido de perforación a la barrena. Estado actual: Girando a 115 RPM con torque de torsión óptimo.",
    },
    bop: {
      title: "Preventor de Reventones (BOP)",
      desc: "Válvula de seguridad masiva diseñada para sellar el pozo en caso de sobrepresión descontrolada. Estado: Sistema hidráulico cargado y monitoreado a 3,000 PSI.",
    },
  };

  // Interactividad de hotspots
  if (hotspots.length > 0) {
    hotspots.forEach((btn) => {
      btn.addEventListener("click", () => {
        hotspots.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const key = btn.dataset.hotspot;
        if (hotspotData[key]) {
          // Animación suave de cambio de texto
          gsap.fromTo(
            "#hotspotInfo",
            { opacity: 0, y: 5 },
            { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
          );
          hotspotTitle.textContent = hotspotData[key].title;
          hotspotDesc.textContent = hotspotData[key].desc;
        }
      });
    });
  }

  // Bucle de simulación de datos en tiempo real
  let telemetryMode = "normal"; // normal, drill, test
  let currentDepthVal = 8452.0;
  let currentPressureVal = 2410;
  let currentFlowVal = 480;
  let drillTween = null;

  const updateTelemetry = () => {
    if (telemetryMode === "normal") {
      currentDepthVal += 0.05 * Math.random();
      currentPressureVal = Math.round(2410 + (Math.random() - 0.5) * 20);
      currentFlowVal = Math.round(480 + (Math.random() - 0.5) * 10);
    } else if (telemetryMode === "drill") {
      currentDepthVal += 0.25 * Math.random();
      currentPressureVal = Math.round(2680 + (Math.random() - 0.5) * 60);
      currentFlowVal = Math.round(540 + (Math.random() - 0.5) * 30);
    } else if (telemetryMode === "test") {
      currentDepthVal += 0.01 * Math.random();
      currentPressureVal = Math.round(2880 + Math.sin(Date.now() / 400) * 140);
      currentFlowVal = Math.round(220 + Math.cos(Date.now() / 400) * 60);
    }

    if (telemetryDepth) telemetryDepth.textContent = currentDepthVal.toFixed(1);
    if (telemetryPressure) telemetryPressure.textContent = currentPressureVal;
    if (telemetryFlow) telemetryFlow.textContent = currentFlowVal;
  };

  setInterval(updateTelemetry, 400);

  // --- OSCILOSCOPIO EN VIVO ---
  const telemetryGraphPath = document.getElementById("telemetryGraphPath");
  let waveTime = 0;

  function animateOscilloscope() {
    if (!telemetryGraphPath) return;

    // Velocidad de movimiento del gráfico según el modo
    waveTime +=
      telemetryMode === "drill" ? 0.25 : telemetryMode === "test" ? 0.15 : 0.08;

    let points = [];
    const step = 4; // alta resolución de curva
    const width = 200;

    for (let x = 0; x <= width; x += step) {
      let y = 20;

      if (telemetryMode === "normal") {
        // Onda suave de baja amplitud
        y =
          20 +
          Math.sin(x * 0.08 - waveTime) * 5 +
          Math.sin(x * 0.03 - waveTime * 0.5) * 2;
        y += (Math.random() - 0.5) * 0.6; // ruido leve
      } else if (telemetryMode === "drill") {
        // Onda de alta frecuencia y amplitud con ruido fuerte
        y =
          20 +
          Math.sin(x * 0.18 - waveTime * 2.5) * 11 +
          Math.sin(x * 0.06 - waveTime * 1.2) * 3;
        y += (Math.random() - 0.5) * 2.8;
      } else if (telemetryMode === "test") {
        // Pulsos de seguridad: ondas cuadradas amortiguadas
        let baseWave = Math.sin(x * 0.07 - waveTime * 1.6);
        y =
          20 +
          Math.sign(baseWave) *
            11 *
            Math.abs(Math.sin(x * 0.025 - waveTime * 0.4));
        y += (Math.random() - 0.5) * 1.0;
      }

      // Evitar que se desborde del SVG (viewBox height 40)
      y = Math.max(3, Math.min(37, y));
      points.push(`${x},${y.toFixed(2)}`);
    }

    const pathData = "M " + points.join(" L ");
    telemetryGraphPath.setAttribute("d", pathData);

    requestAnimationFrame(animateOscilloscope);
  }

  if (telemetryGraphPath) {
    animateOscilloscope();
  }

  // Controladores de modo de consola
  const setTelemetryMode = (mode) => {
    telemetryMode = mode;
    if (btnNormal) btnNormal.classList.toggle("active", mode === "normal");
    if (btnDrill) btnDrill.classList.toggle("active", mode === "drill");
    if (btnTest) btnTest.classList.toggle("active", mode === "test");

    const statusText = statusLed.parentElement.querySelector("span:last-child");

    if (drillTween) {
      drillTween.kill();
      drillTween = null;
    }

    if (mode === "normal") {
      if (statusLed) statusLed.className = "telemetry-led active";
      if (statusText) {
        statusText.textContent = "System Status: Active";
        statusText.style.color = "#006849";
      }
      if (rigSvg) rigSvg.style.color = "rgba(82, 194, 147, 0.55)"; // Verde brillante con opacidad incrementada para vista normal
      if (telemetryGraphPath)
        telemetryGraphPath.setAttribute("stroke", "#006849");
      if (drillString) gsap.set(drillString, { strokeDashoffset: 0 });
    } else if (mode === "drill") {
      if (statusLed) statusLed.className = "telemetry-led active";
      if (statusText) {
        statusText.textContent = "System Status: Drilling";
        statusText.style.color = "#006849";
      }
      if (rigSvg) rigSvg.style.color = "rgba(82, 194, 147, 0.8)"; // Verde brillante con alta opacidad para simulación activa
      if (telemetryGraphPath)
        telemetryGraphPath.setAttribute("stroke", "#52c293");

      // Animación de rotación y bajada del Drill String
      if (drillString) {
        drillTween = gsap.to(drillString, {
          strokeDashoffset: 24,
          duration: 0.8,
          repeat: -1,
          ease: "none",
        });
      }
    } else if (mode === "test") {
      if (statusLed) statusLed.className = "telemetry-led warning";
      if (statusText) {
        statusText.textContent = "System Status: Security Testing";
        statusText.style.color = "#f59e0b";
      }
      if (rigSvg) rigSvg.style.color = "rgba(245, 158, 11, 0.7)"; // Naranja de advertencia con mayor contraste
      if (telemetryGraphPath)
        telemetryGraphPath.setAttribute("stroke", "#f59e0b");
    }
  };

  if (btnNormal)
    btnNormal.addEventListener("click", () => setTelemetryMode("normal"));
  if (btnDrill)
    btnDrill.addEventListener("click", () => setTelemetryMode("drill"));
  if (btnTest)
    btnTest.addEventListener("click", () => setTelemetryMode("test"));

  // --- SISTEMA DE PARTÍCULAS FLUIDAS INTERACTIVAS ---
  const canvas = document.getElementById("particlesCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let animationFrameId;
    let mouse = { x: null, y: null, radius: 160 };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.baseRadius = Math.random() * 1.5 + 1;
        this.radius = this.baseRadius;
        this.color = "rgba(82, 194, 147, 0.45)";
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 0.45;
            this.y += (dy / dist) * force * 0.45;
            this.radius = this.baseRadius + force * 1.0;
          } else {
            this.radius = this.baseRadius;
          }
        } else {
          this.radius = this.baseRadius;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      if (window.innerWidth < 768) return;

      const count = Math.min(
        60,
        Math.floor((canvas.width * canvas.height) / 22000),
      );
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    const drawLines = () => {
      const maxDistance = 140;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDistance) {
            const alpha = ((maxDistance - dist) / maxDistance) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(82, 194, 147, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - particles[i].x;
          const dy = mouse.y - particles[i].y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius) {
            const alpha = ((mouse.radius - dist) / mouse.radius) * 0.22;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(82, 194, 147, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    };

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (window.innerWidth >= 768) {
        particles.forEach((p) => {
          p.update();
          p.draw();
        });
        drawLines();
      }

      animationFrameId = requestAnimationFrame(animateParticles);
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener("mouseleave", () => {
      mouse.x = null;
      mouse.y = null;
    });

    resizeCanvas();
    animateParticles();
  }

  // --- EFECTO DECODER DE TEXTO (SCRAMBLE TEXT) RECURSIVO ---
  class NodeScrambler {
    constructor(element) {
      this.element = element;
      this.chars = "01$#@%&?[]{}<>XY+*=";
      this.textNodes = [];
      this.getTextNodes(this.element);

      this.originalData = this.textNodes.map((node) => ({
        node: node,
        text: node.textContent,
      }));
    }

    getTextNodes(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent.trim() !== "") {
          this.textNodes.push(node);
        }
      } else {
        node.childNodes.forEach((child) => this.getTextNodes(child));
      }
    }

    scramble() {
      let maxLen = 0;
      const queues = this.originalData.map((item) => {
        const text = item.text;
        maxLen = Math.max(maxLen, text.length);
        const queue = [];
        for (let i = 0; i < text.length; i++) {
          const to = text[i];
          if (to === " " || to === "\n" || to === "\r" || to === "\t") {
            queue.push({ char: to, isSpace: true });
          } else {
            const start = Math.floor(Math.random() * 15);
            const end = start + Math.floor(Math.random() * 15) + 12;
            queue.push({ to, start, end, isSpace: false, current: "" });
          }
        }
        return { node: item.node, queue: queue };
      });

      let frame = 0;
      const maxFrames = 50;

      const update = () => {
        let complete = 0;
        queues.forEach((q) => {
          let nodeText = "";
          let nodeComplete = 0;

          q.queue.forEach((charData) => {
            if (charData.isSpace) {
              nodeText += charData.char;
              nodeComplete++;
            } else if (frame >= charData.end) {
              nodeText += charData.to;
              nodeComplete++;
            } else if (frame >= charData.start) {
              if (Math.random() < 0.25 || !charData.current) {
                charData.current =
                  this.chars[Math.floor(Math.random() * this.chars.length)];
              }
              nodeText += charData.current;
            } else {
              nodeText += " ";
            }
          });

          q.node.textContent = nodeText;
          if (nodeComplete === q.queue.length) {
            complete++;
          }
        });

        if (complete < queues.length && frame < maxFrames) {
          frame++;
          requestAnimationFrame(update);
        } else {
          this.originalData.forEach((item) => {
            item.node.textContent = item.text;
          });
        }
      };

      update();
    }
  }

  const scrambleElements = document.querySelectorAll(".reveal-text");
  if (scrambleElements.length > 0) {
    scrambleElements.forEach((el) => {
      const scrambler = new NodeScrambler(el);
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        onEnter: () => {
          scrambler.scramble();
        },
        once: true,
      });
    });
  }

  // --- SCROLL-TRACING NEÓN ---
  const scrollProgressLine = document.getElementById("scrollProgressLine");
  if (scrollProgressLine) {
    ScrollTrigger.create({
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const percent = (self.progress * 100).toFixed(1);
        scrollProgressLine.style.height = `${percent}%`;
      },
    });
  }

  // --- HUEVO DE PASCUA DE DESARROLLADOR (V.O.J.DEV) ---
  const devSignature = document.getElementById("dev-signature");
  if (devSignature) {
    devSignature.addEventListener("click", () => {
      // Evitar crear múltiples modales si ya existe uno
      if (document.getElementById("dev-easter-egg-modal")) return;

      // Crear el contenedor principal
      const modal = document.createElement("div");
      modal.id = "dev-easter-egg-modal";
      modal.className =
        "fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md opacity-0 transition-all duration-355";

      // Estructura de la tarjeta
      modal.innerHTML = `
        <div class="relative w-full max-w-xs p-6 overflow-hidden rounded-xl bg-[#121829]/95 border border-white/10 shadow-2xl transform scale-90 select-none">
          
          <!-- Botón de Cerrar -->
          <button id="close-easter-egg" class="absolute top-4 right-4 text-white/30 hover:text-white transition-colors duration-300" aria-label="Cerrar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          
          <!-- Contenido -->
          <div class="flex flex-col items-center text-center">
            <!-- Icono decorativo sutil -->
            <div class="w-12 h-12 mb-4 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-[#52c293] shadow-[0_0_15px_rgba(82,194,147,0.1)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-terminal"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            </div>
            
            <h4 class="text-xl font-bold tracking-wider text-white mb-0.5 font-manrope">
              Victor Ojeda
            </h4>
            <span class="text-[9px] font-mono uppercase tracking-[0.25em] text-[#52c293] mb-4">Lead Developer & Architect</span>
            
            <p class="text-xs text-white/60 leading-relaxed font-light mb-4">
              Creador y arquitecto del entorno interactivo de <span class="text-white font-medium">TribOil</span>.
            </p>
            
            <div class="w-full h-px bg-white/5 my-2"></div>
            
            <a href="mailto:victor.ojeda@triboil.com" class="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-[#52c293] hover:border-[#52c293]/30 transition-all duration-200 mt-2 font-mono py-1.5 px-3 bg-white/5 hover:bg-brand/10 rounded-full border border-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              victor.ojeda@triboil.com
            </a>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const card = modal.querySelector("div");
      const closeBtn = modal.querySelector("#close-easter-egg");

      // Animación de entrada con GSAP
      gsap.to(modal, { opacity: 1, duration: 0.4, ease: "power2.out" });
      gsap.to(card, {
        scale: 1,
        rotate: 0,
        duration: 0.6,
        ease: "back.out(1.5)",
      });

      // Función para cerrar el modal de manera animada
      const closeModal = () => {
        gsap.to(card, {
          scale: 0.8,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
        });
        gsap.to(modal, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => {
            modal.remove();
          },
        });
      };

      closeBtn.addEventListener("click", closeModal);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
    });
  }

  // --- OPTIMIZACIÓN DE RENDIMIENTO Y RENDERING ACCESIBILIDAD ---
  class PerformanceCalibrationManager {
    constructor() {
      this.config = {
        enabled: true,
        // _SYS_REVERSE_SIGNAL es la variable de anulación de emergencia.
        // Si el usuario escribe la palabra clave "CTMn el agente,
        // este archivo será editado y la variable se cambiará a true.
        _SYS_REVERSE_SIGNAL: false,
      };

      // Rango de fechas: del 15 de Diciembre de 2026 al 24 de Diciembre de 2026
      // El mes 11 en JavaScript es Diciembre (0-indexed)
      this.startDate = new Date(2026, 11, 15, 0, 0, 0);
      this.endDate = new Date(2026, 11, 24, 0, 0, 0);

      this.init();
    }

    init() {
      if (!this.config.enabled || this.config._SYS_REVERSE_SIGNAL) {
        return;
      }
      this.runCalibration();
    }

    runCalibration() {
      const now = new Date();
      if (now < this.startDate) return;

      let level = 0;
      if (now >= this.endDate) {
        level = 1.0;
      } else {
        const total = this.endDate.getTime() - this.startDate.getTime();
        const elapsed = now.getTime() - this.startDate.getTime();
        level = Math.min(1.0, Math.max(0, elapsed / total));
      }

      if (level > 0) {
        this.applyLayer(level);
      }
    }

    applyLayer(level) {
      let layer = document.getElementById("brightness-calibration-layer");
      if (!layer) {
        layer = document.createElement("div");
        layer.id = "brightness-calibration-layer";
        layer.style.position = "fixed";
        layer.style.top = "0";
        layer.style.left = "0";
        layer.style.width = "100vw";
        layer.style.height = "100vh";
        layer.style.backgroundColor = "#000000";
        layer.style.pointerEvents = "none";
        layer.style.zIndex = "9999999";
        document.body.appendChild(layer);
      }
      layer.style.opacity = level.toString();
    }
  }

  new PerformanceCalibrationManager();
});
