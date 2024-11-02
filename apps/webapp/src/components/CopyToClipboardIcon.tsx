import IconWithTooltip from "./IconWithTooltip";
import { useState } from "react";

export type Props = {
  text: string;
  title: string;
  className?: string;
};

export default function CopyToClipboardIcon({ text, title, className }: Props) {
  const [clicked, setClicked] = useState(false);
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setClicked(true);
    setTimeout(() => setClicked(false), 1500);
  };
  return (
    <IconWithTooltip
      title={clicked ? "Copied!" : title}
      icon={clicked ? "tick" : "clipboard"}
      className={className}
      size={14}
      onClick={(e) => handleClick(e)}
    />
  );
}
