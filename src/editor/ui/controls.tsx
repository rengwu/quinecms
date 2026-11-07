import {
  Children,
  isValidElement,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type Ref,
  type TdHTMLAttributes,
  type TextareaHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { Select as BaseSelect } from '@base-ui/react/select';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { CaretUpDownIcon, CheckIcon } from '@phosphor-icons/react';
import { usePortalContainer } from './portal';
import css from './ui.module.css';

export const cx = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(' ');

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** `primary` is the neutral main action; `accent` is reserved for Publish. */
  variant?:
    | 'primary'
    | 'accent'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'destructive'
    | 'secondary-destructive';
  size?: 'sm' | 'base';
  shape?: 'square';
  /** Rendered before the label. */
  icon?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}
export function Button({
  variant = 'secondary',
  size,
  shape,
  icon,
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(css.button, className)}
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

export function Input({
  className,
  size,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  size?: 'sm' | 'base';
  ref?: Ref<HTMLInputElement>;
}) {
  return (
    <input className={cx(css.input, className)} data-size={size} {...props} />
  );
}
export function InputArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  ref?: Ref<HTMLTextAreaElement>;
}) {
  return <textarea className={cx(css.input, className)} {...props} />;
}
export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cx(css.label, className)} {...props} />;
}

interface OptionProps {
  value: unknown;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}
function Option({ value, children, disabled, className }: OptionProps) {
  return (
    <BaseSelect.Item
      value={value}
      disabled={disabled}
      className={cx(css.option, className)}
    >
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator>
        <CheckIcon size={14} />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}
interface SelectProps {
  value?: unknown;
  // Callers narrow the value they gave their options.
  onValueChange?: (value: any) => void;
  renderValue?: (value: any) => ReactNode;
  placeholder?: ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
  'aria-label'?: string;
  children?: ReactNode;
}
function SelectRoot({
  value,
  onValueChange,
  renderValue,
  placeholder,
  disabled,
  id,
  className,
  'aria-label': ariaLabel,
  children,
}: SelectProps) {
  const container = usePortalContainer();
  const items = Children.toArray(children)
    .filter(isValidElement<OptionProps>)
    .map((option) => ({
      value: option.props.value,
      label: option.props.children,
    }));
  const shown = (current: unknown) =>
    current == null || current === '' ? (
      <span className={css.placeholder}>{placeholder}</span>
    ) : renderValue ? (
      renderValue(current)
    ) : (
      (items.find((item) => item.value === current)?.label ?? String(current))
    );
  return (
    <BaseSelect.Root
      items={items}
      value={value}
      onValueChange={(next) => onValueChange?.(next)}
      disabled={disabled}
    >
      <BaseSelect.Trigger
        id={id}
        aria-label={ariaLabel}
        className={cx(css.trigger, className)}
      >
        <BaseSelect.Value className={css.value}>{shown}</BaseSelect.Value>
        <BaseSelect.Icon className={css.caret}>
          <CaretUpDownIcon size={14} />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal container={container}>
        <BaseSelect.Positioner
          className={css.positioner}
          sideOffset={4}
          alignItemWithTrigger={false}
        >
          <BaseSelect.Popup className={css.popup}>
            <BaseSelect.List>{children}</BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
export const Select = Object.assign(SelectRoot, { Option });

interface ToggleProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: ReactNode;
  className?: string;
  'aria-label'?: string;
}
/** Wraps a control in a label when it has visible text. */
function labelled(control: ReactNode, label: ReactNode, className?: string) {
  return label ? (
    <label className={cx(css.choice, className)}>
      {control}
      <span>{label}</span>
    </label>
  ) : (
    control
  );
}
export function Checkbox({
  label,
  className,
  onCheckedChange,
  ...props
}: ToggleProps) {
  return labelled(
    <BaseCheckbox.Root
      className={cx(css.checkbox, !label && className)}
      onCheckedChange={(checked) => onCheckedChange?.(checked)}
      {...props}
    >
      <BaseCheckbox.Indicator>
        <CheckIcon size={12} weight="bold" />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>,
    label,
    className,
  );
}
export function Switch({
  label,
  className,
  onCheckedChange,
  ...props
}: ToggleProps) {
  return labelled(
    <BaseSwitch.Root
      nativeButton
      render={<button type="button" />}
      className={cx(css.switch, !label && className)}
      onCheckedChange={(checked) => onCheckedChange?.(checked)}
      {...props}
    >
      <BaseSwitch.Thumb className={css.thumb} />
    </BaseSwitch.Root>,
    label,
    className,
  );
}

function RadioItem({ value, label }: { value: string; label: ReactNode }) {
  return labelled(
    <BaseRadio.Root value={value} className={css.radio}>
      <BaseRadio.Indicator className={css.dot} />
    </BaseRadio.Root>,
    label,
  );
}
function RadioRoot({
  legend,
  value,
  defaultValue,
  onValueChange,
  children,
}: {
  legend: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <fieldset className={css.group}>
      <legend>{legend}</legend>
      <RadioGroup
        className={css.group}
        aria-label={legend}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => onValueChange?.(next as string)}
      >
        {children}
      </RadioGroup>
    </fieldset>
  );
}
export const Radio = Object.assign(RadioRoot, { Item: RadioItem });

/** A segmented switch between views. */
export function Tabs({
  tabs,
  value,
  onValueChange,
  size,
  className,
}: {
  tabs: { value: string; label: ReactNode }[];
  value?: string;
  onValueChange?: (value: string) => void;
  size?: 'sm' | 'base';
  className?: string;
}) {
  return (
    <BaseTabs.Root
      value={value}
      onValueChange={(next) => onValueChange?.(next as string)}
    >
      <BaseTabs.List className={cx(css.tabs, className)} data-size={size}>
        {tabs.map((tab) => (
          <BaseTabs.Tab key={tab.value} value={tab.value} className={css.tab}>
            {tab.label}
          </BaseTabs.Tab>
        ))}
      </BaseTabs.List>
    </BaseTabs.Root>
  );
}

export function Badge({
  variant = 'secondary',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  variant?: 'secondary' | 'outline' | 'success' | 'warning';
}) {
  return (
    <span
      className={cx(css.badge, className)}
      data-variant={variant}
      {...props}
    />
  );
}

export function Link({
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cx(css.link, className)} {...props} />;
}

function TableRoot({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return <table className={cx(css.table, className)} {...props} />;
}
export const Table = Object.assign(TableRoot, {
  Header: (props: HTMLAttributes<HTMLTableSectionElement>) => (
    <thead {...props} />
  ),
  Body: (props: HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody {...props} />
  ),
  Row: (props: HTMLAttributes<HTMLTableRowElement>) => <tr {...props} />,
  Head: (props: ThHTMLAttributes<HTMLTableCellElement>) => <th {...props} />,
  Cell: (props: TdHTMLAttributes<HTMLTableCellElement>) => <td {...props} />,
});
