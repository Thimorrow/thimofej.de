type VisibilitySource = Pick<Document, "hidden" | "addEventListener" | "removeEventListener">;

/** Keep expensive rendering asleep until entry, and while the tab is hidden. */
export function subscribeCanvasActivity(
  onEnter: (callback: () => void) => () => void,
  visibility: VisibilitySource,
  onChange: (active: boolean) => void,
) {
  let entered = false;
  let disposed = false;
  const update = () => {
    if (!disposed) onChange(entered && !visibility.hidden);
  };
  const unsubscribe = onEnter(() => {
    entered = true;
    update();
  });
  visibility.addEventListener("visibilitychange", update);
  update();

  return () => {
    disposed = true;
    unsubscribe();
    visibility.removeEventListener("visibilitychange", update);
  };
}
