import { Button, Card, Collapse, H5, Icon, Intent, Spinner, Tag } from "@blueprintjs/core"
import { useState } from "react"
import SectionDialog from "./SectionDialog";
import { Section } from "../config";
import PullTable from "./PullTable";
import { PullList } from "../model";

export type Props = {
    section: Section,
    isFirst: boolean,
    isLast: boolean,
    isLoading: boolean,
    data: PullList[],
    onMoveUp: () => void,
    onMoveDown: () => void,
    onChange: (config: Section) => void,
    onDelete: () => void,
}

export default function DashboardSection({isLoading, section, isFirst, isLast, data, onChange, onMoveUp, onMoveDown, onDelete}: Props) {
    const [isCollapsed, setCollapsed] = useState(false)
    const [isEditing, setEditing] = useState(false)

    const count = data.map(res => res.pulls.length).reduce((acc, v) => acc + v, 0)

    const handleTitleClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        setCollapsed(v => !v)
    }

    return (
        <Card className="mt-4">
            <div className="flex">
                <H5 onClick={(e) => handleTitleClick(e)}>
                    <a className="section-label">
                        <Icon icon={isCollapsed ? "chevron-up" : "chevron-down"} color="text"/>
                        <span className="ml-2">{section.label}</span>
                        {!isLoading && (
                            <Tag round intent={(count > 0) ? Intent.PRIMARY : Intent.NONE} className="ml-2">
                                {count}
                            </Tag>
                        )}
                    </a>
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
                isDeleteButtonShown={true}
                onClose={() => setEditing(false)}
                onSubmit={onChange}
                onDelete={onDelete}/>

            {isLoading && <Spinner/>}
            
            {!isLoading && <Collapse isOpen={!isCollapsed}>
                {count > 0 && <PullTable data={data} />}
            </Collapse>}
        </Card>
    )
}