const assert = require("assert").strict;

const sources = require("../sources");
const {GroupSource} = require("../sources/groups");


class Group {
  constructor(name) {
    assertValidName(name);
    this.name = name;
  }

  get source() {
    const Source = sources.get(this.name);

    // XXX FIXME
    if (Source) {
      assert(Source.isGroup(), "Source is for a Group");
      source = new Source();
    } else {
      source = new GroupSource(this.name);
    }
    // XXX

    assert(source != null, "source is not null");
    assert(source.isGroup(), "source is for a Group");

    delete this.source;
    return this.source = source;
  }
}


function validName(name) {
  assert(typeof name === "string", "name is a string")

  if (/[^a-zA-Z0-9-]/.test(name)) {
    return [false, "disallowed characters (must contain only ASCII upper- and lowercase letters (A-Z), digits (0-9), and hyphens (-))"]
  }

  if (name.length <  3) return [false, "too short (must be at least 3 characters)"]
  if (name.length > 50) return [false, "too long (must be no more than 50 characters)"]

  return [true];
}


function assertValidName(name) {
  const [ok, err] = validName(name);
  if (!ok) throw new Error(`invalid group name: ${err}`);
}


module.exports = {
  Group,
};
