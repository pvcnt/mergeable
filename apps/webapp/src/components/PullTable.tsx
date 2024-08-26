import { HTMLTable, Tooltip, Tag, Icon } from "@blueprintjs/core";
import TimeAgo from "./TimeAgo";
import { CheckState, type Pull, PullState } from "@repo/model";
import IconWithTooltip from "./IconWithTooltip";
import { computeSize } from "../lib/size";

import styles from "./PullTable.module.scss";

export type Props = {
    pulls: Pull[],
    onStar?: (v: Pull) => void,
}

const formatDate = (d: string)  => {
    return new Date(d).toLocaleDateString("en", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });
}

export default function PullTable({ pulls, onStar }: Props) {
    if (pulls.length === 0) {
        return <p className={styles.empty}>No results</p>;
    }
    const handleClick = (e: React.MouseEvent, pull: Pull) => {
        // Manually reproduce the behaviour of CTRL+click or middle mouse button.
        if (e.metaKey || e.ctrlKey || e.button == 1) {
            window.open(pull.url);
        } else {
            window.location.href = pull.url;
        }
    };
    const handleStar = (e: React.MouseEvent, pull: Pull) => {
        onStar && onStar(pull);
        e.stopPropagation();
    };
    return (
        <HTMLTable interactive className={styles.table}>
            <thead>
                <tr>
                    <th>&nbsp;</th>
                    <th>&nbsp;</th>
                    <th>Author</th>
                    <th><IconWithTooltip title="Status" icon="git-pull"/></th>
                    <th><IconWithTooltip title="CI Status" icon="tick-circle"/></th>
                    <th>Last Action</th>
                    <th>Size</th>
                    <th>Title</th>
                </tr>
            </thead>
            <tbody>
                {pulls.map((pull, idx) => (
                    <tr key={idx} onClick={(e) => handleClick(e, pull)}>
                        <td onClick={(e) => handleStar(e, pull)}>
                            {pull.starred
                                ? <IconWithTooltip icon="star" color="#FBD065" title="Unstar pull request"/>
                                : <IconWithTooltip icon="star-empty" title="Star pull request"/>}
                        </td>
                        <td>
                            {pull.attention?.set && 
                                <IconWithTooltip
                                    icon="flag"
                                    color="#CD4246"
                                    title={`You are in the attention set: ${pull.attention?.reason}`}
                                />}
                        </td>
                        <td>
                            <div className={styles.author}>
                                <Tooltip content={pull.author.name}>
                                    {pull.author.avatarUrl ? <img src={pull.author.avatarUrl}/> : <Icon icon="user"/>}
                                </Tooltip>
                            </div>
                        </td>
                        <td>
                            {pull.state == PullState.Draft
                            ? <IconWithTooltip icon="document" title="Draft" color="#5F6B7C"/>
                            : pull.state == PullState.Merged
                            ? <IconWithTooltip icon="git-merge" title="Merged" color="#634DBF"/>
                            : pull.state == PullState.Closed
                            ? <IconWithTooltip icon="cross-circle" title="Closed" color="#AC2F33"/>
                            : pull.state == PullState.Approved
                            ? <IconWithTooltip icon="git-pull" title="Approved" color="#1C6E42"/>
                            : pull.state == PullState.Pending
                            ? <IconWithTooltip icon="git-pull" title="Pending" color="#C87619"/>
                            : null}
                        </td>
                        <td>
                            {pull.ciState == CheckState.Error
                            ? <IconWithTooltip icon="error" title="Error" color="#AC2F33"/>
                            : pull.ciState == CheckState.Failure
                            ? <IconWithTooltip icon="cross-circle" title="Some checks are failing" color="#AC2F33"/>
                            : pull.ciState == CheckState.Success
                            ? <IconWithTooltip icon="tick-circle" title="All checks passing" color="#1C6E42"/>
                            : pull.ciState == CheckState.Pending
                            ? <IconWithTooltip icon="circle" title="Pending" color="#C87619"/>
                            : <IconWithTooltip icon="remove" title="No status" color="#5F6B7C"/>}
                        </td>
                        <td>
                            <Tooltip content={formatDate(pull.updatedAt)}>
                                <TimeAgo date={new Date(pull.updatedAt)} tooltip={false} timeStyle="round"/>
                            </Tooltip>
                        </td>
                        <td>
                            <Tooltip content={<><span className={styles.additions}>+{pull.additions}</span> / <span className={styles.deletions}>-{pull.deletions}</span></>} openOnTargetFocus={false} usePortal={false}><Tag>{computeSize(pull)}</Tag></Tooltip>
                        </td>
                        <td>
                            <div className={styles.title}>{pull.title}</div>
                            <div className={styles.source}>
                                {pull.host}/{pull.repo} #{pull.number}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </HTMLTable>
    )
}
