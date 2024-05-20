import { HTMLTable, Tooltip, Tag, Icon } from "@blueprintjs/core"
import ReactTimeAgo from 'react-time-ago'
import { PullList, computeSize } from "../model"
import IconWithTooltip from "./IconWithTooltip"


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
    return (
        <HTMLTable interactive className="pull-table">
            <thead>
                <tr>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Last Action</th>
                    <th>Size</th>
                    <th>Title</th>
                </tr>
            </thead>
            <tbody>
            {data.flatMap((pulls, idx) => (
                pulls.pulls.map((pull, idx2) => (
                    <tr key={`${idx}-${idx2}`}>
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
                                ? <IconWithTooltip icon="document" title="Draft" color="#738091"/>
                                : pull.merged
                                ? <IconWithTooltip icon="git-merge" title="Merged" color="#634DBF"/>
                                : pull.closed
                                ? <IconWithTooltip icon="cross-circle" title="Closed" color="#8E292C"/>
                                : pull.reviewDecision == "APPROVED"
                                ? <IconWithTooltip icon="git-pull" title="Approved" color="#1C6E42"/>
                                : pull.reviewDecision == "CHANGES_REQUESTED"
                                ? <IconWithTooltip icon="issue" title="Changes requested" color="#C87619"/>
                                : <IconWithTooltip icon="git-pull" title="Pending review" color="#738091"/>
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
                                    {pulls.host}:{pull.repository.nameWithOwner} #{pull.number}
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