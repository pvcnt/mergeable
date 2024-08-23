import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightLinksValidator from "starlight-links-validator";

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
      sidebar: [
        {
          label: "About",
          autogenerate: { directory: "about" },
        },
        {
          label: "User Guide",
          autogenerate: { directory: "user-guide" },
        },
        {
          label: "Self-Host",
          autogenerate: { directory: "self-host" },
        },
      ],
      customCss: [
        './src/styles/home.css',
        './src/styles/theme.css',
      ],
      plugins: [
        starlightLinksValidator({
          errorOnRelativeLinks: false,
        })],
    }),
  ],
});
