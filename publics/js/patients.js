document.addEventListener("DOMContentLoaded", () => {
  const patientModal = document.querySelector('[data-modal="add-patient"]');
  if (!patientModal) return;

  const confirmModal = document.querySelector('[data-modal="confirm"]');

  /* ===== Patient create/edit modal ===== */
  const patientForm = patientModal.querySelector("[data-patient-form]");
  const hiddenId = patientForm?.querySelector('input[name="id"]');
  const nameInput = patientForm?.querySelector('input[name="fullName"]');
  const birthInput = patientForm?.querySelector('input[name="birthDate"]');
  const illnessInput = patientForm?.querySelector('textarea[name="illness"]');
  const submitButton = patientForm?.querySelector("[data-submit-label]");
  const titleEl = patientModal.querySelector(".modal__title");
  const subtitleEl = patientModal.querySelector("[data-modal-subtitle]");
  const firstField = patientModal.querySelector('input[name="fullName"]');

  const defaults = {
    title: titleEl ? titleEl.textContent.trim() : "",
    subtitle: subtitleEl ? subtitleEl.textContent.trim() : "",
    submit: submitButton ? submitButton.textContent.trim() : "",
  };

  const openPatientButtons = document.querySelectorAll(
    '[data-open-modal="add-patient"]'
  );

  function setPatientMode(mode, dataset = {}) {
    if (!patientForm) return;
    if (mode === "edit") {
      const id = dataset.patientId || "";
      patientForm.action = `/patients/${id}/edit`;
      if (hiddenId) hiddenId.value = id;
      if (nameInput) nameInput.value = dataset.patientName || "";
      if (birthInput) birthInput.value = dataset.patientBirth || "";
      if (illnessInput)
        illnessInput.value = dataset.patientIllness || "";
      if (titleEl) titleEl.textContent = "Edit patient";
      if (subtitleEl)
        subtitleEl.textContent = "Update the patient details below.";
      if (submitButton) submitButton.textContent = "Update patient";
    } else {
      patientForm.action = "/patients/add";
      patientForm.reset();
      if (hiddenId) hiddenId.value = "";
      if (titleEl) titleEl.textContent = defaults.title;
      if (subtitleEl) subtitleEl.textContent = defaults.subtitle;
      if (submitButton)
        submitButton.textContent = defaults.submit || "Save patient";
    }
  }

  function focusFirst(modalEl) {
    const explicit = modalEl.querySelector("[data-focus-default]");
    if (explicit instanceof HTMLElement) {
      explicit.focus();
      return;
    }
    const focusable = modalEl.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable instanceof HTMLElement) {
      focusable.focus();
    }
  }

  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add("is-open");
    modalEl.setAttribute("aria-hidden", "false");
    document.body.style.setProperty("overflow", "hidden");
    setTimeout(() => {
      if (modalEl === patientModal && firstField) {
        firstField.focus();
      } else {
        focusFirst(modalEl);
      }
    }, 30);
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove("is-open");
    modalEl.setAttribute("aria-hidden", "true");
    const openers = document.querySelectorAll(
      `[data-open-modal="${modalEl.dataset.modal}"]`
    );
    openers.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
    if (modalEl === patientModal) {
      setPatientMode("create");
    }
    if (!document.querySelector(".modal.is-open")) {
      document.body.style.removeProperty("overflow");
    }
  }

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLElement)) return;

    const openAttr = event.target.closest("[data-open-modal]");
    if (openAttr) {
      const target = openAttr.dataset.openModal;
      const modalEl = document.querySelector(`[data-modal="${target}"]`);
      if (modalEl === patientModal) {
        const mode =
          openAttr.getAttribute("data-modal-mode") === "edit"
            ? "edit"
            : "create";
        setPatientMode(mode, openAttr.dataset);
      }
      openAttr.setAttribute("aria-expanded", "true");
      openModal(modalEl);
      event.preventDefault();
      return;
    }

    if (event.target.matches("[data-close-modal]")) {
      const modalEl = event.target.closest(".modal");
      closeModal(modalEl);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const openModalEl = document.querySelector(".modal.is-open");
      if (openModalEl) {
        event.preventDefault();
        closeModal(openModalEl);
      }
    }
  });

  const confirmMessageEl =
    confirmModal?.querySelector("[data-confirm-message]");
  const confirmForm = confirmModal?.querySelector("[data-confirm-form]");

  if (confirmModal && confirmForm) {
    confirmForm.addEventListener("submit", () => {
      closeModal(confirmModal);
    });

    document.querySelectorAll('form[data-confirm="delete"]').forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = form.dataset.confirmName || "this record";
        const message = `Are you sure you want to delete ${name}? This action cannot be undone.`;
        if (confirmMessageEl) confirmMessageEl.textContent = message;

        confirmForm.setAttribute("action", form.getAttribute("action") || "");

        const method =
          form.getAttribute("method") || form.dataset.method || "POST";
        confirmForm.setAttribute("method", method);

        confirmForm
          .querySelectorAll('input[type="hidden"]')
          .forEach((node) => node.remove());

        form.querySelectorAll("input, textarea, select").forEach((field) => {
          if (!field.name) return;
          let confirmField = confirmForm.querySelector(
            `[name="${field.name}"]`
          );
          if (!confirmField) {
            confirmField = document.createElement("input");
            confirmField.type = "hidden";
            confirmField.name = field.name;
            confirmForm.appendChild(confirmField);
          }
          confirmField.value = field.value;
        });

        openModal(confirmModal);
      });
    });
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("modal") === "add-patient") {
    const modeParam = params.get("mode");
    const idParam = params.get("id");
    if (modeParam === "edit" && idParam) {
      const targetBtn = Array.from(openPatientButtons).find(
        (btn) => btn.dataset.patientId === idParam
      );
      if (targetBtn) {
        setPatientMode("edit", targetBtn.dataset);
      } else {
        setPatientMode("create");
      }
    } else {
      setPatientMode("create");
    }
    openModal(patientModal);
    params.delete("modal");
    params.delete("mode");
    params.delete("id");
    const newUrl =
      window.location.pathname +
      (params.toString() ? `?${params.toString()}` : "") +
      window.location.hash;
    window.history.replaceState({}, "", newUrl);
  }
});
