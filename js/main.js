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
  // GESTOR DE TEMA (CLARO / OSCURO POR SEPARADO)
  // ==========================================
  const lightButtons = document.querySelectorAll(".btn-theme-light");
  const darkButtons = document.querySelectorAll(".btn-theme-dark");

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      darkButtons.forEach((btn) => btn.classList.add("active"));
      lightButtons.forEach((btn) => btn.classList.remove("active"));
    } else {
      document.documentElement.classList.remove("dark");
      lightButtons.forEach((btn) => btn.classList.add("active"));
      darkButtons.forEach((btn) => btn.classList.remove("active"));
    }
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
  // PRELOADER RÁPIDO & REVELADO DE ENTRADA
  // ==========================================
  const preloader = document.getElementById("preloader");
  const preloaderBar = document.getElementById("preloaderBar");

  if (preloader) {
    if (preloaderBar) {
      preloaderBar.style.width = "100%";
    }
    setTimeout(() => {
      preloader.classList.add("fade-out");
      animateHero();
      setTimeout(() => {
        preloader.style.display = "none";
      }, 500);
    }, 400);
  } else {
    animateHero();
  }

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

    // Actualizar Calibre Vertical de Sarta de Perforación (Opción B)
    if (gaugeDepthNum && activeSlide.dataset.depthNum) {
      gaugeDepthNum.textContent = activeSlide.dataset.depthNum;
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
  // OPERACIONES / PROYECTOS SLIDER
  // ==========================================
  let currentOps = 0;
  const opsTrack = document.getElementById("opsTrack");
  const opsSlides = document.querySelectorAll(".ops-slide");
  const prevOpsBtn = document.getElementById("prevOpsBtn");
  const nextOpsBtn = document.getElementById("nextOpsBtn");
  const opsCounter = document.getElementById("opsCounter");

  function goToOps(index) {
    if (!opsTrack || opsSlides.length === 0) return;

    if (index < 0) index = opsSlides.length - 1;
    if (index >= opsSlides.length) index = 0;

    currentOps = index;
    opsTrack.style.transform = `translateX(-${currentOps * 100}%)`;

    opsSlides.forEach((slide, idx) => {
      slide.classList.toggle("active", idx === currentOps);
    });

    if (opsCounter) {
      opsCounter.textContent = `0${currentOps + 1} / 0${opsSlides.length}`;
    }
  }

  if (prevOpsBtn) prevOpsBtn.addEventListener("click", () => goToOps(currentOps - 1));
  if (nextOpsBtn) nextOpsBtn.addEventListener("click", () => goToOps(currentOps + 1));

  // ==========================================
  // REVELADO CON GSAP EN SCROLL
  // ==========================================
  const revealElements = document.querySelectorAll(".reveal-up, .reveal-scale");
  revealElements.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      }
    );
  });

  // ==========================================
  // NAVEGACIÓN PRINCIPAL
  // ==========================================
  const mainNav = document.getElementById("mainNav");
  if (mainNav) {
    ScrollTrigger.create({
      start: "top -60",
      onUpdate: (self) => {
        if (self.scroll() > 80) {
          mainNav.classList.add("scrolled");
        } else {
          mainNav.classList.remove("scrolled");
        }
      },
    });
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
  // CONSOLA SCADA DE TELEMETRÍA INDUSTRIAL
  // ==========================================
  const telemetryDepth = document.getElementById("telemetryDepth");
  const telemetryPressure = document.getElementById("telemetryPressure");
  const telemetryFlow = document.getElementById("telemetryFlow");
  const telemetryROP = document.getElementById("telemetryROP");
  const telemetryTorque = document.getElementById("telemetryTorque");
  const rigSvg = document.getElementById("rigSvg");
  const drillString = document.getElementById("drillString");
  const statusLed = document.getElementById("statusLed");
  const statusLabel = document.getElementById("statusLabel");

  const btnNormal = document.getElementById("btnNormalMode");
  const btnDrill = document.getElementById("btnDrillMode");
  const btnTest = document.getElementById("btnTestMode");

  const hotspots = document.querySelectorAll(".rig-hotspot");
  const hotspotTitle = document.getElementById("hotspotTitle");
  const hotspotDesc = document.getElementById("hotspotDesc");

  const hotspotData = {
    crown: {
      title: "Corona de Poleas (Crown Block)",
      desc: "Estructura superior de soporte con capacidad de carga para soportar hasta 500 toneladas en maniobras de sarta de tubería pesada.",
    },
    string: {
      title: "Sarta de Perforación (Drill String)",
      desc: "Tubería drill pipe de grado API S-135 con rotación activa para transmisión continua de energía hidráulica y mecánica hacia la barrena.",
    },
    bop: {
      title: "Conjunto Preventor de Reventones (BOP Stack)",
      desc: "Línea de defensa primaria de seguridad de pozo con arietes anulares y de corte certificados para contención de presiones hasta 5,000 PSI.",
    },
  };

  if (hotspots.length > 0) {
    hotspots.forEach((btn) => {
      btn.addEventListener("click", () => {
        hotspots.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const key = btn.dataset.hotspot;
        if (hotspotData[key]) {
          if (hotspotTitle) hotspotTitle.textContent = hotspotData[key].title;
          if (hotspotDesc) hotspotDesc.textContent = hotspotData[key].desc;
        }
      });
    });
  }

  let telemetryMode = "normal"; // normal, drill, test
  let currentDepthVal = 8452.4;
  let currentPressureVal = 2410;
  let currentFlowVal = 480;
  let currentROPVal = 32.5;
  let currentTorqueVal = 1420;
  let drillTween = null;

  const updateTelemetry = () => {
    if (telemetryMode === "normal") {
      currentDepthVal += 0.02 * Math.random();
      currentPressureVal = Math.round(2410 + (Math.random() - 0.5) * 15);
      currentFlowVal = Math.round(480 + (Math.random() - 0.5) * 8);
      currentROPVal = (32.5 + (Math.random() - 0.5) * 1.5).toFixed(1);
      currentTorqueVal = Math.round(1420 + (Math.random() - 0.5) * 20);
    } else if (telemetryMode === "drill") {
      currentDepthVal += 0.15 * Math.random();
      currentPressureVal = Math.round(2680 + (Math.random() - 0.5) * 35);
      currentFlowVal = Math.round(540 + (Math.random() - 0.5) * 15);
      currentROPVal = (48.0 + (Math.random() - 0.5) * 3.0).toFixed(1);
      currentTorqueVal = Math.round(1850 + (Math.random() - 0.5) * 45);
    } else if (telemetryMode === "test") {
      currentDepthVal += 0.005 * Math.random();
      currentPressureVal = Math.round(2920 + Math.sin(Date.now() / 500) * 80);
      currentFlowVal = Math.round(260 + Math.cos(Date.now() / 500) * 20);
      currentROPVal = "0.0";
      currentTorqueVal = Math.round(620 + (Math.random() - 0.5) * 15);
    }

    if (telemetryDepth) telemetryDepth.textContent = currentDepthVal.toFixed(1);
    if (telemetryPressure) telemetryPressure.textContent = currentPressureVal;
    if (telemetryFlow) telemetryFlow.textContent = currentFlowVal;
    if (telemetryROP) telemetryROP.textContent = currentROPVal;
    if (telemetryTorque) telemetryTorque.textContent = currentTorqueVal;
  };

  setInterval(updateTelemetry, 500);

  // --- Osciloscopio de Presión de Lodos ---
  const telemetryGraphPath = document.getElementById("telemetryGraphPath");
  let waveTime = 0;

  function animateOscilloscope() {
    if (!telemetryGraphPath) return;

    waveTime += telemetryMode === "drill" ? 0.2 : telemetryMode === "test" ? 0.12 : 0.06;

    let points = [];
    const step = 4;
    const width = 200;

    for (let x = 0; x <= width; x += step) {
      let y = 20;

      if (telemetryMode === "normal") {
        y = 20 + Math.sin(x * 0.08 - waveTime) * 4 + Math.sin(x * 0.03 - waveTime * 0.5) * 2;
      } else if (telemetryMode === "drill") {
        y = 20 + Math.sin(x * 0.16 - waveTime * 2) * 9 + Math.sin(x * 0.05 - waveTime) * 3;
        y += (Math.random() - 0.5) * 1.5;
      } else if (telemetryMode === "test") {
        y = 20 + Math.sign(Math.sin(x * 0.08 - waveTime * 1.5)) * 8;
      }

      y = Math.max(4, Math.min(36, y));
      points.push(`${x},${y.toFixed(2)}`);
    }

    telemetryGraphPath.setAttribute("d", "M " + points.join(" L "));
    requestAnimationFrame(animateOscilloscope);
  }

  if (telemetryGraphPath) {
    animateOscilloscope();
  }

  const setTelemetryMode = (mode) => {
    telemetryMode = mode;
    if (btnNormal) btnNormal.classList.toggle("active", mode === "normal");
    if (btnDrill) btnDrill.classList.toggle("active", mode === "drill");
    if (btnTest) btnTest.classList.toggle("active", mode === "test");

    if (drillTween) {
      drillTween.kill();
      drillTween = null;
    }

    if (mode === "normal") {
      if (statusLed) statusLed.className = "telemetry-led active";
      if (statusLabel) {
        statusLabel.textContent = "ESTADO: OPERACIÓN NOMINAL";
        statusLabel.style.color = "#008a62";
      }
      if (rigSvg) rigSvg.style.color = "rgba(0, 104, 73, 0.45)";
      if (telemetryGraphPath) telemetryGraphPath.setAttribute("stroke", "#008a62");
    } else if (mode === "drill") {
      if (statusLed) statusLed.className = "telemetry-led active";
      if (statusLabel) {
        statusLabel.textContent = "ESTADO: PERFORACIÓN ACTIVA";
        statusLabel.style.color = "#059669";
      }
      if (rigSvg) rigSvg.style.color = "rgba(0, 104, 73, 0.85)";
      if (telemetryGraphPath) telemetryGraphPath.setAttribute("stroke", "#059669");

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
      if (statusLabel) {
        statusLabel.textContent = "ESTADO: PRUEBA DE PRESIÓN BOP";
        statusLabel.style.color = "#f59e0b";
      }
      if (rigSvg) rigSvg.style.color = "rgba(245, 158, 11, 0.7)";
      if (telemetryGraphPath) telemetryGraphPath.setAttribute("stroke", "#f59e0b");
    }
  };

  if (btnNormal) btnNormal.addEventListener("click", () => setTelemetryMode("normal"));
  if (btnDrill) btnDrill.addEventListener("click", () => setTelemetryMode("drill"));
  if (btnTest) btnTest.addEventListener("click", () => setTelemetryMode("test"));

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
  // SCROLL PROGRESS LINE (OPCIÓN 1)
  // ==========================================
  const scrollProgressLine = document.getElementById("scrollProgressLine");
  if (scrollProgressLine) {
    ScrollTrigger.create({
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        scrollProgressLine.style.height = `${(self.progress * 100).toFixed(1)}%`;
      },
    });
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

});
