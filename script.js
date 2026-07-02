const params = new URLSearchParams(window.location.search);
const lopRaw = params.get("lop") || "K15 FM";
const lopDisplay = lopRaw.toUpperCase().replace(/\s*K15$/i, "").trim();

const className = document.getElementById("className");
if (className) className.textContent = lopDisplay;

const eventDate = new Date("2026-08-09T08:00:00+07:00");

function updateCountdown(){
  const now = new Date();
  const diff = eventDate - now;

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  if (diff <= 0){
    daysEl.textContent = "0";
    hoursEl.textContent = "0";
    minutesEl.textContent = "0";
    secondsEl.textContent = "0";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  daysEl.textContent = days;
  hoursEl.textContent = hours;
  minutesEl.textContent = minutes;
  secondsEl.textContent = seconds;
}
updateCountdown();
setInterval(updateCountdown, 1000);

const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting) entry.target.classList.add("show");
  });
},{threshold:.16});
reveals.forEach(el=>observer.observe(el));
