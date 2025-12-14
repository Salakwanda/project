// Basic client-side helpers and form validation
document.addEventListener("DOMContentLoaded", function () {
  // Simple client-side form validation for registration and login
  // Client-side UI interactions: nav toggle, flash dismiss, and submit feedback
  // Mobile nav toggle
  const navToggle = document.getElementById("navToggle");
  const nav = document.querySelector(".nav-links");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => nav.classList.toggle("open"));
  }

  // Auto-dismiss flash messages after a short interval
  const flashes = document.querySelectorAll(".flash");
  if (flashes.length) {
    setTimeout(() => {
      flashes.forEach((f) => f.classList.add("fade-out"));
    }, 3000);
    // Remove from DOM after animation
    setTimeout(() => flashes.forEach((f) => f.remove()), 3400);
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
    .forEach((el) => el.classList.add("fade-in-up"));
});
