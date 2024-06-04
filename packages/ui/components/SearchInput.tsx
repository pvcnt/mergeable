import { useCallback, createRef } from "react";
import { HotkeysTarget2, HotkeyConfig, InputGroup } from "@blueprintjs/core";


type Props = {
    value: string,
    onChange: (v: string) => void,
    className?: string,
}

export default function SearchInput({value, onChange, className}: Props) {
    const inputRef = createRef<HTMLInputElement>();
    const handleFocus = useCallback(() => inputRef.current?.focus(), [inputRef]);

    const hotkeys: HotkeyConfig[] = [
        {
            combo: "s",
            global: true,
            label: "Focus search input",
            preventDefault: true,
            onKeyDown: handleFocus,
        },
    ]

    return (
        <HotkeysTarget2 hotkeys={hotkeys}>
            <InputGroup
                leftIcon="search"
                placeholder="Search diffs"
                round
                className={className}
                value={value}
                inputRef={inputRef}
                onChange={e => onChange(e.target.value)}/>
        </HotkeysTarget2>
    )
}
