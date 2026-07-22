const TEACHER_INVITATION_CONFIG = {
  MAIN_IMAGE_URL: "/assets/images/thumoi/thu-moi-chinh-base.jpg",

  // Tọa độ trên ảnh gốc 617 x 848.
  TEXT_X: 93,
  TEXT_Y: 205,

  MAX_TEXT_WIDTH: 435,
  DEFAULT_FONT_SIZE: 10.4,
  MIN_FONT_SIZE: 7.2,

  FONT_FAMILY: '"Times New Roman", Georgia, serif',
  TEXT_COLOR: "#f4e6bd",

  DOWNLOAD_PREFIX: "Thu-moi-K15FM"
};

const state = {
  image: null,
  imageReady: false
};

const canvas = document.getElementById("mainInvitationCanvas");
const ctx = canvas.getContext("2d");

const teacherNameInput = document.getElementById("teacherName");
const teacherTitleInput = document.getElementById("teacherTitle");
const formMessage = document.getElementById("formMessage");

function escapeFileName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildInvitationLine() {
  const teacherName = teacherNameInput.value.trim();
  const teacherTitle = teacherTitleInput.value.trim();

  let text = "Kính gửi: Thầy/Cô";

  if (teacherName) {
    text += " " + teacherName;
  }

  if (teacherTitle) {
    text += " - " + teacherTitle;
  }

  return text;
}

function fitFontSize(text) {
  let size = TEACHER_INVITATION_CONFIG.DEFAULT_FONT_SIZE;

  while (size > TEACHER_INVITATION_CONFIG.MIN_FONT_SIZE) {
    ctx.font =
      "600 " +
      size +
      "px " +
      TEACHER_INVITATION_CONFIG.FONT_FAMILY;

    if (
      ctx.measureText(text).width <=
      TEACHER_INVITATION_CONFIG.MAX_TEXT_WIDTH
    ) {
      break;
    }

    size -= 0.2;
  }

  return size;
}

function drawInvitation() {
  if (!state.imageReady) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(state.image, 0, 0, canvas.width, canvas.height);

  const text = buildInvitationLine();
  const fontSize = fitFontSize(text);

  ctx.save();
  ctx.font =
    "600 " +
    fontSize +
    "px " +
    TEACHER_INVITATION_CONFIG.FONT_FAMILY;

  ctx.fillStyle = TEACHER_INVITATION_CONFIG.TEXT_COLOR;
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,.45)";
  ctx.shadowBlur = 1.2;
  ctx.shadowOffsetY = 0.7;

  ctx.fillText(
    text,
    TEACHER_INVITATION_CONFIG.TEXT_X,
    TEACHER_INVITATION_CONFIG.TEXT_Y
  );

  ctx.restore();

  if (
    fontSize <=
    TEACHER_INVITATION_CONFIG.MIN_FONT_SIZE + 0.1
  ) {
    formMessage.textContent =
      "Tên hoặc chức vụ đang khá dài. Bạn nên rút gọn để chữ rõ hơn.";
  } else {
    formMessage.textContent = "";
  }
}

function downloadInvitation() {
  const teacherName = teacherNameInput.value.trim();
  const teacherTitle = teacherTitleInput.value.trim();

  if (!teacherName) {
    formMessage.textContent =
      "Bạn hãy nhập tên Thầy/Cô trước khi tải thư mời.";
    teacherNameInput.focus();
    return;
  }

  drawInvitation();

  const safeName =
    escapeFileName(teacherName) || "Thay-Co";

  const link = document.createElement("a");
  link.download =
    TEACHER_INVITATION_CONFIG.DOWNLOAD_PREFIX +
    "-" +
    safeName +
    ".png";

  link.href = canvas.toDataURL("image/png", 1);
  link.click();
}

function loadMainImage() {
  const image = new Image();

  image.onload = function () {
    state.image = image;
    state.imageReady = true;

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    drawInvitation();
  };

  image.onerror = function () {
    formMessage.textContent =
      "Không tải được ảnh nền thư mời. Kiểm tra đường dẫn file ảnh.";
  };

  image.src =
    TEACHER_INVITATION_CONFIG.MAIN_IMAGE_URL +
    "?v=20260722-1";
}

document
  .querySelectorAll(".invitation-tab")
  .forEach(function (tab) {
    tab.addEventListener("click", function () {
      const tabName = tab.dataset.tab;

      document
        .querySelectorAll(".invitation-tab")
        .forEach(function (item) {
          const active =
            item.dataset.tab === tabName;

          item.classList.toggle(
            "is-active",
            active
          );

          item.setAttribute(
            "aria-selected",
            String(active)
          );
        });

      document
        .querySelectorAll(".invitation-panel")
        .forEach(function (panel) {
          const active =
            panel.dataset.panel === tabName;

          panel.classList.toggle(
            "is-active",
            active
          );

          panel.hidden = !active;
        });
    });
  });

document
  .getElementById("previewMain")
  .addEventListener("click", drawInvitation);

document
  .getElementById("downloadMain")
  .addEventListener("click", downloadInvitation);

teacherNameInput.addEventListener("input", drawInvitation);
teacherTitleInput.addEventListener("input", drawInvitation);

loadMainImage();
