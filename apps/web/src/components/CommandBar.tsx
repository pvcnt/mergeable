import { useMemo, useState } from "react";
import { HotkeysTarget2, HotkeyConfig, MenuItem } from "@blueprintjs/core";
import { ItemPredicate, ItemRenderer, Omnibar } from "@blueprintjs/select";
import { Pull } from "@repo/types";
import { usePulls } from "@/db";

type Props = {
    className?: string,
}

function highlightText(text: string, query: string) {
    let lastIndex = 0;
    const words = query
        .split(/\s+/)
        .filter(word => word.length > 0)
        .map(escapeRegExpChars);
    if (words.length === 0) {
        return [text];
    }
    const regexp = new RegExp(words.join("|"), "gi");
    const tokens: React.ReactNode[] = [];
    let match = regexp.exec(text);
    while (match) {
        const length = match[0].length;
        const before = text.slice(lastIndex, regexp.lastIndex - length);
        if (before.length > 0) {
            tokens.push(before);
        }
        lastIndex = regexp.lastIndex;
        tokens.push(<strong key={lastIndex}>{match[0]}</strong>);
        match = regexp.exec(text);
    }
    const rest = text.slice(lastIndex);
    if (rest.length > 0) {
        tokens.push(rest);
    }
    return tokens;
}

function escapeRegExpChars(text: string) {
    return text.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1");
}

export default function CommandBar({ className }: Props) {
    const [ open, setOpen ] = useState(false);
    const pulls = usePulls();

    const hotkeys: HotkeyConfig[] = useMemo(() => [
        {
            combo: "mod+k",
            global: true,
            label: "Open command bar",
            preventDefault: true,
            onKeyDown: () => setOpen(true),
        },
    ], [setOpen]);

    const itemRenderer: ItemRenderer<Pull> = (pull, props) => {
        if (!props.modifiers.matchesPredicate) {
            return null;
        }
        return (
            <MenuItem
                key={pull.uid}
                text={highlightText(pull.title, props.query)}
                roleStructure="listoption"
                active={props.modifiers.active}
                disabled={props.modifiers.disabled}
                onClick={props.handleClick}
                onFocus={props.handleFocus}
                ref={props.ref}/>
        );
    };
    const handleSelect = (pull: Pull) => {
        window.open(pull.url);
        setOpen(false);
    };

    const handleClose = () => setOpen(false);

    const itemPredicate: ItemPredicate<Pull> = (query, pull, _, exactMatch) => {
        const normalizedTitle = pull.title.toLowerCase();
        const normalizedQuery = query.toLowerCase();
        if (exactMatch) {
            return normalizedTitle === normalizedQuery;
        } else {
            const tokens = query.split(" ").map(tok => tok.trim()).filter(tok => tok.length > 0);
            return tokens.every(tok => pull.title.indexOf(tok) > -1);
        }
    }

    return (
        <HotkeysTarget2 hotkeys={hotkeys}>
            <Omnibar<Pull>
                inputProps={{
                    leftIcon: "search",
                    placeholder: "Search pull requests",
                }}
                itemRenderer={itemRenderer}
                itemPredicate={itemPredicate}
                onItemSelect={handleSelect}
                items={pulls.data}
                isOpen={open}
                onClose={handleClose}
                resetOnSelect={true}
                noResults={<MenuItem roleStructure="listoption" text="No results." disabled/>}
                overlayProps={{ hasBackdrop: true }}
                className={className}/>
        </HotkeysTarget2>
    )
}