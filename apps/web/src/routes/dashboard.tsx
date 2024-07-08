import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@blueprintjs/core";
import SectionDialog from "@/components/SectionDialog";
import DashboardSection from "@/components/DashboardSection";
import { PullValue, SectionValue } from "@repo/types";
import SearchInput from "@/components/SearchInput";
import { deleteSection, moveSectionDown, moveSectionUp, saveSection, toggleStar, useSections, usePulls } from "@/db";
import { getWorker } from "@/worker/client";

import styles from "./dashboard.module.scss";

function matches(pull: PullValue, tokens: string[]): boolean {
    return tokens.length === 0 || tokens.every(tok => pull.title.toLowerCase().indexOf(tok) > -1 || pull.repo.indexOf(tok) > -1)
}

export default function Dashboard() {
    const sections = useSections();
    const pulls = usePulls();

    const [ search, setSearch ] = useState("");
    const [ isEditing, setEditing ] = useState(false);
    const [ isRefreshing, setRefreshing ] = useState(false);
    const [ searchParams, setSearchParams ] = useSearchParams();
    const [ newSection, setNewSection ] = useState<SectionValue>({label: "", search: "", notified: false});

    const tokens = search.split(" ").map(tok => tok.toLowerCase())
    const pullsBySection = sections.data.map(section => pulls.data
            .filter(pull => pull.sections.indexOf(section.id) > -1)
            .filter(v => matches(v, tokens)));

    const worker = getWorker();

    const handleRefresh = () => {
        setRefreshing(true);
        worker.refresh()
            .then(() => setRefreshing(false))
            .catch(console.error);
    }

    // Open a "New section" dialog if URL is a share link.
    useEffect(() => {
        if (searchParams.get("action") === "share") {
            setNewSection({
                label: searchParams.get("label") || "",
                search: searchParams.get("search") || "",
                notified: false,
            })
            setEditing(true)
        }
    }, [searchParams]);

    const handleSubmit = (value: SectionValue) => {
        saveSection({...value, id: "", position: sections.data.length});
        // Remove sharing parameters from URL if they were defined once the new section
        // has been created from those parameters.
        if (searchParams.get("action") === "share") {
            setSearchParams({});
        }
    }

    return (
        <>
            <div className={styles.header}>
                <SearchInput value={search} onChange={setSearch} className={styles.search}/>
                <Button text="New section" icon="plus" onClick={() => setEditing(true)}/>
                <Button
                    icon="refresh"
                    disabled={isRefreshing}
                    loading={isRefreshing}
                    onClick={handleRefresh}/>
            </div>
            <SectionDialog
                newSection={newSection}
                title="New section"
                isOpen={sections.isLoaded && isEditing}
                onClose={() => setEditing(false)}
                onSubmit={handleSubmit}/>
            {sections.isLoaded && sections.data.map((section, idx) => {
                return (
                    <DashboardSection
                        key={idx}
                        section={section}
                        isLoading={pulls.isLoading}
                        pulls={pullsBySection[idx]}
                        hasMore={false}
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
