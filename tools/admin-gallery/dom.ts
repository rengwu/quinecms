const usable = (element: Element) =>
  !element.closest('[inert]') &&
  !(element as HTMLButtonElement).disabled &&
  ((element as HTMLElement).checkVisibility?.() ?? true);
const name = (element: Element) =>
  element.getAttribute('aria-label') ?? element.textContent?.trim() ?? '';

/** The first usable control named `text`, waiting up to three seconds.
 * Rows that add details after their label match by prefix. */
export async function find(
  root: ParentNode,
  text: string,
  selector = 'button, summary, a, [role="option"], [role="combobox"]',
): Promise<HTMLElement> {
  for (let tries = 0; tries < 60; tries++) {
    const candidates = [...root.querySelectorAll(selector)].filter(usable);
    const match =
      candidates.find((element) => name(element) === text) ??
      candidates.find((element) => name(element).startsWith(text));
    if (match) return match as HTMLElement;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw Error(`“${text}” was not found.`);
}

export async function click(root: ParentNode, text: string) {
  (await find(root, text)).click();
}

export async function type(root: ParentNode, label: string, value: string) {
  const input = (await find(root, label, 'input, textarea')) as
    HTMLInputElement | HTMLTextAreaElement;
  const setter = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(input),
    'value',
  )!.set!;
  setter.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

/** Gives a hidden file input a file, as choosing one in the picker would. */
export function choose(root: ParentNode, label: string, file: File) {
  const input = root.querySelector<HTMLInputElement>(
    `input[type="file"][aria-label="${label}"]`,
  )!;
  const files = new DataTransfer();
  files.items.add(file);
  input.files = files.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

/** Specimens and scripted screens open dialogs that take focus on mount.
 * Keep the reader's scroll position when they do. */
export function focusWithoutScrolling() {
  const focus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function (options) {
    focus.call(this, { ...options, preventScroll: true });
  };
}
