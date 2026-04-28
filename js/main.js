document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const burgerBtn = document.getElementById("burgerBtn");
  const mainNav = document.getElementById("mainNav");
  const navLinks = document.querySelectorAll("#mainNav a");
  const sections = document.querySelectorAll("main section[id]");
  const themeToggle = document.getElementById("themeToggle");
  const themeLabel = document.querySelector(".theme-toggle-label");
  // typed title removed
  const logoImg = document.querySelector(".logo-img");

  const setMenuState = (isOpen) => {
    if (!burgerBtn || !mainNav) return;
    burgerBtn.classList.toggle("open", isOpen);
    mainNav.classList.toggle("active", isOpen);
    burgerBtn.setAttribute("aria-expanded", String(isOpen));
    burgerBtn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  };

  if (burgerBtn && mainNav) {
    burgerBtn.addEventListener("click", () => {
      setMenuState(!mainNav.classList.contains("active"));
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => setMenuState(false));
    });

    document.addEventListener("click", (event) => {
      if (!mainNav.contains(event.target) && !burgerBtn.contains(event.target)) {
        setMenuState(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 992) {
        setMenuState(false);
      }
    });
  }

  const savedTheme = localStorage.getItem("site-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const applyTheme = (theme) => {
    body.classList.toggle("theme-dark", theme === "dark");
    localStorage.setItem("site-theme", theme);

    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    }

    if (themeLabel) {
      themeLabel.textContent = theme === "dark" ? "Dark" : "Light";
    }

    // logo swap support: set data-logo-dark to your white-text logo path
    if (logoImg) {
      const lightSrc = logoImg.getAttribute("data-logo-light") || logoImg.getAttribute("src");
      const darkSrc = logoImg.getAttribute("data-logo-dark");

      if (theme === "dark" && darkSrc) {
        logoImg.src = darkSrc;
        logoImg.style.filter = "";
      } else {
        logoImg.src = lightSrc;
        // fallback: make text readable if dark logo isn't provided
        logoImg.style.filter = theme === "dark" ? "brightness(0) invert(1)" : "";
      }
    }
  };

  applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      applyTheme(body.classList.contains("theme-dark") ? "light" : "dark");
    });
  }

  // typewriter removed (per request)

  const revealSections = document.querySelectorAll(".reveal-section");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.18 }
  );

  revealSections.forEach((section) => revealObserver.observe(section));

  const activateNav = () => {
    let currentId = "";

    sections.forEach((section) => {
      const top = window.scrollY;
      const offset = section.offsetTop - 150;
      const height = section.offsetHeight;

      if (top >= offset && top < offset + height) {
        currentId = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${currentId}`;
      link.classList.toggle("active-link", isActive);
    });
  };

  activateNav();
  window.addEventListener("scroll", activateNav, { passive: true });

  // ------------------- Smooth 3D tilt (mouse-follow) ----------------------
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp = (num, min, max) => Math.min(max, Math.max(min, num));
  const lerp = (a, b, t) => a + (b - a) * t;

  const initTilt = (el) => {
    if (!el || prefersReducedMotion) return;

    const maxRotate = Number(el.getAttribute("data-tilt-max")) || 10; // degrees
    const maxTranslate = Number(el.getAttribute("data-tilt-translate")) || 10; // px
    const perspective = Number(el.getAttribute("data-tilt-perspective")) || 900;

    let rafId = null;
    let isHover = false;
    let rect = null;

    const state = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      tz: 0,
      targetTz: 0,
    };

    const updateRect = () => {
      rect = el.getBoundingClientRect();
    };

    const animate = () => {
      rafId = null;

      const ease = isHover ? 0.14 : 0.12;
      state.x = lerp(state.x, state.targetX, ease);
      state.y = lerp(state.y, state.targetY, ease);
      state.tz = lerp(state.tz, state.targetTz, ease);

      const rotateX = state.y * maxRotate;
      const rotateY = state.x * maxRotate;
      const translateX = state.x * maxTranslate;
      const translateY = state.y * maxTranslate;

      el.style.transform = `perspective(${perspective}px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) translate3d(${translateX}px, ${translateY}px, ${state.tz}px)`;

      if (
        Math.abs(state.x - state.targetX) > 0.001 ||
        Math.abs(state.y - state.targetY) > 0.001 ||
        Math.abs(state.tz - state.targetTz) > 0.2
      ) {
        rafId = requestAnimationFrame(animate);
      }
    };

    const requestTick = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(animate);
    };

    const onEnter = (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      isHover = true;
      el.classList.add("is-tilting");
      updateRect();
      state.targetTz = 14;
      requestTick();
    };

    const onMove = (event) => {
      if (!isHover) return;
      if (event.pointerType && event.pointerType !== "mouse") return;
      if (!rect) updateRect();

      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      state.targetX = clamp(px * 2 - 1, -1, 1);
      state.targetY = clamp(py * 2 - 1, -1, 1);
      requestTick();
    };

    const onLeave = () => {
      isHover = false;
      state.targetX = 0;
      state.targetY = 0;
      state.targetTz = 0;
      requestTick();

      window.setTimeout(() => {
        if (!isHover) el.classList.remove("is-tilting");
      }, 220);
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    window.addEventListener("resize", updateRect, { passive: true });
  };

  document.querySelectorAll("[data-tilt]").forEach(initTilt);

  const soundBtn = document.getElementById("soundBtn");
  const clickSound = document.getElementById("clickSound");

  if (soundBtn && clickSound) {
    soundBtn.addEventListener("click", () => {
      clickSound.currentTime = 0;
      clickSound.play();
    });
  }

  const checkQuizBtn = document.getElementById("checkQuizBtn");
  const quizResult = document.getElementById("quizResult");

  if (checkQuizBtn && quizResult) {
    checkQuizBtn.addEventListener("click", () => {
      const q1Ans = document.querySelector('input[name="q1"]:checked');
      const q2Ans = document.querySelector('input[name="q2"]:checked');
      const q3Speed = document.querySelector('input[value="speed"]')?.checked;
      const q3Logs = document.querySelector('input[value="logs"]')?.checked;
      const q3Secure = document.querySelector('input[value="secure"]')?.checked;

      let score = 0;
      const maxScore = 3;

      if (q1Ans && q1Ans.value === "correct") score += 1;
      if (q2Ans && q2Ans.value === "correct") score += 1;
      if (q3Speed && q3Secure && !q3Logs) score += 1;

      quizResult.textContent = `Score: ${score}/${maxScore}. `;

      if (score === maxScore) {
        quizResult.textContent += "Perfect! All correct.";
        quizResult.style.color = "#2ecc71";
      } else if (score === 2) {
        quizResult.textContent += "Almost there!";
        quizResult.style.color = "#f39c12";
      } else {
        quizResult.textContent += "Needs improvement. Try again!";
        quizResult.style.color = "#e74c3c";
      }

      quizResult.style.transform = "scale(1.04)";
      setTimeout(() => {
        quizResult.style.transform = "scale(1)";
      }, 180);
    });
  }

  const canvas = document.getElementById("drawCanvas");
  const clearBtn = document.getElementById("clearCanvasBtn");
  const colorPicker = document.getElementById("colorPicker");
  const brushSize = document.getElementById("brushSize");
  const undoBtn = document.getElementById("undoBtn");
  const redoBtn = document.getElementById("redoBtn");
  const toolBtns = document.querySelectorAll(".tool-btn");

  if (canvas && clearBtn && colorPicker && brushSize && undoBtn && redoBtn) {
    const ctx = canvas.getContext("2d");
    let isDrawing = false;
    let currentTool = "brush";
    let undoStack = [];
    let redoStack = [];

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const getCanvasPoint = (event) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const saveState = () => {
      undoStack.push(canvas.toDataURL());
      redoStack = [];
    };

    saveState();

    toolBtns.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        toolBtns.forEach((toolBtn) => toolBtn.classList.remove("active"));
        event.currentTarget.classList.add("active");
        currentTool = event.currentTarget.dataset.tool;
      });
    });

    const startDrawing = (event) => {
      if (currentTool === "fill") {
        ctx.fillStyle = colorPicker.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveState();
        return;
      }

      isDrawing = true;
      const point = getCanvasPoint(event);
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      draw(event);
    };

    const stopDrawing = () => {
      if (!isDrawing) return;
      isDrawing = false;
      ctx.beginPath();
      saveState();
    };

    const draw = (event) => {
      if (!isDrawing) return;
      if (event.cancelable) event.preventDefault();

      ctx.lineWidth = brushSize.value;
      ctx.globalCompositeOperation = currentTool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = currentTool === "eraser" ? "rgba(0,0,0,1)" : colorPicker.value;

      const point = getCanvasPoint(event);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);
    canvas.addEventListener("touchstart", startDrawing, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);

    clearBtn.addEventListener("click", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveState();
    });

    undoBtn.addEventListener("click", () => {
      if (undoStack.length <= 1) return;

      redoStack.push(undoStack.pop());
      const img = new Image();
      img.src = undoStack[undoStack.length - 1];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(img, 0, 0);
      };
    });

    redoBtn.addEventListener("click", () => {
      if (!redoStack.length) return;

      const state = redoStack.pop();
      undoStack.push(state);
      const img = new Image();
      img.src = state;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(img, 0, 0);
      };
    });
  }

  const dropdown = document.getElementById("serverDropdown");
  const dropdownTrigger = document.getElementById("dropdownTrigger");
  const dropdownOptions = document.getElementById("dropdownOptions");
  const selectedText = document.getElementById("selectedText");
  const selectedFlag = document.getElementById("selectedFlag");
  const dynamicEffect = document.getElementById("dynamicEffect");
  const serverStatus = document.getElementById("serverStatus");
  const serverPing = document.getElementById("serverPing");
  const serverMessage = document.getElementById("serverMessage");

  if (
    dropdown &&
    dropdownTrigger &&
    dropdownOptions &&
    selectedText &&
    selectedFlag &&
    dynamicEffect &&
    serverStatus &&
    serverPing &&
    serverMessage
  ) {
    dropdownTrigger.addEventListener("click", () => {
      dropdown.classList.toggle("open");
    });

    dropdownOptions.querySelectorAll("li").forEach((item) => {
      item.addEventListener("click", (event) => {
        const target = event.currentTarget;
        const val = target.dataset.value;
        const flagSrc = target.dataset.flag;
        const text = target.textContent;

        selectedText.textContent = text;
        selectedFlag.src = flagSrc;
        dropdown.classList.remove("open");
        dynamicEffect.classList.remove("hidden");

        if (val === "poland" || val === "uk" || val === "germany") {
          serverStatus.textContent = "Online - Fast";
          serverStatus.style.color = "#2ecc71";
          serverPing.textContent = `${Math.floor(Math.random() * 20 + 10)} ms`;
          serverMessage.textContent = "Excellent connection for Europe.";
        } else if (val === "korea" || val === "japan") {
          serverStatus.textContent = "Heavy Load";
          serverStatus.style.color = "#f39c12";
          serverPing.textContent = `${Math.floor(Math.random() * 50 + 100)} ms`;
          serverMessage.textContent = "High traffic in Asia regions. Expect slight delays.";
        } else {
          serverStatus.textContent = "Online - Stable";
          serverStatus.style.color = "#2ecc71";
          serverPing.textContent = `${Math.floor(Math.random() * 30 + 60)} ms`;
          serverMessage.textContent = "Good connection for streaming.";
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove("open");
      }
    });
  }

  const planEls = document.querySelectorAll(".plan");
  const selectBtns = document.querySelectorAll(".plans .btn-select");

  const setActivePlan = (planEl) => {
    if (!planEl) return;
    planEls.forEach((el) => el.classList.remove("active"));
    planEl.classList.add("active");
  };

  selectBtns.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const plan = event.currentTarget.closest(".plan");
      setActivePlan(plan);
      selectBtns.forEach((b) => b.classList.remove("is-selected"));
      event.currentTarget.classList.add("is-selected");
      event.currentTarget.blur();
    });
  });

  const initialPlan = document.querySelector('.plan[data-plan="premium"]') || planEls[0];
  if (initialPlan) {
    setActivePlan(initialPlan);
    const initialBtn = initialPlan.querySelector(".btn-select");
    if (initialBtn) initialBtn.classList.add("is-selected");
  }

  // ------------------- SLIDER (classic, loop with first slide return) ----------------------
  const slider = document.getElementById("slider");
  const slides = document.querySelectorAll(".slide");
  const points = Array.from(document.querySelectorAll(".point"));
  const prevBtn = document.getElementById("arrow-left");
  const nextBtn = document.getElementById("arrow-right");

  if (slider && slides.length) {
    let index = 0;

    const updateSlider = () => {
      slider.style.transform = `translateX(-${index * (100 / 3)}%)`;

      points.forEach((point, pointIndex) => {
        point.classList.toggle("active-point", pointIndex === index);
      });

      slides.forEach((slide, slideIndex) => {
        slide.querySelector(".slider-content")?.classList.toggle("active-slide", slideIndex === index);
      });
    };

    nextBtn?.addEventListener("click", () => {
      index = (index + 1) % slides.length;
      updateSlider();
    });

    prevBtn?.addEventListener("click", () => {
      index = (index - 1 + slides.length) % slides.length;
      updateSlider();
    });

    points.forEach((point, pointIndex) => {
      point.addEventListener("click", () => {
        index = pointIndex;
        updateSlider();
      });
    });

    updateSlider();
  }

  // removed plan list 3D/spotlight (per request)

  // map hover motion disabled for stability
});