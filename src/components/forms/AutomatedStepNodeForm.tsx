import { AutomatedStepNodeData, AutomationAction } from '../../types/workflow';

interface Props {
  data: AutomatedStepNodeData;
  actions: AutomationAction[];
  onChange: (data: AutomatedStepNodeData) => void;
}

// This form is the "dynamic form" requirement: the parameter inputs
// re-render based on which mock automation action is currently selected.
export function AutomatedStepNodeForm({ data, actions, onChange }: Props) {
  const selectedAction = actions.find((a) => a.id === data.actionId);

  const handleActionChange = (actionId: string) => {
    const action = actions.find((a) => a.id === actionId);
    // Reset params to match the newly selected action's expected fields.
    const params: Record<string, string> = {};
    action?.params.forEach((p) => (params[p] = data.params[p] ?? ''));
    onChange({ ...data, actionId, params });
  };

  const handleParamChange = (paramName: string, value: string) => {
    onChange({ ...data, params: { ...data.params, [paramName]: value } });
  };

  return (
    <div className="form">
      <div className="field">
        <label>Title</label>
        <input value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      </div>
      <div className="field">
        <label>Action</label>
        <select value={data.actionId} onChange={(e) => handleActionChange(e.target.value)}>
          <option value="">Select an action…</option>
          {actions.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
      </div>
      {selectedAction && selectedAction.params.length > 0 && (
        <div className="field">
          <label>Action parameters</label>
          {selectedAction.params.map((paramName) => (
            <input
              key={paramName}
              placeholder={paramName}
              value={data.params[paramName] ?? ''}
              onChange={(e) => handleParamChange(paramName, e.target.value)}
              style={{ marginBottom: 6 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
