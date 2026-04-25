document.addEventListener('DOMContentLoaded', function () {
  // BURGER MENU
  const burgerBtn = document.getElementById("burgerBtn");
  const nav = document.getElementById("mainNav");

  burgerBtn.addEventListener("click", () => {
    nav.classList.toggle("active");
  });

  const burger = document.getElementById('burgerBtn');
  const mainNav = document.getElementById('mainNav');

  burger.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    burger.classList.toggle('open');
  });

  document.querySelectorAll('#mainNav a').forEach(a => {
    a.addEventListener('click', () => {
      mainNav.classList.remove('open');
      burger.classList.remove('open');
    });
  });

  // VIDEO
  const soundBtn = document.getElementById('soundBtn');
  const clickSound = document.getElementById('clickSound');

  if (soundBtn && clickSound) {
    soundBtn.addEventListener('click', () => {
      clickSound.currentTime = 0; 
      clickSound.play();
    });
  }


  // INTERACTIVE FORMS & CANVAS
  const checkQuizBtn = document.getElementById('checkQuizBtn');
  const quizResult = document.getElementById('quizResult');

  if (checkQuizBtn) {
    checkQuizBtn.addEventListener('click', () => {
      const q1Ans = document.querySelector('input[name="q1"]:checked');
      const q2Ans = document.querySelector('input[name="q2"]:checked');
      const q3Speed = document.querySelector('input[value="speed"]').checked;
      const q3Logs = document.querySelector('input[value="logs"]').checked;
      const q3Secure = document.querySelector('input[value="secure"]').checked;

      let score = 0;
      const maxScore = 3;

      if (q1Ans && q1Ans.value === "correct") score++;
      if (q2Ans && q2Ans.value === "correct") score++;
      if (q3Speed && q3Secure && !q3Logs) score++;

      quizResult.textContent = `Score: ${score}/${maxScore}. `;
      if (score === maxScore) {
        quizResult.textContent += "Perfect! All Correct.";
        quizResult.style.color = "#2ecc71";
      } else if (score === 2) {
        quizResult.textContent += "Almost there!";
        quizResult.style.color = "#f39c12";
      } else {
        quizResult.textContent += "Needs improvement. Try again!";
        quizResult.style.color = "#e74c3c";
      }
      
      quizResult.style.transform = "scale(1.05)";
      setTimeout(() => quizResult.style.transform = "scale(1)", 200);
    });
  }

  const canvas = document.getElementById('drawCanvas');
  const clearBtn = document.getElementById('clearCanvasBtn');
  const colorPicker = document.getElementById('colorPicker');
  const brushSize = document.getElementById('brushSize');
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const toolBtns = document.querySelectorAll('.tool-btn');
  
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let currentTool = 'brush';
    let undoStack = [];
    let redoStack = [];

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const saveState = () => {
      undoStack.push(canvas.toDataURL());
      redoStack = [];
    };

    saveState();

    toolBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        toolBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentTool = e.target.dataset.tool;
      });
    });

    const startDrawing = (e) => {
      if (currentTool === 'fill') {
        ctx.fillStyle = colorPicker.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveState();
        return;
      }
      isDrawing = true;
      draw(e);
    };

    const stopDrawing = () => {
      if (isDrawing) {
        isDrawing = false;
        ctx.beginPath();
        saveState();
      }
    };

    const draw = (e) => {
      if (!isDrawing) return;
      
      ctx.lineWidth = brushSize.value;
      
      if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = colorPicker.value;
      }

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;   
      const scaleY = canvas.height / rect.height; 

      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    clearBtn.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveState();
    });

    undoBtn.addEventListener('click', () => {
      if (undoStack.length > 1) {
        redoStack.push(undoStack.pop());
        const img = new Image();
        img.src = undoStack[undoStack.length - 1];
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = 'source-over';
          ctx.drawImage(img, 0, 0);
        };
      }
    });

    redoBtn.addEventListener('click', () => {
      if (redoStack.length > 0) {
        const state = redoStack.pop();
        undoStack.push(state);
        const img = new Image();
        img.src = state;
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = 'source-over';
          ctx.drawImage(img, 0, 0);
        };
      }
    });
  }

  const dropdown = document.getElementById('serverDropdown');
  const dropdownTrigger = document.getElementById('dropdownTrigger');
  const dropdownOptions = document.getElementById('dropdownOptions');
  const selectedText = document.getElementById('selectedText');
  const selectedFlag = document.getElementById('selectedFlag');
  
  const dynamicEffect = document.getElementById('dynamicEffect');
  const serverStatus = document.getElementById('serverStatus');
  const serverPing = document.getElementById('serverPing');
  const serverMessage = document.getElementById('serverMessage');

  if (dropdownTrigger) {
    dropdownTrigger.addEventListener('click', () => {
      dropdown.classList.toggle('open');
    });

    dropdownOptions.querySelectorAll('li').forEach(item => {
      item.addEventListener('click', (e) => {
        const val = e.target.closest('li').dataset.value;
        const flagSrc = e.target.closest('li').dataset.flag;
        const text = e.target.closest('li').textContent;

        selectedText.textContent = text;
        selectedFlag.src = flagSrc;
        dropdown.classList.remove('open');
        
        dynamicEffect.classList.remove('hidden');

        if (val === 'poland' || val === 'uk' || val === 'germany') {
          serverStatus.textContent = "Online - Fast";
          serverStatus.style.color = "#2ecc71"; 
          serverPing.textContent = Math.floor(Math.random() * 20 + 10) + " ms";
          serverMessage.textContent = "Excellent connection for Europe.";
        } else if (val === 'korea' || val === 'japan') {
          serverStatus.textContent = "Heavy Load";
          serverStatus.style.color = "#f39c12"; 
          serverPing.textContent = Math.floor(Math.random() * 50 + 100) + " ms";
          serverMessage.textContent = "High traffic in Asia regions. Expect slight delays.";
        } else {
          serverStatus.textContent = "Online - Stable";
          serverStatus.style.color = "#2ecc71";
          serverPing.textContent = Math.floor(Math.random() * 30 + 60) + " ms";
          serverMessage.textContent = "Good connection for streaming.";
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });
  }

  // PLANS
  const planEls = document.querySelectorAll('.plan');
  const selectBtns = document.querySelectorAll('.btn-select');

  function setActivePlan(planEl) {
    planEls.forEach(el => el.classList.remove('active'));
    planEl.classList.add('active');
  }

  selectBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const plan = e.target.closest('.plan');
      setActivePlan(plan);
      e.target.blur();
    });
  });

  const defaultPlan = document.querySelector('.plan--highlight');
  if (defaultPlan) setActivePlan(defaultPlan);

  // ------------------- SLIDER ----------------------
  const slider = document.getElementById('slider');
  const slides = document.querySelectorAll('.slide');
  const points = document.querySelectorAll('.point');
  const prevBtn = document.getElementById('arrow-left');
  const nextBtn = document.getElementById('arrow-right');

  let index = 0;

  function updateSlider() {
    slider.style.transform = `translateX(-${index * (100 / 3)}%)`;

    points.forEach((p, i) => {
      p.classList.toggle('active-point', i === index);
    });

    slides.forEach((s, i) => {
      const content = s.querySelector('.slider-content');
      content.classList.toggle('active-slide', i === index);
    });
  }

  nextBtn.addEventListener('click', () => {
    index = (index + 1) % slides.length;
    updateSlider();
  });

  prevBtn.addEventListener('click', () => {
    index = (index - 1 + slides.length) % slides.length;
    updateSlider();
  });

  points.forEach((point, i) => {
    point.addEventListener('click', () => {
      index = i;
      updateSlider();
    });
  });

  updateSlider()});