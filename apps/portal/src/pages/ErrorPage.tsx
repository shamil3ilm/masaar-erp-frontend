interface ErrorPageProps {
  title: string
  message: string
}

/** The whole page when there is no invoice to show — a dead link or a refusal. */
export function ErrorPage({ title, message }: ErrorPageProps) {
  return (
    <div className="error-page">
      <div className="error-box">
        {/* Decorative: the heading already says what happened. */}
        <div className="error-icon" aria-hidden="true">⚠</div>
        <h1>{title}</h1>
        <p>{message}</p>
      </div>
    </div>
  )
}
