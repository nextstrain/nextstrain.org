import React, { ErrorInfo, ReactNode } from "react";
import { ErrorContainer } from "../pages/404";

export class InternalError extends Error {}

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage:"",
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error instanceof InternalError ? error.message : "Unknown error (thrown value was not an InternalError)",
    };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error);
    console.error(info);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          {"Something isn't working!"}
          <br/>
          {`Error: ${this.state.errorMessage}`}
          <br/>
          {"Please "}<a href="/contact" style={{fontWeight: 300}}>get in touch</a>{" if this keeps happening"}
        </ErrorContainer>
      )
    }
    return this.props.children; 
  }
}