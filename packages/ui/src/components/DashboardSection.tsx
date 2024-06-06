import { Button, Card, Collapse, H5, Icon, Intent, Spinner, Tag } from "@blueprintjs/core"
import { useState } from "react"
import SectionDialog from "./SectionDialog";
import { Pull, Section } from "@repo/types";
import PullTable from "./PullTable";

export type Props = {
    section: Section,
    isFirst: boolean,
    isLast: boolean,
    isLoading: boolean,
    pulls: Pull[],
    isStarred: (v: Pull) => boolean,
    hasMore?: boolean,
    onMoveUp: () => void,
    onMoveDown: () => void,
    onChange: (v: Section) => void,
    onDelete: () => void,
    onStar: (v: Pull) => void,
}

export default function DashboardSection({isLoading, section, isFirst, isLast, pulls, isStarred, hasMore = false, onChange, onMoveUp, onMoveDown, onDelete, onStar}: Props) {
    const [isCollapsed, setCollapsed] = useState(false)
    const [isEditing, setEditing] = useState(false)

    const handleTitleClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        setCollapsed(v => !v)
    }

    return (
        <Card className="mt-4">
            <div className="flex">
                <H5 onClick={(e) => handleTitleClick(e)}>
                    <div className="section-label">
                        <Icon icon={isCollapsed ? "chevron-down" : "chevron-up"} color="text"/>
                        <span className="ml-2">{section.label}</span>
                        {(pulls.length > 0) && (
                            <Tag round intent={Intent.NONE} className="ml-2">{pulls.length}{hasMore ? '+' : ''}</Tag>
                        )}
                    </div>
                </H5>
                <div className="ml-auto">
                    <Button icon="symbol-triangle-up" minimal disabled={isFirst} onClick={onMoveUp}/>
                    <Button icon="symbol-triangle-down" minimal disabled={isLast} onClick={onMoveDown}/>
                    <Button icon="edit" minimal onClick={() => setEditing(true)}/>
                </div>
            </div>

            <SectionDialog
                section={section}
                title="Edit section"
                isOpen={isEditing}
                isNew={false}
                onClose={() => setEditing(false)}
                onSubmit={onChange}
                onDelete={onDelete}/>

            {isLoading 
                ? <Spinner/>
                : <Collapse isOpen={!isCollapsed}>
                    {pulls.length > 0
                        ? <PullTable pulls={pulls} isStarred={isStarred} onStar={onStar} />
                        : <p className="no-results">No results</p>}
                </Collapse>}
        </Card>
    )
}