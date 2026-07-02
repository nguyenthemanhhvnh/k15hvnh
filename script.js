// Lấy tên lớp từ link, ví dụ: ?lop=KTBK15
const params = new URLSearchParams(window.location.search);
const lopRaw = params.get("lop") || "K15 FM";

// Hiển thị tên lớp gọn hơn: KTBK15 -> KTB, KTB K15 -> KTB
const lopDisplay = lopRaw
  .toUpperCase()
  .replace(/\s*K15$/i, "")
  .trim();

document.getElementById("className").textContent = lopDisplay;

// Countdown đến 08:00 ngày 09/08/2026
const target = new Date("2026-08-09T08:00:00+07:00").getTime();

function updateCountdown(){
  const distance = Math.max(target - Date.now(), 0);

  document.getElementById("days").textContent = Math.floor(distance / 86400000);
  document.getElementById("hours").textContent = Math.floor(distance / 3600000) % 24;
  document.getElementById("minutes").textContent = Math.floor(distance / 60000) % 60;
  document.getElementById("seconds").textContent = Math.floor(distance / 1000) % 60;
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Hiệu ứng xuất hiện khi cuộn
const observer = new IntersectionObserver((entries)=>{
  entries.forEach((entry)=>{
    if(entry.isIntersecting){
      entry.target.classList.add("show");
    }
  });
},{threshold:0.15});

document.querySelectorAll(".reveal").forEach((el)=>observer.observe(el));
