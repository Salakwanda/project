// Basic client-side helpers and form validation
document.addEventListener("DOMContentLoaded", function () {
  // Simple client-side form validation for registration and login
  // Client-side UI interactions: nav toggle, flash dismiss, and submit feedback
  // Mobile nav toggle
  const navToggle = document.getElementById("navToggle");
  const nav = document.querySelector(".nav-links");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      const expanded = nav.classList.contains("open");
      navToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
    // close nav when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !nav.contains(e.target) &&
        !navToggle.contains(e.target) &&
        nav.classList.contains("open")
      ) {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Auto-dismiss flash messages after a short interval
  const flashes = document.querySelectorAll(".flash");
  if (flashes.length) {
    setTimeout(() => {
      flashes.forEach((f) => f.classList.add("fade-out"));
    }, 3000);
    // Remove from DOM after animation
    setTimeout(() => flashes.forEach((f) => f.remove()), 3800);
  }

  // Show spinner on form submissions to give feedback
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", function (e) {
      // Allow normal HTML validation to run — only attach UX feedback
      const submit = form.querySelector("button[type=submit]");
      if (submit) {
        submit.disabled = true;
        const original = submit.innerHTML;
        submit.innerHTML =
          '<span class="spinner" aria-hidden="true"></span> ' +
          (submit.getAttribute("data-wait") || "Please wait...");
        // In case of client-side validation failure, re-enable after small delay
        setTimeout(() => {
          // If page hasn't navigated, restore button
          try {
            submit.disabled = false;
            submit.innerHTML = original;
          } catch (err) {}
        }, 3000);
      }
    });
  });

  // Add small entrance animation to key sections for visual polish
  document
    .querySelectorAll(".card, .hero, table, .form")
    .forEach((el) => el.classList.add("fade-in-up", "reveal"));

  // IntersectionObserver for reveal animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  // Booking price estimate updates (if on book page)
  const bookForm = document.getElementById("bookForm");
  if (bookForm) {
    const radios = bookForm.elements["needs_transport"];
    const medsCheckbox = document.getElementById("collect_medication");
    const priceEl = document.getElementById("priceEstimate");
    function updatePrice() {
      const selected = Array.from(radios).find((r) => r.checked).value;
      let total = 50;
      if (selected === "yes") total += 20;
      if (medsCheckbox && medsCheckbox.checked) total += 10;
      if (priceEl) priceEl.textContent = "$" + total;
    }
    Array.from(radios).forEach((r) =>
      r.addEventListener("change", updatePrice)
    );
    if (medsCheckbox) medsCheckbox.addEventListener("change", updatePrice);
    updatePrice();
  }

  // Notification and profile toggles
  const notifBtn = document.getElementById("notifBtn");
  const notifPop = document.getElementById("notifPop");
  const profileBtn = document.getElementById("profileBtn");
  const profilePop = document.getElementById("profilePop");
  if (notifBtn && notifPop) {
    notifBtn.addEventListener("click", (e) => {
      if (notifPop.classList.contains("open")) {
        hidePopover(notifPop, notifBtn);
      } else {
        showPopover(notifPop, notifBtn);
      }
    });
  }
  if (profileBtn && profilePop) {
    profileBtn.addEventListener("click", (e) => {
      if (profilePop.classList.contains("open")) {
        hidePopover(profilePop, profileBtn);
      } else {
        showPopover(profilePop, profileBtn, true);
      }
    });
  }

  // Close popovers when clicking outside or pressing Escape
  document.addEventListener("click", (e) => {
    if (
      notifPop &&
      !notifPop.contains(e.target) &&
      notifBtn &&
      !notifBtn.contains(e.target)
    ) {
      if (notifPop.classList.contains("open")) hidePopover(notifPop, notifBtn);
    }
    if (
      profilePop &&
      !profilePop.contains(e.target) &&
      profileBtn &&
      !profileBtn.contains(e.target)
    ) {
      if (profilePop.classList.contains("open"))
        hidePopover(profilePop, profileBtn);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (notifPop && notifPop.classList.contains("open"))
        hidePopover(notifPop, notifBtn);
      if (profilePop && profilePop.classList.contains("open"))
        hidePopover(profilePop, profileBtn);
      if (nav && nav.classList.contains("open")) {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    }
  });

  // Utility functions for animated popovers
  function showPopover(pop, btn, focusFirst = false) {
    pop.removeAttribute("hidden");
    // allow CSS transition
    requestAnimationFrame(() => pop.classList.add("open"));
    btn.setAttribute("aria-expanded", "true");
    // focus first focusable element inside if requested
    if (focusFirst) {
      const focusable = pop.querySelector("a,button,input,select,textarea");
      if (focusable) {
        focusable.focus();
      } else {
        // fallback to focusing the pop container itself
        setTimeout(() => pop.focus(), 50);
      }
    } else {
      // small courtesy focus so keyboard users can close with Escape
      setTimeout(() => pop.focus(), 120);
    }
  }

  function hidePopover(pop, btn) {
    pop.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    // wait for transition to finish before hiding to allow animation
    const ms = 220;
    setTimeout(() => {
      pop.setAttribute("hidden", "");
    }, ms);
  }

  // Close button inside profile popover
  document.querySelectorAll(".pop-close").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const pop = btn.closest(".profile-pop, .notif-pop");
      if (!pop) return;
      if (pop.classList.contains("open")) {
        if (pop.id === "profilePop") hidePopover(pop, profileBtn);
        else if (pop.id === "notifPop") hidePopover(pop, notifBtn);
      }
    });
  });

  // Hide profile popover when clicking a menu item (useful for non-navigation links)
  document.querySelectorAll(".profile-pop .menu-item").forEach((mi) => {
    mi.addEventListener("click", (e) => {
      const href = mi.getAttribute("href") || "";
      if (href === "#" || href === "") {
        e.preventDefault();
        hidePopover(document.getElementById("profilePop"), profileBtn);
      }
    });
  });
});
