(function () {
  "use strict";

  function setYear() {
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  function markMissingImages() {
    var images = document.querySelectorAll(".media-tile img");
    images.forEach(function (img) {
      img.addEventListener("error", function () {
        var tile = img.closest(".media-tile");
        if (tile) tile.classList.add("is-missing");
      });
    });
  }

  function initLightbox() {
    var modal = document.getElementById("lightbox");
    if (!modal) return;

    var modalImg = document.getElementById("lightboxImg");
    var modalCaption = document.getElementById("lightboxCaption");
    var closeBtn = modal.querySelector(".modal-close");
    var lastActiveEl = null;
    var bodyScrollY = 0;
    var isOpen = false;

    function lockScroll() {
      bodyScrollY = window.scrollY || 0;
      document.body.style.position = "fixed";
      document.body.style.top = "-" + bodyScrollY + "px";
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    }

    function unlockScroll() {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, bodyScrollY);
    }

    function getFocusableEls() {
      return modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    }

    function onKeyDown(e) {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }

      if (e.key !== "Tab") return;
      var focusable = Array.prototype.slice.call(getFocusableEls());
      if (focusable.length === 0) return;

      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      var active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || active === modal) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    function openFromTrigger(triggerEl) {
      if (!modalImg) return;

      var src = triggerEl.getAttribute("data-modal-src") || "";
      var alt = triggerEl.getAttribute("data-modal-alt") || "";
      var caption = triggerEl.getAttribute("data-modal-caption") || "";

      lastActiveEl = document.activeElement;
      modalImg.alt = alt;
      modalImg.src = src;

      if (modalCaption) {
        modalCaption.textContent = caption;
      }

      modal.setAttribute("aria-hidden", "false");
      lockScroll();
      isOpen = true;

      if (closeBtn) closeBtn.focus();
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;

      modal.setAttribute("aria-hidden", "true");
      unlockScroll();

      if (modalImg) {
        modalImg.src = "";
        modalImg.alt = "";
      }
      if (modalCaption) modalCaption.textContent = "";

      if (lastActiveEl && typeof lastActiveEl.focus === "function") {
        lastActiveEl.focus();
      }
    }

    document.addEventListener("click", function (e) {
      var trigger = e.target.closest(".js-open-modal");
      if (trigger) {
        e.preventDefault();
        openFromTrigger(trigger);
        return;
      }

      if (!isOpen) return;
      var closeTarget = e.target.closest("[data-close='true']");
      if (closeTarget) {
        e.preventDefault();
        close();
      }
    });

    document.addEventListener("keydown", onKeyDown);

    if (modalImg) {
      modalImg.addEventListener("error", function () {
        if (modalCaption) {
          var existing = modalCaption.textContent ? modalCaption.textContent + " — " : "";
          modalCaption.textContent = existing + "(Missing asset file)";
        }
      });
    }

    window.__jnLightboxClose = close;
  }

  function initParticles() {
    var prefersReduced = false;
    try {
      prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      prefersReduced = false;
    }
    if (prefersReduced) return;

    var isMobile = false;
    try {
      isMobile = !!(window.matchMedia && window.matchMedia("(max-width: 780px)").matches);
    } catch (e) {
      isMobile = (window.innerWidth || 9999) <= 780;
    }

    var host = document.getElementById("particles-js");
    if (!host) return;

    if (typeof window.particlesJS !== "function") return;

    var config = {
      particles: {
        number: { value: 260, density: { enable: true, value_area: 700 } },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: {
          value: 0.78,
          random: true,
          anim: { enable: true, speed: 0.6, opacity_min: 0.18, sync: false }
        },
        size: {
          value: 2.9,
          random: true,
          anim: { enable: true, speed: 1.6, size_min: 0.8, sync: false }
        },
        line_linked: { enable: true, distance: 175, color: "#ffffff", opacity: 0.32, width: 1 },
        move: {
          enable: true,
          speed: 0.95,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out"
        }
      },
      interactivity: {
        detect_on: "window",
        events: {
          onhover: { enable: true, mode: "repulse" },
          onclick: { enable: true, mode: "push" },
          resize: true
        },
        modes: {
          repulse: { distance: 50, duration: 0.08 },
          push: { particles_nb: 8 }
        }
      },
      retina_detect: true
    };

    if (isMobile) {
      config.particles.number.value = 155;
      config.particles.number.density.value_area = 1350;
      config.particles.line_linked.distance = 125;
      config.particles.line_linked.opacity = 0.32;
      config.particles.line_linked.width = 1;
    }

    window.particlesJS("particles-js", config);

    installParticlesHoverGlow();
  }

  function initGalleryDeepLinks() {
    var body = document.body;
    if (!body || body.getAttribute("data-gallery-page") !== "true") return;

    var modal = document.getElementById("lightbox");
    if (!modal) return;

    var suppressNextHashRoute = false;

    function isModalOpen() {
      return modal.getAttribute("aria-hidden") === "false";
    }

    function parseHashId() {
      var raw = window.location.hash || "";
      if (!raw || raw === "#") return "";
      try {
        return decodeURIComponent(raw.slice(1)).trim();
      } catch (e) {
        return raw.slice(1).trim();
      }
    }

    function findTileById(id) {
      if (!id) return null;
      var byDomId = document.getElementById(id);
      if (byDomId) return byDomId;

      try {
        return document.querySelector('[data-gallery-id="' + CSS.escape(id) + '"]');
      } catch (e) {
        return document.querySelector('[data-gallery-id="' + id.replace(/"/g, "") + '"]');
      }
    }

    function clearHashNoScroll() {
      if (!window.location.hash) return;
      try {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      } catch (e) {
        window.location.hash = "";
      }
    }

    function routeFromHash() {
      if (suppressNextHashRoute) {
        suppressNextHashRoute = false;
        return;
      }

      var id = parseHashId();
      if (!id) {
        if (isModalOpen() && typeof window.__jnLightboxClose === "function") {
          window.__jnLightboxClose();
        }
        return;
      }

      var tile = findTileById(id);
      if (!tile) return;

      if (!tile.classList.contains("js-open-modal")) return;

      tile.click();
    }

    document.addEventListener(
      "click",
      function (e) {
        var trigger = e.target && e.target.closest && e.target.closest(".js-open-modal[data-gallery-id]");
        if (!trigger) return;

        var id = trigger.getAttribute("data-gallery-id") || trigger.id || "";
        if (!id) return;

        if (parseHashId() === id) return;

        suppressNextHashRoute = true;
        window.location.hash = id;
      },
      true
    );

    (function wrapCloseToClearHash() {
      var originalClose = window.__jnLightboxClose;
      if (typeof originalClose !== "function") return;

      if (originalClose.__jnWrapped) return;

      var wrapped = function () {
        clearHashNoScroll();
        return originalClose();
      };
      wrapped.__jnWrapped = true;
      window.__jnLightboxClose = wrapped;
    })();

    window.addEventListener("hashchange", routeFromHash);

    if (window.location.hash) {
      window.setTimeout(routeFromHash, 0);
    }
  }

  function installParticlesHoverGlow() {
    var attempt = 0;

    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function lerpRgb(a, b, t) {
      return {
        r: Math.round(lerp(a.r, b.r, t)),
        g: Math.round(lerp(a.g, b.g, t)),
        b: Math.round(lerp(a.b, b.b, t))
      };
    }

    function tryInstall() {
      var pJS = window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS;
      if (!pJS || !pJS.particles || !pJS.particles.array) {
        attempt += 1;
        if (attempt < 40) window.setTimeout(tryInstall, 50);
        return;
      }

      var baseLineRgb = pJS.particles.line_linked.color_rgb_line || { r: 255, g: 255, b: 255 };
      baseLineRgb = { r: baseLineRgb.r, g: baseLineRgb.g, b: baseLineRgb.b };
      var baseLineOpacity = pJS.particles.line_linked.opacity;
      var baseLineDistance = pJS.particles.line_linked.distance;
      var baseLineWidth =
        typeof pJS.particles.line_linked.width === "number" ? pJS.particles.line_linked.width : 1;
      var baseMoveSpeed = pJS.particles.move && typeof pJS.particles.move.speed === "number" ? pJS.particles.move.speed : 1;

      var glowRgb = { r: 255, g: 58, b: 58 }; // red interaction glow
      var baseHex = "#ffffff";
      var lastInside = false;
      var lastMouseX = null;
      var lastMouseY = null;
      var refillFrames = 0;

      if (!pJS.__jnOverlayPatched && pJS.fn && typeof pJS.fn.particlesDraw === "function") {
        var originalDraw = pJS.fn.particlesDraw.bind(pJS.fn);
        pJS.fn.particlesDraw = function () {
          originalDraw();
          drawLocalizedLinkGlow();
        };
        pJS.__jnOverlayPatched = true;
      }

      function drawLocalizedLinkGlow() {
        var mouse = pJS.interactivity && pJS.interactivity.mouse;
        var active = !!(pJS.interactivity && pJS.interactivity.status === "mousemove");

        var mx = mouse ? mouse.pos_x : null;
        var my = mouse ? mouse.pos_y : null;
        var hasMousePos =
          typeof mx === "number" &&
          typeof my === "number" &&
          isFinite(mx) &&
          isFinite(my) &&
          mx > -50 &&
          my > -50 &&
          mx < pJS.canvas.w + 50 &&
          my < pJS.canvas.h + 50;
        if (!active || !hasMousePos) return;

        var ctx = pJS.canvas && pJS.canvas.ctx;
        if (!ctx) return;

        var particles = pJS.particles.array;
        var near = [];
        var nearDist = 210;
        var nearDist2 = nearDist * nearDist;
        var maxNear = 70;

        for (var i = 0; i < particles.length; i++) {
          var p = particles[i];
          var dx = p.x - mx;
          var dy = p.y - my;
          var d2 = dx * dx + dy * dy;
          if (d2 <= nearDist2) {
            near.push(p);
            if (near.length >= maxNear) break;
          }
        }
        if (near.length < 2) return;

        var linkDist = 165;
        var linkDist2 = linkDist * linkDist;

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";

        for (var a = 0; a < near.length; a++) {
          var pa = near[a];
          var dax = pa.x - mx;
          var day = pa.y - my;
          var da = Math.sqrt(dax * dax + day * day);
          var wa = clamp(1 - da / nearDist, 0, 1);
          if (wa <= 0) continue;

          for (var b = a + 1; b < near.length; b++) {
            var pb = near[b];
            var dx2 = pa.x - pb.x;
            var dy2 = pa.y - pb.y;
            var dd2 = dx2 * dx2 + dy2 * dy2;
            if (dd2 > linkDist2) continue;

            var dbx = pb.x - mx;
            var dby = pb.y - my;
            var db = Math.sqrt(dbx * dbx + dby * dby);
            var wb = clamp(1 - db / nearDist, 0, 1);
            var w = Math.min(wa, wb);
            if (w <= 0) continue;

            var dd = Math.sqrt(dd2);
            var alpha = clamp((1 - dd / linkDist) * 0.95 * (0.35 + 0.65 * w), 0, 1);
            if (alpha <= 0.02) continue;

            ctx.strokeStyle = "rgba(" + glowRgb.r + "," + glowRgb.g + "," + glowRgb.b + "," + alpha + ")";
            ctx.lineWidth = clamp(1.2 + 2.8 * w, 1.2, 4);
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.stroke();
          }
        }

        ctx.restore();
      }

      function tick() {
        var mouse = pJS.interactivity && pJS.interactivity.mouse;
        var active = !!(pJS.interactivity && pJS.interactivity.status === "mousemove");

        var mx = mouse ? mouse.pos_x : null;
        var my = mouse ? mouse.pos_y : null;
        var hasMousePos =
          typeof mx === "number" &&
          typeof my === "number" &&
          isFinite(mx) &&
          isFinite(my) &&
          mx > -50 &&
          my > -50 &&
          mx < pJS.canvas.w + 50 &&
          my < pJS.canvas.h + 50;

        if (active && hasMousePos) {
          lastMouseX = mx;
          lastMouseY = my;
        }

        if (!active && lastInside) {
          refillFrames = 22;
        }
        lastInside = active;

        var glowDist = 230;

        pJS.particles.line_linked.color = baseHex;
        pJS.particles.line_linked.color_rgb_line = baseLineRgb;
        pJS.particles.line_linked.opacity = baseLineOpacity;
        pJS.particles.line_linked.width = baseLineWidth;
        pJS.particles.line_linked.distance = baseLineDistance;

        if (refillFrames > 0) {
          refillFrames -= 1;
          var refillT = refillFrames / 22;
          if (pJS.particles.move) {
            pJS.particles.move.speed = baseMoveSpeed + (1.35 * refillT);
          }
        } else {
          if (pJS.particles.move) pJS.particles.move.speed = baseMoveSpeed;
        }

        var particles = pJS.particles.array;
        var maxGlow = 0;
        for (var i = 0; i < particles.length; i++) {
          var pt = particles[i];

          if (!pt.__jnBaseRgb) {
            var seed = (pt.color && pt.color.rgb) || { r: 255, g: 255, b: 255 };
            pt.__jnBaseRgb = { r: seed.r, g: seed.g, b: seed.b };
            pt.__jnGlow = 0;
          }

          var targetGlow = 0;
          if (active && hasMousePos) {
            var dx = pt.x - mx;
            var dy = pt.y - my;
            var d = Math.sqrt(dx * dx + dy * dy);
            targetGlow = clamp(1 - d / glowDist, 0, 1);
          }

          pt.__jnGlow = pt.__jnGlow + (targetGlow - pt.__jnGlow) * (active ? 0.35 : 0.5);
          if (pt.__jnGlow > maxGlow) maxGlow = pt.__jnGlow;

          if (pt.__jnGlow < 0.01) {
            if (pt.color && pt.color.rgb) pt.color.rgb = pt.__jnBaseRgb;
            if ("opacity_bubble" in pt) delete pt.opacity_bubble;
            if ("radius_bubble" in pt) delete pt.radius_bubble;
          } else {
            if (pt.color && pt.color.rgb) pt.color.rgb = lerpRgb(pt.__jnBaseRgb, glowRgb, pt.__jnGlow);
            pt.opacity_bubble = clamp(pt.opacity + pt.__jnGlow * 0.65, 0, 1);
            pt.radius_bubble = pt.radius + pt.__jnGlow * 2.2;
          }

          if (refillFrames > 0 && lastMouseX !== null && lastMouseY !== null) {
            var ax = lastMouseX - pt.x;
            var ay = lastMouseY - pt.y;
            var ad = Math.sqrt(ax * ax + ay * ay) || 1;
            var pull = clamp(1 - ad / 520, 0, 1);
            if (pull > 0) {
              var kick = pull * 0.08;
              pt.vx = clamp(pt.vx + (ax / ad) * kick, -1.8, 1.8);
              pt.vy = clamp(pt.vy + (ay / ad) * kick, -1.8, 1.8);
            }
          }
        }

        window.requestAnimationFrame(tick);
      }

      window.requestAnimationFrame(tick);
    }

    tryInstall();
  }

  setYear();
  markMissingImages();
  initLightbox();
  initGalleryDeepLinks();
  initParticles();
})();
