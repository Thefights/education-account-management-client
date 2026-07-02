export const selectInputNumberTextOnFocus = (event) => {
  const input = event?.target
  window.requestAnimationFrame(() => input?.select?.())
}
