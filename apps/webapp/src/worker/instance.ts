import * as Comlink from "comlink";
import { groupBy, indexBy, prop, unique } from "remeda";
import { db } from "../lib/db";
import { splitQueries } from "@repo/github";
import { LATEST_SCHEMA_VERSION, type Pull } from "@repo/model";
import { GitHubClient, isInAttentionSet } from "@repo/github";
import { gitHubClient } from "../github";

const syncPullsIntervalMillis = 5 * 60_000;    // 5 minutes
const syncViewersIntervalMillis = 60 * 60_000; // 1 hour

declare const self: SharedWorkerGlobalScope;

function syncViewers(client: GitHubClient) {
    syncViewersOnce(client)
        .then(() => setInterval(syncViewers, syncViewersIntervalMillis))
        .catch(console.error);
}

async function executeActivity(name: string, intervalMillis: number, force: boolean, fn: () => Promise<void>): Promise<void> {
    const activity = await db.activities.get(name);
    if (!force && activity !== undefined && activity.refreshTime > new Date(Date.now() - intervalMillis)) {
        return;
    }
    if (activity !== undefined && activity.running) {
        // Do not run activities concurrently.
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

export async function syncViewersOnce(client: GitHubClient, force: boolean = false): Promise<void> {
    await executeActivity("syncViewers", syncViewersIntervalMillis, force, async () => {
        const connections = await db.connections.toArray();
        for (const connection of connections) {
            const viewer = await client.getViewer(connection);
            await db.connections.update(connection, { viewer });
        }
        console.log(`Synced ${connections.length} connections`);
    });
}

function syncPulls(client: GitHubClient) {
    syncPullsOnce(client)
        .then(() => setInterval(syncPulls, syncPullsIntervalMillis))
        .catch(console.error);
}

export async function syncPullsOnce(client: GitHubClient, force: boolean = false): Promise<void> {
    await executeActivity("syncPulls", syncPullsIntervalMillis, force, async () => {
        const connections = await db.connections.toArray();
        const sections = await db.sections.toArray();

        // Search for pull requests for every section and every connection.
        // Every request returns node IDs for matching pull requests, and
        // the date at which each pull request was last updated.
        const rawResults = (
            await Promise.all(sections.flatMap(section => {
                return connections.flatMap(connection => {
                    const queries = splitQueries(section.search);
                    return queries.flatMap(async query => {
                        const pulls = await client.searchPulls(connection, query);
                        return pulls.map(res => ({
                            ...res,
                            uid: `${connection.id}:${res.id}`,
                            sections: [section.id],
                            connection: connection.id,
                        }));
                    });
                });
            }))
        ).flat();

        // Deduplicate pull requests present in multiple sections.
        const results = Object.values(groupBy(rawResults, pull => pull.uid))
            .map(vs => ({ ...vs[0], sections: vs.flatMap(v => unique(v.sections)) }));
        
        // For every unique pull request, fetch information about it.
        const stars = new Set((await db.stars.toArray()).map(star => star.uid));
        const connectionsById = indexBy(connections, prop("id"));
        const sectionsInAttentionSet = new Set(sections.filter(v => v.attention).map(v => v.id));
        const previousKeys = new Set(await db.pulls.toCollection().primaryKeys());

        const stats = { new: 0, unchanged: 0, updated: 0 };

        const pulls: Pull[] = await Promise.all(results.map(async res => {
            if (previousKeys.has(res.uid)) {
                const previousPull = await db.pulls.get(res.uid);
                // Avoid fetching information if the pull request did not change.
                if (previousPull !== undefined 
                    && res.updatedAt <= previousPull.updatedAt 
                    && previousPull.schemaVersion === LATEST_SCHEMA_VERSION
                ) {
                    stats.unchanged += 1;
                    return previousPull;
                } else {
                    stats.updated += 1;
                }
            } else {
                stats.new += 1;
            }
            const connection = connectionsById[res.connection];
            const pull = await client.getPull(connection, res.id);
            const mayBeInAttentionSet = res.sections.some(v => sectionsInAttentionSet.has(v));
            return {
                ...pull,
                uid: res.uid,
                connection: res.connection,
                sections: res.sections,
                host: connection.host,
                schemaVersion: LATEST_SCHEMA_VERSION,
                starred: stars.has(res.uid) ? 1 : 0,
                attention: mayBeInAttentionSet ? isInAttentionSet(connection, pull) : undefined,
            }
        }));

        // Upsert current pull requests...
        await db.pulls.bulkPut(pulls);

        // ... and remove previous pull requests that are not anymore included in any sections.
        const staleKeys = new Set(previousKeys);
        pulls.forEach(pull => staleKeys.delete(pull.uid));
        await db.pulls.bulkDelete(Array.from(staleKeys));

        console.log(`Synced ${pulls.length} pull requests: ${stats.new} new, ${stats.updated} updated, ${stats.unchanged} unchanged, ${staleKeys.size} deleted`);
    });
}

export type Api = {
    refreshPulls: () => Promise<void>,
    refreshViewers: () => Promise<void>,
}

self.addEventListener("connect", (event: MessageEvent) => {
    // Start background sync with GitHub.
    syncViewers(gitHubClient);
    syncPulls(gitHubClient);

    // Expose an API to our clients.
    const api: Api = {
        refreshPulls: () => syncPullsOnce(gitHubClient, true),
        refreshViewers: () => syncViewersOnce(gitHubClient, true),
    };
    Comlink.expose(api, event.ports[0]);
});

export default null;