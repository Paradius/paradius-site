/**
 * Contact form island — progressive enhancement over static form markup.
 * With JS disabled, visitors use the visible mailto fallback.
 */

import {
  buildLeadPayload,
  buildMailtoUrl,
  isApiConfigured,
  mapSubmitHttpError,
  parseProfileParams,
  resolveLeadsEndpoint,
  validateLeadForm,
  type ApiProblemBody,
  type FieldErrors,
  type LeadFormFieldKey,
  type LeadFormFields,
} from '../lib/contact/form';

const FIELD_KEYS: LeadFormFieldKey[] = ['name', 'email', 'company', 'message'];

function readFormFields(form: HTMLFormElement): LeadFormFields {
  const data = new FormData(form);
  return {
    name: String(data.get('name') ?? ''),
    email: String(data.get('email') ?? ''),
    company: String(data.get('company') ?? ''),
    message: String(data.get('message') ?? ''),
    website: String(data.get('website') ?? ''),
  };
}

function renderChips(
  container: HTMLElement,
  profiles: string[],
  onRemove: (code: string) => void,
): void {
  container.replaceChildren();

  for (const code of profiles) {
    const chip = document.createElement('span');
    chip.className = 'inner-chip';
    chip.setAttribute('role', 'listitem');
    chip.dataset.profileCode = code;

    const codeEl = document.createElement('span');
    codeEl.className = 'inner-chip__code';
    codeEl.textContent = code;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'inner-chip__remove';
    removeBtn.setAttribute('aria-label', `Remove ${code}`);
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => {
      onRemove(code);
    });

    chip.append(codeEl, removeBtn);
    container.append(chip);
  }
}

function clearFieldErrors(root: HTMLElement): void {
  for (const key of FIELD_KEYS) {
    const field = root.querySelector<HTMLElement>(`[data-field="${key}"]`);
    field?.classList.remove('inner-field--error');

    const input = field?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      'input, textarea',
    );
    input?.removeAttribute('aria-invalid');
    input?.removeAttribute('aria-describedby');

    const errorEl = root.querySelector<HTMLElement>(`[data-field-error="${key}"]`);
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = '';
    }
  }
}

function showFieldErrors(root: HTMLElement, errors: FieldErrors): void {
  clearFieldErrors(root);

  for (const [key, message] of Object.entries(errors) as [LeadFormFieldKey, string][]) {
    const field = root.querySelector<HTMLElement>(`[data-field="${key}"]`);
    field?.classList.add('inner-field--error');

    const errorId = `contact-${key}-error`;
    const input = field?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      'input, textarea',
    );
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', errorId);
    }

    const errorEl = root.querySelector<HTMLElement>(`[data-field-error="${key}"]`);
    if (errorEl && message) {
      errorEl.hidden = false;
      errorEl.textContent = message;
    }
  }
}

function setSubmitting(submitBtn: HTMLButtonElement, submitting: boolean): void {
  submitBtn.disabled = submitting;
  submitBtn.textContent = submitting ? 'Sending…' : (submitBtn.dataset.idleLabel ?? 'Send inquiry');
  submitBtn.setAttribute('aria-busy', String(submitting));
}

function showStatus(
  root: HTMLElement,
  kind: 'success' | 'error' | null,
): void {
  const successEl = root.querySelector<HTMLElement>('[data-status="success"]');
  const errorEl = root.querySelector<HTMLElement>('[data-status="error"]');
  const form = root.querySelector<HTMLFormElement>('#lead-form');

  successEl?.toggleAttribute('hidden', kind !== 'success');
  errorEl?.toggleAttribute('hidden', kind !== 'error');
  form?.toggleAttribute('hidden', kind === 'success');
}

function updateProfileHint(root: HTMLElement, count: number): void {
  root.querySelector<HTMLElement>('[data-field="profiles"]')?.toggleAttribute('hidden', count === 0);
  const hint = root.querySelector<HTMLElement>('[data-profile-hint]');
  if (!hint) {
    return;
  }

  hint.textContent =
    count > 0
      ? 'Pre-filled from catalog. Remove chips you no longer need.'
      : 'Add profiles from the talent catalog. Chips appear when you follow a profile link.';
}

function updateMailtoLinks(root: HTMLElement, form: HTMLFormElement, profiles: string[]): void {
  const fields = readFormFields(form);
  const mailtoUrl = buildMailtoUrl(fields, profiles);

  const staticMailto = document.querySelector<HTMLAnchorElement>('[data-static-mailto]');
  if (staticMailto) {
    staticMailto.href = mailtoUrl;
  }

  const fallbackMailto = root.querySelector<HTMLAnchorElement>('[data-mailto-fallback]');
  if (fallbackMailto) {
    fallbackMailto.href = mailtoUrl;
  }
}

async function submitLead(
  endpoint: string,
  payload: ReturnType<typeof buildLeadPayload>,
): Promise<{ ok: true } | { ok: false; status: number; body: ApiProblemBody | null }> {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, status: 0, body: null };
  }

  if (response.ok) {
    return { ok: true };
  }

  let body: ApiProblemBody | null = null;
  try {
    body = (await response.json()) as ApiProblemBody;
  } catch {
    body = null;
  }

  return { ok: false, status: response.status, body };
}

function initContactForm(): void {
  const root = document.querySelector<HTMLElement>('[data-contact-form]');
  const form = root?.querySelector<HTMLFormElement>('#lead-form');
  const chipsContainer = root?.querySelector<HTMLElement>('[data-profile-chips]');
  const submitBtn = root?.querySelector<HTMLButtonElement>('[data-submit]');

  if (!root || !form || !chipsContainer || !submitBtn) {
    return;
  }

  const apiBaseUrl = root.dataset.apiBaseUrl ?? '';
  const apiConfigured = isApiConfigured(apiBaseUrl);
  let profiles = parseProfileParams(window.location.search);

  const syncChips = (): void => {
    renderChips(chipsContainer, profiles, (code) => {
      profiles = profiles.filter((entry) => entry !== code);
      syncChips();
    });
    updateProfileHint(root, profiles.length);
    updateMailtoLinks(root, form, profiles);
  };

  syncChips();

  form.addEventListener('input', () => {
    updateMailtoLinks(root, form, profiles);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFieldErrors(root);
    showStatus(root, null);

    const fields = readFormFields(form);
    const validation = validateLeadForm(fields);
    if (!validation.valid) {
      showFieldErrors(root, validation.errors);
      return;
    }

    if (!apiConfigured) {
      window.location.href = buildMailtoUrl(fields, profiles);
      showStatus(root, 'success');
      return;
    }

    setSubmitting(submitBtn, true);

    const payload = buildLeadPayload(fields, profiles);
    const result = await submitLead(resolveLeadsEndpoint(apiBaseUrl), payload);

    setSubmitting(submitBtn, false);

    if (result.ok) {
      showStatus(root, 'success');
      return;
    }

    const errorTitle = root.querySelector<HTMLElement>('[data-error-title]');
    const errorMessage = root.querySelector<HTMLElement>('[data-error-message]');
    const errorFallback = root.querySelector<HTMLElement>('[data-error-fallback]');

    const mapped =
      result.status > 0
        ? mapSubmitHttpError(result.status, result.body)
        : {
            kind: 'network' as const,
            message: 'Unable to reach our servers.',
          };

    if (errorTitle) {
      errorTitle.textContent =
        mapped.kind === 'rate_limited' ? 'Please wait' : 'Something went wrong';
    }

    if (errorMessage) {
      errorMessage.textContent = mapped.message;
    }

    if (mapped.kind === 'validation' && mapped.fieldErrors) {
      showFieldErrors(root, mapped.fieldErrors);
    }

    if (mapped.kind === 'network' || mapped.kind === 'rate_limited') {
      errorFallback?.removeAttribute('hidden');
      updateMailtoLinks(root, form, profiles);
    } else {
      errorFallback?.setAttribute('hidden', '');
    }

    showStatus(root, 'error');
  });
}

initContactForm();
