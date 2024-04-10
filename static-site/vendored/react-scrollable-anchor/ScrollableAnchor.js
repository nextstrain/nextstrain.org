/* eslint-disable */
/* Eslint identifies some react deprecations which we should attend to by
switching to a different library when necessary */

import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Manager from './Manager'

export default class ScrollableAnchor extends Component {
  constructor(props) {
    super(props)
    this.id = props.id || props.children.ref
  }

  componentDidMount() {
    const element = ReactDOM.findDOMNode(this.refs[Object.keys(this.refs)[0]])
    Manager.addAnchor(this.id, element)
  }

  componentWillUnmount() {
    Manager.removeAnchor(this.id)
  }

  render() {
    const {children, id} = this.props

    return React.cloneElement(children, {
      ref: children.ref || id,
    })
  }
}
