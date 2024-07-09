import * as Comlink from "comlink";
import { groupBy } from "remeda";
import { getPulls } from "@repo/github";
import { db } from "@repo/storage";
import type { Pull } from "@repo/types";

const intervalMillis = 300_000; // 5 minutes

declare const self: SharedWorkerGlobalScope;

function syncPulls() {
    syncPullsOnce().catch(console.error);
    setInterval(syncPulls, intervalMillis);
}

async function syncPullsOnce() {
    const connections = await db.connections.toArray();
    const sections = await db.sections.toArray();
    const stars = new Set((await db.stars.toArray()).map(star => star.uid));

    const fetchedAt = new Date();
    const rawPulls: Pull[] = (
        await Promise.all(sections.flatMap(section => {
            return connections.map(async connection => {
                const pulls = await getPulls(connection, section.search);
                return pulls.map(pull => {
                    const uid = `${connection.host},${pull.repo},${pull.number}`
                    const starred = stars.has(uid) ? 1 : 0;
                    const sections = [section.id];
                    return { uid, fetchedAt, starred, sections, ...pull };
                });
            });
        }))
    ).flat();

    const pulls: Pull[] = Object.values(groupBy(rawPulls, pull => pull.uid))
        .map(vs => ({ ...vs[0], sections: vs.flatMap(v => v.sections) }));

    await db.pulls.bulkPut(pulls);

    // Remove extraneous items, i.e., pull requests that are not anymore included in any sections.
    const keys = new Set(await db.pulls.toCollection().primaryKeys());
    pulls.forEach(pull => keys.delete(pull.uid));
    await db.pulls.bulkDelete(Array.from(keys));

    console.log(`Fetched ${pulls.length} pull requests [${connections.length} connections, ${sections.length} sections]`);
}

export type Api = {
    refresh: () => Promise<void>,
}

self.addEventListener("connect", (event: MessageEvent) => {
    // Start background sync with GitHub.
    syncPulls();

    // Expose an API to our clients.
    const api: Api = { refresh: syncPullsOnce };
    Comlink.expose(api, event.ports[0]);
});

export default null;