import { Tooltip, Tag, Icon } from "@blueprintjs/core";
import TimeAgo from "./TimeAgo";
import type { Pull } from "@repo/github";
import IconWithTooltip from "./IconWithTooltip";
import { computeSize } from "../lib/size";
import styles from "./PullRow.module.scss";
import { useState } from "react";
import CopyToClipboardIcon from "./CopyToClipboardIcon";
import { toggleStar } from "../lib/mutations";
import { useStars } from "../lib/queries";

export type Props = {
  pull: Pull;
};

const formatDate = (d: string) => {
  return new Date(d).toLocaleDateString("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};

export default function PullRow({ pull }: Props) {
  const [active, setActive] = useState(false);
  const stars = useStars();
  const handleClick = (e: React.MouseEvent) => {
    // Manually reproduce the behaviour of CTRL+click or middle mouse button.
    if (e.metaKey || e.ctrlKey || e.button == 1) {
      window.open(pull.url);
    } else {
      window.location.href = pull.url;
    }
  };
  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStar(pull).catch(console.error);
  };
  return (
    <tr
      onClick={(e) => handleClick(e)}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={styles.row}
    >
      <td onClick={(e) => handleStar(e)}>
        {stars.has(pull.uid) ? (
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
          {pull.author && (
            <Tooltip content={pull.author.name}>
              {pull.author.avatarUrl ? (
                <img src={pull.author.avatarUrl} />
              ) : (
                <Icon icon="user" />
              )}
            </Tooltip>
          )}
        </div>
      </td>
      <td>
        {pull.state == "draft" ? (
          <IconWithTooltip icon="document" title="Draft" color="#5F6B7C" />
        ) : pull.state == "merged" ? (
          <IconWithTooltip icon="git-merge" title="Merged" color="#634DBF" />
        ) : pull.state == "enqueued" ? (
          <IconWithTooltip icon="time" title="Enqueued" color="#1C6E42" />
        ) : pull.state == "closed" ? (
          <IconWithTooltip icon="cross-circle" title="Closed" color="#AC2F33" />
        ) : pull.state == "approved" ? (
          <IconWithTooltip icon="git-pull" title="Approved" color="#1C6E42" />
        ) : pull.state == "pending" ? (
          <IconWithTooltip icon="git-pull" title="Pending" color="#C87619" />
        ) : null}
      </td>
      <td>
        {pull.checkState == "error" ? (
          <IconWithTooltip icon="error" title="Error" color="#AC2F33" />
        ) : pull.checkState == "failure" ? (
          <IconWithTooltip
            icon="cross-circle"
            title="Some checks are failing"
            color="#AC2F33"
          />
        ) : pull.checkState == "success" ? (
          <IconWithTooltip
            icon="tick-circle"
            title="All checks passing"
            color="#1C6E42"
          />
        ) : (
          <IconWithTooltip icon="remove" title="Pending" color="#5F6B7C" />
        )}
      </td>
      <td>
        <Tooltip content={formatDate(pull.updatedAt)}>
          <TimeAgo
            date={new Date(pull.updatedAt)}
            tooltip={false}
            timeStyle="round"
          />
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
            <CopyToClipboardIcon
              title="Copy URL to clipboard"
              text={pull.url}
              className={styles.copy}
            />
          )}
        </div>
        <div className={styles.source}>
          {pull.host}/{pull.repo} #{pull.number}
        </div>
      </td>
    </tr>
  );
}
