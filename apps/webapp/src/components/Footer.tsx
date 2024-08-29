import styles from "./Footer.module.scss";

type Props = {
    commit: string,
}

export default function Footer({ commit }: Props) {
    return (
        <footer className={styles.footer}>
            Mergeable @ {(commit.length > 0)
                ? <a href={`https://github.com/pvcnt/mergeable/commit/${commit}`}>{commit.substring(0, 7)}</a> 
                : "devel"}
        </footer>
    )
}