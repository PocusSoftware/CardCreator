export function portal(node: HTMLElement): { destroy: () => void } {
  document.body.appendChild(node);
  return {
    destroy() {
      if (node.parentNode === document.body) {
        node.remove();
      }
    },
  };
}
