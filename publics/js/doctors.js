document.addEventListener("DOMContentLoaded", () => {
  const doctorModal = document.querySelector('[data-modal="add-doctor"]');
  if (!doctorModal) return;

  const viewModal = document.querySelector('[data-modal="view-doctor"]');
  const confirmModal = document.querySelector('[data-modal="confirm"]');

  const doctorForm = doctorModal.querySelector("[data-doctor-form]");
  const hiddenId = doctorForm?.querySelector('input[name="id"]');
  const nameInput = doctorForm?.querySelector('input[name="fullName"]');
  const specialtyInput = doctorForm?.querySelector('input[name="specialty"]');
  const submitButton = doctorForm?.querySelector("[data-doctor-submit]");
  const titleEl = doctorModal.querySelector(".modal__title");
  const subtitleEl = doctorModal.querySelector("[data-doctor-modal-subtitle]");
  const firstField = doctorModal.querySelector('input[name="fullName"]');

  const defaults = {
    title: titleEl ? titleEl.textContent.trim() : "",
    subtitle: subtitleEl ? subtitleEl.textContent.trim() : "",
    submit: submitButton ? submitButton.textContent.trim() : "",
  };

  const openDoctorButtons = document.querySelectorAll(
    '[data-open-modal="add-doctor"]'
  );

  const viewFields = viewModal
    ? {
        name: viewModal.querySelector('[data-doctor-field="name"]'),
        specialty: viewModal.querySelector('[data-doctor-field="specialty"]'),
      }
    : null;

  function setDoctorMode(mode, dataset = {}) {
    if (!doctorForm) return;
    if (mode === "edit") {
      const id = dataset.doctorId || "";
      doctorForm.action = `/doctors/${id}/edit`;
      if (hiddenId) hiddenId.value = id;
      if (nameInput) nameInput.value = dataset.doctorName || "";
      if (specialtyInput) {
        specialtyInput.value = dataset.doctorSpecialty || "";
      }
      if (titleEl) titleEl.textContent = "Edit doctor";
      if (subtitleEl)
        subtitleEl.textContent = "Update the doctor details below.";
      if (submitButton) submitButton.textContent = "Update doctor";
    } else {
      doctorForm.action = "/doctors/add";
      doctorForm.reset();
      if (hiddenId) hiddenId.value = "";
      if (titleEl) titleEl.textContent = defaults.title;
      if (subtitleEl) subtitleEl.textContent = defaults.subtitle;
      if (submitButton)
        submitButton.textContent = defaults.submit || "Save doctor";
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
      if (modalEl === doctorModal && firstField) {
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
    if (modalEl === doctorModal) {
      setDoctorMode("create");
    } else if (modalEl === viewModal && viewFields) {
      Object.values(viewFields).forEach((field) => field && (field.value = ""));
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
      if (modalEl === doctorModal) {
        const mode =
          openAttr.getAttribute("data-modal-mode") === "edit"
            ? "edit"
            : "create";
        setDoctorMode(mode, openAttr.dataset);
      } else if (modalEl === viewModal && viewFields) {
        if (viewFields.name)
          viewFields.name.value = openAttr.dataset.doctorName || "";
        if (viewFields.specialty)
          viewFields.specialty.value = openAttr.dataset.doctorSpecialty || "";
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
  if (params.get("modal") === "add-doctor") {
    const modeParam = params.get("mode");
    const idParam = params.get("id");
    if (modeParam === "edit" && idParam) {
      const targetBtn = Array.from(openDoctorButtons).find(
        (btn) => btn.dataset.doctorId === idParam
      );
      if (targetBtn) {
        setDoctorMode("edit", targetBtn.dataset);
      } else {
        setDoctorMode("create");
      }
    } else {
      setDoctorMode("create");
    }
    openModal(doctorModal);
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
