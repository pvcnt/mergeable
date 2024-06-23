import { Button, Icon, IconSize, Tooltip } from '@blueprintjs/core'
import { NavLink } from 'react-router-dom'
import { BlueprintIcons_16Id } from '@blueprintjs/icons/lib/esm/generated/16px/blueprint-icons-16';

import styles from "./Sidebar.module.scss";

type SidebarLinkProps = {
    title: string,
    link: string,
    icon: BlueprintIcons_16Id,
}

function SidebarLink({title, icon, link}: SidebarLinkProps) {
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

function SidebarButton({title, icon, onClick}: {title: string, icon: BlueprintIcons_16Id, onClick: () => void}) {
    return (
        <Tooltip content={title}>
          <Button minimal large onClick={onClick}>
            <Icon icon={icon} size={IconSize.LARGE}/>
          </Button>
        </Tooltip>
    )
}

type Props = {
    isDark: boolean,
    onDarkChange: () => void,
}

export default function Sidebar({ isDark, onDarkChange }: Props) {
  return (
    <div className={styles.sidebar}>
      <img src="/logo.svg" height="30" className={styles.logo}/>
      <SidebarLink link="/" title="Dashboard" icon="dashboard"/>
      <SidebarLink link="/stars" title="Stars" icon="bookmark"/>
      <SidebarLink link="/settings" title="Settings" icon="cog"/>
      <div className={styles.bottom}>
        <SidebarButton
          title={"Switch to " + (isDark ? "light" : "dark") + " mode"}
          icon={isDark ? "flash" : "moon"}
          onClick={() => onDarkChange()}
          />
      </div>
    </div>
  )
}