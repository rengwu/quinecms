import { useState } from 'react';
import { PlusIcon, XIcon } from '@phosphor-icons/react';
import styles from '../../../src/editor/editor.module.css';
import { click } from '../dom';
import { interactions, Then, type Section } from '../Specimen';
import {
  Badge,
  Button,
  Checkbox,
  Input,
  InputArea,
  Label,
  Link,
  Menu,
  type MenuItem,
  Radio,
  Select,
  Switch,
  Table,
  Tabs,
} from '../../../src/editor/ui';

const variants = [
  'primary',
  'accent',
  'secondary',
  'ghost',
  'outline',
  'destructive',
  'secondary-destructive',
] as const;
const row = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
} as const;
const stack = { display: 'grid', gap: 16 } as const;

function Choice({ disabled, open }: { disabled: boolean; open: boolean }) {
  const [value, setValue] = useState('');
  return (
    <>
      <Select
        aria-label="Category"
        className={styles.full}
        placeholder="Choose…"
        value={value}
        disabled={disabled}
        renderValue={(v) => (v ? String(v) : 'Choose…')}
        onValueChange={(v) => setValue(String(v ?? ''))}
      >
        <Select.Option value="">Choose…</Select.Option>
        <Select.Option value="Notes">Notes</Select.Option>
        <Select.Option value="Essays">Essays</Select.Option>
      </Select>
      {open && <Then run={(stage) => click(stage, 'Category')} />}
    </>
  );
}

const section: Section = {
  id: 'primitives',
  title: 'Primitives',
  specimens: [
    {
      title: 'Button',
      source: 'src/editor/ui',
      wide: true,
      pickers: { State: ['Default', 'Disabled'], Interaction: interactions },
      render: ({ State }) => (
        <div style={stack}>
          {(['sm', 'base'] as const).map((size) => (
            <div key={size} style={row}>
              {variants.map((variant) => (
                <Button
                  key={variant}
                  size={size}
                  variant={variant}
                  disabled={State === 'Disabled'}
                >
                  {variant}
                </Button>
              ))}
              <Button
                size={size}
                variant="primary"
                icon={<PlusIcon />}
                disabled={State === 'Disabled'}
              >
                Add
              </Button>
              <Button
                size={size}
                variant="ghost"
                shape="square"
                aria-label="Close"
                disabled={State === 'Disabled'}
              >
                <XIcon size={20} />
              </Button>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Menu',
      source: 'src/editor/ui/menu.tsx',
      pickers: { State: ['Available', 'Blocked'], Interaction: interactions },
      render: ({ State }) => {
        const items: MenuItem[] = [
          { label: 'Duplicate page', onSelect() {} },
          {
            label: 'Delete page',
            destructive: true,
            disabled: State === 'Blocked',
            onSelect() {},
          },
        ];
        return (
          <div style={{ ...row, justifyContent: 'flex-end', minHeight: 120 }}>
            <Menu
              label="Document actions"
              items={items}
              hint={
                State === 'Blocked'
                  ? 'Remove the links listed under “Used in” before deleting this page.'
                  : undefined
              }
            />
          </div>
        );
      },
    },
    {
      title: 'Input and Label',
      source: 'src/editor/ui',
      width: 'drawer',
      pickers: {
        State: ['Filled', 'Empty', 'Disabled'],
        Interaction: interactions,
      },
      render: ({ State }) => {
        const value = (filled: string) => (State === 'Empty' ? '' : filled);
        const disabled = State === 'Disabled';
        return (
          <div className={styles.formStack}>
            <div className={styles.field}>
              <Label htmlFor="primitive-text">Text</Label>
              <Input
                id="primitive-text"
                aria-label="Text"
                placeholder="Alternative text"
                defaultValue={value('Harbour at dusk')}
                disabled={disabled}
              />
            </div>
            <div className={styles.field}>
              <Label htmlFor="primitive-number">Number</Label>
              <Input
                id="primitive-number"
                aria-label="Number"
                type="number"
                defaultValue={value('4')}
                disabled={disabled}
              />
            </div>
            <div className={styles.field}>
              <Label htmlFor="primitive-date">Date</Label>
              <Input
                id="primitive-date"
                aria-label="Date"
                type="date"
                defaultValue={value('2026-10-06')}
                disabled={disabled}
              />
            </div>
            <div className={styles.field}>
              <Label htmlFor="primitive-small">Small</Label>
              <Input
                id="primitive-small"
                aria-label="Small"
                size="sm"
                placeholder="Link URL"
                defaultValue={value('https://example.com')}
                disabled={disabled}
              />
            </div>
          </div>
        );
      },
    },
    {
      title: 'InputArea',
      source: 'src/editor/ui',
      width: 'drawer',
      pickers: {
        State: ['Filled', 'Empty', 'Disabled', 'Read-only'],
        Interaction: interactions,
      },
      render: ({ State }) => (
        <InputArea
          aria-label="Summary"
          rows={4}
          defaultValue={
            State === 'Empty' ? '' : 'Why every change starts as a draft.'
          }
          disabled={State === 'Disabled'}
          readOnly={State === 'Read-only'}
        />
      ),
    },
    {
      title: 'Select',
      source: 'src/editor/ui',
      width: 'drawer',
      pickers: {
        State: ['Placeholder', 'Open', 'Disabled'],
        Interaction: interactions,
      },
      render: ({ State }) => (
        <Choice disabled={State === 'Disabled'} open={State === 'Open'} />
      ),
    },
    {
      title: 'Checkbox and Switch',
      source: 'src/editor/ui, switch',
      width: 'drawer',
      pickers: { State: ['Off', 'On', 'Disabled'], Interaction: interactions },
      render: ({ State }) => {
        const props = {
          checked: State === 'On',
          disabled: State === 'Disabled',
          onCheckedChange() {},
        };
        return (
          <div className={styles.formStack}>
            <Checkbox label="Required" {...props} />
            <Checkbox aria-label="Featured" {...props} />
            <Switch label="Dark mode" {...props} />
            <Switch aria-label="Active" {...props} />
          </div>
        );
      },
    },
    {
      title: 'Radio',
      source: 'src/editor/ui',
      width: 'drawer',
      pickers: { Interaction: interactions },
      render: () => (
        <Radio
          legend="When a translation is unavailable"
          defaultValue="fallback"
        >
          <Radio.Item value="fallback" label="Show the whole English item" />
          <Radio.Item
            value="strict"
            label="Require every language before publishing"
          />
        </Radio>
      ),
    },
    {
      title: 'Badge',
      source: 'src/editor/ui',
      render: () => (
        <div style={row}>
          <Badge variant="success">Eligible</Badge>
          <Badge variant="warning">Incomplete</Badge>
          <Badge variant="outline">No copy</Badge>
          <Badge variant="secondary">Shared</Badge>
        </div>
      ),
    },
    {
      title: 'Tabs',
      source: 'src/editor/ui',
      pickers: { State: ['Draft', 'Visitor'], Interaction: interactions },
      render: ({ State }) => (
        <Tabs
          size="sm"
          value={State.toLowerCase()}
          tabs={[
            { value: 'draft', label: 'Draft' },
            { value: 'visitor', label: 'Visitor' },
          ]}
        />
      ),
    },
    {
      title: 'Link',
      source: 'src/editor/ui',
      pickers: { Interaction: interactions },
      render: () => <Link href="#primitives">Open original</Link>,
    },
    {
      title: 'Table',
      source: 'src/editor/ui',
      width: 'panel',
      pickers: { State: ['Rows', 'Empty'], Interaction: interactions },
      render: ({ State }) => (
        <div className={styles.pageTable}>
          <Table aria-label="Pages">
            <Table.Header>
              <Table.Row>
                <Table.Head>Page title</Table.Head>
                <Table.Head>Type</Table.Head>
                <Table.Head>URL path</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {State === 'Rows' ? (
                <Table.Row className={styles.pageRow}>
                  <Table.Cell>Home</Table.Cell>
                  <Table.Cell>Static</Table.Cell>
                  <Table.Cell>/</Table.Cell>
                </Table.Row>
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={3}>
                    <p className={styles.muted}>No pages yet.</p>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      ),
    },
  ],
};
export default section;
