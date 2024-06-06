import { HTMLTable, Tooltip, Tag, Icon } from "@blueprintjs/core"
import ReactTimeAgo from "react-time-ago"

import { Pull, PullState } from "@repo/types"
import IconWithTooltip from "./IconWithTooltip"
import { computeSize } from "../utils/size"


export type Props = {
    pulls: Pull[],
    isStarred: (v: Pull) => boolean,
    onStar: (v: Pull) => void,
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

export default function PullTable({pulls, isStarred, onStar}: Props) {
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
                {pulls.map((pull, idx) => (
                    <tr key={idx}>
                        <td className="cursor-pointer" onClick={() => onStar(pull)}>
                            {isStarred(pull)
                                ? <IconWithTooltip icon="star" color="#FBD065" title="Unstar pull request"/>
                                : <IconWithTooltip icon="star-empty" title="Star pull request"/>}
                        </td>
                        <td>
                            <a href={pull.url}>
                                <div className="pull-author">
                                    <Tooltip content={pull.author.name}>
                                        {pull.author.avatarUrl ? <img src={pull.author.avatarUrl}/> : <Icon icon="user"/>}
                                    </Tooltip>
                                </div>
                            </a>
                        </td>
                        <td>
                            <a href={pull.url}>
                                {pull.state == PullState.Draft
                                ? <IconWithTooltip icon="document" title="Draft" color="#5F6B7C"/>
                                : pull.state == PullState.Merged
                                ? <IconWithTooltip icon="git-merge" title="Merged" color="#634DBF"/>
                                : pull.state == PullState.Closed
                                ? <IconWithTooltip icon="cross-circle" title="Closed" color="#AC2F33"/>
                                : pull.state == PullState.Approved
                                ? <IconWithTooltip icon="git-pull" title="Approved" color="#1C6E42"/>
                                : pull.state == PullState.ChangesRequested
                                ? <IconWithTooltip icon="issue" title="Changes requested" color="#C87619"/>
                                : pull.state == PullState.Pending
                                ? <IconWithTooltip icon="git-pull" title="Pending review" color="#C87619"/>
                                : null}
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
                                    {pull.host}:{pull.repository} #{pull.id}
                                </div>
                            </a>
                        </td>
                    </tr>
                ))}
            </tbody>
        </HTMLTable>
    )
}