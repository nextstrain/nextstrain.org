const {S3Source, PrivateS3Source} = require("./s3");

class PublicGroupSource extends S3Source {
  get bucket() { return `nextstrain-${this.name}`; }
  static isGroup() {
    return true;
  }
}

class PrivateGroupSource extends PrivateS3Source {
  get bucket() { return `nextstrain-${this.name}`; }

  static visibleToUser(user) {
    return !!user && !!user.groups && user.groups.includes(this._name);
  }
  static isGroup() {
    return true;
  }
}

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
];

module.exports = {
  PublicGroupSource,
  PrivateGroupSource,
  groupSources,
};
