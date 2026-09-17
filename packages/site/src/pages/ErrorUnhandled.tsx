export function ErrorUnhandled({ error }: { error: unknown }) {
  if (error instanceof Error) {
    return (
      <>
        <h1>Unexpected Error Occurred</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
