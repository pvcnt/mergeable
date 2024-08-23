import { Button, Card, Collapse, H5, Icon, Intent, Spinner, Tag } from "@blueprintjs/core"
import { useState } from "react"
import SectionDialog from "./SectionDialog";
import type { Pull, Section } from "@repo/model";
import PullTable from "./PullTable";

import styles from "./DashboardSection.module.scss";

export type Props = {
    section: Section,
    isFirst: boolean,
    isLast: boolean,
    isLoading: boolean,
    pulls: Pull[],
    hasMore?: boolean,
    onMoveUp: () => void,
    onMoveDown: () => void,
    onChange: (v: Section) => void,
    onDelete: () => void,
    onStar: (v: Pull) => void,
}

export default function DashboardSection({ isLoading, section, isFirst, isLast, pulls, hasMore = false, onChange, onMoveUp, onMoveDown, onDelete, onStar }: Props) {
    const [isCollapsed, setCollapsed] = useState(false)
    const [isEditing, setEditing] = useState(false)

    const handleTitleClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        setCollapsed(v => !v)
    }

    return (
        <Card className={styles.section}>
            <div className={styles.header}>
                <H5 onClick={(e) => handleTitleClick(e)} className={styles.title}>
                    <Icon icon={isCollapsed ? "chevron-down" : "chevron-up"} color="text"/>
                    <span>{section.label}</span>
                    {(pulls.length > 0) && (
                        <Tag round intent={Intent.NONE}>{pulls.length}{hasMore ? '+' : ''}</Tag>
                    )}
                </H5>
                <div className={styles.actions}>
                    <Button icon="symbol-triangle-up" minimal disabled={isFirst} onClick={onMoveUp}/>
                    <Button icon="symbol-triangle-down" minimal disabled={isLast} onClick={onMoveDown}/>
                    <Button icon="edit" minimal onClick={() => setEditing(true)}/>
                </div>
            </div>

            <SectionDialog
                section={section}
                title="Edit section"
                isOpen={isEditing}
                onClose={() => setEditing(false)}
                onSubmit={v => onChange({...section, ...v})}
                onDelete={onDelete}/>

            {isLoading 
                ? <Spinner/>
                : <Collapse isOpen={!isCollapsed}>
                    <PullTable pulls={pulls} onStar={onStar} />
                </Collapse>}
        </Card>
    )
}