/* eslint-disable */
/* We disable eslint for this vendored code. Eslint identifies (correctly) that
`arguments` shouldn't exist in fat-arrow functions, but they are - perhaps
browsers aren't spec-compliant or perhaps transpilation is at play here
*/

export const debounce = (func, wait, immediate) => {
  let timeout
  return () => {
    const context = this
    const args = arguments
    const later = () => {
      timeout = null
      if (!immediate) {
        func.apply(context, args)
      }
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) {
      func.apply(context, args)
    }
  }
}
