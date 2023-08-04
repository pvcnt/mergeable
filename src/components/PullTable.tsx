import { HTMLTable, Intent, Tooltip } from "@blueprintjs/core"
import ReactTimeAgo from 'react-time-ago'
import { PullList, computeSize } from "../model"
import IconWithTooltip from "./IconWithTooltip"



export type Props = {
    data: PullList[],
}

export default function PullTable({data}: Props) {
    return (
        <HTMLTable interactive className="pull-table">
            <thead>
            <tr>
                <th>Status</th>
                <th>Title</th>
                <th>Size</th>
                <th>Updated</th>
            </tr>
            </thead>
            <tbody>
            {data.flatMap((pulls, idx) => (
                pulls.pulls.map((pull, idx2) => (
                    <tr key={`${idx}-${idx2}`}>
                        <td>
                            <a href={pull.url}>
                                {pull.isDraft
                                ? <IconWithTooltip icon="document" title="Draft"/>
                                : pull.merged
                                ? <IconWithTooltip icon="git-merge" title="Merged"/>
                                : pull.closed
                                ? <IconWithTooltip icon="cross-circle" title="Closed"/>
                                : pull.reviewDecision == "APPROVED"
                                ? <IconWithTooltip icon="git-pull" intent={Intent.SUCCESS} title="Approved"/>
                                : pull.reviewDecision == "CHANGES_REQUESTED"
                                ? <IconWithTooltip icon="issue" intent={Intent.DANGER} title="Changes requested"/>
                                : <IconWithTooltip icon="git-pull" title="Pending review"/>
                                }
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
                        <td><a href={pull.url}><Tooltip content={<><span className="additions">+{pull.additions}</span> / <span className="deletions">-{pull.deletions}</span></>} openOnTargetFocus={false} usePortal={false}>{computeSize(pull)}</Tooltip></a></td>
                        <td><a href={pull.url}><ReactTimeAgo date={new Date(pull.updatedAt)} tooltip timeStyle="twitter"/></a></td>
                    </tr>
                ))
            ))}
            </tbody>
        </HTMLTable>
    )
}