import React, { ErrorInfo, ReactNode } from "react";

/**
 * An extension of the default `Error` class to make it possible for
 * us to distinguish internally-arising Errors from others.
 *
 * @class
 */
export class InternalError extends Error {}

interface Props {
  children: ReactNode;
}

interface State {
  errorMessage: string;
  hasError: boolean;
}

/**
 * A React Server Component that wraps around something that might
 * ow an error, and displays an error message when and if that
 * happens.
 *
 * @class
 */
export class ErrorBoundary extends React.Component<Props, State> {
  /**
   * @constructor
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      errorMessage: "",
      hasError: false,
    };
  }

  /**
   * React-specific helper function that will be called when a child
   * component throws an error during rendering. Allows for the
   * display of that error.
   */
  static getDerivedStateFromError(error: Error): State {
    return {
      errorMessage:
        error instanceof InternalError
          ? error.message
          : "Unknown error (thrown value was not an InternalError)",
      hasError: true,
    };
  }

  /**
   * React-specific helper function that works with
   * `getDerivedStateFromError` (which see) to enable error-message
   * display.
   *
   * We override this to also echo the error message out the console.
   *
   * @override
   */
  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error);
    console.error(info);
  }

  /**
   * React-specific helper for rendering a component.
   *
   * Needs to be overridden to conditionally display `this.state.errorMessage`
   * when `this.state.hasError` is true.
   *
   * @override
   */
  override render() {
    if (this.state.hasError) {
      return (
        <div className="errorContainer">
          {"Something isn't working!"}
          <br />
          Error: `{this.state.errorMessage}`
          <br />
          Please <a href="/contact">get in touch</a> if this keeps happening
        </div>
      );
    }
    return this.props.children;
  }
}
