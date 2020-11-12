/* A base error class for our custom internal errors.
 */
class NextstrainError extends Error {
  constructor(...params) {
    super(...params);
    this.name = this.constructor.name;
  }
}

class ResourceNotFoundError extends NextstrainError {
  constructor(msg = "The requested URLs do not exist", ...rest) {
    super(msg, ...rest);
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

/* Thrown when a Source (sub-)class is improperly accessedobject is asked to create a new Dataset object
 * without a dataset path.
 */
class InvalidSourceImplementation extends NextstrainError {
  constructor(msg = "Invalid implementation of Source (sub-)class", ...rest) {
    super(msg, ...rest);
  }
}


module.exports = {
  InvalidSourceImplementation,
  ResourceNotFoundError,
  NoDatasetPathError
};
