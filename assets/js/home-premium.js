const HOME_CONFIG = {
  EVENT_DATE: "2026-08-09T08:00:00+07:00"
};

const els = {
  days: document.getElementById("countDays"),
  hours: document.getElementById("countHours"),
  minutes: document.getElementById("countMinutes"),
  seconds: document.getElementById("countSeconds")
};

function pad(value) {
  return String(Math.max(0, value)).padStart(2, "0");
}

function updateCountdown() {
  const eventTime = new Date(HOME_CONFIG.EVENT_DATE).getTime();
  const now = Date.now();
  const diff = Math.max(0, eventTime - now);

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  els.days.textContent = pad(days);
  els.hours.textContent = pad(hours);
  els.minutes.textContent = pad(minutes);
  els.seconds.textContent = pad(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);
