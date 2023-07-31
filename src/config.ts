import localforage from "localforage"
import { createContext } from "react"

export type Config = {
    sections: Section[],
    connections: Connection[],
}
  
export type Section = {
    label: string,
    search: string,
}

export type Connection = {
    host: string,
    baseUrl: string,
    auth: string,
}

const configKey = "config"

export const defaultConfig: Config = {
    sections: [
        {
            "label": "Needs your review",
            "search": "is:open review-requested:{USER} -review:approved -reviewed-by:{USER}",
        },
        {
            "label": "Changes requested",
            "search": "is:open author:{USER} review:changes_requested",
        },
        {
            "label": "Approved",
            "search": "is:open author:{USER} review:approved",
        },
        {
            "label": "Waiting for reviewers",
            "search": "is:open author:{USER} review:none",
        },
        {
            "label": "Waiting for the author",
            "search": "is:open review-requested:{USER} review:changes_requested",
        },
        {
            "label": "Draft",
            "search": "is:open author:{USER} draft:true",
        }
    ],
    connections: [],
}

export const emptyConfig = {sections: [], connections: []}
export const emptySectionConfig = {label: "", search: ""}

export function readConfig(): Promise<Config> {
    return localforage.getItem<Config>(configKey)
        .then(config => (config === null) ? defaultConfig : config)
}

export function writeConfig(config: Config): Promise<Config> {
    return localforage.setItem(configKey, config)
}

export type ConfigContextType = {
    config: Config,
    setConfig: (config: ((prevConfig: Config) => Config)) => void,
}

export const ConfigContext = createContext<ConfigContextType>({
    config: defaultConfig,
    setConfig: (v => v),
})
