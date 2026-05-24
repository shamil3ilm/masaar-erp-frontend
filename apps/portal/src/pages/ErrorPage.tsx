interface ErrorPageProps {
  title: string
  message: string
}

export function ErrorPage({ title, message }: ErrorPageProps) {
  return (
    <div className="error-page">
      <div className="error-box">
        <div className="error-icon">⚠</div>
        <h1>{title}</h1>
        <p>{message}</p>
      </div>
    </div>
  )
}
