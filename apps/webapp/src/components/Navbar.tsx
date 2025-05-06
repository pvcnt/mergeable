import { ReactNode } from "react";
import { Button, Navbar as BPNavbar } from "@blueprintjs/core";
import { useNavigate, useLocation } from "react-router";

import styles from "./Navbar.module.scss";

type Props = {
  children?: ReactNode;
};

export default function Navbar({ children }: Props) {
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
      <BPNavbar.Group align="end">{children}</BPNavbar.Group>
    </BPNavbar>
  );
}
