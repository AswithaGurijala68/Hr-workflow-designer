import { ApprovalNodeData } from '../../types/workflow';

interface Props {
  data: ApprovalNodeData;
  onChange: (data: ApprovalNodeData) => void;
}

const ROLES = ['Manager', 'HRBP', 'Director', 'VP'];

export function ApprovalNodeForm({ data, onChange }: Props) {
  return (
    <div className="form">
      <div className="field">
        <label>Title</label>
        <input value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      </div>
      <div className="field">
        <label>Approver role</label>
        <select value={data.approverRole} onChange={(e) => onChange({ ...data, approverRole: e.target.value })}>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Auto-approve threshold</label>
        <input
          type="number"
          value={data.autoApproveThreshold}
          onChange={(e) => onChange({ ...data, autoApproveThreshold: Number(e.target.value) })}
        />
      </div>
    </div>
  );
}
