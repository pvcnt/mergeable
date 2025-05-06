import { ReactNode } from "react";
import { Button, Navbar as BPNavbar } from "@blueprintjs/core";
import { useNavigate, useLocation } from "react-router";
import styles from "./Navbar.module.scss";
import { SearchBox } from "./SearchBox";

export interface NavbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  children?: ReactNode;
}

export default function Navbar({
  search,
  onSearchChange,
  children,
}: NavbarProps) {
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
      <BPNavbar.Group align="end">
        <SearchBox value={search} onChange={onSearchChange} />
        {children}
      </BPNavbar.Group>
    </BPNavbar>
  );
}
