import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import relativeLinks from "astro-relative-links";

// https://astro.build/config
export default defineConfig({
  site: "https://pvcnt.github.io",
  base: "mergeable",
  trailingSlash: "always",
  integrations: [
    starlight({
      title: "Mergeable",
      logo: {
        src: "./src/assets/logo.svg",
      },
      favicon: "/favicon.png",
      editLink: {
        baseUrl: "https://github.com/pvcnt/mergeable/edit/main/apps/website/",
      },
      social: {
        github: "https://github.com/pvcnt/mergeable",
      },
      pagination: false,
      sidebar: [
        {
          label: "About",
          autogenerate: { directory: "about" },
        },
        {
          label: "Get Started",
          autogenerate: { directory: "get-started" },
        },
        {
          label: "Self-Host",
          autogenerate: { directory: "self-host" },
        },
      ],
    }),
    // Better support for "base" property.
    relativeLinks(),
  ],
});
