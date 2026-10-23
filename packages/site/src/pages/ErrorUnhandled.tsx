export function ErrorUnhandled({ error }: { error: unknown }) {
  if (error instanceof Error) {
    // ts-ignore
    return (
      <>
        <h1>Unexpected Error Occurred</h1>
        <p>{error.message}</p>
        {import.meta.env.MODE === 'development' && (
          <>
            <p>The stack trace is:</p>
            <pre>{error.stack}</pre>
          </>
        )}
      </>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
