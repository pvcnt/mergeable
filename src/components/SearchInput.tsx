import { useCallback, useMemo, createRef } from "react";
import { InputGroup, useHotkeys } from "@blueprintjs/core";


type Props = {
    value: string,
    onChange: (v: string) => void,
}

export default function SearchInput({value, onChange}: Props) {
    const inputRef = createRef<HTMLInputElement>();
    const handleFocus = useCallback(() => inputRef.current?.focus(), [inputRef]);

    // hotkeys array must be memoized to avoid infinitely re-binding hotkeys
    const hotkeys = useMemo(
        () => [
            {
                combo: "s",
                global: true,
                label: "Focus search input",
                preventDefault: true,
                onKeyDown: handleFocus,
            },
        ],
        [handleFocus],
    );
    const { handleKeyDown, handleKeyUp } = useHotkeys(hotkeys);

    return (
        <div tabIndex={0} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} className="grow">
            <InputGroup
                leftIcon="search"
                placeholder="Search pull requests"
                round
                className="grow"
                value={value}
                inputRef={inputRef}
                onChange={e => onChange(e.target.value)}/>
        </div>
    )
}
