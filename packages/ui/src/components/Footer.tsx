type Props = {
    commit: string|undefined,
}

export default function Footer({commit}: Props) {
    return (
        <footer>
            Mergeable @ {commit 
                ? <a href={`https://github.com/pvcnt/mergeable/commit/${commit}`}>{commit.substring(0, 7)}</a> 
                : 'devel'}
        </footer>
    )
}