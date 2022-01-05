const authz = require("../authz");
const {S3Source, PrivateS3Source} = require("./s3");

const PRODUCTION = process.env.NODE_ENV === "production";

class PublicGroupSource extends S3Source {
  get bucket() { return `nextstrain-${this.name}`; }
  static isGroup() {
    return true;
  }

  get authzPolicy() {
    return [
      ...authzPolicy(this.name),

      /* No role restriction on reading anything tagged "public".
       */
      {tag: authz.tags.Visibility.Public, role: "*", allow: [authz.actions.Read]},
    ];
  }

  get authzTags() {
    return new Set([
      authz.tags.Type.Source,
      authz.tags.Visibility.Public,
    ]);
  }
  get authzTagsToPropagate() {
    return new Set([
      authz.tags.Visibility.Public,
    ]);
  }
}


class PrivateGroupSource extends PrivateS3Source {
  get bucket() { return `nextstrain-${this.name}`; }
  static isGroup() {
    return true;
  }

  get authzPolicy() {
    return authzPolicy(this.name);
  }
}


/**
 * Generate the authorization policy for a given Nextstrain Group.
 *
 * Currently generated from a statically-defined policy template, but in the
 * future could retrieve a per-group, owner-defined, stored policy which makes
 * use of both system- and user-defined tags and roles.
 *
 * @param {string} groupName - Name of the Nextstrain Group
 * @returns {authzPolicy}
 */
function authzPolicy(groupName) {
  const {Read, Write} = authz.actions;
  const {Type} = authz.tags;

  return [
    /* eslint-disable no-multi-spaces */

    /* All membership roles in a Nextstrain Group can see information about the
     * group Source instance.
     */
    {tag: Type.Source, role: `${groupName}/viewers`, allow: [Read]},
    {tag: Type.Source, role: `${groupName}/editors`, allow: [Read]},
    {tag: Type.Source, role: `${groupName}/owners`,  allow: [Read]},

    /* Editors and Owners can create/update/delete datasets and narratives, but
     * Viewers can only see them.
     */
    {tag: Type.Dataset, role: `${groupName}/viewers`, allow: [Read]},
    {tag: Type.Dataset, role: `${groupName}/editors`, allow: [Read, Write]},
    {tag: Type.Dataset, role: `${groupName}/owners`,  allow: [Read, Write]},

    {tag: Type.Narrative, role: `${groupName}/viewers`, allow: [Read]},
    {tag: Type.Narrative, role: `${groupName}/editors`, allow: [Read, Write]},
    {tag: Type.Narrative, role: `${groupName}/owners`,  allow: [Read, Write]},

    /* eslint-enable no-multi-spaces */
  ];
}


/* Dev/testing groups */

class TestSource extends PublicGroupSource {
  static get _name() { return "test"; }
  get bucket() { return "nextstrain-group-test"; }
}

class TestPrivateSource extends PrivateGroupSource {
  static get _name() { return "test-private"; }
  get bucket() { return "nextstrain-group-test-private"; }
}


/* Real groups */

class BlabSource extends PublicGroupSource {
  static get _name() { return "blab"; }
}

class BlabPrivateSource extends PrivateGroupSource {
  static get _name() { return "blab-private"; }
}

class InrbDrcSource extends PrivateGroupSource {
  /* Person to contact for enquiries: Alli Black / James Hadfield */
  static get _name() { return "inrb-drc"; }

  // INRB's bucket is named differently due to early adoption
  get bucket() { return "nextstrain-inrb"; }
}

class NzCovid19PrivateSource extends PrivateGroupSource {
  /* Person to contact for enquiries: James Hadfield */
  static get _name() { return "nz-covid19-private"; }
}

class AllWalesPrivateSource extends PrivateGroupSource {
  /* Person to contact for enquiries: James Hadfield */
  static get _name() { return "allwales-private"; }
}

class NextspainSource extends PublicGroupSource {
  /* Person to contact for enquiries: James Hadfield */
  static get _name() { return "nextspain"; }
}

class SeattleFluSource extends PublicGroupSource {
  static get _name() { return "seattleflu"; }
}

class SwissSource extends PublicGroupSource {
  /* Person to contact for enquiries: Richard Neher / Emma Hodcroft */
  static get _name() { return "swiss"; }
}

class COGUKSource extends PublicGroupSource {
  /* Person to contact for enquiries: Trevor / Emma / James */
  static get _name() { return "cog-uk"; }
}

class NGSSASource extends PublicGroupSource {
  /* Person to contact for enquiries: Richard Neher / Emma Hodcroft */
  static get _name() { return "ngs-sa"; }
}

class ECDCSource extends PublicGroupSource {
  /* Person to contact for enquiries: Richard Neher / Emma Hodcroft */
  static get _name() { return "ecdc"; }
}

class IllinoisGagnonPublicSource extends PublicGroupSource {
  /* Person to contact for enquiries: Thomas Sibley */
  static get _name() { return "illinois-gagnon-public"; }
}

class IllinoisGagnonPrivateSource extends PrivateGroupSource {
  /* Person to contact for enquiries: Thomas Sibley */
  static get _name() { return "illinois-gagnon-private"; }
}

class GrubaughLabPrivateSource extends PrivateGroupSource {
  /* Person to contact for enquiries: James */
  static get _name() { return "grubaughlab"; }
}

class GrubaughLabPublicSource extends PublicGroupSource {
  static get _name() { return "grubaughlab-public"; }
}

class NeherLabSource extends PublicGroupSource {
  /* Person to contact for enquiries: Richard */
  static get _name() { return "neherlab"; }
}

class SpheresSource extends PublicGroupSource {
  /* Person to contaect for enquiries: Trevor */
  static get _name() { return "spheres"; }
}

class NIPHSource extends PublicGroupSource {
  static get _name() { return "niph"; }
}

class EPICOVIGALSource extends PublicGroupSource {
  static get _name() { return "epicovigal"; }
}

class WAPHLSource extends PublicGroupSource {
  static get _name() { return "waphl"; }
}

class ILRIPrivateSource extends PrivateGroupSource {
  static get _name() { return "ilri"; }
}

class NebraskaDHHSSource extends PublicGroupSource {
  /* Person to contact: Bryan Temogoh */
  static get _name() { return "nebraska-dhhs"; }
}

class AfricaCDCSource extends PublicGroupSource {
  /* Person to contact: Gerald Mboowa */
  static get _name() { return "africa-cdc"; }
}

class PIGIEPrivateSource extends PrivateGroupSource {
  static get _name() { return "pigie"; }
}

class ViennaRNASource extends PublicGroupSource {
  static get _name() { return "ViennaRNA"; }
  get bucket() { return "nextstrain-viennarna"; }
}

class SC2ZamPubSource extends PublicGroupSource {
  static get _name() { return "SC2ZamPub"; }
  get bucket() { return "nextstrain-sc2zampub"; }
}

class SC2ZamPrivateSource extends PrivateGroupSource {
  static get _name() { return "SC2Zam"; }
  get bucket() { return "nextstrain-sc2zam"; }
}

class WallauLabPrivateSource extends PrivateGroupSource {
  static get _name() { return "wallaulab"; }
}

class NextfluPrivateSource extends PrivateGroupSource {
  static get _name() { return "nextflu-private"; }
}

class NcovHKSource extends PublicGroupSource {
  static get _name() { return "ncovHK"; }
  get bucket() { return "nextstrain-ncovhk"; }
}

class DatabiomicsPrivateSource extends PrivateGroupSource {
  static get _name() { return "databiomics"; }
}

class UsdaArsFluCrewSource extends PublicGroupSource {
  static get _name() { return "usda-ars-flucrew"; }
}

class OffluSwinePrivateSource extends PrivateGroupSource {
  static get _name() { return "offlu-swine-private"; }
}

class ValldHebronVirologySource extends PublicGroupSource {
  static get _name() { return "valldhebronvirology"; }
}

class ValldHebronVirologyPrivateSource extends PrivateGroupSource {
  static get _name() { return "valldhebronvirology-private"; }
}

const groupSources = [
  /* Public nextstrain groups: */
  BlabSource,
  SeattleFluSource,
  NextspainSource,
  SwissSource,
  COGUKSource,
  NGSSASource,
  ECDCSource,
  IllinoisGagnonPublicSource,
  NeherLabSource,
  SpheresSource,
  NIPHSource,
  EPICOVIGALSource,
  WAPHLSource,
  ViennaRNASource,
  SC2ZamPubSource,
  NebraskaDHHSSource,
  NcovHKSource,
  AfricaCDCSource,
  GrubaughLabPublicSource,
  UsdaArsFluCrewSource,
  ValldHebronVirologySource,
  /* Private nextstrain groups: */
  BlabPrivateSource,
  NzCovid19PrivateSource,
  AllWalesPrivateSource,
  IllinoisGagnonPrivateSource,
  GrubaughLabPrivateSource,
  InrbDrcSource,
  ILRIPrivateSource,
  PIGIEPrivateSource,
  SC2ZamPrivateSource,
  WallauLabPrivateSource,
  NextfluPrivateSource,
  DatabiomicsPrivateSource,
  OffluSwinePrivateSource,
  ValldHebronVirologyPrivateSource,

  /* Groups for dev/testing.  Might be nice to expose these in production too,
   * but we'd need additional changes first to support "unlisted" Groups.
   *   -trs, 24 Jan 2022
   * */
  ...(PRODUCTION ? [] : [TestSource, TestPrivateSource]),
];

module.exports = {
  PublicGroupSource,
  PrivateGroupSource,
  groupSources,
};
