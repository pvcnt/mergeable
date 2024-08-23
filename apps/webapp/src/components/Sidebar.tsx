import { AnchorButton, Button, Icon, IconSize, Intent, Tooltip } from "@blueprintjs/core";
import { NavLink } from "react-router-dom";
import { BlueprintIcons_16Id } from '@blueprintjs/icons/lib/esm/generated/16px/blueprint-icons-16';

import styles from "./Sidebar.module.scss";
import ReactTimeAgo from "react-time-ago";
import { useActivity } from "../lib/queries";

function SidebarLink({ title, icon, link }: { title: string, link: string, icon: BlueprintIcons_16Id }) {
    return (
        <NavLink to={link}>
        {({ isActive }) => (
            <Tooltip content={title}>
              <Button minimal large active={isActive}>
                <Icon icon={icon} size={IconSize.LARGE}/>
              </Button>
            </Tooltip>
        )}
        </NavLink>
    )
}

type Props = {
    isDark: boolean,
    onDarkChange: () => void,
    onRefresh: () => Promise<void>,
}

export default function Sidebar({ isDark, onDarkChange, onRefresh }: Props) {
  const refreshActivity = useActivity("syncPulls");
  const handleRefresh = () => onRefresh().catch(console.error);
  return (
    <div className={styles.sidebar}>
      <img src="/logo.svg" height="30" className={styles.logo}/>
      <SidebarLink link="/inbox" title="Inbox" icon="inbox"/>
      <SidebarLink link="/settings" title="Settings" icon="cog"/>

      <div className={styles.separator}/>

      <Tooltip content={refreshActivity && <span>Refreshed <ReactTimeAgo date={refreshActivity.refreshTime} tooltip={false} timeStyle="round"/></span>}>
        <Button large onClick={handleRefresh} loading={refreshActivity?.running} disabled={refreshActivity?.running} intent={Intent.PRIMARY} outlined>
          <Icon icon="refresh" size={IconSize.LARGE}/>
        </Button>
      </Tooltip>

      <div className={styles.bottom}>
        <Tooltip content="Help">
          <AnchorButton large minimal href="https://pvcnt.github.io/mergeable/user-guide/">
            <Icon icon="help" size={IconSize.LARGE}/>
          </AnchorButton>
        </Tooltip>
        <Tooltip content={"Switch to " + (isDark ? "light" : "dark") + " mode"}>
          <Button large onClick={onDarkChange} minimal>
            <Icon icon={isDark ? "flash" : "moon"} size={IconSize.LARGE}/>
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}