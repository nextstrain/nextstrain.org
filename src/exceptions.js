/* A base error class for our custom internal errors.
 */
class NextstrainError extends Error {
  constructor(...params) {
    super(...params);
    this.name = this.constructor.name;
  }
}

/* Thrown when a valid Source object is asked to create a new Dataset object
 * without a dataset path.
 */
class NoDatasetPathError extends NextstrainError {
  constructor(msg = "No dataset path provided", ...rest) {
    super(msg, ...rest);
  }
}


module.exports = {
  NoDatasetPathError
};
