import { Icon, Intent, Tooltip } from "@blueprintjs/core"
import { BlueprintIcons_16Id } from "@blueprintjs/icons/lib/esm/generated/16px/blueprint-icons-16"

type Props = {
    icon: BlueprintIcons_16Id,
    title: string,
    intent?: Intent,
}

export default function IconWithTooltip({icon, title, intent}: Props) {
    return (
        <Tooltip content={title} openOnTargetFocus={false} usePortal={false}>
            <Icon icon={icon} intent={intent} />
        </Tooltip>
    )
}