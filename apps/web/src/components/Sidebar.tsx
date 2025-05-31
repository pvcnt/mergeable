import { AnchorButton, Button, Icon, Tooltip } from "@blueprintjs/core";
import { NavLink } from "react-router";
import type { BlueprintIcons_16Id } from "@blueprintjs/icons/lib/esm/generated/16px/blueprint-icons-16";
import styles from "./Sidebar.module.scss";

function SidebarLink({
  title,
  icon,
  link,
}: {
  title: string;
  link: string;
  icon: BlueprintIcons_16Id;
}) {
  return (
    <NavLink to={link}>
      {({ isActive }) => (
        <Tooltip content={title}>
          <Button variant="minimal" active={isActive}>
            <Icon icon={icon} />
          </Button>
        </Tooltip>
      )}
    </NavLink>
  );
}

type Props = {
  isDark: boolean;
  onDarkChange: () => void;
  onLogout: () => void;
};

export default function Sidebar({ isDark, onDarkChange, onLogout }: Props) {
  return (
    <div className={styles.sidebar}>
      <img src="/logo.svg" height="30" className={styles.logo} />
      <SidebarLink link="/inbox" title="Inbox" icon="inbox" />
      <SidebarLink link="/settings" title="Settings" icon="cog" />

      <div className={styles.bottom}>
        <Tooltip content="Help">
          <AnchorButton
            variant="minimal"
            href="https://www.usemergeable.dev/user-guide/"
          >
            <Icon icon="help" />
          </AnchorButton>
        </Tooltip>
        <Tooltip content={"Switch to " + (isDark ? "light" : "dark") + " mode"}>
          <Button onClick={onDarkChange} variant="minimal">
            <Icon icon={isDark ? "flash" : "moon"} />
          </Button>
        </Tooltip>
        <Tooltip content="Logout">
          <Button onClick={onLogout} variant="minimal">
            <Icon icon="log-out" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
