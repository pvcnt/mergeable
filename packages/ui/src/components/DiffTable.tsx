import { HTMLTable, Tooltip, Tag, Icon } from "@blueprintjs/core"
import ReactTimeAgo from "react-time-ago"

import { Diff, DiffState } from "@repo/types"
import IconWithTooltip from "./IconWithTooltip"
import { getDiffUid } from "../utils/diff"
import { computeSize } from "../utils/size"


export type Props = {
    diffs: Diff[],
    stars: Set<string>,
    onStar: (v: Diff) => void,
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

export default function DiffTable({diffs, stars, onStar}: Props) {
    return (
        <HTMLTable interactive className="diff-table">
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
                {diffs.map((diff, idx) => (
                    <tr key={idx}>
                        <td className="cursor-pointer" onClick={() => onStar(diff)}>
                            {stars.has(getDiffUid(diff))
                                ? <IconWithTooltip icon="star" color="#FBD065" title="Unstar diff"/>
                                : <IconWithTooltip icon="star-empty" title="Star diff"/>}
                        </td>
                        <td>
                            <a href={diff.url}>
                                <div className="diff-author">
                                    <Tooltip content={diff.author.name}>
                                        {diff.author.avatarUrl ? <img src={diff.author.avatarUrl}/> : <Icon icon="user"/>}
                                    </Tooltip>
                                </div>
                            </a>
                        </td>
                        <td>
                            <a href={diff.url}>
                                {diff.state == DiffState.Draft
                                ? <IconWithTooltip icon="document" title="Draft" color="#5F6B7C"/>
                                : diff.state == DiffState.Merged
                                ? <IconWithTooltip icon="git-merge" title="Merged" color="#634DBF"/>
                                : diff.state == DiffState.Closed
                                ? <IconWithTooltip icon="cross-circle" title="Closed" color="#AC2F33"/>
                                : diff.state == DiffState.Approved
                                ? <IconWithTooltip icon="git-pull" title="Approved" color="#1C6E42"/>
                                : diff.state == DiffState.ChangesRequested
                                ? <IconWithTooltip icon="issue" title="Changes requested" color="#C87619"/>
                                : diff.state == DiffState.Pending
                                ? <IconWithTooltip icon="git-pull" title="Pending review" color="#C87619"/>
                                : null}
                            </a>
                        </td>
                        <td>
                            <a href={diff.url}>
                                <Tooltip content={formatDate(diff.updatedAt)}>
                                    <ReactTimeAgo date={new Date(diff.updatedAt)} tooltip={false} timeStyle="round"/>
                                </Tooltip>
                            </a>
                        </td>
                        <td>
                            <a href={diff.url}>
                                <Tooltip content={<><span className="additions">+{diff.additions}</span> / <span className="deletions">-{diff.deletions}</span></>} openOnTargetFocus={false} usePortal={false}><Tag>{computeSize(diff)}</Tag></Tooltip>
                            </a>
                        </td>
                        <td>
                            <a href={diff.url}>
                                <div className="font-semibold">{diff.title}</div>
                                <div className="text-sm">
                                    {diff.host}:{diff.repository} #{diff.id}
                                </div>
                            </a>
                        </td>
                    </tr>
                ))}
            </tbody>
        </HTMLTable>
    )
}