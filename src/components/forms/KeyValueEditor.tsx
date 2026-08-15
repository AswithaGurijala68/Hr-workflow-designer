import { KeyValuePair } from '../../types/workflow';

interface KeyValueEditorProps {
  label: string;
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
}

// Small controlled-component pattern: the parent form owns the array,
// this component only renders inputs and reports changes upward.
export function KeyValueEditor({ label, pairs, onChange }: KeyValueEditorProps) {
  const update = (index: number, field: 'key' | 'value', value: string) => {
    const next = pairs.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    onChange(next);
  };

  const remove = (index: number) => onChange(pairs.filter((_, i) => i !== index));
  const add = () => onChange([...pairs, { key: '', value: '' }]);

  return (
    <div className="field">
      <label>{label}</label>
      {pairs.map((pair, i) => (
        <div key={i} className="kv-row">
          <input placeholder="key" value={pair.key} onChange={(e) => update(i, 'key', e.target.value)} />
          <input placeholder="value" value={pair.value} onChange={(e) => update(i, 'value', e.target.value)} />
          <button type="button" className="icon-btn" onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      <button type="button" className="link-btn" onClick={add}>+ Add field</button>
    </div>
  );
}
