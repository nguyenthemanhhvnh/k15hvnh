const canvas = document.getElementById("avatarCanvas");
const ctx = canvas.getContext("2d");

const photoInput = document.getElementById("photoInput");
const zoomRange = document.getElementById("zoomRange");
const rotateRange = document.getElementById("rotateRange");
const zoomValue = document.getElementById("zoomValue");
const rotateValue = document.getElementById("rotateValue");
const resetBtn = document.getElementById("resetBtn");
const downloadBtn = document.getElementById("downloadBtn");
const copyCaptionBtn = document.getElementById("copyCaptionBtn");
const captionText = document.getElementById("captionText");

const FRAME_SRC = "frame.png";
const SIZE = 1080;

const frame = new Image();
frame.src = FRAME_SRC;

let userImage = null;
let imageState = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0
};

let drag = {
  active: false,
  lastX: 0,
  lastY: 0
};

frame.onload = render;

function drawDefaultBackground() {
  const gradient = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  gradient.addColorStop(0, "#071b45");
  gradient.addColorStop(0.55, "#0a2460");
  gradient.addColorStop(1, "#061331");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.fillStyle = "rgba(245,196,81,0.16)";
  ctx.font = "bold 42px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Chọn ảnh để bắt đầu", SIZE / 2, SIZE / 2);
}

function render() {
  ctx.clearRect(0, 0, SIZE, SIZE);

  if (!userImage) {
    drawDefaultBackground();
  } else {
    drawUserImage();
  }

  ctx.drawImage(frame, 0, 0, SIZE, SIZE);
}

function drawUserImage() {
  ctx.save();

  const baseScale = Math.max(SIZE / userImage.width, SIZE / userImage.height);
  const finalScale = baseScale * imageState.scale;

  ctx.translate(SIZE / 2 + imageState.x, SIZE / 2 + imageState.y);
  ctx.rotate(imageState.rotation);
  ctx.scale(finalScale, finalScale);

  ctx.drawImage(
    userImage,
    -userImage.width / 2,
    -userImage.height / 2,
    userImage.width,
    userImage.height
  );

  ctx.restore();
}

photoInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      userImage = img;
      resetImage();
      render();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

zoomRange.addEventListener("input", () => {
  imageState.scale = Number(zoomRange.value) / 100;
  zoomValue.textContent = `${zoomRange.value}%`;
  render();
});

rotateRange.addEventListener("input", () => {
  const degree = Number(rotateRange.value);
  imageState.rotation = degree * Math.PI / 180;
  rotateValue.textContent = `${degree}°`;
  render();
});

function resetImage() {
  imageState = {
    x: 0,
    y: -40,
    scale: 1,
    rotation: 0
  };

  zoomRange.value = 100;
  rotateRange.value = 0;
  zoomValue.textContent = "100%";
  rotateValue.textContent = "0°";
  render();
}

resetBtn.addEventListener("click", resetImage);

downloadBtn.addEventListener("click", () => {
  if (!userImage) {
    alert("Bạn vui lòng chọn ảnh trước nhé!");
    return;
  }

  const link = document.createElement("a");
  link.download = "avatar-k15fm.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const clientX = event.clientX ?? event.touches?.[0]?.clientX;
  const clientY = event.clientY ?? event.touches?.[0]?.clientY;

  return {
    x: (clientX - rect.left) * (SIZE / rect.width),
    y: (clientY - rect.top) * (SIZE / rect.height)
  };
}

canvas.addEventListener("pointerdown", (event) => {
  if (!userImage) return;
  canvas.setPointerCapture(event.pointerId);
  const p = getCanvasPoint(event);
  drag.active = true;
  drag.lastX = p.x;
  drag.lastY = p.y;
});

canvas.addEventListener("pointermove", (event) => {
  if (!drag.active || !userImage) return;
  const p = getCanvasPoint(event);
  imageState.x += p.x - drag.lastX;
  imageState.y += p.y - drag.lastY;
  drag.lastX = p.x;
  drag.lastY = p.y;
  render();
});

canvas.addEventListener("pointerup", () => {
  drag.active = false;
});

canvas.addEventListener("pointercancel", () => {
  drag.active = false;
});

canvas.addEventListener("wheel", (event) => {
  if (!userImage) return;
  event.preventDefault();

  const delta = event.deltaY > 0 ? -4 : 4;
  const next = Math.min(260, Math.max(50, Number(zoomRange.value) + delta));
  zoomRange.value = next;
  imageState.scale = next / 100;
  zoomValue.textContent = `${next}%`;
  render();
}, { passive: false });

copyCaptionBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(captionText.innerText);
    copyCaptionBtn.textContent = "Đã sao chép";
    setTimeout(() => copyCaptionBtn.textContent = "Sao chép caption", 1600);
  } catch {
    alert("Trình duyệt không cho phép sao chép tự động. Bạn copy thủ công giúp mình nhé.");
  }
});
