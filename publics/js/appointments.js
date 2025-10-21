document.addEventListener("DOMContentLoaded", () => {
  const appointmentModal = document.querySelector(
    '[data-modal="add-appointment"]'
  );
  if (!appointmentModal) return;

  const viewModal = document.querySelector('[data-modal="view-appointment"]');
  const confirmModal = document.querySelector('[data-modal="confirm"]');

  const appointmentForm = appointmentModal.querySelector(
    "[data-appointment-form]"
  );
  const hiddenId = appointmentForm?.querySelector('input[name="id"]');
  const patientSelect = appointmentForm?.querySelector(
    "[data-appointment-patient]"
  );
  const doctorSelect = appointmentForm?.querySelector(
    "[data-appointment-doctor]"
  );
  const dateInput = appointmentForm?.querySelector(
    "[data-appointment-date]"
  );
  const submitButton = appointmentForm?.querySelector(
    "[data-appointment-submit]"
  );
  const titleEl = appointmentModal.querySelector(".modal__title");
  const subtitleEl = appointmentModal.querySelector(
    "[data-appointment-modal-subtitle]"
  );
  const firstField = patientSelect;

  const defaults = {
    title: titleEl ? titleEl.textContent.trim() : "",
    subtitle: subtitleEl ? subtitleEl.textContent.trim() : "",
    submit: submitButton ? submitButton.textContent.trim() : "",
  };

  const openAppointmentButtons = document.querySelectorAll(
    '[data-open-modal="add-appointment"]'
  );

  const viewFields = viewModal
    ? {
        patient: viewModal.querySelector('[data-appointment-field="patient"]'),
        doctor: viewModal.querySelector('[data-appointment-field="doctor"]'),
        date: viewModal.querySelector('[data-appointment-field="date"]'),
      }
    : null;

  function setAppointmentMode(mode, dataset = {}) {
    if (!appointmentForm) return;
    if (mode === "edit") {
      const id = dataset.appointmentId || "";
      appointmentForm.action = `/appointments/${id}/edit`;
      if (hiddenId) hiddenId.value = id;
      if (patientSelect)
        patientSelect.value = dataset.appointmentPatientId || "";
      if (doctorSelect)
        doctorSelect.value = dataset.appointmentDoctorId || "";
      if (dateInput) dateInput.value = dataset.appointmentDate || "";
      if (titleEl) titleEl.textContent = "Edit appointment";
      if (subtitleEl)
        subtitleEl.textContent = "Update the appointment details below.";
      if (submitButton) submitButton.textContent = "Update appointment";
    } else {
      appointmentForm.action = "/appointments/add";
      appointmentForm.reset();
      if (hiddenId) hiddenId.value = "";
      if (patientSelect) patientSelect.value = "";
      if (doctorSelect) doctorSelect.value = "";
      if (dateInput) dateInput.value = "";
      if (titleEl) titleEl.textContent = defaults.title;
      if (subtitleEl) subtitleEl.textContent = defaults.subtitle;
      if (submitButton)
        submitButton.textContent = defaults.submit || "Save appointment";
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
      if (modalEl === appointmentModal && firstField) {
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
    if (modalEl === appointmentModal) {
      setAppointmentMode("create");
    } else if (modalEl === viewModal && viewFields) {
      Object.values(viewFields).forEach((field) => field && (field.value = ""));
    }
    if (!document.querySelector(".modal.is-open")) {
      document.body.style.removeProperty("overflow");
    }
  }

  function formatReadableDate(raw) {
    if (!raw) return "";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLElement)) return;

    const openAttr = event.target.closest("[data-open-modal]");
    if (openAttr) {
      const target = openAttr.dataset.openModal;
      const modalEl = document.querySelector(`[data-modal="${target}"]`);
      if (modalEl === appointmentModal) {
        const mode =
          openAttr.getAttribute("data-modal-mode") === "edit"
            ? "edit"
            : "create";
        setAppointmentMode(mode, openAttr.dataset);
      } else if (modalEl === viewModal && viewFields) {
        if (viewFields.patient)
          viewFields.patient.value = openAttr.dataset.appointmentPatient || "";
        if (viewFields.doctor)
          viewFields.doctor.value = openAttr.dataset.appointmentDoctor || "";
        if (viewFields.date)
          viewFields.date.value = formatReadableDate(
            openAttr.dataset.appointmentDate
          );
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
  if (params.get("modal") === "add-appointment") {
    const modeParam = params.get("mode");
    const idParam = params.get("id");
    if (modeParam === "edit" && idParam) {
      const targetBtn = Array.from(openAppointmentButtons).find(
        (btn) => btn.dataset.appointmentId === idParam
      );
      if (targetBtn) {
        setAppointmentMode("edit", targetBtn.dataset);
      } else {
        setAppointmentMode("create");
      }
    } else {
      setAppointmentMode("create");
    }
    openModal(appointmentModal);
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
