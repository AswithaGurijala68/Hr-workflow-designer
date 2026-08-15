import { Handle, Position } from 'reactflow';
import { ReactNode } from 'react';

interface NodeShellProps {
  color: string;
  icon: string;
  title: string;
  subtitle?: string;
  showTargetHandle?: boolean;
  showSourceHandle?: boolean;
  children?: ReactNode;
}

// Every custom node renders through this shell so the canvas has a
// consistent look. Individual node components just supply color/icon/text -
// they don't repeat the handle or layout markup.
export function NodeShell({
  color,
  icon,
  title,
  subtitle,
  showTargetHandle = true,
  showSourceHandle = true,
  children,
}: NodeShellProps) {
  return (
    <div
      style={{
        borderRadius: 10,
        border: `1.5px solid ${color}`,
        background: '#fff',
        minWidth: 180,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {showTargetHandle && <Handle type="target" position={Position.Left} style={{ background: color }} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: `1px solid ${color}22` }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: '#777' }}>{subtitle}</div>}
        </div>
      </div>
      {children && <div style={{ padding: '6px 12px 10px', fontSize: 11, color: '#555' }}>{children}</div>}
      {showSourceHandle && <Handle type="source" position={Position.Right} style={{ background: color }} />}
    </div>
  );
}
