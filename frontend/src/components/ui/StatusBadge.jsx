import { getStatusColor, getStatusLabel } from '../../utils/helpers';

export default function StatusBadge({ status }) {
  return <span className={getStatusColor(status)}>{getStatusLabel(status)}</span>;
}
