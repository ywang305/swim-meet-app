interface ErrorMessageProps {
  message?: string;
  swimcloudUrl?: string;
}

export function ErrorMessage({ message, swimcloudUrl }: ErrorMessageProps) {
  return (
    <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
      <p className="text-sm text-red-600 font-medium mb-1">Something went wrong</p>
      {message && <p className="text-xs text-red-500 mb-3">{message}</p>}
      {swimcloudUrl && (
        <a
          href={swimcloudUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          View on SwimCloud →
        </a>
      )}
    </div>
  );
}

export function EmptyState({ message, swimcloudUrl }: { message: string; swimcloudUrl?: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-8 text-center">
      <p className="text-sm text-slate-500 mb-2">{message}</p>
      {swimcloudUrl && (
        <a
          href={swimcloudUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          View on SwimCloud →
        </a>
      )}
    </div>
  );
}
