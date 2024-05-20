import { useCallback, useContext, useEffect, useState } from "react";
import { Section, emptySectionConfig, ConfigContext } from "../config";
import DashboardSection from "../components/DashboardSection";
import { Button, InputGroup } from "@blueprintjs/core";
import SectionDialog from "../components/SectionDialog";
import { useQueries } from "@tanstack/react-query";
import { getPulls, getViewer } from "../github";
import { Pull } from "../model";

function matches(pull: Pull, tokens: string[]): boolean {
    return tokens.length === 0 || tokens.every(tok => pull.title.toLowerCase().indexOf(tok) > -1 || pull.repository.nameWithOwner.indexOf(tok) > -1)
}

function sum(values: number[]): number {
    return values.reduce((acc, v) => acc + v, 0)
}

export default function Dashboard() {
    const { config, setConfig } = useContext(ConfigContext)
    const [ search, setSearch ] = useState("")
    const [ isEditing, setEditing ] = useState(false)

    const viewers = useQueries({
        queries: config.connections.map(connection => ({
            queryKey: ['viewer', connection.host],
            queryFn: () => getViewer(connection),
            staleTime: Infinity,
        })),
    })
    const results = useQueries({
        queries: config.sections.flatMap(section => {
            return config.connections.map((connection, idx) => ({
                queryKey: ['pulls', connection.host, connection.auth, section.search],
                queryFn: () => getPulls(connection, section.search, viewers[idx].data?.login || ""),
                refetchInterval: 300_000,
                refetchIntervalInBackground: true,
                refetchOnWindowFocus: false,
                enabled: viewers[idx].data !== undefined,
            }))
        }),
    })

    const refetchAll = useCallback(async () => {
		await Promise.all(results.map(res => res.refetch()));
	}, [results]);

    const isFetching = results.some(res => res.isFetching)

    const tokens = search.split(" ").map(tok => tok.toLowerCase())

    const count = sum(config.sections.map((section, idx) => {
        if (section.notified) {
            return sum(results.slice(idx * config.connections.length, (idx + 1) * config.connections.length).map(res => res.data?.length || 0))
        }
        return 0
    }))

    useEffect(() => {
        if (count > 0) {
            document.title = `(${count}) Reviewer`
        } else {
            document.title = "Reviewer"
        }
    }, [count])

    const handleSubmit = (config: Section) => {
        setConfig(v => ({...v, sections: [config, ...v.sections]}))
    }
    const handleChange = (idx: number, value: Section) => {
        setConfig(v => ({...v, sections: [...v.sections.slice(0, idx), value, ...v.sections.slice(idx + 1)]}))
    }
    const handleMoveUp = (idx: number) => {
        setConfig(v => ({...v, sections: [...v.sections.slice(0, idx - 1), v.sections[idx], v.sections[idx - 1], ...v.sections.slice(idx + 1)]}))
    }
    const handleMoveDown = (idx: number) => {
        setConfig(v => ({...v, sections: [...v.sections.slice(0, idx), v.sections[idx + 1], v.sections[idx], ...v.sections.slice(idx + 1)]}))
    }
    const handleDelete = (idx: number) => {
        setConfig(v => ({...v, sections: [...v.sections.slice(0, idx), ...v.sections.slice(idx + 1)]}))
    }

    return (
        <>
            <div className="flex w-full">
                <InputGroup leftIcon="search" placeholder="Search pull requests" round className="grow" value={search} onChange={e => setSearch(e.target.value)} />
                <Button text="New section" icon="plus" onClick={() => setEditing(true)} className="ml-4"/>
                <Button icon="refresh"
                    disabled={isFetching}
                    loading={isFetching}
                    className="ml-4"
                    onClick={refetchAll}/>
            </div>
            <SectionDialog
                section={emptySectionConfig}
                title="New section"
                isOpen={isEditing}
                onClose={() => setEditing(false)}
                onSubmit={handleSubmit}/>
            {config !== undefined && config.sections.map((section, idx) => {
                return (
                    <DashboardSection key={idx}
                                      section={section}
                                      isLoading={results.slice(idx * config.connections.length, (idx + 1) * config.connections.length).some(res => res.isLoading)}
                                      data={results.slice(idx * config.connections.length, (idx + 1) * config.connections.length).map((res, idx) => ({host: config.connections[idx].host, pulls: (res.data || []).filter(v => matches(v, tokens))}))}
                                      isFirst={idx === 0}
                                      isLast={idx === config.sections.length - 1}
                                      onChange={v => handleChange(idx, v)}
                                      onDelete={() => handleDelete(idx)}
                                      onMoveUp={() => handleMoveUp(idx)}
                                      onMoveDown={() => handleMoveDown(idx)}/>
                )
            })}
        </>
    )
}
