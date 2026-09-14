(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Preloader / açılış animasyonu ---------------- */
  var preloader = document.querySelector(".preloader");
  function hidePreloader() {
    if (preloader) preloader.classList.add("is-hidden");
    document.body.classList.remove("is-locked");
  }
  document.body.classList.add("is-locked");
  window.addEventListener("load", function () {
    setTimeout(hidePreloader, prefersReducedMotion ? 0 : 1400);
  });
  setTimeout(hidePreloader, 4000);

  /* ---------------- Header scroll state ---------------- */
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- Mobile nav ---------------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mainNav = document.querySelector(".main-nav");
  navToggle.addEventListener("click", function () {
    var open = mainNav.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  mainNav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      mainNav.classList.remove("is-open");
      navToggle.classList.remove("is-open");
    });
  });

  /* ---------------- Hero slideshow ---------------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  if (slides.length > 1) {
    var activeIndex = 0;
    setInterval(function () {
      slides[activeIndex].classList.remove("is-active");
      activeIndex = (activeIndex + 1) % slides.length;
      slides[activeIndex].classList.add("is-active");
    }, 5000);
  }

  /* ---------------- Drifting coins ---------------- */
  var drift = document.querySelector(".coin-drift");
  if (drift && !prefersReducedMotion) {
    for (var i = 0; i < 10; i++) {
      var s = document.createElement("span");
      var size = 10 + Math.random() * 26;
      s.style.width = size + "px";
      s.style.height = size + "px";
      s.style.left = Math.random() * 100 + "%";
      s.style.animationDuration = 14 + Math.random() * 16 + "s";
      s.style.animationDelay = -(Math.random() * 20) + "s";
      drift.appendChild(s);
    }
  }

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------- Animated stat counters ---------------- */
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var counted = new WeakSet();
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || counted.has(entry.target)) return;
        counted.add(entry.target);
        var el = entry.target;
        var target = parseInt(el.dataset.count, 10);
        var suffix = el.dataset.suffix || "";
        if (prefersReducedMotion) { el.textContent = target + suffix; return; }
        var start = 0;
        var duration = 1200;
        var startTime = null;
        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          el.textContent = Math.round(start + (target - start) * progress) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------------- Gallery lightbox ---------------- */
  var galleryButtons = Array.prototype.slice.call(document.querySelectorAll(".gallery-grid button"));
  var lightbox = document.querySelector(".lightbox");
  var lightboxImg = lightbox ? lightbox.querySelector("img") : null;
  var currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    var img = galleryButtons[index].querySelector("img");
    lightboxImg.src = img.dataset.full || img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add("is-open");
    document.body.classList.add("is-locked");
  }
  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("is-locked");
  }
  function step(dir) {
    currentIndex = (currentIndex + dir + galleryButtons.length) % galleryButtons.length;
    openLightbox(currentIndex);
  }
  galleryButtons.forEach(function (btn, i) {
    btn.addEventListener("click", function () { openLightbox(i); });
  });
  if (lightbox) {
    lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    lightbox.querySelector(".lightbox-prev").addEventListener("click", function () { step(-1); });
    lightbox.querySelector(".lightbox-next").addEventListener("click", function () { step(1); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    });
  }

  /* ---------------- Reservation form — doğrudan WhatsApp ---------------- */
  var HOTEL_WHATSAPP = "905549841700";

  var form = document.getElementById("reservation-form");
  if (form) {
    var checkin = form.querySelector("#checkin");
    var checkout = form.querySelector("#checkout");
    var nightsNote = form.querySelector("#nights-note");
    var msg = form.querySelector(".form-msg");

    var todayStr = new Date().toISOString().slice(0, 10);
    checkin.min = todayStr;
    checkout.min = todayStr;

    function updateNights() {
      if (!checkin.value || !checkout.value) { nightsNote.classList.remove("is-visible"); return; }
      var nights = Math.round((new Date(checkout.value) - new Date(checkin.value)) / 86400000);
      if (nights > 0) {
        nightsNote.textContent = nights === 1 ? "1 gecelik konaklama seçtiniz." : nights + " gecelik konaklama seçtiniz.";
        nightsNote.classList.add("is-visible");
      } else {
        nightsNote.textContent = "Çıkış tarihi, giriş tarihinden sonra olmalıdır.";
        nightsNote.classList.add("is-visible");
      }
    }
    checkin.addEventListener("change", function () { checkout.min = checkin.value || todayStr; updateNights(); });
    checkout.addEventListener("change", updateNights);

    function buildMessage(data) {
      return [
        "Merhaba, Mangır Otel için rezervasyon talebim var.",
        "",
        "Ad Soyad: " + data.name,
        "Telefon: " + data.phone,
        "Giriş: " + data.checkin,
        "Çıkış: " + data.checkout,
        "Kişi sayısı: " + data.guests,
        "Oda tercihi: " + data.room,
        (data.notes ? "Not: " + data.notes : null)
      ].filter(Boolean).join("\n");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      msg.textContent = ""; msg.className = "form-msg";

      var data = {
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        checkin: checkin.value,
        checkout: checkout.value,
        guests: form.guests.value,
        room: form.room.options[form.room.selectedIndex].text,
        notes: form.notes.value.trim()
      };

      if (!data.name || !data.phone || !data.checkin || !data.checkout) {
        msg.textContent = "Lütfen ad, telefon, giriş ve çıkış tarihini doldurun.";
        msg.classList.add("err");
        return;
      }
      if (new Date(data.checkout) <= new Date(data.checkin)) {
        msg.textContent = "Çıkış tarihi giriş tarihinden sonra olmalıdır.";
        msg.classList.add("err");
        return;
      }

      var waUrl = "https://wa.me/" + HOTEL_WHATSAPP + "?text=" + encodeURIComponent(buildMessage(data));
      window.open(waUrl, "_blank", "noopener");

      msg.textContent = "WhatsApp'a yönlendiriliyorsunuz — mesajı gönderdiğinizde talebiniz otelimize ulaşacak.";
      msg.classList.add("ok");
    });
  }

  /* ---------------- Places (Gezilecek Yerler) filters + modal ---------------- */
  var HOTEL_ADDRESS = "İsmetpaşa, İnönü Cd. No:185, 17000 Çanakkale Merkez";
  var placeFilters = Array.prototype.slice.call(document.querySelectorAll(".places-filter"));
  var placeCards = Array.prototype.slice.call(document.querySelectorAll(".place-card"));

  if (placeFilters.length) {
    placeFilters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        placeFilters.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        var filter = btn.dataset.filter;
        placeCards.forEach(function (card) {
          var cats = (card.dataset.cat || "").split(" ");
          var show = filter === "all" || cats.indexOf(filter) !== -1;
          card.style.display = show ? "" : "none";
        });
      });
    });
  }

  var placeModal = document.getElementById("place-modal");
  if (placeModal && placeCards.length) {
    var pmTag = document.getElementById("pm-tag");
    var pmTitle = document.getElementById("pm-title");
    var pmDist = document.getElementById("pm-dist");
    var pmTime = document.getElementById("pm-time");
    var pmDesc = document.getElementById("pm-desc");
    var pmMap = document.getElementById("pm-map");

    function openPlaceModal(card) {
      pmTag.textContent = card.dataset.tag || "";
      pmTitle.textContent = card.dataset.title || "";
      pmDist.textContent = card.dataset.dist || "-";
      pmTime.textContent = card.dataset.time || "-";
      pmDesc.textContent = card.dataset.desc || "";
      var dest = encodeURIComponent(card.dataset.map || card.dataset.title || "Çanakkale");
      var origin = encodeURIComponent(HOTEL_ADDRESS);
      pmMap.href = "https://www.google.com/maps/dir/?api=1&origin=" + origin + "&destination=" + dest;
      placeModal.classList.add("is-open");
      document.body.classList.add("is-locked");
    }
    function closePlaceModal() {
      placeModal.classList.remove("is-open");
      document.body.classList.remove("is-locked");
    }
    placeCards.forEach(function (card) {
      card.addEventListener("click", function () { openPlaceModal(card); });
    });
    document.getElementById("place-modal-close").addEventListener("click", closePlaceModal);
    placeModal.addEventListener("click", function (e) { if (e.target === placeModal) closePlaceModal(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && placeModal.classList.contains("is-open")) closePlaceModal();
    });
  }

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
