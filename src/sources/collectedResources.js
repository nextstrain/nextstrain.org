/**
 * CollectedResources represents a set of resources linked by being conceptually
 * "the same". Sameness often means all available versions of the same filename
 * but could also encompass different filenames, e.g. X and X_YYYY-MM-DD would
 * be grouped together. 
 *
 * The representation of resources themselves (`objects`) varies, but current implementations
 * use plain objects or Maps. Methods to interact with the objects are defined by a
 * subclass of `CollectedResources` which allows this flexibility in underlying data
 * structure. 
 *
 * There is a strong conceptual similarity between objects and Resource classes.
 * Fundamentally Resource (sub-)classes are designed to map a nextstrain.org URL
 * to the URLs which represent the associated files, however here we are going the other
 * way: we want to map _files_ to their nextstrain.org URLs, where available.
 * This includes concepts which Resources can't yet represent because they don't
 * (yet) have associated nextstrain.org URLs -- concepts such as S3 object version.
 * (GitHub-sourced files have similar issues where the branch (or commit) info is
 * encoded in the Source, not the Resource.)
 * While we can monkeypatch the instances, I think it's better to extend the Resource
 * (sub-)classes if we want to go in that direction.
 * 
 * Note that our RBAC authorization for resources currently uses ae policy from the
 * underlying source + tags from the appropriate Resource instance; with the tags coming
 * from the underling source + the resource type (currently Narrative | Dataset).
 * Currently, if a user is allowed to access the source then they are allowed read access
 * to all assets, so we don't perform any authorization at the resource level here.
 * If this changes, or we want to do it for completness, we could easily extend the 
 * `authorized` function to set a policy for CollectedResources (via the associated source)
 * and define `authzTags` for CollectedResources as applicable.
 */
class CollectedResources {
  constructor(source, objects) {
    /**
     * Each entry in resources must define at least 'key', 'lastUpdated' and 'type'
     * All other keys are implementation dependent as they will be parsed by the
     * `nextstrainUrl` method on the respective source.
     */
    this._source = source;
    [this._name, this._resourceType] = this.constructor.objectName(objects[0])
    this._versions = objects
    this._versions.sort((o) => this.lastUpdated(o))
  }

  get name() {return this._name}

  get versions() {return this._versions;}

  static objectName(object) { // eslint-disable-line no-unused-vars
    throw new Error("static objectName(object) must be implemented by a subclass")
  }

  lastUpdated(version=this._versions[0]) { // eslint-disable-line no-unused-vars
    throw new Error("lastUpdated(object) must be implemented by a subclass")
  }
  
  /**
   * Filter currently returns a boolean, but this may be expanded upon once filtering
   * is actually implemented
   */
  filter() {
    throw new Error("filter(args) must be implemented by a subclass")
  }

  nextstrainUrl(version=this._versions[0]) { // eslint-disable-line no-unused-vars
    throw new Error("nextstrainUrl(object) must be implemented by a subclass")
  }
}

export {
  CollectedResources
};