import { useContext } from "react"
import { HTMLTable, Tooltip, Tag, Icon } from "@blueprintjs/core"
import ReactTimeAgo from "react-time-ago"

import { PullList, computeSize } from "../model"
import IconWithTooltip from "./IconWithTooltip"
import { ConfigContext } from "../config"


export type Props = {
    data: PullList[],
}

const formatDate = (d: string)  => {
    return new Date(d).toLocaleDateString("en", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    })
}

export default function PullTable({data}: Props) {
    const { config, setConfig } = useContext(ConfigContext)

    const stars = new Set(config.stars)

    const handleStar = (number: number) => {
        setConfig(prev => prev.stars.indexOf(number) > -1 
            ? {...prev, stars: prev.stars.filter(s => s != number)} 
            : {...prev, stars: prev.stars.concat([number])})
    }
    return (
        <HTMLTable interactive className="pull-table">
            <thead>
                <tr>
                    <th>&nbsp;</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Last Action</th>
                    <th>Size</th>
                    <th>Title</th>
                </tr>
            </thead>
            <tbody>
                {data.map((pullList, idx) => (
                    pullList.pulls.map((pull, idx2) => (
                    <tr key={`${idx}-${idx2}`}>
                        <td className="cursor-pointer" onClick={() => handleStar(pull.number)}>
                            {stars.has(pull.number)
                                ? <Tooltip content="Unstar pull request"><Icon icon="star" color="#FBD065"/></Tooltip>
                                : <Tooltip content="Star pull request"><Icon icon="star-empty"/></Tooltip>}
                        </td>
                        <td>
                            <a href={pull.url}>
                                <div className="pull-author">
                                    <Tooltip content={pull.author.login}>
                                        {pull.author.avatarUrl ? <img src={pull.author.avatarUrl}/> : <Icon icon="user"/>}
                                    </Tooltip>
                                </div>
                            </a>
                        </td>
                        <td>
                            <a href={pull.url}>
                                {pull.isDraft
                                ? <IconWithTooltip icon="document" title="Draft" color="#5F6B7C"/>
                                : pull.merged
                                ? <IconWithTooltip icon="git-merge" title="Merged" color="#634DBF"/>
                                : pull.closed
                                ? <IconWithTooltip icon="cross-circle" title="Closed" color="#AC2F33"/>
                                : pull.reviewDecision == "APPROVED"
                                ? <IconWithTooltip icon="git-pull" title="Approved" color="#1C6E42"/>
                                : pull.reviewDecision == "CHANGES_REQUESTED"
                                ? <IconWithTooltip icon="issue" title="Changes requested" color="#C87619"/>
                                : <IconWithTooltip icon="git-pull" title="Pending review" color="#C87619"/>
                                }
                            </a>
                        </td>
                        <td>
                            <a href={pull.url}>
                                <Tooltip content={formatDate(pull.updatedAt)}>
                                    <ReactTimeAgo date={new Date(pull.updatedAt)} tooltip={false} timeStyle="round"/>
                                </Tooltip>
                            </a>
                        </td>
                        <td>
                            <a href={pull.url}>
                                <Tooltip content={<><span className="additions">+{pull.additions}</span> / <span className="deletions">-{pull.deletions}</span></>} openOnTargetFocus={false} usePortal={false}><Tag>{computeSize(pull)}</Tag></Tooltip>
                            </a>
                        </td>
                        <td>
                            <a href={pull.url}>
                                <div className="font-semibold">{pull.title}</div>
                                <div className="text-sm">
                                    {pullList.host}:{pull.repository.nameWithOwner} #{pull.number}
                                </div>
                            </a>
                        </td>
                    </tr>
                ))
            ))}
            </tbody>
        </HTMLTable>
    )
}