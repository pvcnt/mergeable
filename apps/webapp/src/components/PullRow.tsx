import { Tooltip, Tag, Icon } from "@blueprintjs/core";
import TimeAgo from "./TimeAgo";
import { CheckState, type Pull, PullState } from "@repo/model";
import IconWithTooltip from "./IconWithTooltip";
import { computeSize } from "../lib/size";
import styles from "./PullRow.module.scss";
import { useState } from "react";
import CopyToClipboardIcon from "./CopyToClipboardIcon";

export type Props = {
  pull: Pull;
  onStar?: () => void;
};

const formatDate = (d: Date | string) => {
  return new Date(d).toLocaleDateString("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};

export default function PullRow({ pull, onStar }: Props) {
  const [active, setActive] = useState(false);
  const handleClick = (e: React.MouseEvent) => {
    // Manually reproduce the behaviour of CTRL+click or middle mouse button.
    if (e.metaKey || e.ctrlKey || e.button == 1) {
      window.open(pull.url);
    } else {
      window.location.href = pull.url;
    }
  };
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(pull.url);
  };
  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStar && onStar();
  };
  return (
    <tr
      onClick={(e) => handleClick(e)}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={styles.row}
    >
      <td onClick={(e) => handleStar(e)}>
        {pull.starred ? (
          <IconWithTooltip
            icon="star"
            color="#FBD065"
            title="Unstar pull request"
          />
        ) : (
          <IconWithTooltip icon="star-empty" title="Star pull request" />
        )}
      </td>
      <td>
        {pull.attention?.set && (
          <IconWithTooltip
            icon="flag"
            color="#CD4246"
            title={`You are in the attention set: ${pull.attention?.reason}`}
          />
        )}
      </td>
      <td>
        <div className={styles.author}>
          <Tooltip content={pull.author.name}>
            {pull.author.avatarUrl ? (
              <img src={pull.author.avatarUrl} />
            ) : (
              <Icon icon="user" />
            )}
          </Tooltip>
        </div>
      </td>
      <td>
        {pull.state == PullState.Draft ? (
          <IconWithTooltip icon="document" title="Draft" color="#5F6B7C" />
        ) : pull.state == PullState.Merged ? (
          <IconWithTooltip icon="git-merge" title="Merged" color="#634DBF" />
        ) : pull.state == PullState.Closed ? (
          <IconWithTooltip icon="cross-circle" title="Closed" color="#AC2F33" />
        ) : pull.state == PullState.Approved ? (
          <IconWithTooltip icon="git-pull" title="Approved" color="#1C6E42" />
        ) : pull.state == PullState.Pending ? (
          <IconWithTooltip icon="git-pull" title="Pending" color="#C87619" />
        ) : null}
      </td>
      <td>
        {pull.ciState == CheckState.Error ? (
          <IconWithTooltip icon="error" title="Error" color="#AC2F33" />
        ) : pull.ciState == CheckState.Failure ? (
          <IconWithTooltip
            icon="cross-circle"
            title="Some checks are failing"
            color="#AC2F33"
          />
        ) : pull.ciState == CheckState.Success ? (
          <IconWithTooltip
            icon="tick-circle"
            title="All checks passing"
            color="#1C6E42"
          />
        ) : pull.ciState == CheckState.Pending ? (
          <IconWithTooltip icon="circle" title="Pending" color="#C87619" />
        ) : (
          <IconWithTooltip icon="remove" title="No status" color="#5F6B7C" />
        )}
      </td>
      <td>
        <Tooltip content={formatDate(pull.updatedAt)}>
          <TimeAgo date={pull.updatedAt} tooltip={false} timeStyle="round" />
        </Tooltip>
      </td>
      <td>
        <Tooltip
          content={
            <>
              <span className={styles.additions}>+{pull.additions}</span> /{" "}
              <span className={styles.deletions}>-{pull.deletions}</span>
            </>
          }
          openOnTargetFocus={false}
          usePortal={false}
        >
          <Tag>{computeSize(pull)}</Tag>
        </Tooltip>
      </td>
      <td>
        <div className={styles.title}>
          <span>{pull.title}</span>
          {active && (
            <CopyToClipboardIcon title="Copy URL to clipboard" text={pull.url} className={styles.copy}/>
          )}
        </div>
        <div className={styles.source}>
          {pull.host}/{pull.repo} #{pull.number}
        </div>
      </td>
    </tr>
  );
}
