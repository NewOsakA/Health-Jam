document.addEventListener("DOMContentLoaded", () => {
  const accountModal = document.querySelector('[data-modal="add-account"]');
  if (!accountModal) return;

  const viewModal = document.querySelector('[data-modal="view-account"]');
  const confirmModal = document.querySelector('[data-modal="confirm"]');

  const accountForm = accountModal.querySelector("[data-account-form]");
  const hiddenId = accountForm?.querySelector('input[name="id"]');
  const usernameInput = accountForm?.querySelector('input[name="username"]');
  const passwordInput = accountForm?.querySelector("[data-account-password]");
  const confirmInput = accountForm?.querySelector("[data-account-confirm]");
  const roleSelect = accountForm?.querySelector("[data-account-role]");
  const submitButton = accountForm?.querySelector("[data-account-submit]");
  const titleEl = accountModal.querySelector(".modal__title");
  const subtitleEl = accountModal.querySelector("[data-account-modal-subtitle]");
  const noteEl = accountModal.querySelector("[data-account-note]");

  const defaults = {
    title: titleEl ? titleEl.textContent.trim() : "",
    subtitle: subtitleEl ? subtitleEl.textContent.trim() : "",
    submit: submitButton ? submitButton.textContent.trim() : "",
    note: noteEl ? noteEl.textContent.trim() : "",
  };

  const openAccountButtons = document.querySelectorAll(
    '[data-open-modal="add-account"]'
  );

  const viewFields = viewModal
    ? {
        username: viewModal.querySelector('[data-account-field="username"]'),
        role: viewModal.querySelector('[data-account-field="role"]'),
        created: viewModal.querySelector('[data-account-field="created"]'),
      }
    : null;

  function togglePasswordRequirements(required) {
    if (!passwordInput || !confirmInput) return;
    passwordInput.required = required;
    confirmInput.required = required;
    passwordInput.value = "";
    confirmInput.value = "";
    if (required) {
      passwordInput.placeholder = "Set a password";
      confirmInput.placeholder = "Confirm password";
    } else {
      passwordInput.placeholder = "Leave blank to keep current password";
      confirmInput.placeholder = "Confirm new password";
    }
  }

  function setAccountMode(mode, dataset = {}) {
    if (!accountForm) return;
    const isEdit = mode === "edit";
    accountForm.action = isEdit
      ? `/accounts/${dataset.accountId || ""}/edit`
      : `/accounts/add`;

    if (!isEdit) {
      accountForm.reset();
    }

    if (hiddenId) hiddenId.value = isEdit ? dataset.accountId || "" : "";
    if (usernameInput)
      usernameInput.value = isEdit ? dataset.accountUsername || "" : "";
    if (roleSelect)
      roleSelect.value = isEdit
        ? dataset.accountAdmin === "1"
          ? "1"
          : "0"
        : "0";

    const isSelf = dataset.accountSelf === "true";

    if (roleSelect) roleSelect.disabled = isSelf;
    if (noteEl) {
      noteEl.textContent = isEdit
        ? "Leave password blank to keep it unchanged."
        : defaults.note;
    }

    togglePasswordRequirements(!isEdit);

    if (titleEl) titleEl.textContent = isEdit ? "Edit account" : defaults.title;
    if (subtitleEl)
      subtitleEl.textContent = isEdit
        ? "Update username, role, or password."
        : defaults.subtitle;
    if (submitButton)
      submitButton.textContent = isEdit
        ? "Update account"
        : defaults.submit || "Save account";
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
    setTimeout(() => focusFirst(modalEl), 30);
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove("is-open");
    modalEl.setAttribute("aria-hidden", "true");
    const openers = document.querySelectorAll(
      `[data-open-modal="${modalEl.dataset.modal}"]`
    );
    openers.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
    if (modalEl === accountModal) {
      setAccountMode("create");
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
      if (modalEl === accountModal) {
        const mode =
          openAttr.getAttribute("data-modal-mode") === "edit"
            ? "edit"
            : "create";
        setAccountMode(mode, openAttr.dataset);
      } else if (modalEl === viewModal && viewFields) {
        if (viewFields.username)
          viewFields.username.value =
            openAttr.dataset.accountUsername || "";
        if (viewFields.role)
          viewFields.role.value = openAttr.dataset.accountRole || "";
        if (viewFields.created)
          viewFields.created.value = formatReadableDate(
            openAttr.dataset.accountCreated
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
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn && submitBtn.disabled) return;
        event.preventDefault();
        const name = form.dataset.confirmName || "this account";
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
  if (params.get("modal") === "add-account") {
    const modeParam = params.get("mode");
    const idParam = params.get("id");
    if (modeParam === "edit" && idParam) {
      const targetBtn = Array.from(openAccountButtons).find(
        (btn) => btn.dataset.accountId === idParam
      );
      if (targetBtn) {
        setAccountMode("edit", targetBtn.dataset);
      } else {
        setAccountMode("create");
      }
    } else {
      setAccountMode("create");
    }
    openModal(accountModal);
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
