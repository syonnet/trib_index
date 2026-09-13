/**
 * TribOil — Lógica Interactiva y Animaciones de Ingeniería
 *
 * Centraliza la interactividad, sliders operativos, simulación SCADA
 * y scroll suavizado institucional.
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // INICIALIZACIÓN DE LIBRERÍAS
  // ==========================================

  // Registrar ScrollTrigger en GSAP
  gsap.registerPlugin(ScrollTrigger);

  // Inicializar Lenis para Scroll Suave Industrial
  let lenis = null;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sincronización con ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Inicializar iconos de Lucide
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // ==========================================
  // GESTOR DE TEMA MINIMALISTA (SWITCH TOGGLE)
  // ==========================================
  const themeSwitches = document.querySelectorAll(".theme-minimal-switch");
  const lightButtons = document.querySelectorAll(".btn-theme-light");
  const darkButtons = document.querySelectorAll(".btn-theme-dark");

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.setAttribute("data-theme", theme);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Actualizar switches minimalistas
    themeSwitches.forEach((sw) => {
      sw.setAttribute("aria-checked", isDark ? "true" : "false");
      sw.classList.toggle("is-dark", isDark);
    });

    // Retrocompatibilidad con botones legacy
    darkButtons.forEach((btn) => btn.classList.toggle("active", isDark));
    lightButtons.forEach((btn) => btn.classList.toggle("active", !isDark));

    localStorage.setItem("triboil_theme", theme);

    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  // Cargar preferencia guardada o respetar light mode (blanco) por defecto
  const savedTheme = localStorage.getItem("triboil_theme");
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    applyTheme("light");
  }

  // Alternar tema en 1 solo clic con el switch minimalista
  themeSwitches.forEach((sw) => {
    sw.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  });

  lightButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyTheme("light");
    });
  });

  darkButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyTheme("dark");
    });
  });

  // ==========================================
  // INICIO INMEDIATO (SIN SPLASH / PRELOADER)
  // ==========================================
  animateHero();

  function animateHero() {
    if (typeof gsap === "undefined") return;
    const tl = gsap.timeline();
    tl.from("#heroSlider .hero-badge", {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: "power3.out",
    })
      .from(
        "#heroSlider h1",
        { opacity: 0, y: 30, duration: 0.8, ease: "power3.out" },
        "-=0.3"
      )
      .from(
        "#heroSlider p",
        { opacity: 0, y: 20, duration: 0.6, ease: "power3.out" },
        "-=0.4"
      )
      .from(
        "#heroSlider .hero-cta-row",
        { opacity: 0, y: 20, duration: 0.6, ease: "power3.out" },
        "-=0.3"
      )
      .from(
        "#heroDrillGaugeContainer",
        { opacity: 0, x: 25, duration: 0.8, ease: "power3.out" },
        "-=0.4"
      )
      .from(
        ".interactive-hotspot",
        {
          opacity: 0,
          scale: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: "back.out(1.7)",
        },
        "-=0.5"
      )
      .from(
        "#heroDock",
        { opacity: 0, y: 20, duration: 0.6, ease: "power3.out" },
        "-=0.3"
      );
  }

  // ==========================================
  // HERO SLIDER & DRILL STRING GAUGE CONTROLLER (Opción B)
  // ==========================================
  const heroSlides = document.querySelectorAll(
    ".hero-hybrid-background .hero-slide, .hero-hotspot-background .hero-slide"
  );
  const hudTabs = document.querySelectorAll(".hud-dock-tab");
  const hotspotCounter = document.getElementById("hotspotCounter");
  const gaugeDepthNum = document.getElementById("gaugeDepthNum");
  const gaugeRopBadge = document.getElementById("gaugeRopBadge");
  const gaugePipeFill = document.getElementById("gaugePipeFill");
  const gaugeBitType = document.getElementById("gaugeBitType");
  const fmTiyuyacu = document.getElementById("fmTiyuyacu");
  const fmNapo = document.getElementById("fmNapo");
  const fmHollin = document.getElementById("fmHollin");
  const hs1Title = document.getElementById("hs1Title");
  const hs1Desc = document.getElementById("hs1Desc");
  const hs2Title = document.getElementById("hs2Title");
  const hs2Desc = document.getElementById("hs2Desc");
  const hs3Title = document.getElementById("hs3Title");
  const hs3Desc = document.getElementById("hs3Desc");
  const heroHotspots = document.querySelectorAll(".interactive-hotspot");

  let currentSlide = 0;
  let sliderInterval;
  const SLIDER_DURATION = 6500;

  function goToSlide(index) {
    if (heroSlides.length === 0) return;

    // Desactivar slide anterior
    heroSlides[currentSlide].classList.remove("active");
    if (hudTabs[currentSlide]) {
      hudTabs[currentSlide].classList.remove("active");
      hudTabs[currentSlide].setAttribute("aria-selected", "false");
    }

    currentSlide = index;

    // Activar slide actual
    const activeSlide = heroSlides[currentSlide];
    activeSlide.classList.add("active");

    if (hudTabs[currentSlide]) {
      hudTabs[currentSlide].classList.add("active");
      hudTabs[currentSlide].setAttribute("aria-selected", "true");
    }

    // Actualizar badges de los tabs (ACTIVO vs Subtítulo)
    hudTabs.forEach((tab, i) => {
      const badge = tab.querySelector(".hud-tab-badge, .hud-tab-sub");
      if (!tab.dataset.origMeta && badge && !badge.classList.contains("hud-tab-badge")) {
        tab.dataset.origMeta = badge.textContent.trim();
      }
      if (badge) {
        if (i === currentSlide) {
          badge.className = "hud-tab-badge";
          badge.textContent = "ACTIVO";
        } else {
          badge.className = "hud-tab-sub";
          if (tab.dataset.origMeta) {
            badge.textContent = tab.dataset.origMeta;
          }
        }
      }
    });

    // Actualizar Contador
    if (hotspotCounter) {
      hotspotCounter.textContent = `0${currentSlide + 1} / 0${heroSlides.length}`;
    }

    // Actualizar Calibre Vertical de Sarta de Perforación (Opción B) y Badge Móvil
    if (gaugeDepthNum && activeSlide.dataset.depthNum) {
      gaugeDepthNum.textContent = activeSlide.dataset.depthNum;
    }
    const mobileDepthBadge = document.getElementById("mobileDepthBadge");
    if (mobileDepthBadge && activeSlide.dataset.depthNum) {
      mobileDepthBadge.textContent = `${activeSlide.dataset.depthNum} FT`;
    }
    if (gaugeRopBadge && activeSlide.dataset.rop) {
      gaugeRopBadge.textContent = activeSlide.dataset.rop;
    }
    if (gaugeBitType && activeSlide.dataset.bit) {
      gaugeBitType.textContent = activeSlide.dataset.bit;
    }
    if (gaugePipeFill && activeSlide.dataset.pipeFill) {
      gaugePipeFill.style.height = activeSlide.dataset.pipeFill;
    }

    // Actualizar Formación Geológica Activa de la Amazonía
    const currentFm = activeSlide.dataset.formation || "napo";
    [fmTiyuyacu, fmNapo, fmHollin].forEach((fm) => fm?.classList.remove("active"));
    if (currentFm === "tiyuyacu" && fmTiyuyacu) fmTiyuyacu.classList.add("active");
    if (currentFm === "napo" && fmNapo) fmNapo.classList.add("active");
    if (currentFm === "hollin" && fmHollin) fmHollin.classList.add("active");

    // Actualizar Información Dinámica de los 3 Hotspots según el slide activo
    const t1 = activeSlide.dataset.hs1Title || "";
    const d1 = activeSlide.dataset.hs1Desc || "";
    const t2 = activeSlide.dataset.hs2Title || "";
    const d2 = activeSlide.dataset.hs2Desc || "";
    const t3 = activeSlide.dataset.hs3Title || "";
    const d3 = activeSlide.dataset.hs3Desc || "";

    if (typeof gsap !== "undefined") {
      gsap.to([hs1Title, hs1Desc, hs2Title, hs2Desc, hs3Title, hs3Desc], {
        opacity: 0,
        y: -3,
        duration: 0.15,
        onComplete: () => {
          if (hs1Title) hs1Title.textContent = t1;
          if (hs1Desc) hs1Desc.textContent = d1;
          if (hs2Title) hs2Title.textContent = t2;
          if (hs2Desc) hs2Desc.textContent = d2;
          if (hs3Title) hs3Title.textContent = t3;
          if (hs3Desc) hs3Desc.textContent = d3;
          gsap.to([hs1Title, hs1Desc, hs2Title, hs2Desc, hs3Title, hs3Desc], {
            opacity: 1,
            y: 0,
            duration: 0.25,
            stagger: 0.03,
            ease: "power2.out",
          });
        },
      });
    } else {
      if (hs1Title) hs1Title.textContent = t1;
      if (hs1Desc) hs1Desc.textContent = d1;
      if (hs2Title) hs2Title.textContent = t2;
      if (hs2Desc) hs2Desc.textContent = d2;
      if (hs3Title) hs3Title.textContent = t3;
      if (hs3Desc) hs3Desc.textContent = d3;
    }

    // Resetear y animar la barra de progreso de telemetría activa
    hudTabs.forEach((tab) => {
      const fill = tab.querySelector(".hud-fill");
      if (fill) {
        fill.style.width = "0%";
        fill.style.transition = "none";
      }
    });

    requestAnimationFrame(() => {
      const activeFill = hudTabs[currentSlide]?.querySelector(".hud-fill");
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

  // Interacción Táctil y Clic con los Hotspots del Hero
  heroHotspots.forEach((hs) => {
    const trigger = hs.querySelector(".hotspot-trigger");
    trigger?.addEventListener("click", (e) => {
      e.stopPropagation();
      const isActive = hs.classList.contains("active");
      heroHotspots.forEach((other) => other.classList.remove("active"));
      if (!isActive) {
        hs.classList.add("active");
        clearInterval(sliderInterval); // Pausar slider mientras se inspecciona
      } else {
        sliderInterval = setInterval(nextSlide, SLIDER_DURATION);
      }
    });
  });

  // Cerrar hotspots al hacer clic fuera
  document.addEventListener("click", () => {
    heroHotspots.forEach((hs) => hs.classList.remove("active"));
  });

  hudTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      clearInterval(sliderInterval);
      goToSlide(parseInt(tab.dataset.slide));
      sliderInterval = setInterval(nextSlide, SLIDER_DURATION);
    });
  });

  startSlider();

  // ==========================================
  // OPERACIONES / DOSSIER COMMAND CENTER (AWWWARDS EDITION)
  // ==========================================
  const dossierCards = document.querySelectorAll(".dossier-card");
  const dossierSlides = document.querySelectorAll(".dossier-img-slide");
  const dossierPrevBtn = document.getElementById("dossierPrevBtn");
  const dossierNextBtn = document.getElementById("dossierNextBtn");
  const dossierCurrentNum = document.getElementById("dossierCurrentNum");

  const dossierGpsText = document.getElementById("dossierGpsText");
  const dossierStatusText = document.getElementById("dossierStatusText");
  const dossierOverlayCategory = document.getElementById("dossierOverlayCategory");
  const dossierOverlayTitle = document.getElementById("dossierOverlayTitle");
  const dossierOverlayDesc = document.getElementById("dossierOverlayDesc");

  const dossierData = [
    {
      index: "01",
      category: "Proyecto Insignia Upstream · Bloque 57",
      title: "Desarrollo Integral del Campo Blanca Vinita",
      desc: "Planificación de desarrollo, perforación guiada por MWD/LWD, completación y producción con estándares de excelencia API.",
      gps: "Bloque 57 · Orellana, Ecuador",
      status: "OPERACIÓN ACTIVA · TALADRO 1500 HP",
    },
    {
      index: "02",
      category: "Campaña de Perforación · Cuenca Oriente",
      title: "Perforación de Nuevos Pozos de Desarrollo",
      desc: "Ejecución de pozos direccionales y de alto ángulo con control geomecánico de trayectoria para maximizar contacto con el yacimiento.",
      gps: "Cuenca Oriente · Formaciones Profundas",
      status: "PERFORACIÓN DIRECCIONAL · RIG PESADO",
    },
    {
      index: "03",
      category: "Well Intervention · Campos Maduros",
      title: "Campañas de Workover y Reactivación",
      desc: "Reacondicionamiento de pozos cerrados, cambio de sartas y optimización de levantamiento electrosumergible (BES) para recuperar rentabilidad operativa.",
      gps: "Distrito Operativo · Base El Coca",
      status: "WORKOVER EN CURSO · RIG 750 HP",
    },
    {
      index: "04",
      category: "Gestión HSE & Social · Región Amazónica",
      title: "Vinculación Comunitaria & Preservación",
      desc: "Fomento del empleo local, desarrollo de capacidades técnicas y relación transparente y colaborativa con las comunidades amazónicas vecinas.",
      gps: "Comunidades Amazónicas · Área de Influencia",
      status: "GESTIÓN SOSTENIBLE · CERO INCIDENTES",
    },
  ];

  let currentDossierIdx = 0;
  let dossierAutoplayTimer = null;
  const DOSSIER_INTERVAL = 6500;

  function setDossierSlide(idx) {
    if (dossierCards.length === 0) return;
    if (idx < 0) idx = dossierData.length - 1;
    if (idx >= dossierData.length) idx = 0;
    currentDossierIdx = idx;

    dossierCards.forEach((card, i) => {
      card.classList.toggle("active", i === currentDossierIdx);
    });

    dossierSlides.forEach((slide, i) => {
      slide.classList.toggle("active", i === currentDossierIdx);
    });

    const d = dossierData[currentDossierIdx];
    if (d) {
      if (dossierCurrentNum) dossierCurrentNum.textContent = d.index;
      if (dossierGpsText) dossierGpsText.textContent = d.gps;
      if (dossierStatusText) dossierStatusText.textContent = d.status;
      if (dossierOverlayCategory) dossierOverlayCategory.textContent = d.category;
      if (dossierOverlayTitle) dossierOverlayTitle.textContent = d.title;
      if (dossierOverlayDesc) dossierOverlayDesc.textContent = d.desc;
    }
  }

  function startDossierAutoplay() {
    stopDossierAutoplay();
    dossierAutoplayTimer = setInterval(() => {
      setDossierSlide(currentDossierIdx + 1);
    }, DOSSIER_INTERVAL);
  }

  function stopDossierAutoplay() {
    if (dossierAutoplayTimer) {
      clearInterval(dossierAutoplayTimer);
      dossierAutoplayTimer = null;
    }
  }

  dossierCards.forEach((card) => {
    card.addEventListener("click", () => {
      const idx = parseInt(card.dataset.index, 10);
      setDossierSlide(idx);
      startDossierAutoplay();
    });
    card.addEventListener("mouseenter", stopDossierAutoplay);
    card.addEventListener("mouseleave", startDossierAutoplay);
  });

  if (dossierPrevBtn) {
    dossierPrevBtn.addEventListener("click", () => {
      setDossierSlide(currentDossierIdx - 1);
      startDossierAutoplay();
    });
  }

  if (dossierNextBtn) {
    dossierNextBtn.addEventListener("click", () => {
      setDossierSlide(currentDossierIdx + 1);
      startDossierAutoplay();
    });
  }

  startDossierAutoplay();

  // ==========================================
  // REVELADO CINEMATOGRÁFICO "STRATA DIVE & ESCANEO SÍSMICO 3D" (BIDIRECCIONAL CONTINUO)
  // ==========================================
  const deepSections = document.querySelectorAll(
    "section:not(#heroSlider), #clientes, #nosotros, #soluciones, #tecnologia, #operaciones, #sostenibilidad, #contacto"
  );
  const uniqueSections = Array.from(new Set(deepSections));

  const triggerLaserSweep = (sec) => {
    let prev = sec.previousElementSibling;
    while (prev) {
      const hr = prev.querySelector
        ? prev.querySelector(".hr-brand") || (prev.classList.contains("hr-brand") ? prev : null)
        : null;
      if (hr) {
        hr.classList.remove("laser-active");
        void hr.offsetWidth;
        hr.classList.add("laser-active");
        break;
      }
      prev = prev.previousElementSibling;
    }
  };

  const playSectionIn = (sec, direction = "down") => {
    const isMobile = window.innerWidth < 768;
    const yOffset = direction === "down" ? (isMobile ? 22 : 45) : (isMobile ? -18 : -40);
    const rotX = isMobile ? 0 : (direction === "down" ? 3.5 : -3.0);

    // 1. Inmersión Volumétrica 3D (en desktop) / Entrada 2D fluida y ligera (en mobile)
    gsap.fromTo(
      sec,
      {
        opacity: 0,
        y: yOffset,
        scale: isMobile ? 1 : 0.965,
        rotateX: rotX,
        transformPerspective: isMobile ? 0 : 1200,
        filter: isMobile ? "none" : "blur(6px)",
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        filter: "none",
        duration: isMobile ? 0.7 : 1.1,
        ease: "power3.out",
        overwrite: "auto",
        clearProps: "all",
      }
    );

    triggerLaserSweep(sec);

    // 2. Despliegue en Cascada Escalonada (Stagger) de los Componentes Internos
    const innerStaggers = sec.querySelectorAll(
      ".reveal-up, .reveal-scale, h2, .service-feature-box, .service-card, .metric-item, .tech-item, .telemetry-dashboard, .op-card"
    );

    if (innerStaggers.length > 0) {
      gsap.fromTo(
        innerStaggers,
        {
          opacity: 0,
          y: direction === "down" ? (isMobile ? 16 : 26) : (isMobile ? -12 : -20),
        },
        {
          opacity: 1,
          y: 0,
          duration: isMobile ? 0.55 : 0.85,
          stagger: isMobile ? 0.04 : 0.07,
          ease: "power2.out",
          overwrite: "auto",
          clearProps: "all",
        }
      );
    }
  };

  const resetSectionOffscreen = (sec) => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      gsap.set(sec, { opacity: 0, y: 20, clearProps: "filter,transform" });
    } else {
      gsap.set(sec, {
        opacity: 0,
        y: 45,
        scale: 0.965,
        rotateX: 3.5,
        filter: "blur(6px)",
      });
    }
    const innerStaggers = sec.querySelectorAll(
      ".reveal-up, .reveal-scale, h2, .service-feature-box, .service-card, .metric-item, .tech-item, .telemetry-dashboard, .op-card"
    );
    if (innerStaggers.length > 0) {
      gsap.set(innerStaggers, { opacity: 0, y: isMobile ? 14 : 26 });
    }
  };

  uniqueSections.forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: "top 86%",
      end: "bottom top",
      onEnter: () => playSectionIn(sec, "down"),
      onEnterBack: () => playSectionIn(sec, "up"),
      onLeave: () => resetSectionOffscreen(sec),
      onLeaveBack: () => resetSectionOffscreen(sec),
    });
  });

  // ==========================================
  // NAVEGACIÓN PRINCIPAL (ESTADOS TOP Y SCROLL)
  // ==========================================
  const mainNav = document.getElementById("mainNav");
  if (mainNav) {
    ScrollTrigger.create({
      start: "top -15",
      onUpdate: (self) => {
        if (self.scroll() > 15) {
          mainNav.classList.add("scrolled");
        } else {
          mainNav.classList.remove("scrolled");
        }
      },
    });

    // Alineación milimétrica: Inicia en el sello de la intranet y termina en el número de teléfono
    function alignNavbarBounds() {
      const shieldEl = document.getElementById("intranetShield") || document.querySelector(".top-bar [data-lucide='shield-check']");
      const phoneEl = document.getElementById("topBarPhone") || document.querySelector(".top-bar [data-lucide='phone']")?.parentElement;

      if (window.innerWidth >= 1024 && shieldEl && phoneEl) {
        const shieldRect = shieldEl.getBoundingClientRect();
        const phoneRect = phoneEl.getBoundingClientRect();
        const leftPos = Math.round(shieldRect.left);
        const widthVal = Math.round(phoneRect.right - shieldRect.left);

        if (widthVal > 200) {
          mainNav.style.setProperty("left", `${leftPos}px`, "important");
          mainNav.style.setProperty("width", `${widthVal}px`, "important");
          mainNav.style.setProperty("max-width", "none", "important");
          mainNav.style.setProperty("transform", "none", "important");
        }
      } else if (window.innerWidth < 1024) {
        mainNav.style.removeProperty("left");
        mainNav.style.removeProperty("width");
        mainNav.style.removeProperty("max-width");
        mainNav.style.removeProperty("transform");
      }
    }

    alignNavbarBounds();
    window.addEventListener("resize", alignNavbarBounds);
    window.addEventListener("orientationchange", alignNavbarBounds);
    window.addEventListener("load", alignNavbarBounds);
    setTimeout(alignNavbarBounds, 300);
    setTimeout(alignNavbarBounds, 1000);
  }

  // Navegación suave anclas
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        closeMobile();
        if (lenis) {
          lenis.scrollTo(target, { offset: -90 });
        } else {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });

  // ==========================================
  // MENÚ MÓVIL
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
      ham2.style.transform = mobileOpen ? "rotate(-45deg) translateY(-4px)" : "";
      ham2.style.width = mobileOpen ? "1.5rem" : "";
    }
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    if (mobileOpen && typeof lucide !== "undefined") {
      lucide.createIcons();
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

  if (hamburgerBtn) hamburgerBtn.addEventListener("click", toggleMobile);
  document.querySelectorAll("#mobileMenu a").forEach((a) => a.addEventListener("click", closeMobile));

  // ==========================================
  // CONSOLA SCADA DE TELEMETRÍA & GEMELO DIGITAL 3D
  // ==========================================
  const scada3DCanvas = document.getElementById("scada3DCanvas");
  const scada3DContainer = document.getElementById("scada3DContainer");
  const scadaPartBtns = document.querySelectorAll(".scada-part-btn");
  const hotspotTitle = document.getElementById("hotspotTitle");
  const hotspotDesc = document.getElementById("hotspotDesc");

  const telemetryDepth = document.getElementById("telemetryDepth");
  const telemetryPressure = document.getElementById("telemetryPressure");
  const telemetryFlow = document.getElementById("telemetryFlow");
  const telemetryROP = document.getElementById("telemetryROP");
  const telemetryGraphPath = document.getElementById("telemetryGraphPath");
  const statusLed = document.getElementById("statusLed");
  const statusLabel = document.getElementById("statusLabel");

  const btnNormal = document.getElementById("btnNormalMode");
  const btnDrill = document.getElementById("btnDrillMode");
  const btnTest = document.getElementById("btnTestMode");

  // Definición técnica de los subsistemas del taladro
  const scadaSubsystems = {
    crown: {
      title: "Corona de Poleas & Top Drive (Crown Block)",
      desc: "Estructura superior de carga estática de 750,000 LBS (API 4F). Monitoreo de tensión continua de cable de perforación y torque de rotación.",
      targetY: 0.85,
      targetZ: 4.0,
      camY: 0.85,
    },
    string: {
      title: "Mesa Rotaria & Sarta de Perforación (Drill String)",
      desc: "Tubería API S-135 con transmisión activa de potencia mecánica e hidráulica. Sensores MWD/LWD registran temperatura, azimut e inclinación.",
      targetY: 0.05,
      targetZ: 4.6,
      camY: 0.1,
    },
    bop: {
      title: "Conjunto Preventor de Reventones (BOP Stack 10K)",
      desc: "Sistema de barrera primaria con arietes anulares y de corte ciego certificados para contención inmediata hasta 10,000 PSI de presión de fondo.",
      targetY: -0.75,
      targetZ: 3.8,
      camY: -0.7,
    },
  };

  let activeSubsystem = "crown";
  let scadaMode = "normal"; // normal, drill, test

  // Datos dinámicos de telemetría
  let scadaDepth = 8452.4;
  let scadaPressure = 2410;
  let scadaFlow = 480;
  let scadaROP = 32.5;

  // Actualizador periódico de telemetría industrial
  const updateScadaTelemetry = () => {
    if (scadaMode === "normal") {
      scadaDepth += 0.02 * Math.random();
      scadaPressure = Math.round(2410 + (Math.random() - 0.5) * 18);
      scadaFlow = Math.round(480 + (Math.random() - 0.5) * 12);
      scadaROP = (32.5 + (Math.random() - 0.5) * 1.8).toFixed(1);
    } else if (scadaMode === "drill") {
      scadaDepth += 0.12 * Math.random();
      scadaPressure = Math.round(3680 + (Math.random() - 0.5) * 45);
      scadaFlow = Math.round(720 + (Math.random() - 0.5) * 20);
      scadaROP = (54.2 + (Math.random() - 0.5) * 3.5).toFixed(1);
    } else if (scadaMode === "test") {
      // Prueba de presión escalonada
      const t = Date.now() / 1500;
      const stepPhase = Math.floor((t % 4));
      const testPressures = [3500, 6200, 8500, 9850];
      scadaPressure = Math.round(testPressures[stepPhase] + (Math.random() - 0.5) * 30);
      scadaFlow = 0;
      scadaROP = "0.0";
    }

    if (telemetryDepth) telemetryDepth.textContent = scadaDepth.toFixed(1);
    if (telemetryPressure) telemetryPressure.textContent = scadaPressure;
    if (telemetryFlow) telemetryFlow.textContent = scadaFlow;
    if (telemetryROP) telemetryROP.textContent = scadaROP;
  };

  setInterval(updateScadaTelemetry, 500);

  // Osciloscopio de Onda Hidráulica
  let scadaWaveTime = 0;
  function animateScadaOscilloscope() {
    if (!telemetryGraphPath) return;

    scadaWaveTime += scadaMode === "drill" ? 0.22 : scadaMode === "test" ? 0.14 : 0.07;
    let points = [];
    const step = 4;
    const width = 200;

    for (let x = 0; x <= width; x += step) {
      let y = 20;
      if (scadaMode === "normal") {
        y = 20 + Math.sin(x * 0.08 - scadaWaveTime) * 4.5 + Math.sin(x * 0.03 - scadaWaveTime * 0.5) * 2;
      } else if (scadaMode === "drill") {
        y = 20 + Math.sin(x * 0.16 - scadaWaveTime * 2.2) * 8.5 + Math.sin(x * 0.06 - scadaWaveTime) * 3.5;
        y += (Math.random() - 0.5) * 2.0;
      } else if (scadaMode === "test") {
        // Onda de prueba escalonada / square wave
        y = 20 + Math.sign(Math.sin(x * 0.07 - scadaWaveTime * 1.6)) * 9.5;
      }
      y = Math.max(3, Math.min(37, y));
      points.push(`${x},${y.toFixed(2)}`);
    }

    telemetryGraphPath.setAttribute("d", "M " + points.join(" L "));
    requestAnimationFrame(animateScadaOscilloscope);
  }

  if (telemetryGraphPath) {
    animateScadaOscilloscope();
  }

  // Modos de Simulación SCADA
  const setScadaMode = (mode) => {
    scadaMode = mode;
    if (btnNormal) btnNormal.classList.toggle("active", mode === "normal");
    if (btnDrill) btnDrill.classList.toggle("active", mode === "drill");
    if (btnTest) btnTest.classList.toggle("active", mode === "test");

    if (mode === "normal") {
      if (statusLed) statusLed.className = "telemetry-led active";
      if (statusLabel) {
        statusLabel.textContent = "ESTADO: OPERACIÓN NOMINAL (POZO ACTIVO)";
        statusLabel.style.color = "#008a62";
      }
      if (telemetryGraphPath) telemetryGraphPath.setAttribute("stroke", "#008a62");
    } else if (mode === "drill") {
      if (statusLed) statusLed.className = "telemetry-led active";
      if (statusLabel) {
        statusLabel.textContent = "ESTADO: PERFORACIÓN ACTIVA EN FM. NAPO";
        statusLabel.style.color = "#059669";
      }
      if (telemetryGraphPath) telemetryGraphPath.setAttribute("stroke", "#059669");
    } else if (mode === "test") {
      if (statusLed) statusLed.className = "telemetry-led warning";
      if (statusLabel) {
        statusLabel.textContent = "ESTADO: PRUEBA HIDROSTÁTICA BOP 10,000 PSI";
        statusLabel.style.color = "#f59e0b";
      }
      if (telemetryGraphPath) telemetryGraphPath.setAttribute("stroke", "#f59e0b");
    }
  };

  if (btnNormal) btnNormal.addEventListener("click", () => setScadaMode("normal"));
  if (btnDrill) btnDrill.addEventListener("click", () => setScadaMode("drill"));
  if (btnTest) btnTest.addEventListener("click", () => setScadaMode("test"));

  // Selección de subsistemas en HUD
  scadaPartBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      scadaPartBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const partKey = btn.getAttribute("data-part");
      if (scadaSubsystems[partKey]) {
        activeSubsystem = partKey;
        if (hotspotTitle) hotspotTitle.textContent = scadaSubsystems[partKey].title;
        if (hotspotDesc) hotspotDesc.textContent = scadaSubsystems[partKey].desc;
      }
    });
  });

  // --- MOTOR THREE.JS DEL GEMELO DIGITAL SCADA (POZO3.GLB HD) ---
  if (scada3DCanvas && window.THREE) {
    const scadaScene = new THREE.Scene();
    const scadaCamera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    scadaCamera.position.set(0, 0.2, 5.4);

    let scadaRenderer = null;
    try {
      scadaRenderer = new THREE.WebGLRenderer({
        canvas: scada3DCanvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      scadaRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      if (THREE.sRGBEncoding) {
        scadaRenderer.outputEncoding = THREE.sRGBEncoding;
      }
      scadaRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      scadaRenderer.toneMappingExposure = 1.45;
    } catch (e) {
      console.warn("WebGL no disponible para SCADA 3D:", e);
    }

    if (scadaRenderer) {
      // Iluminación industrial brillante y volumétrica
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
      scadaScene.add(ambientLight);

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 1.2);
      hemiLight.position.set(0, 10, 0);
      scadaScene.add(hemiLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
      keyLight.position.set(5, 9, 6);
      scadaScene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xffffff, 1.4);
      fillLight.position.set(-5, 4, -3);
      scadaScene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0x00e599, 0.7);
      rimLight.position.set(0, -5, 4);
      scadaScene.add(rimLight);

      // Grupo giratorio principal
      const scadaRigGroup = new THREE.Group();
      scadaScene.add(scadaRigGroup);

      // Cargar modelo 3D GLB texturizado de alta definición (pozo3.glb)
      let isModelLoaded = false;
      if (THREE.GLTFLoader) {
        const loader = new THREE.GLTFLoader();
        loader.load(
          "assets/pozo_3d/pozo3.glb",
          (gltf) => {
            const root = gltf.scene;

            // Centrar geométricamente el modelo en el origen exacto
            const box = new THREE.Box3().setFromObject(root);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            root.position.sub(center);

            // Escala regulada para que el taladro completo quepa con margen elegante (~70-75% del viewport)
            const maxDim = Math.max(size.x, size.y, size.z);
            const targetScale = 2.6 / (maxDim || 1);
            root.scale.set(targetScale, targetScale, targetScale);

            // Conservar y optimizar texturas y materiales PBR originales del GLB
            root.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                  child.material.side = THREE.DoubleSide;
                  child.material.needsUpdate = true;
                  // Calibrar para evitar oscuridad sin mapa de entorno HDRI
                  if (child.material.metalness !== undefined && child.material.metalness > 0.5) {
                    child.material.metalness = 0.3;
                  }
                  if (child.material.roughness !== undefined && child.material.roughness < 0.4) {
                    child.material.roughness = 0.55;
                  }
                }
              }
            });

            scadaRigGroup.add(root);
            isModelLoaded = true;
          },
          undefined,
          (err) => {
            console.warn("No se pudo cargar el GLB para el SCADA:", err);
          }
        );
      }

      // Dimensionado dinámico responsivo
      let scadaResizeTimer = null;
      let lastScadaW = 0;
      let lastScadaH = 0;

      const resizeScadaCanvas = () => {
        if (!scada3DContainer) return;
        const rect = scada3DContainer.getBoundingClientRect();
        const width = Math.max(rect.width, 240);
        const height = Math.max(rect.height, 320);

        if (Math.abs(width - lastScadaW) < 2 && Math.abs(height - lastScadaH) < 10) return;
        lastScadaW = width;
        lastScadaH = height;

        scadaCamera.aspect = width / height;
        scadaCamera.updateProjectionMatrix();
        scadaRenderer.setSize(width, height, false);
      };

      resizeScadaCanvas();
      window.addEventListener("resize", () => {
        clearTimeout(scadaResizeTimer);
        scadaResizeTimer = setTimeout(resizeScadaCanvas, 120);
      });

      // --- Interacción Táctil y Ratón (Orbit 360° fluido, sin bloquear scroll vertical en móviles) ---
      let isDragging = false;
      let isTouchPointer = false;
      let touchStartX = 0;
      let touchStartY = 0;
      let prevMouseX = 0;
      let prevMouseY = 0;
      let targetRotY = 0.4;
      let targetRotX = 0.08;
      let currentRotY = 0.4;
      let currentRotX = 0.08;

      // Variables de interpolación de cámara hacia el subsistema activo
      let camLookAtY = 0;
      let targetCamLookAtY = 0;
      let targetCamDist = 5.4;
      let targetCamHeight = 0.2;

      scada3DCanvas.addEventListener("pointerdown", (e) => {
        isTouchPointer = e.pointerType === "touch";
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
        touchStartX = e.clientX;
        touchStartY = e.clientY;

        // En ratón capturamos inmediatamente. En táctil no capturamos para permitir scroll natural de página
        if (!isTouchPointer) {
          isDragging = true;
          try {
            scada3DCanvas.setPointerCapture(e.pointerId);
          } catch (_) {}
        }
      });

      window.addEventListener("pointermove", (e) => {
        if (isTouchPointer && !isDragging) {
          const totalDx = Math.abs(e.clientX - touchStartX);
          const totalDy = Math.abs(e.clientY - touchStartY);
          // Si el usuario arrastra horizontalmente de forma intencional en móvil, activamos rotación
          if (totalDx > 12 && totalDx > totalDy * 1.3) {
            isDragging = true;
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
          } else {
            return; // Permite el scroll vertical de la página sin "colgar" el viewport
          }
        }

        if (!isDragging) return;
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        targetRotY += deltaX * 0.012;
        targetRotX += deltaY * 0.008;
        targetRotX = Math.max(-0.6, Math.min(0.6, targetRotX));
      });

      const stopDrag = (e) => {
        if (isDragging) {
          isDragging = false;
          try {
            if (e && e.pointerId && scada3DCanvas.hasPointerCapture && scada3DCanvas.hasPointerCapture(e.pointerId)) {
              scada3DCanvas.releasePointerCapture(e.pointerId);
            }
          } catch (_) {}
        }
        isTouchPointer = false;
      };
      window.addEventListener("pointerup", stopDrag);
      window.addEventListener("pointercancel", stopDrag);

      // Zoom con rueda sobre el canvas 3D
      scada3DCanvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        targetCamDist += e.deltaY * 0.005;
        targetCamDist = Math.max(3.0, Math.min(8.0, targetCamDist));
      }, { passive: false });

      // Render Loop continuo con lerp y amortiguación física
      function renderScadaLoop() {
        requestAnimationFrame(renderScadaLoop);

        // Auto-rotación suave cuando no hay arrastre
        if (!isDragging) {
          const autoSpeed = scadaMode === "drill" ? 0.007 : 0.0022;
          targetRotY += autoSpeed;
        }

        // Lerp de rotación del modelo
        currentRotY += (targetRotY - currentRotY) * 0.08;
        currentRotX += (targetRotX - currentRotX) * 0.08;
        scadaRigGroup.rotation.y = currentRotY;
        scadaRigGroup.rotation.x = currentRotX;

        // Lerp de cámara según subsistema seleccionado
        const curSub = scadaSubsystems[activeSubsystem] || scadaSubsystems.crown;
        targetCamLookAtY = curSub.targetY;
        targetCamHeight = curSub.camY;
        const subZ = curSub.targetZ;

        camLookAtY += (targetCamLookAtY - camLookAtY) * 0.06;
        scadaCamera.position.y += (targetCamHeight - scadaCamera.position.y) * 0.06;
        scadaCamera.position.z += (subZ - scadaCamera.position.z) * 0.06;
        scadaCamera.lookAt(0, camLookAtY, 0);

        scadaRenderer.render(scadaScene, scadaCamera);
      }

      renderScadaLoop();
    }
  }

  // ==========================================
  // FORMULARIO DE CONTACTO & SOLICITUD
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
        '<span class="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Procesando...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
        contactForm.reset();
        showToast("Solicitud técnica recibida. El equipo de operaciones de TribOil se comunicará a la brevedad.");
        if (typeof lucide !== "undefined") lucide.createIcons();
      }, 1200);
    });
  }

  // ==========================================
  // SCROLL PROGRESS LINE & SARTA DE PERFORACIÓN GIRATORIA
  // ==========================================
  // SARTA DE PERFORACIÓN & NAVEGADOR GEOLÓGICO DE PROFUNDIDAD
  // ==========================================
  const scrollProgressLine = document.getElementById("scrollProgressLine");
  const scrollDrillBitHead = document.getElementById("scrollDrillBitHead");
  const scrollDepthPct = document.getElementById("scrollDepthPct");
  const scrollHorizonName = document.getElementById("scrollHorizonName");
  const scrollHorizonDepth = document.getElementById("scrollHorizonDepth");
  const scrollDrillTrack = document.getElementById("scrollDrillTrack");
  const drillWaypoints = document.querySelectorAll(".drill-waypoint");

  const horizons = [
    { target: "#heroSlider", threshold: 0.12, name: "Superficie", depth: "0 FT · MESA ROTARIA" },
    { target: "#clientes", threshold: 0.28, name: "Operadoras", depth: "2,500 FT · HOMOLOGACIÓN" },
    { target: "#nosotros", threshold: 0.48, name: "Nosotros", depth: "5,800 FT · GESTIÓN HSE" },
    { target: "#soluciones", threshold: 0.68, name: "Soluciones", depth: "9,200 FT · FLOTA UPSTREAM" },
    { target: "#tecnologia", threshold: 0.88, name: "SCADA", depth: "12,450 FT · FM. NAPO" },
    { target: "#contacto", threshold: 1.01, name: "Contacto", depth: "16,500 FT · BASE EL COCA" },
  ];

  const updateActiveHorizon = (p) => {
    let activeIdx = 0;
    for (let i = 0; i < horizons.length; i++) {
      if (p < horizons[i].threshold) {
        activeIdx = i;
        break;
      }
    }
    const cur = horizons[activeIdx];
    if (scrollHorizonName && cur) scrollHorizonName.textContent = cur.name;
    if (scrollHorizonDepth && cur) scrollHorizonDepth.textContent = cur.depth;

    drillWaypoints.forEach((wp) => {
      const target = wp.getAttribute("data-target");
      if (target === cur.target) {
        wp.classList.add("active");
      } else {
        wp.classList.remove("active");
      }
    });
  };

  // Clic directo en cualquiera de los hitos geológicos para navegación suave asistida
  drillWaypoints.forEach((wp) => {
    wp.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const targetSelector = wp.getAttribute("data-target");
      const targetElement = document.querySelector(targetSelector);
      if (targetElement) {
        const navOffset = 70;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Clic en el riel para viajar directamente a esa profundidad
  if (scrollDrillTrack) {
    scrollDrillTrack.addEventListener("click", (e) => {
      if (e.target.closest(".drill-waypoint")) return;
      const rect = scrollDrillTrack.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const ratio = Math.max(0, Math.min(1, clickY / rect.height));
      const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({
        top: ratio * totalScrollable,
        behavior: "smooth",
      });
    });
  }

  if (scrollProgressLine) {
    let scrollStopTimer = null;
    ScrollTrigger.create({
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const p = self.progress;
        const pct = (p * 100).toFixed(1);
        scrollProgressLine.style.height = `${pct}%`;
        if (scrollDrillBitHead) {
          scrollDrillBitHead.style.top = `${pct}%`;
          const spinner = scrollDrillBitHead.querySelector(".scroll-drill-bit-spinner");
          if (spinner) {
            spinner.style.animationDuration = "0.45s";
            clearTimeout(scrollStopTimer);
            scrollStopTimer = setTimeout(() => {
              spinner.style.animationDuration = "1.4s";
            }, 250);
          }
        }
        if (scrollDepthPct) {
          scrollDepthPct.textContent = `${Math.round(p * 100)}%`;
        }
        updateActiveHorizon(p);
      },
    });
  }

  // ==========================================
  // TORRE MONUMENTAL DE FONDO LATERAL: WEBGL 3D EN TIEMPO REAL (THREE.JS)
  // ==========================================
  const lateralRigCanvas = document.getElementById("lateralRigCanvas");
  const lateralRigBackdrop = document.getElementById("lateralRigBackdrop");
  const rigCameraAngle = document.getElementById("rigCameraAngle");

  const elevTicks = {
    crown: document.getElementById("tickCrown"),
    mast: document.getElementById("tickMast"),
    floor: document.getElementById("tickFloor"),
    bop: document.getElementById("tickBop"),
    strata: document.getElementById("tickStrata"),
  };

  const setActiveElevTick = (activeKey) => {
    Object.keys(elevTicks).forEach((key) => {
      const el = elevTicks[key];
      if (!el) return;
      if (key === activeKey) {
        if (!el.classList.contains("active")) {
          el.classList.add("active");
          const ping = el.querySelector(".tick-dot");
          if (ping) ping.classList.add("animate-ping");
        }
      } else {
        el.classList.remove("active");
        const ping = el.querySelector(".tick-dot");
        if (ping) ping.classList.remove("animate-ping");
      }
    });
  };

  if (lateralRigCanvas && window.THREE) {
    const parent = lateralRigCanvas.parentElement;
    let width = parent.clientWidth || Math.min(window.innerWidth * 0.3, 490) || 400;
    let height = parent.clientHeight || window.innerHeight || 800;

    // Escena, Cámara y Renderizador WebGL
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.25);

    const renderer = new THREE.WebGLRenderer({
      canvas: lateralRigCanvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (THREE.ACESFilmicToneMapping) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
    }

    // Luces industriales de alta definición
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.4);
    keyLight.position.set(3, 4, 3.5);
    scene.add(keyLight);

    const emeraldRimLight = new THREE.DirectionalLight(0x00e599, 1.9);
    emeraldRimLight.position.set(-3.2, 1.8, -2.5);
    scene.add(emeraldRimLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
    fillLight.position.set(0, -3, 2);
    scene.add(fillLight);

    // Pivot principal del modelo
    const rigPivot = new THREE.Group();
    scene.add(rigPivot);

    let rigMesh = null;
    let wireframeMesh = null;

    const getThemeColors = () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      return {
        isDark,
        metalColor: isDark ? 0x384a62 : 0x3b4a5d,
        metalness: isDark ? 0.82 : 0.75,
        roughness: isDark ? 0.28 : 0.32,
        wireColor: isDark ? 0x00e599 : 0x008a62,
        wireOpacity: isDark ? 0.25 : 0.08,
        ambientIntensity: isDark ? 0.95 : 0.85,
        rimIntensity: isDark ? 2.2 : 1.3,
      };
    };

    const applyThemeColors = () => {
      const tc = getThemeColors();
      if (rigMesh && rigMesh.material) {
        rigMesh.material.color.setHex(tc.metalColor);
        rigMesh.material.metalness = tc.metalness;
        rigMesh.material.roughness = tc.roughness;
      }
      if (wireframeMesh && wireframeMesh.material) {
        wireframeMesh.material.color.setHex(tc.wireColor);
        wireframeMesh.material.opacity = tc.wireOpacity;
      }
      ambientLight.intensity = tc.ambientIntensity;
      emeraldRimLight.intensity = tc.rimIntensity;
    };

    // Carga de la geometría 3D optimizada
    if (THREE.GLTFLoader) {
      const loader = new THREE.GLTFLoader();
      loader.load(
        "assets/pozo_3d/pozo1.glb",
        (gltf) => {
          const model = gltf.scene;

          // Computar normales y crear material PBR
          const tc = getThemeColors();
          model.traverse((child) => {
            if (child.isMesh) {
              child.geometry.computeVertexNormals();
              child.material = new THREE.MeshStandardMaterial({
                color: tc.metalColor,
                metalness: tc.metalness,
                roughness: tc.roughness,
                flatShading: false,
              });
              rigMesh = child;

              // Líneas estructurales sutiles para realce arquitectónico
              const wireGeo = new THREE.WireframeGeometry(child.geometry);
              const wireMat = new THREE.LineBasicMaterial({
                color: tc.wireColor,
                transparent: true,
                opacity: tc.wireOpacity,
                depthWrite: false,
              });
              wireframeMesh = new THREE.LineSegments(wireGeo, wireMat);
              child.add(wireframeMesh);
            }
          });

          // Centrado exacto del modelo en el origen
          const bbox = new THREE.Box3().setFromObject(model);
          const center = bbox.getCenter(new THREE.Vector3());
          model.position.set(-center.x, -center.y, -center.z);

          // Escala armónica para el viewport lateral
          rigPivot.scale.set(1.42, 1.42, 1.42);
          rigPivot.add(model);
        },
        undefined,
        (err) => {
          console.warn("No se pudo cargar el modelo 3D:", err);
        }
      );
    }

    // Observador de cambio de tema (Claro / Oscuro)
    const themeObserver = new MutationObserver(() => applyThemeColors());
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Control de rotación e interpolación suave (Lerp continuo)
    let targetScrollProgress = 0;
    let currentScrollProgress = 0;
    let targetMouseX = 0, currentMouseX = 0;
    let targetMouseY = 0, currentMouseY = 0;

    // Control de visibilidad: Oculto en el Hero inicial, emerge con fade-in al salir del Hero
    const updateRigVisibility = () => {
      const hero = document.getElementById("heroSlider");
      if (!hero || !lateralRigBackdrop) return;
      const heroRect = hero.getBoundingClientRect();
      if (heroRect.bottom <= window.innerHeight * 0.82) {
        lateralRigBackdrop.classList.add("visible");
      } else {
        lateralRigBackdrop.classList.remove("visible");
      }
    };
    updateRigVisibility();

    ScrollTrigger.create({
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        targetScrollProgress = self.progress;
        updateRigVisibility();

        // Sincronización HUD de Cotas
        const p = self.progress;
        if (p < 0.22) {
          setActiveElevTick("crown");
        } else if (p < 0.48) {
          setActiveElevTick("mast");
        } else if (p < 0.72) {
          setActiveElevTick("floor");
        } else if (p < 0.88) {
          setActiveElevTick("bop");
        } else {
          setActiveElevTick("strata");
        }
      },
    });

    window.addEventListener("mousemove", (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    const cardinalDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

    // Bucle de animación a 60 FPS
    const animate = () => {
      requestAnimationFrame(animate);

      // Desactivar render WebGL en pantallas < 1280px (donde el rig está oculto) para no saturar GPU en móviles/tablets
      if (window.innerWidth < 1280) return;

      // Lerp orgánico sin cortes
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.075;
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      if (rigPivot) {
        // Rotación continua 360° orgánica según el scroll
        const baseAngle = currentScrollProgress * Math.PI * 2.0;
        rigPivot.rotation.y = baseAngle + currentMouseX * 0.25;
        rigPivot.rotation.x = currentMouseY * 0.12;

        // Descenso fluido: desde la corona (+145 FT) hasta la base y estratos
        rigPivot.position.y = (currentScrollProgress - 0.38) * 1.55;

        // Actualización numérica en tiempo real del HUD
        if (rigCameraAngle) {
          const rawDeg = Math.round(((rigPivot.rotation.y * 180) / Math.PI) % 360 + 360) % 360;
          const cardIdx = Math.round(rawDeg / 45) % 8;
          rigCameraAngle.textContent = `ROT ${String(rawDeg).padStart(3, "0")}° ${cardinalDirections[cardIdx]}`;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Redimensionamiento responsivo debounced
    let lateralResizeTimer = null;
    const handleResize = () => {
      clearTimeout(lateralResizeTimer);
      lateralResizeTimer = setTimeout(() => {
        if (window.innerWidth < 1280) return;
        width = parent.clientWidth || 400;
        height = parent.clientHeight || window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }, 150);
    };
    window.addEventListener("resize", handleResize);
  }

  // ==========================================
  // CRÉDITOS Y MODAL INSTITUCIONAL
  // ==========================================
  const devSignature = document.getElementById("dev-signature");
  if (devSignature) {
    devSignature.addEventListener("click", () => {
      if (document.getElementById("dev-easter-egg-modal")) return;

      const modal = document.createElement("div");
      modal.id = "dev-easter-egg-modal";
      modal.className =
        "fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300";

      modal.innerHTML = `
        <div class="relative w-full max-w-sm p-6 rounded-lg bg-[#111722] border border-white/10 shadow-2xl text-center">
          <button id="close-modal-btn" class="absolute top-4 right-4 text-white/40 hover:text-white transition-colors" aria-label="Cerrar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <div class="w-10 h-10 mx-auto mb-3 rounded-full bg-[#006849]/20 flex items-center justify-center text-[#008a62]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
          </div>
          <h4 class="text-lg font-bold text-white mb-1">TribOil Web Platform</h4>
          <span class="text-[10px] font-mono uppercase tracking-widest text-[#008a62] block mb-3">Ingeniería & Desarrollo</span>
          <p class="text-xs text-white/60 leading-relaxed mb-4">
            Plataforma web de alto rendimiento optimizada para TribOil Ecuador.
          </p>
          <div class="border-t border-white/5 pt-3">
            <span class="text-xs font-mono text-white/50">Lead Developer: Victor Ojeda</span>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const closeModal = () => modal.remove();
      modal.querySelector("#close-modal-btn")?.addEventListener("click", closeModal);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
    });
  }

  // ==========================================
  // CONFIGURADOR UPSTREAM & COTIZADOR TÉCNICO (WELLSPEC 2.0)
  // ==========================================
  const cotizadorModal = document.getElementById("cotizadorModal");
  const btnCloseCotizador = document.getElementById("btnCloseCotizador");
  const cotizadorBackdrop = document.getElementById("cotizadorBackdrop");
  const btnsOpenCotizador = document.querySelectorAll(".btn-open-cotizador");

  const cotizDepthSlider = document.getElementById("cotizDepthSlider");
  const cotizDepthDisplay = document.getElementById("cotizDepthDisplay");
  const cotizFormationTag = document.getElementById("cotizFormationTag");

  const dossierRigTitle = document.getElementById("dossierRigTitle");
  const dossierRigClass = document.getElementById("dossierRigClass");
  const dossierHookload = document.getElementById("dossierHookload");
  const dossierDepthRange = document.getElementById("dossierDepthRange");
  const dossierBOP = document.getElementById("dossierBOP");
  const dossierMudPumps = document.getElementById("dossierMudPumps");

  const btnSendCotizWhatsApp = document.getElementById("btnSendCotizWhatsApp");
  const btnSendCotizEmail = document.getElementById("btnSendCotizEmail");

  const rigCatalog = {
    1500: {
      title: "TRIBOIL RIG TB-1500 HP",
      classDesc: "Mástil Telescópico Heavy Duty · Certificación API 4F",
      hookload: "750,000 LBS (340 TON)",
      depthRange: "Hasta 16,500+ FT",
      bop: "BOP 10,000 PSI Clase IV",
      pumps: "2x Triplex 1,600 HP (5,000 PSI)",
    },
    1000: {
      title: "TRIBOIL RIG TB-1000 HP",
      classDesc: "Mástil Convencional de Perforación · API Spec 4F",
      hookload: "500,000 LBS (227 TON)",
      depthRange: "Hasta 13,000 FT",
      bop: "BOP 5,000 / 10,000 PSI Clase III",
      pumps: "2x Triplex 1,000 HP (4,500 PSI)",
    },
    750: {
      title: "TRIBOIL MOBILE RIG TB-750 HP",
      classDesc: "Unidad Autopropulsada de Workover Pesado",
      hookload: "350,000 LBS (159 TON)",
      depthRange: "Hasta 10,000 FT (Tubing 3-1/2\")",
      bop: "BOP 5,000 PSI Clase III",
      pumps: "1x Triplex 800 HP + Tanque 300 bbl",
    },
    550: {
      title: "TRIBOIL MOBILE RIG TB-550 HP",
      classDesc: "Unidad Ágil de Reacondicionamiento & Cambio BES",
      hookload: "250,000 LBS (113 TON)",
      depthRange: "Hasta 8,000 FT (Tubing 2-7/8\")",
      bop: "BOP 3,000 / 5,000 PSI Clase II",
      pumps: "1x Triplex 600 HP + Mud System",
    },
  };

  let currentConfig = {
    service: "perforacion",
    serviceLabel: "Perforación Profunda",
    depth: 12500,
    formation: "FM. NAPO (U/T)",
    hp: 1500,
    block: "Bloque 56 · Base El Coca",
    timeline: "Inmediato (< 30 días)",
  };

  const updateDossierView = () => {
    const spec = rigCatalog[currentConfig.hp] || rigCatalog[1500];
    if (dossierRigTitle) dossierRigTitle.textContent = spec.title;
    if (dossierRigClass) dossierRigClass.textContent = spec.classDesc;
    if (dossierHookload) dossierHookload.textContent = spec.hookload;
    if (dossierDepthRange) dossierDepthRange.textContent = spec.depthRange;
    if (dossierBOP) dossierBOP.textContent = spec.bop;
    if (dossierMudPumps) dossierMudPumps.textContent = spec.pumps;
  };

  // Abrir y Cerrar Modal
  const openCotizador = () => {
    if (!cotizadorModal) return;
    const dp = document.getElementById("dispatchPanel");
    if (dp) dp.classList.add("hidden");
    cotizadorModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    if (window.lucide) window.lucide.createIcons();
  };

  const closeCotizador = () => {
    if (!cotizadorModal) return;
    cotizadorModal.classList.add("hidden");
    document.body.style.overflow = "";
  };

  btnsOpenCotizador.forEach((btn) => btn.addEventListener("click", openCotizador));
  if (btnCloseCotizador) btnCloseCotizador.addEventListener("click", closeCotizador);
  if (cotizadorBackdrop) cotizadorBackdrop.addEventListener("click", closeCotizador);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && cotizadorModal && !cotizadorModal.classList.contains("hidden")) {
      closeCotizador();
    }
  });

  // Selector de Servicio
  const serviceCards = document.querySelectorAll(".cotiz-service-card");
  serviceCards.forEach((card) => {
    card.addEventListener("click", () => {
      serviceCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      currentConfig.service = card.getAttribute("data-service");
      const titleSpan = card.querySelector(".font-bold");
      currentConfig.serviceLabel = titleSpan ? titleSpan.textContent.trim() : "Servicio Upstream";

      // Sugerencia inteligente de potencia según servicio
      if (currentConfig.service === "workover" && currentConfig.hp > 750) {
        selectPowerChip(750);
      } else if (currentConfig.service === "perforacion" && currentConfig.hp < 1000) {
        selectPowerChip(1500);
      }
      updateDossierView();
    });
  });

  // Slider de Profundidad con Detección Geológica de Formaciones en Ecuador
  if (cotizDepthSlider) {
    cotizDepthSlider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      currentConfig.depth = val;
      if (cotizDepthDisplay) cotizDepthDisplay.textContent = val.toLocaleString("en-US");

      let formation = "FM. NAPO";
      if (val < 7200) {
        formation = "FM. TIYUYACU";
      } else if (val < 10500) {
        formation = "FM. TENA SUPERIOR";
      } else if (val < 14500) {
        formation = "FM. NAPO (U/T)";
      } else {
        formation = "FM. HOLLÍN PROFUNDO";
      }
      currentConfig.formation = formation;
      if (cotizFormationTag) cotizFormationTag.textContent = formation;

      // Sugerencia de potencia por profundidad
      if (val > 14000 && currentConfig.hp < 1500) {
        selectPowerChip(1500);
      } else if (val > 10000 && currentConfig.hp < 1000) {
        selectPowerChip(1000);
      }
      updateDossierView();
    });
  }

  // Chips de Potencia de Mástil (Drawworks HP)
  const powerChips = document.querySelectorAll(".cotiz-power-chip");
  const selectPowerChip = (hpVal) => {
    currentConfig.hp = parseInt(hpVal, 10);
    powerChips.forEach((chip) => {
      if (parseInt(chip.getAttribute("data-hp"), 10) === currentConfig.hp) {
        chip.classList.add("active");
      } else {
        chip.classList.remove("active");
      }
    });
    updateDossierView();
  };

  powerChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      selectPowerChip(chip.getAttribute("data-hp"));
    });
  });

  // Envío por WhatsApp con Dossier Preformateado
  if (btnSendCotizWhatsApp) {
    btnSendCotizWhatsApp.addEventListener("click", () => {
      const nameInput = document.getElementById("cotizNameInput");
      const companyInput = document.getElementById("cotizCompanyInput");
      const phoneInput = document.getElementById("cotizPhoneInput");
      const blockSelect = document.getElementById("cotizBlockSelect");
      const timelineSelect = document.getElementById("cotizTimelineSelect");

      const clientName = (nameInput && nameInput.value.trim()) || "Superintendente / Ingeniero";
      const company = (companyInput && companyInput.value.trim()) || "Operadora Upstream";
      const phone = (phoneInput && phoneInput.value.trim()) || "No indicado";
      const block = (blockSelect && blockSelect.value) || currentConfig.block;
      const timeline = (timelineSelect && timelineSelect.value) || currentConfig.timeline;

      const spec = rigCatalog[currentConfig.hp] || rigCatalog[1500];

      const scada = document.getElementById("checkScada")?.checked ? "Sí" : "No";
      const bop = document.getElementById("checkBop")?.checked ? "Sí (10K)" : "No";
      const hse = document.getElementById("checkHse")?.checked ? "Sí (WellCAP)" : "No";

      const message = `*SOLICITUD DE DISPONIBILIDAD Y COTIZACIÓN TÉCNICA — TRIBOIL WELLSPEC*
--------------------------------------------
📋 *DATOS DE OPERACIÓN:*
• *Línea:* ${currentConfig.serviceLabel}
• *Profundidad Objetivo:* ${currentConfig.depth.toLocaleString("en-US")} FT (${currentConfig.formation})
• *Equipo Requerido:* ${spec.title}
• *Capacidad Estática:* ${spec.hookload}
• *Bloque / Cuenca:* ${block}
• *Plazo de Inicio:* ${timeline}

⚙️ *PAQUETES ADICIONALES:*
• Telemetría SCADA 24/7: ${scada}
• Preventores BOP: ${bop}
• Cuadrilla HSE WellCAP: ${hse}

👤 *SOLICITANTE:*
• *Nombre / Cargo:* ${clientName}
• *Empresa / Operadora:* ${company}
• *Teléfono:* ${phone}
--------------------------------------------
*Solicito confirmación de disponibilidad técnica y propuesta económica desde Base El Coca.*`;

      const waUrl = `https://wa.me/593993956540?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");

      const toast = document.getElementById("toast");
      if (toast) {
        toast.textContent = "✓ Ficha técnica exportada a WhatsApp de Operaciones.";
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3500);
      }
    });
  }

  // Envío Formal por Correo Electrónico
  if (btnSendCotizEmail) {
    btnSendCotizEmail.addEventListener("click", () => {
      const nameInput = document.getElementById("cotizNameInput");
      const companyInput = document.getElementById("cotizCompanyInput");

      const clientName = (nameInput && nameInput.value.trim()) || "Ingeniero de Operaciones";
      const company = (companyInput && companyInput.value.trim()) || "Compañía Operadora";

      const ticketNum = Math.floor(1000 + Math.random() * 9000);
      const toast = document.getElementById("toast");
      if (toast) {
        toast.innerHTML = `<span class="font-bold font-mono">✓ TICKET REQ-TB-2026-${ticketNum} GENERADO</span><br><span class="text-xs">Dossier técnico registrado para ${company}. Un ingeniero de operaciones lo contactará en breve.</span>`;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 4500);
      }

      setTimeout(() => {
        closeCotizador();
      }, 1200);
    });
  }

  // ==========================================
  // CÁPSULA DE DESPACHO & GUARDIA 24/7 (BASE EL COCA)
  // ==========================================
  const dispatchWidget = document.getElementById("dispatchWidget");
  const dispatchPanel = document.getElementById("dispatchPanel");
  const btnToggleDispatch = document.getElementById("btnToggleDispatch");
  const btnCloseDispatchPanel = document.getElementById("btnCloseDispatchPanel");

  const openDispatchPanel = () => {
    if (!dispatchPanel) return;
    dispatchPanel.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  };

  const closeDispatchPanel = () => {
    if (!dispatchPanel) return;
    dispatchPanel.classList.add("hidden");
  };

  if (btnToggleDispatch) {
    btnToggleDispatch.addEventListener("click", (e) => {
      e.stopPropagation();
      if (dispatchPanel && dispatchPanel.classList.contains("hidden")) {
        openDispatchPanel();
      } else {
        closeDispatchPanel();
      }
    });
  }

  if (btnCloseDispatchPanel) {
    btnCloseDispatchPanel.addEventListener("click", (e) => {
      e.stopPropagation();
      closeDispatchPanel();
    });
  }

  // Cerrar al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (dispatchWidget && !dispatchWidget.contains(e.target)) {
      closeDispatchPanel();
    }
  });

  // ==========================================
  // MODAL DE POLÍTICA DE PRIVACIDAD & CONFIDENCIALIDAD
  // ==========================================
  const privacyModal = document.getElementById("privacyModal");
  const privacyBackdrop = document.getElementById("privacyBackdrop");
  const btnClosePrivacyModal = document.getElementById("btnClosePrivacyModal");
  const btnAcceptPrivacy = document.getElementById("btnAcceptPrivacy");
  const btnsOpenPrivacy = document.querySelectorAll(".btn-open-privacy");

  const openPrivacyModal = () => {
    if (!privacyModal) return;
    privacyModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    if (window.lucide) window.lucide.createIcons();
  };

  const closePrivacyModal = () => {
    if (!privacyModal) return;
    privacyModal.classList.add("hidden");
    document.body.style.overflow = "";
  };

  btnsOpenPrivacy.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openPrivacyModal();
    });
  });

  if (btnClosePrivacyModal) btnClosePrivacyModal.addEventListener("click", closePrivacyModal);
  if (btnAcceptPrivacy) btnAcceptPrivacy.addEventListener("click", closePrivacyModal);
  if (privacyBackdrop) privacyBackdrop.addEventListener("click", closePrivacyModal);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && privacyModal && !privacyModal.classList.contains("hidden")) {
      closePrivacyModal();
    }
  });

  // Lo primero que ve el usuario al ingresar: Política de Privacidad
  setTimeout(() => {
    openPrivacyModal();
  }, 250);

});


