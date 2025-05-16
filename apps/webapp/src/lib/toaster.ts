import { OverlayToaster, type Toaster } from "@blueprintjs/core";
import { createRoot } from "react-dom/client";
import { useIsClient } from "usehooks-ts";
import { useEffect } from "react";

let toaster: Toaster | undefined;

export function useToaster() {
  const isClient = useIsClient();

  useEffect(() => {
    if (isClient && !toaster) {
      OverlayToaster.createAsync(
        {},
        {
          domRenderer: (toaster, containerElement) =>
            createRoot(containerElement).render(toaster),
        },
      )
        .then((v) => (toaster = v))
        .catch(console.error);
    }
  }, [isClient]);

  return toaster;
}
