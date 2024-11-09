// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["assets/out.css", "assets/base.css"],
  app: {
    buildAssetsDir: "/",
  },
});
