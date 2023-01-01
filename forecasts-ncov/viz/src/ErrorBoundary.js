import React from 'react';
import {Status} from "./Status";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { errorCaught: false };
  }
  static getDerivedStateFromError(error) {
    return { errorCaught: error };
  }
  render() {
    if (this.state.errorCaught) {
      return (
        <Status err={this.state.errorCaught}>
          Something appears to have gone wrong while rendering the data. Please get in touch!
        </Status>
      )
    }
    return this.props.children; 
  }
}