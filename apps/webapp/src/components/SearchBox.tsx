import { useMemo, useRef, useState } from "react";
import {
  InputGroup,
  type HotkeyConfig,
  useHotkeys,
  Tag,
} from "@blueprintjs/core";

export interface SearchBoxProps {
  value: string;
  onChange: (v: string) => void;
}

export function SearchBox({ value, onChange }: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasFocus, setFocus] = useState(false);
  const hotkeys: HotkeyConfig[] = useMemo(
    () => [
      {
        combo: "s",
        global: true,
        label: "Search pulls",
        preventDefault: true,
        onKeyDown: () => inputRef.current?.focus(),
      },
    ],
    [inputRef],
  );
  useHotkeys(hotkeys);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      inputRef.current?.blur();
    }
  };

  return (
    <InputGroup
      placeholder="Search pulls"
      leftIcon="search"
      type="search"
      value={value}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      aria-label="Search pulls"
      rightElement={
        <Tag minimal round>
          {hasFocus ? "Esc" : "S"}
        </Tag>
      }
      inputRef={inputRef}
      onKeyDown={handleKeyDown}
      onValueChange={onChange}
    />
  );
}
