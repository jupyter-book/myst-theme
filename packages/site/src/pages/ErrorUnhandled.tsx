export type ErrorResponse = {
  status: number;
  statusText: string;
  data: any;
};
export function ErrorUnhandled({ error }: { error: ErrorResponse }) {
  return (
    <>
      <h1>Unexpected Error Occurred</h1>
      <p>Status: {error.status}</p>
      <p>{error.data.message}</p>
    </>
  );
}
