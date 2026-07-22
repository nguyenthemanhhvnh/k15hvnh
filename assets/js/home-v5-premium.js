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
