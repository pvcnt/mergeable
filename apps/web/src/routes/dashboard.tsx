import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@blueprintjs/core"

import SectionDialog from "@repo/ui/components/SectionDialog"
import DashboardSection from "@repo/ui/components/DashboardSection"
import { Pull, Section } from "@repo/types"
import SearchInput from "@repo/ui/components/SearchInput"
import { usePulls } from "../queries"
import { deleteSection, moveSectionDown, moveSectionUp, saveSection, toggleStar, useConnections, useSections, useStars } from "../db"

function matches(pull: Pull, tokens: string[]): boolean {
    return tokens.length === 0 || tokens.every(tok => pull.title.toLowerCase().indexOf(tok) > -1 || pull.repository.indexOf(tok) > -1)
}

export default function Dashboard() {
    const connections = useConnections()
    const sections = useSections()
    const { isStarred } = useStars()

    const [ search, setSearch ] = useState("")
    const [ isEditing, setEditing ] = useState(false)
    const [ searchParams, setSearchParams ] = useSearchParams()

    const [ newSection, setNewSection ] = useState<Section>({
        id: "",
        label: "",
        search: "",
        position: sections.data.length,
        notified: false,
    });

    const pulls = usePulls(sections.data, connections.data)

    const refetchAll = useCallback(async () => {
		await Promise.all(pulls.map(res => res.refetch()));
	}, [pulls]);

    const isFetching = pulls.some(res => res.isFetching)

    const tokens = search.split(" ").map(tok => tok.toLowerCase())

    // Open a "New section" dialog if URL is a share link.
    useEffect(() => {
        if (sections.isLoaded && searchParams.get("action") === "share") {
            setNewSection({
                id: "",
                label: searchParams.get("label") || "",
                search: searchParams.get("search") || "",
                position: sections.data.length,
                notified: false,
            })
            setEditing(true)
        }
    }, [searchParams, sections.isLoaded, sections.data.length])

    const handleSubmit = (section: Section) => {
        saveSection(section)

        // Remove sharing parameters from URL if they were defined once the new section
        // has been created from those parameters.
        if (searchParams.get("action") === "share") {
            setSearchParams({})
        }
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
                isOpen={sections.isLoaded && isEditing}
                isNew={true}
                onClose={() => setEditing(false)}
                onSubmit={handleSubmit}/>
            {sections.isLoaded && sections.data.map((section, idx) => {
                const data = pulls.slice(idx * connections.data.length, (idx + 1) * connections.data.length)
                return (
                    <DashboardSection
                        key={idx}
                        section={section}
                        isLoading={data.some(res => res.isLoading)}
                        pulls={data.flatMap(res => (res.data?.pulls || []).filter(v => matches(v, tokens)))}
                        isStarred={isStarred}
                        hasMore={data.some(res => res.data?.hasMore)}
                        isFirst={idx === 0}
                        isLast={idx === sections.data.length - 1}
                        onChange={saveSection}
                        onDelete={() => deleteSection(section)}
                        onMoveUp={() => moveSectionUp(section)}
                        onMoveDown={() => moveSectionDown(section)}
                        onStar={toggleStar}/>
                )
            })}
        </>
    )
}
