import * as Comlink from "comlink";
import { groupBy } from "remeda";
import { getPulls, getViewer } from "@repo/github";
import { db } from "@repo/storage";
import type { Pull } from "@repo/types";

const syncPullsIntervalMillis = 5 * 60_000;    // 5 minutes
const syncViewersIntervalMillis = 60 * 60_000; // 1 hour

declare const self: SharedWorkerGlobalScope;

function syncViewers() {
    syncViewersOnce()
        .then(() => setInterval(syncViewers, syncViewersIntervalMillis))
        .catch(console.error);
}

async function executeActivity(name: string, intervalMillis: number, force: boolean, fn: () => Promise<void>): Promise<void> {
    const activity = await db.activities.get(name);
    if (!force && activity !== undefined && activity.refreshTime <= new Date(Date.now() - intervalMillis)) {
        console.log(`Not running ${name} now`);
        return;
    }
    if (activity === undefined) {
        await db.activities.add({ name, running: true, refreshTime: new Date(0) });
    } else {
        await db.activities.update(name, { running: true });
    }
    try {
        await fn();
    } finally {
        await db.activities.update(name, { running: false, refreshTime: new Date() });
    }
}

async function syncViewersOnce(force: boolean = false): Promise<void> {
    await executeActivity("syncViewers", syncViewersIntervalMillis, force, async () => {
        const connections = await db.connections.toArray();
        for (const connection of connections) {
            const viewer = await getViewer(connection);
            await db.connections.update(connection, { viewer });
        }
        console.log(`Synced ${connections.length} connections`);
    });
}

function syncPulls() {
    syncPullsOnce()
        .then(() => setInterval(syncPulls, syncPullsIntervalMillis))
        .catch(console.error);
}

async function syncPullsOnce(force: boolean = false): Promise<void> {
    await executeActivity("syncPulls", syncPullsIntervalMillis, force, async () => {
        const connections = await db.connections.toArray();
        const sections = await db.sections.toArray();
        const stars = new Set((await db.stars.toArray()).map(star => star.uid));

        const rawPulls: Pull[] = (
            await Promise.all(sections.flatMap(section => {
                return connections.map(async connection => {
                    const pulls = await getPulls(connection, section.search);
                    return pulls.map(pull => {
                        const sections = [section.id];
                        const starred = stars.has(pull.uid) ? 1 : 0;
                        return { ...pull, sections, starred };
                    });
                });
            }))
        ).flat();

        // Deduplicate pull requests present in multiple sections.
        const pulls: Pull[] = Object.values(groupBy(rawPulls, pull => pull.uid))
            .map(vs => ({ ...vs[0], sections: vs.flatMap(v => v.sections) }));

        await db.pulls.bulkPut(pulls);

        // Remove extraneous items, i.e., pull requests that are not anymore included in any sections.
        const keys = new Set(await db.pulls.toCollection().primaryKeys());
        pulls.forEach(pull => keys.delete(pull.uid));
        await db.pulls.bulkDelete(Array.from(keys));

        console.log(`Synced ${pulls.length} pull requests`);
    });
}

export type Api = {
    refreshPulls: () => Promise<void>,
    refreshViewers: () => Promise<void>,
}

self.addEventListener("connect", (event: MessageEvent) => {
    // Start background sync with GitHub.
    syncViewers();
    syncPulls();

    // Expose an API to our clients.
    const api: Api = {
        refreshPulls: () => syncPullsOnce(true),
        refreshViewers: () => syncViewersOnce(true),
    };
    Comlink.expose(api, event.ports[0]);
});

export default null;