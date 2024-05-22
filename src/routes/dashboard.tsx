import { useCallback, useContext, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@blueprintjs/core"

import { Section, emptySectionConfig, ConfigContext } from "../config"
import SectionDialog from "../components/SectionDialog"
import DashboardSection from "../components/DashboardSection"
import { Diff } from "../model"
import SearchInput from "../components/SearchInput"
import { useDiffs } from "../queries"

function matches(diff: Diff, tokens: string[]): boolean {
    return tokens.length === 0 || tokens.every(tok => diff.title.toLowerCase().indexOf(tok) > -1 || diff.repository.indexOf(tok) > -1)
}

function sum(values: number[]): number {
    return values.reduce((acc, v) => acc + v, 0)
}

export default function Dashboard() {
    const { config, setConfig } = useContext(ConfigContext)
    const [ search, setSearch ] = useState("")
    const [ isEditing, setEditing ] = useState(false)
    const [ searchParams, setSearchParams ] = useSearchParams()
    const [ newSection, setNewSection ] = useState(emptySectionConfig)

    const diffs = useDiffs(config)

    const refetchAll = useCallback(async () => {
		await Promise.all(diffs.map(res => res.refetch()));
	}, [diffs]);

    const isFetching = diffs.some(res => res.isFetching)

    const tokens = search.split(" ").map(tok => tok.toLowerCase())

    const count = sum(config.sections.map((section, idx) => {
        if (section.notified) {
            return sum(diffs.slice(idx * config.connections.length, (idx + 1) * config.connections.length).map(res => res.data?.diffs.length || 0))
        }
        return 0
    }))

    // Change window's title to include number of diffs.
    useEffect(() => {
        if (count > 0) {
            document.title = `(${count}) Reviewer`
        } else {
            document.title = "Reviewer"
        }
    }, [count])

    // Open a "New section" dialog if URL is a share link.
    useEffect(() => {
        if (searchParams.get("action") === "share") {
            setNewSection({
                label: searchParams.get("label") || emptySectionConfig.label,
                search: searchParams.get("search") || emptySectionConfig.search,
                notified: emptySectionConfig.notified
            })
            setEditing(true)
        }
    }, [searchParams])

    const handleSubmit = (config: Section) => {
        setConfig(v => ({...v, sections: [config, ...v.sections]}))

        // Remove sharing parameters from URL if they were defined once the new section
        // has been created from those parameters.
        if (searchParams.get("action") === "share") {
            setSearchParams({})
        }
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
                <SearchInput value={search} onChange={setSearch} className="grow"/>
                <Button text="New section" icon="plus" onClick={() => setEditing(true)} className="ml-4"/>
                <Button
                    icon="refresh"
                    disabled={isFetching}
                    loading={isFetching}
                    className="ml-4"
                    onClick={refetchAll}/>
            </div>
            <SectionDialog
                section={newSection}
                title="New section"
                isOpen={isEditing}
                isNew={true}
                onClose={() => setEditing(false)}
                onSubmit={handleSubmit}/>
            {config !== undefined && config.sections.map((section, idx) => {
                const data = diffs.slice(idx * config.connections.length, (idx + 1) * config.connections.length)
                return (
                    <DashboardSection
                        key={idx}
                        section={section}
                        isLoading={data.some(res => res.isLoading)}
                        diffs={data.flatMap(res => (res.data?.diffs || []).filter(v => matches(v, tokens)))}
                        hasMore={data.some(res => res.data?.hasMore)}
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
