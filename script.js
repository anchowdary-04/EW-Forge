// ================= ELEMENTS =================
const pickupForm = document.getElementById("pickupForm");
const requestForm = document.getElementById("requestForm");
const serviceSelect = document.getElementById("serviceSelect");

// ================= NAVBAR SCROLL SHRINK =================
window.addEventListener("scroll", () => {
  const nav = document.getElementById("mainNav");
  if (nav) {
    nav.classList.toggle("scrolled", window.scrollY > 60);
  }
  handleScrollReveal();
});

// ================= SCROLL REVEAL =================
function handleScrollReveal() {
  const elements = document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right");
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) {
      el.classList.add("visible");
    }
  });
}
// Run once on load
document.addEventListener("DOMContentLoaded", handleScrollReveal);

// ================= PARTICLE CANVAS =================
(function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  window.addEventListener("resize", () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  const particles = Array.from({ length: 55 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 2.5 + 0.5,
    dx: (Math.random() - 0.5) * 0.5,
    dy: (Math.random() - 0.5) * 0.5,
    alpha: Math.random() * 0.5 + 0.1
  }));

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(129, 199, 132, ${p.alpha})`;
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });

    // Draw connecting lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(129, 199, 132, ${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawParticles);
  }

  drawParticles();
})();

// ================= RIPPLE EFFECT ON SERVICE CARDS =================
document.querySelectorAll(".service-rect").forEach(card => {
  card.addEventListener("click", function (e) {
    const ripple = document.createElement("span");
    const rect = card.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: rgba(255,255,255,0.18);
      top: ${e.clientY - rect.top - size / 2}px;
      left: ${e.clientX - rect.left - size / 2}px;
      transform: scale(0);
      animation: rippleAnim 0.6s ease-out forwards;
      pointer-events: none;
      z-index: 1;
    `;
    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  });
});

// Add ripple keyframe dynamically
const rippleStyle = document.createElement("style");
rippleStyle.textContent = `@keyframes rippleAnim { to { transform: scale(1); opacity: 0; } }`;
document.head.appendChild(rippleStyle);

// ================= TOAST =================
function showToast(msg) {
  const toast = document.getElementById("successToast");
  const toastMsg = document.getElementById("toastMsg");
  if (!toast) return;
  toastMsg.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3200);
}

// ================= FORM VISIBILITY =================
function hideForms() {
  pickupForm?.classList.add("d-none");
  requestForm?.classList.add("d-none");
}

function openPickup() {
  hideForms();
  pickupForm?.classList.remove("d-none");
  // Re-trigger animation
  pickupForm?.classList.remove("form-animate");
  void pickupForm?.offsetWidth;
  pickupForm?.classList.add("form-animate");
  setTimeout(() => {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  }, 80);
}

function openRequest() {
  hideForms();
  requestForm?.classList.remove("d-none");
  requestForm?.classList.remove("form-animate");
  void requestForm?.offsetWidth;
  requestForm?.classList.add("form-animate");
  setTimeout(() => {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  }, 80);
}

// ================= DROPDOWN =================
if (serviceSelect) {
  serviceSelect.addEventListener("change", function () {
    if (this.value === "pickup") openPickup();
    if (this.value === "request") openRequest();
  });
}

// ================= LOCAL STORAGE =================
function getStoredRequests() {
  return JSON.parse(localStorage.getItem("ewforgeRequests")) || [];
}

function saveRequest(data) {
  const allRequests = getStoredRequests();
  allRequests.push(data);
  localStorage.setItem("ewforgeRequests", JSON.stringify(allRequests));
}

// ================= SUBMIT PICKUP =================
function submitPickup(e) {
  e.preventDefault();

  const electronics = [];
  pickupForm
    .querySelectorAll('input[type="checkbox"]:checked')
    .forEach(cb => electronics.push(cb.nextElementSibling.innerText));

  const data = {
    type: "Pickup",
    name: pickupForm.querySelector('input[placeholder="Name"]').value,
    email: pickupForm.querySelector('input[placeholder="Email"]').value,
    phone: pickupForm.querySelector('input[placeholder="Phone Number"]').value,
    location: pickupForm.querySelector('input[placeholder="Location"]').value,
    count: pickupForm.querySelector('input[placeholder="Number of electronics"]').value,
    electronics: electronics.join(", "),
    years: pickupForm.querySelector('input[placeholder*="years"]').value,
    time: new Date().toLocaleString()
  };

  saveRequest(data);
  showToast("✅ Pickup Scheduled Successfully!");
  e.target.reset();
  hideForms();
}

// ================= SUBMIT REQUEST =================
function submitRequest(e) {
  e.preventDefault();

  const data = {
    type: "Request",
    name: requestForm.querySelector('input[placeholder="Name"]').value,
    organisation: requestForm.querySelector('input[placeholder*="Company"]').value,
    part: requestForm.querySelector('input[placeholder*="Functional"]').value,
    quantity: requestForm.querySelector('input[placeholder*="Quantity"]').value,
    location: requestForm.querySelector('input[placeholder="Location"]').value,
    time: new Date().toLocaleString()
  };

  saveRequest(data);
  showToast("✅ Request Submitted Successfully!");
  e.target.reset();
  hideForms();
}

// ================= SMOOTH SCROLL FOR NAV LINKS =================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// ================= MAKE FUNCTIONS GLOBAL =================
window.openPickup = openPickup;
window.openRequest = openRequest;
window.submitPickup = submitPickup;
window.submitRequest = submitRequest;