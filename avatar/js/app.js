const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const uploadInput = document.getElementById("uploadInput");
const zoomRange = document.getElementById("zoomRange");
const rotateRange = document.getElementById("rotateRange");
const zoomValue = document.getElementById("zoomValue");
const rotateValue = document.getElementById("rotateValue");
const centerBtn = document.getElementById("centerBtn");
const resetBtn = document.getElementById("resetBtn");
const downloadBtn = document.getElementById("downloadBtn");
const copyCaptionBtn = document.getElementById("copyCaptionBtn");
const captionText = document.getElementById("captionText");
const toast = document.getElementById("toast");
const tabs = document.querySelectorAll(".tab");

const SIZE = 1080;

const OPENING = window.K15_OPENING || { x: 64, y: 64, w: 952, h: 729 };
const OPENING_CENTER = {
  x: OPENING.x + OPENING.w / 2,
  y: OPENING.y + OPENING.h / 2
};

const FRAMES = {
  classic: "images/frame-classic.png?v=v4",
  premium: "images/frame-premium.png?v=v4",
  retro: "images/frame-retro.png?v=v4"
};

let currentFrame = "classic";
let frameImage = new Image();
let photo = null;
let state = { x: 0, y: 0, scale: 1.1, rotate: 0 };
let dragging = false;
let lastPoint = { x: 0, y: 0 };

function loadFrame(key) {
  currentFrame = key;
  frameImage = new Image();
  frameImage.onload = render;
  frameImage.src = FRAMES[key];
}

loadFrame(currentFrame);

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  gradient.addColorStop(0, "#071844");
  gradient.addColorStop(0.55, "#101b58");
  gradient.addColorStop(1, "#05071c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function render() {
  ctx.clearRect(0, 0, SIZE, SIZE);
  drawBackground();

  if (photo) {
    ctx.save();

    const baseScale = Math.max(
      OPENING.w / photo.width,
      OPENING.h / photo.height
    );

    const finalScale = baseScale * state.scale;

    ctx.translate(OPENING_CENTER.x + state.x, OPENING_CENTER.y + state.y);
    ctx.rotate(state.rotate);
    ctx.scale(finalScale, finalScale);
    ctx.drawImage(photo, -photo.width / 2, -photo.height / 2);

    ctx.restore();
  } else {
    ctx.fillStyle = "rgba(246,197,87,0.22)";
    ctx.font = "bold 38px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Chọn ảnh để bắt đầu", OPENING_CENTER.x, OPENING_CENTER.y);
  }

  if (frameImage.complete) {
    ctx.drawImage(frameImage, 0, 0, SIZE, SIZE);
  }
}

function syncControls() {
  zoomRange.value = Math.round(state.scale * 100);
  rotateRange.value = Math.round(state.rotate * 180 / Math.PI);
  zoomValue.textContent = `${zoomRange.value}%`;
  rotateValue.textContent = `${rotateRange.value}°`;
}

function centerImage() {
  state = { x: 0, y: 0, scale: 1.1, rotate: 0 };
  syncControls();
  render();
}

function resetAll() {
  photo = null;
  uploadInput.value = "";
  centerImage();
}

uploadInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    const img = new Image();

    img.onload = () => {
      photo = img;
      centerImage();
    };

    img.src = reader.result;
  };

  reader.readAsDataURL(file);
});

zoomRange.addEventListener("input", () => {
  state.scale = Number(zoomRange.value) / 100;
  zoomValue.textContent = `${zoomRange.value}%`;
  render();
});

rotateRange.addEventListener("input", () => {
  const degree = Number(rotateRange.value);
  state.rotate = degree * Math.PI / 180;
  rotateValue.textContent = `${degree}°`;
  render();
});

centerBtn.addEventListener("click", centerImage);
resetBtn.addEventListener("click", resetAll);

downloadBtn.addEventListener("click", () => {
  if (!photo) {
    alert("Bạn vui lòng chọn ảnh trước nhé!");
    return;
  }

  const link = document.createElement("a");
  link.download = `avatar-k15fm-${currentFrame}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});

function getPoint(event) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: (event.clientX - rect.left) * (SIZE / rect.width),
    y: (event.clientY - rect.top) * (SIZE / rect.height)
  };
}

canvas.addEventListener("pointerdown", (event) => {
  if (!photo) return;
  canvas.setPointerCapture(event.pointerId);
  dragging = true;
  lastPoint = getPoint(event);
});

canvas.addEventListener("pointermove", (event) => {
  if (!dragging || !photo) return;

  const point = getPoint(event);

  state.x += point.x - lastPoint.x;
  state.y += point.y - lastPoint.y;

  lastPoint = point;
  render();
});

canvas.addEventListener("pointerup", () => dragging = false);
canvas.addEventListener("pointercancel", () => dragging = false);

canvas.addEventListener("wheel", (event) => {
  if (!photo) return;
  event.preventDefault();

  const step = event.deltaY > 0 ? -5 : 5;
  const next = Math.max(80, Math.min(300, Number(zoomRange.value) + step));

  zoomRange.value = next;
  state.scale = next / 100;
  zoomValue.textContent = `${next}%`;

  render();
}, { passive: false });

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    loadFrame(tab.dataset.frame);
  });
});

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1600);
}

copyCaptionBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(captionText.innerText);
    showToast("Đã sao chép caption");
  } catch {
    alert("Bạn copy caption thủ công giúp mình nhé.");
  }
});

syncControls();
