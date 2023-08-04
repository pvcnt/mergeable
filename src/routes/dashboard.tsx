import { useContext, useState } from "react";
import { Section, emptySectionConfig, ConfigContext } from "../config";
import DashboardSection from "../components/DashboardSection";
import { Button, InputGroup } from "@blueprintjs/core";
import EditSectionDialog from "../components/EditSectionDialog";

export default function Dashboard() {
    const { config, setConfig } = useContext(ConfigContext)
    const [ search, setSearch ] = useState("")
    const [ isEditing, setEditing ] = useState(false)

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
            </div>
            <EditSectionDialog
                section={emptySectionConfig}
                title="New section"
                isOpen={isEditing}
                onClose={() => setEditing(false)}
                onSubmit={handleSubmit}/>
            {config !== undefined && config.sections.map((section, idx) => {
                return (
                    <DashboardSection key={idx}
                                      config={config}
                                      section={section} 
                                      isFirst={idx === 0}
                                      isLast={idx === config.sections.length - 1}
                                      search={search}
                                      onChange={v => handleChange(idx, v)}
                                      onDelete={() => handleDelete(idx)}
                                      onMoveUp={() => handleMoveUp(idx)}
                                      onMoveDown={() => handleMoveDown(idx)}/>
                )
            })}
        </>
    )
}