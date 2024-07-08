import * as Comlink from "comlink";
import type { Api } from "./instance";

function memoize<T>(fn: () => T): () => T {
    let value: T | undefined;
    return () => (value ??= fn());
}

export const getWorker = memoize(() => {
    const worker = new SharedWorker(new URL("./instance", import.meta.url), {type: "module"});
    return Comlink.wrap<Api>(worker.port);
});