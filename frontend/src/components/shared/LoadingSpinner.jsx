export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="scim-loading">
      <div className="d-flex align-items-center gap-2">
        <div className="scim-spinner" />
        <span className="text-muted-custom">{message}</span>
      </div>
    </div>
  );
}
