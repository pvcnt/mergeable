import { ReactNode } from "react";
import { Alignment, Button, Navbar as BPNavbar } from "@blueprintjs/core";
import { useNavigate, useLocation } from "react-router-dom";

import styles from "./Navbar.module.scss";

type Props = {
    children?: ReactNode,
}

export default function Navbar({ children }: Props) {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const renderLink = (label: string, to: string) => {
        return <Button onClick={() => navigate(to)} active={pathname == to} minimal text={label} />
    }
    return (
        <BPNavbar className={styles.container}>
            <BPNavbar.Group align={Alignment.LEFT}>
                {renderLink("Dashboard", "/inbox")}
                <BPNavbar.Divider />
                {renderLink("Starred pulls", "/inbox/stars")}
            </BPNavbar.Group>
            <BPNavbar.Group align={Alignment.RIGHT}>
                {children}
            </BPNavbar.Group>
        </BPNavbar>
    );
}