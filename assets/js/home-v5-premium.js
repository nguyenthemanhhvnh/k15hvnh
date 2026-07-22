const HOME_V5_CONFIG = {
  EVENT_DATE: "2026-08-09T08:00:00+07:00"
};

const countdownEls = {
  days: document.getElementById("countDays"),
  hours: document.getElementById("countHours"),
  minutes: document.getElementById("countMinutes"),
  seconds: document.getElementById("countSeconds")
};

function pad(value) {
  return String(Math.max(0, value)).padStart(2, "0");
}

function updateValue(element, value) {
  const nextValue = pad(value);

  if (element.textContent !== nextValue) {
    element.textContent = nextValue;
    element.classList.add("is-ticking");

    window.setTimeout(function () {
      element.classList.remove("is-ticking");
    }, 160);
  }
}

function updateCountdown() {
  const eventTime =
    new Date(HOME_V5_CONFIG.EVENT_DATE).getTime();

  const diff =
    Math.max(0, eventTime - Date.now());

  const days =
    Math.floor(diff / 86400000);

  const hours =
    Math.floor((diff % 86400000) / 3600000);

  const minutes =
    Math.floor((diff % 3600000) / 60000);

  const seconds =
    Math.floor((diff % 60000) / 1000);

  updateValue(countdownEls.days, days);
  updateValue(countdownEls.hours, hours);
  updateValue(countdownEls.minutes, minutes);
  updateValue(countdownEls.seconds, seconds);
}

function setupReveal() {
  const elements =
    document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    elements.forEach(function (element) {
      element.classList.add("is-visible");
    });
    return;
  }

  const observer =
    new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add(
              "is-visible"
            );

            observer.unobserve(
              entry.target
            );
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -30px 0px"
      }
    );

  elements.forEach(function (element) {
    observer.observe(element);
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);
setupReveal();

function setupK15MusicPlayer() {
  const audio =
    document.getElementById("k15ThemeSong");

  const toggle =
    document.getElementById("musicToggle");

  const icon =
    document.querySelector(".v5-radio__play-icon");

  const progress =
    document.getElementById("musicProgress");

  const currentTime =
    document.getElementById("musicCurrentTime");

  const duration =
    document.getElementById("musicDuration");

  const mute =
    document.getElementById("musicMute");

  const radio =
    document.querySelector(".v5-radio");

  if (
    !audio ||
    !toggle ||
    !progress ||
    !currentTime ||
    !duration
  ) {
    return;
  }

  function formatAudioTime(seconds) {
    if (!Number.isFinite(seconds)) {
      return "00:00";
    }

    const minutes =
      Math.floor(seconds / 60);

    const remainingSeconds =
      Math.floor(seconds % 60);

    return (
      String(minutes).padStart(2, "0") +
      ":" +
      String(remainingSeconds).padStart(2, "0")
    );
  }

  function updatePlayerState() {
    const isPlaying =
      !audio.paused && !audio.ended;

    toggle.setAttribute(
      "aria-pressed",
      String(isPlaying)
    );

    toggle.setAttribute(
      "aria-label",
      isPlaying
        ? "Tạm dừng bài hát"
        : "Phát bài hát"
    );

    icon.textContent =
      isPlaying ? "❚❚" : "▶";

    radio.classList.toggle(
      "is-playing",
      isPlaying
    );
  }

  toggle.addEventListener(
    "click",
    async function () {
      try {
        if (audio.paused) {
          await audio.play();
        } else {
          audio.pause();
        }

        updatePlayerState();
      } catch (error) {
        console.error(
          "Không thể phát nhạc:",
          error
        );
      }
    }
  );

  audio.addEventListener(
    "loadedmetadata",
    function () {
      duration.textContent =
        formatAudioTime(audio.duration);
    }
  );

  audio.addEventListener(
    "timeupdate",
    function () {
      currentTime.textContent =
        formatAudioTime(audio.currentTime);

      if (audio.duration) {
        progress.value =
          (audio.currentTime /
            audio.duration) *
          100;
      }
    }
  );

  progress.addEventListener(
    "input",
    function () {
      if (audio.duration) {
        audio.currentTime =
          (Number(progress.value) /
            100) *
          audio.duration;
      }
    }
  );

  if (mute) {
    mute.addEventListener(
      "click",
      function () {
        audio.muted = !audio.muted;

        mute.textContent =
          audio.muted ? "🔇" : "🔊";

        mute.setAttribute(
          "aria-pressed",
          String(audio.muted)
        );

        mute.setAttribute(
          "aria-label",
          audio.muted
            ? "Bật âm thanh"
            : "Tắt âm thanh"
        );
      }
    );
  }

  audio.addEventListener(
    "play",
    updatePlayerState
  );

  audio.addEventListener(
    "pause",
    updatePlayerState
  );

  audio.addEventListener(
    "ended",
    function () {
      progress.value = 0;
      audio.currentTime = 0;
      updatePlayerState();
    }
  );

  updatePlayerState();
}

setupK15MusicPlayer();

