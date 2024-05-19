type Props = {
    commit: string,
}

export default function Footer({commit}: Props) {
    return (
        <footer>
            Reviewer @ {<a href={`https://github.com/pvcnt/reviewer/commit/${commit}`}>{commit.substring(0, 7)}</a> || 'dev'}
        </footer>
    )
}