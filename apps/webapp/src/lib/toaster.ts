import { OverlayToaster } from "@blueprintjs/core";
import { createRoot } from "react-dom/client";

export const AppToaster = OverlayToaster.createAsync(
  {},
  {
    domRenderer: (toaster, containerElement) =>
      createRoot(containerElement).render(toaster),
  },
);
