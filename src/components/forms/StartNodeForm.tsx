import { StartNodeData } from '../../types/workflow';
import { KeyValueEditor } from './KeyValueEditor';

interface Props {
  data: StartNodeData;
  onChange: (data: StartNodeData) => void;
}

export function StartNodeForm({ data, onChange }: Props) {
  return (
    <div className="form">
      <div className="field">
        <label>Start title</label>
        <input value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      </div>
      <KeyValueEditor
        label="Metadata (optional)"
        pairs={data.metadata}
        onChange={(metadata) => onChange({ ...data, metadata })}
      />
    </div>
  );
}
