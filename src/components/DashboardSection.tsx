import { Button, Card, Collapse, H5, Icon, Intent, Spinner, Tag } from "@blueprintjs/core"
import { useState } from "react"
import EditSectionDialog from "./EditSectionDialog";
import { Config, Section } from "../config";
import { getPulls, getViewer } from "../github";
import PullTable from "./PullTable";
import { useQueries } from "@tanstack/react-query";
import { Pull } from "../model";

export type Props = {
    config: Config,
    section: Section,
    isFirst: boolean,
    isLast: boolean,
    search: string,
    onMoveUp: () => void,
    onMoveDown: () => void,
    onChange: (config: Section) => void,
    onDelete: () => void,
}

function matches(pull: Pull, tokens: string[]): boolean {
    return tokens.length === 0 || tokens.every(tok => pull.title.toLowerCase().indexOf(tok) > -1 || pull.repository.nameWithOwner.indexOf(tok) > -1)
}

export default function DashboardSection({config, section, isFirst, isLast, search, onChange, onMoveUp, onMoveDown, onDelete}: Props) {
    const [isCollapsed, setCollapsed] = useState(false)
    const [isEditing, setEditing] = useState(false)

    const tokens = search.split(" ").map(tok => tok.toLowerCase())

    const viewers = useQueries({
        queries: config.connections.map(connection => ({
            queryKey: ['viewer', connection.host],
            queryFn: () => getViewer(connection),
            staleTime: Infinity,
        })),
    })
    const results = useQueries({
        queries: config.connections.map((connection, idx) => ({
            queryKey: ['pulls', connection.host, section.search],
            queryFn: () => getPulls(connection, section.search, viewers[idx].data?.login || ""),
            refetchInterval: 60000,
            refetchIntervalInBackground: true,
            enabled: viewers[idx].data !== undefined,
        })),
    })

    const isLoading = results.some(res => res.isLoading)
    const pullsByHost = results.map((res, idx) => ({host: config.connections[idx].host, pulls: (res.data || []).filter(v => matches(v, tokens))}))
    const count = results.map(res => (res.data || []).length).reduce((acc, v) => acc + v, 0)

    const handleTitleClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        setCollapsed(v => !v)
    }

    return (
        <Card className="section">
            <div className="header">
                <H5 onClick={(e) => handleTitleClick(e)}>
                    <a className="link">
                        <Icon icon={isCollapsed ? "chevron-up" : "chevron-down"}/>
                        <span className="title">{section.label}</span>
                        {pullsByHost !== undefined && <span className="count">
                            <Tag round intent={(count > 0) ? Intent.PRIMARY : Intent.NONE}>
                                {count}
                            </Tag>
                        </span>}
                    </a>
                </H5>
                <div className="actions">
                    <Button icon="symbol-triangle-up" minimal disabled={isFirst} onClick={onMoveUp}/>
                    <Button icon="symbol-triangle-down" minimal disabled={isLast} onClick={onMoveDown}/>
                    <Button icon="edit" minimal onClick={() => setEditing(true)}/>
                </div>
            </div>

            <EditSectionDialog
                section={section}
                title="Edit section"
                isOpen={isEditing}
                isDeleteButtonShown={true}
                onClose={() => setEditing(false)}
                onSubmit={onChange}
                onDelete={onDelete}/>

            {isLoading && <Spinner/>}
            
            {!isLoading && <Collapse isOpen={!isCollapsed}>
                {count > 0 && <PullTable pullsByHost={pullsByHost} />}
            </Collapse>}
        </Card>
    )
}