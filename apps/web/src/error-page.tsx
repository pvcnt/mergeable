import { isRouteErrorResponse, useRouteError } from "react-router";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      {isRouteErrorResponse(error) && (
        <p>
          <i>{error.statusText}</i>
        </p>
      )}
    </div>
  );
}
