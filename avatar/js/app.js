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

function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (
      navigator.platform === "MacIntel" &&
      navigator.maxTouchPoints > 1
    );
}

function isFacebookBrowser() {
  return /FBAN|FBAV|FB_IAB|Instagram/i.test(navigator.userAgent);
}

function canvasToBlob(canvasElement) {
  return new Promise((resolve, reject) => {
    canvasElement.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Không thể tạo file ảnh."));
        }
      },
      "image/png",
      1
    );
  });
}

function showIOSSaveScreen(imageUrl) {
  const saveWindow = window.open("", "_blank");

  if (!saveWindow) {
    window.location.href = imageUrl;
    return;
  }

  saveWindow.document.open();
  saveWindow.document.write(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      >
      <title>Lưu Avatar K15FM</title>

      <style>
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          min-height: 100vh;
          padding: 24px 16px 40px;
          font-family: Arial, Helvetica, sans-serif;
          color: #ffffff;
          text-align: center;
          background:
            radial-gradient(
              circle at 85% 8%,
              rgba(245, 158, 11, 0.35),
              transparent 25%
            ),
            linear-gradient(
              135deg,
              #020a1f 0%,
              #061b49 55%,
              #020718 100%
            );
        }

        .container {
          width: min(620px, 100%);
          margin: 0 auto;
        }

        h1 {
          margin: 8px 0 10px;
          color: #f5c451;
          font-size: 28px;
        }

        p {
          color: #d7e2f3;
          line-height: 1.6;
        }

        .avatar {
          display: block;
          width: 100%;
          margin: 20px auto;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
        }

        .instruction {
          margin-top: 18px;
          padding: 16px;
          color: #f5c451;
          font-weight: 700;
          line-height: 1.6;
          border: 1px solid rgba(245, 196, 81, 0.4);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.08);
        }

        button {
          width: 100%;
          margin-top: 14px;
          padding: 14px 18px;
          color: #111827;
          font-size: 16px;
          font-weight: 800;
          border: 0;
          border-radius: 999px;
          background: linear-gradient(
            135deg,
            #f5c451,
            #f59e0b
          );
        }
      </style>
    </head>

    <body>
      <main class="container">
        <h1>🎉 Avatar đã sẵn sàng!</h1>

        <p>
          Trên iPhone, hãy nhấn giữ vào ảnh bên dưới,
          sau đó chọn <strong>“Lưu vào Ảnh”</strong>
          hoặc <strong>“Save to Photos”</strong>.
        </p>

        <img
          class="avatar"
          src="${imageUrl}"
          alt="Avatar K15FM"
        >

        <div class="instruction">
          Nhấn giữ ảnh khoảng 1–2 giây
          → chọn “Lưu vào Ảnh”.
        </div>

        <button onclick="window.close()">
          Quay lại trang tạo Avatar
        </button>
      </main>
    </body>
    </html>
  `);

  saveWindow.document.close();
}

downloadBtn.addEventListener("click", async () => {
  if (!photo) {
    alert("Bạn vui lòng chọn ảnh trước nhé!");
    return;
  }

  const oldButtonText = downloadBtn.textContent;
  downloadBtn.disabled = true;
  downloadBtn.textContent = "Đang tạo ảnh...";

  try {
    const blob = await canvasToBlob(canvas);

    const fileName =
      `avatar-k15fm-${currentFrame || "classic"}.png`;

    const file = new File(
      [blob],
      fileName,
      { type: "image/png" }
    );

    /*
     * Ưu tiên bảng chia sẻ gốc của iPhone.
     * Người dùng có thể chọn “Lưu hình ảnh”.
     */
    const canShareFile =
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [file] });

    if (isIOSDevice() && canShareFile) {
      try {
        await navigator.share({
          files: [file],
          title: "Avatar K15FM",
          text: "K15FM – Thanh xuân phát lại"
        });

        return;
      } catch (shareError) {
        /*
         * AbortError xảy ra khi người dùng tự đóng bảng chia sẻ.
         * Khi đó không cần hiện lỗi.
         */
        if (shareError.name === "AbortError") {
          return;
        }
      }
    }

    /*
     * iPhone hoặc trình duyệt Facebook:
     * mở ảnh để người dùng nhấn giữ và lưu.
     */
    if (isIOSDevice() || isFacebookBrowser()) {
      const imageUrl = canvas.toDataURL("image/png");
      showIOSSaveScreen(imageUrl);
      return;
    }

    /*
     * Chrome, Cốc Cốc, Samsung Internet và trình duyệt desktop.
     */
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 1500);
  } catch (error) {
    console.error(error);

    /*
     * Phương án dự phòng cuối cùng:
     * mở ảnh PNG trực tiếp.
     */
    const imageUrl = canvas.toDataURL("image/png");
    showIOSSaveScreen(imageUrl);
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.textContent = oldButtonText;
  }
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
const iosNotice = document.getElementById("iosNotice");

if (iosNotice && (isIOSDevice() || isFacebookBrowser())) {
  iosNotice.hidden = false;
}
