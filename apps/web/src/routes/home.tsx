import { redirect } from "react-router";
import { db } from "../lib/db";
import type { Route } from "./+types/home";
import { gitHubClient } from "../github";
import { saveConnection } from "../lib/mutations";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  // If the "token" query parameter if provided, and no connections are defined, then
  // save a new connection for github.com. This allows to login using an OAuth app.
  const isConnected = (await db.connections.count()) > 0;
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (token && !isConnected) {
    const props = {
      label: "",
      baseUrl: "https://api.github.com",
      auth: token,
      host: "github.com",
      orgs: [],
    };
    const viewer = await gitHubClient.getViewer(props);
    await saveConnection({ id: "", ...props, viewer });
  }
  return redirect("/inbox");
}
