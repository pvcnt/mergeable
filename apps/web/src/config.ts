import { Config, Section } from "@repo/types"
import localforage from "localforage"
import { createContext } from "react"

const configKey = "config"

export const defaultSections: Section[] = [
    {
        id: "",
        label: "Needs your review",
        search: "is:open review-requested:{USER} -review:approved -reviewed-by:{USER}",
        notified: true,
    },
    {
        id: "",
        label: "Changes requested",
        search: "is:open author:{USER} review:changes_requested",
        notified: true,
    },
    {
        id: "",
        label: "Approved",
        search: "is:open author:{USER} review:approved",
        notified: false,
    },
    {
        id: "",
        label: "Waiting for reviewers",
        search: "is:open author:{USER} review:none draft:false",
        notified: false,
    },
    {
        id: "",
        label: "Waiting for the author",
        search: "is:open review-requested:{USER} review:changes_requested",
        notified: false,
    },
    {
        id: "",
        label: "Draft",
        search: "is:open author:{USER} draft:true",
        notified: false,
    }
];

export const defaultConfig: Config = {
    sections: defaultSections,
    connections: [],
    stars: [],
}

export const emptyConfig = {sections: [], connections: []}
export const emptySectionConfig: Section = {id: "", label: "", search: "", notified: false}

export function readConfig(): Promise<Config> {
    return localforage.getItem<Config>(configKey)
        .then(config => (config === null) ? defaultConfig : {...defaultConfig, ...config})
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
