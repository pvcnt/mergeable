export default {
  fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return new Response("OK");
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
