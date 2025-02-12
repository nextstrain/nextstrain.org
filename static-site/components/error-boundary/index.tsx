import React, { ErrorInfo, ReactNode } from "react";

export class InternalError extends Error {}

interface Props {
  children: ReactNode;
}

interface State {
  errorMessage: string;
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      errorMessage: "",
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      errorMessage:
        error instanceof InternalError
          ? error.message
          : "Unknown error (thrown value was not an InternalError)",
      hasError: true,
    };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error);
    console.error(info);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="errorContainer">
          Something isn't working!
          <br />
          Error: `${this.state.errorMessage}`
          <br />
          Please{" "}
          <a href="/contact" style={{ fontWeight: 300 }}>
            get in touch
          </a>{" "}
          if this keeps happening
        </div>
      );
    }
    return this.props.children;
  }
}
