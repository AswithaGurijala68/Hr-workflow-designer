import { TaskNodeData } from '../../types/workflow';
import { KeyValueEditor } from './KeyValueEditor';

interface Props {
  data: TaskNodeData;
  onChange: (data: TaskNodeData) => void;
}

export function TaskNodeForm({ data, onChange }: Props) {
  return (
    <div className="form">
      <div className="field">
        <label>Title *</label>
        <input value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      </div>
      <div className="field">
        <label>Description</label>
        <textarea value={data.description} onChange={(e) => onChange({ ...data, description: e.target.value })} />
      </div>
      <div className="field">
        <label>Assignee</label>
        <input value={data.assignee} onChange={(e) => onChange({ ...data, assignee: e.target.value })} />
      </div>
      <div className="field">
        <label>Due date</label>
        <input type="date" value={data.dueDate} onChange={(e) => onChange({ ...data, dueDate: e.target.value })} />
      </div>
      <KeyValueEditor
        label="Custom fields (optional)"
        pairs={data.customFields}
        onChange={(customFields) => onChange({ ...data, customFields })}
      />
    </div>
  );
}
