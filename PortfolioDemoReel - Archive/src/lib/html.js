/**
 * Tiny tagged-template helper. Components return strings instead of React
 * elements, so values must already be trusted or deliberately escaped.
 */
export function html(strings, ...values) {
  return strings.reduce((out, str, i) => {
    if (i === 0) return str;
    const value = values[i - 1];
    const chunk = Array.isArray(value) ? value.join("") : (value ?? "");
    return out + chunk + str;
  }, "");
}

export function mount(target, markup) {
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el) return null;
  el.innerHTML = markup;
  return el;
}
