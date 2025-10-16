// Start: Code genetated by ChatGPT

(function () {
  const nav = document.querySelector(".nav-right");
  if (!nav) return;

  // Create the moving pill once
  let indicator = document.createElement("span");
  indicator.id = "nav-indicator";
  nav.appendChild(indicator);

  const links = Array.from(nav.querySelectorAll("a"));
  const active = nav.querySelector("a.is-active");

  function moveTo(el) {
    if (!el) return;
    const navBox = nav.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    const x = box.left - navBox.left;
    indicator.style.width = `${box.width}px`;
    indicator.style.height = `${box.height}px`;
    indicator.style.transform = `translateY(-50%) translateX(${x}px)`;
  }

  // Restore last clicked position to animate from it after a page change
  function restoreFromSession() {
    try {
      const raw = sessionStorage.getItem("navIndicator");
      if (!raw) return false;
      const { left, width, height } = JSON.parse(raw);
      indicator.style.width = `${width}px`;
      indicator.style.height = `${height}px`;
      indicator.style.transform = `translateY(-50%) translateX(${left}px)`;
      // allow one frame, then animate to the new active link
      requestAnimationFrame(() => moveTo(active));
      // keep the value for the next navigation; it will be overwritten on next click
      return true;
    } catch {
      return false;
    }
  }

  // Save clicked link position BEFORE navigation
  links.forEach((link) => {
    link.addEventListener("click", () => {
      const navBox = nav.getBoundingClientRect();
      const box = link.getBoundingClientRect();
      const payload = {
        left: box.left - navBox.left,
        width: box.width,
        height: box.height,
      };
      sessionStorage.setItem("navIndicator", JSON.stringify(payload));
    });
  });

  // On first paint: if we have a stored pos, animate from it; otherwise snap to active
  if (!restoreFromSession()) {
    requestAnimationFrame(() => moveTo(active));
  }

  // Keep aligned on resize (snap to current active)
  window.addEventListener("resize", () =>
    moveTo(nav.querySelector("a.is-active"))
  );
})();

// End: Code genetated by ChatGPT
