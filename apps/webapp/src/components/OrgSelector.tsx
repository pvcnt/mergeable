import { MenuItem } from "@blueprintjs/core";
import { MultiSelect, type ItemRenderer } from "@blueprintjs/select";

type Props = {
  selected: string[];
  onChange: (v: string[]) => void;
};

export default function OrgSelector({ selected, onChange }: Props) {
  const renderValue: ItemRenderer<string> = (value, props) => {
    if (!props.modifiers.matchesPredicate) {
      return null;
    }
    return <MenuItem text={value} roleStructure="listoption" />;
  };
  const renderTag = (v: string) => v;
  const renderNewItem = (q: string, active: boolean) => {
    return (
      <MenuItem
        roleStructure="listoption"
        icon="add"
        text={q}
        active={active}
        shouldDismissPopover={false}
      />
    );
  };

  const isSelected = (v: string) => selected.indexOf(v) > -1;
  const handleRemove = (v: string) => onChange(selected.filter((x) => v !== x));
  const handleSelect = (v: string) => {
    !isSelected(v) && onChange(selected.concat([v]));
  };

  return (
    <MultiSelect<string>
      itemRenderer={renderValue}
      tagRenderer={renderTag}
      items={[]}
      selectedItems={selected}
      onItemSelect={handleSelect}
      createNewItemFromQuery={(query) => query}
      createNewItemRenderer={renderNewItem}
      placeholder=""
      noResults={
        <MenuItem
          text="Please type something..."
          roleStructure="listoption"
          disabled
        />
      }
      onRemove={handleRemove}
      onItemsPaste={onChange}
      openOnKeyDown={true}
      resetOnSelect={true}
    />
  );
}
