import { useCallback, useContext, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@blueprintjs/core"

import { emptySectionConfig, ConfigContext } from "../config"
import SectionDialog from "@repo/ui/components/SectionDialog"
import DashboardSection from "@repo/ui/components/DashboardSection"
import { Pull, Section } from "@repo/types"
import SearchInput from "@repo/ui/components/SearchInput"
import { usePulls } from "../queries"
import { getPullUid } from "@repo/ui/utils/pull"

function matches(pull: Pull, tokens: string[]): boolean {
    return tokens.length === 0 || tokens.every(tok => pull.title.toLowerCase().indexOf(tok) > -1 || pull.repository.indexOf(tok) > -1)
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

    const pulls = usePulls(config)

    const refetchAll = useCallback(async () => {
		await Promise.all(pulls.map(res => res.refetch()));
	}, [pulls]);

    const isFetching = pulls.some(res => res.isFetching)

    const tokens = search.split(" ").map(tok => tok.toLowerCase())

    const count = sum(config.sections.map((section, idx) => {
        if (section.notified) {
            return sum(pulls.slice(idx * config.connections.length, (idx + 1) * config.connections.length).map(res => res.data?.pulls.length || 0))
        }
        return 0
    }))

    const stars = new Set(config.stars)
    const handleStar = (pull: Pull) => {
        const uid = getPullUid(pull)
        setConfig(prev => prev.stars.indexOf(uid) > -1 
            ? {...prev, stars: prev.stars.filter(s => s != uid)} 
            : {...prev, stars: prev.stars.concat([uid])})
    }

    // Change window's title to include number of pull requests.
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
                const data = pulls.slice(idx * config.connections.length, (idx + 1) * config.connections.length)
                return (
                    <DashboardSection
                        key={idx}
                        section={section}
                        isLoading={data.some(res => res.isLoading)}
                        pulls={data.flatMap(res => (res.data?.pulls || []).filter(v => matches(v, tokens)))}
                        stars={stars}
                        hasMore={data.some(res => res.data?.hasMore)}
                        isFirst={idx === 0}
                        isLast={idx === config.sections.length - 1}
                        onChange={v => handleChange(idx, v)}
                        onDelete={() => handleDelete(idx)}
                        onMoveUp={() => handleMoveUp(idx)}
                        onMoveDown={() => handleMoveDown(idx)}
                        onStar={handleStar}/>
                )
            })}
        </>
    )
}
