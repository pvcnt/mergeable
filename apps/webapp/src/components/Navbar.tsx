import { ReactNode, useCallback, useMemo } from "react";
import {
  Button,
  Navbar as BPNavbar,
  Tooltip,
  Icon,
  HotkeyConfig,
  useHotkeys,
} from "@blueprintjs/core";
import { useNavigate, useLocation } from "react-router";
import styles from "./Navbar.module.scss";
import { SearchBox } from "./SearchBox";
import { useActivity } from "../lib/queries";
import TimeAgo from "./TimeAgo";

export interface NavbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  onRefresh: () => Promise<void>;
  children?: ReactNode;
}

export default function Navbar({
  search,
  onSearchChange,
  onRefresh,
  children,
}: NavbarProps) {
  const refreshActivity = useActivity("syncPulls");
  const handleRefresh = useCallback(
    () => onRefresh().catch(console.error),
    [onRefresh],
  );

  const hotkeys: HotkeyConfig[] = useMemo(
    () => [
      {
        combo: "r",
        global: true,
        label: "Refresh pull requests",
        preventDefault: true,
        onKeyDown: handleRefresh,
      },
    ],
    [handleRefresh],
  );
  useHotkeys(hotkeys);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const renderLink = (label: string, to: string) => {
    return (
      <Button
        onClick={() => navigate(to)}
        active={pathname == to}
        variant="minimal"
        text={label}
      />
    );
  };
  return (
    <BPNavbar className={styles.container}>
      <BPNavbar.Group align="start">
        {renderLink("Dashboard", "/inbox")}
        <BPNavbar.Divider />
        {renderLink("Starred pulls", "/inbox/stars")}
      </BPNavbar.Group>
      <BPNavbar.Group align="end" className={styles.actions}>
        <SearchBox value={search} onChange={onSearchChange} />
        <Tooltip
          content={
            refreshActivity && (
              <span>
                Refreshed{" "}
                <TimeAgo
                  date={refreshActivity.refreshTime}
                  tooltip={false}
                  timeStyle="round"
                />
              </span>
            )
          }
        >
          <Button
            onClick={handleRefresh}
            loading={refreshActivity?.running}
            disabled={refreshActivity?.running}
            variant="minimal"
          >
            <Icon icon="refresh" />
          </Button>
        </Tooltip>
        {children}
      </BPNavbar.Group>
    </BPNavbar>
  );
}
