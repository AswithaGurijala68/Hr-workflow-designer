import { EndNodeData } from '../../types/workflow';

interface Props {
  data: EndNodeData;
  onChange: (data: EndNodeData) => void;
}

export function EndNodeForm({ data, onChange }: Props) {
  return (
    <div className="form">
      <div className="field">
        <label>End message</label>
        <input value={data.endMessage} onChange={(e) => onChange({ ...data, endMessage: e.target.value })} />
      </div>
      <div className="field checkbox-field">
        <label>
          <input
            type="checkbox"
            checked={data.summaryFlag}
            onChange={(e) => onChange({ ...data, summaryFlag: e.target.checked })}
          />
          {' '}Generate summary
        </label>
      </div>
    </div>
  );
}
