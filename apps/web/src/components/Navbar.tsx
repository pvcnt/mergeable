import { type ReactNode, useCallback, useMemo } from "react";
import {
  Button,
  Navbar as BPNavbar,
  Tooltip,
  Icon,
  type HotkeyConfig,
  useHotkeys,
} from "@blueprintjs/core";
import { useNavigate, useLocation } from "react-router";
import styles from "./Navbar.module.scss";
import { SearchBox } from "./SearchBox";
import TimeAgo from "./TimeAgo";

export interface NavbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  onRefresh: () => void;
  isFetching: boolean;
  refreshedAt: number;
  children?: ReactNode;
}

export default function Navbar({
  search,
  onSearchChange,
  onRefresh,
  isFetching,
  refreshedAt,
  children,
}: NavbarProps) {
  const handleRefresh = useCallback(onRefresh, [onRefresh]);
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
            <span>
              Refreshed{" "}
              <TimeAgo date={refreshedAt} tooltip={false} timeStyle="round" />
            </span>
          }
        >
          <Button
            onClick={handleRefresh}
            loading={isFetching}
            disabled={isFetching}
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
