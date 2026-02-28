export default function StatusBadge({ status }) {
  const classes = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
    rejected: 'badge-rejected'
  };

  return (
    <span className={classes[status] || 'badge-pending'}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}