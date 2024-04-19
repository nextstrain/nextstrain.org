/**
 * Cryptographic building blocks for encrypting our data at rest.
 *
 * The primary use case for this module is encrypting some data in sessions
 * when at rest in Redis.  When adding other usages, please evaluate if the
 * tradeoffs/choices made by this module are right for the new use case!
 *
 * This module uses the AWS Cryptography SDK (@aws-crypto/… modules) because:
 *
 *  - it stood out in a sea of options on NPM as presumably more trustworthy,
 *    robust, and correct than other cryptography libraries by various unknown
 *    authors
 *
 *  - it goes to great lengths to implement best practices while still allowing
 *    a spectrum of safe choices based on your own tradeoffs/needs
 *
 *  - as an official AWS product, it appears well maintained
 *
 *  - the explanatory documentation and examples are superb (although the API
 *    reference docs are terrible/non-existent)
 *
 * Note that although the SDK supports and is primarily intended for use with
 * AWS's Key Management Service (KMS), we don't actually use KMS here.  The
 * code we call never interacts with an AWS service.  Instead, we rely on
 * locally-stored keys provided directly (e.g. SESSION_ENCRYPTION_KEYS).  While
 * it would be lovely to use KMS to securely store and automatically rotate our
 * keys, it seems wildy infeasible to be making (potentially multiple) network
 * calls to KMS for each request to nextstrain.org with an authenticated
 * session.
 *
 * The wrapping and data algorithm suites are chosen for the following
 * properties:
 *
 *   - Symmetric encryption using AES-GCM with 256-bit keys (AES256_GCM_IV12_TAG16)
 *   - Data key derivation with HKDF and SHA-384 (HKDF_SHA384)
 *   - No signing (ECDSA_*)
 *   - No key commitments (COMMIT_KEY)
 *
 * We opt out of the defaults of signing and key commitments because they both
 * add significant overhead to the encrypt/decrypt time and (to a lesser
 * degree) the encrypted message size.  Since we decrypt on ~every request with
 * a session, it's important to be as fast as possible!  These security
 * features are also not exceptionally useful for our use case, as they
 * primarily protect against modifications of the ciphertext by external
 * parties but we're not exchanging the data with anyone other than ourselves.
 * In rough benchmarking, the encrypt() and decrypt() routines provided by this
 * module with the algorithm choices above each take <1ms.
 *
 * See the AWS Cryptography SDK docs¹ for more information on these properties.
 * The concept guide² is a particularly helpful place to start and get oriented
 * before reading further reference material.
 *
 * ¹ https://docs.aws.amazon.com/encryption-sdk/latest/developer-guide/
 * ² https://docs.aws.amazon.com/encryption-sdk/latest/developer-guide/concepts.html
 *
 * @module cryptography
 */

import { strict as assert } from 'assert';

import awsCrypto from '@aws-crypto/client-node';
import { randomBytes } from 'crypto';


/* These must be changed with care.  Blithely changing them could make existing
 * ciphertexts undecryptable.
 */
const KEY_LENGTH_BITS = 256;
const KEY_COMMITMENT_POLICY = awsCrypto.CommitmentPolicy.FORBID_ENCRYPT_ALLOW_DECRYPT;
const WRAPPING_SUITE = awsCrypto.RawAesWrappingSuiteIdentifier.AES256_GCM_IV12_TAG16_NO_PADDING;
const DATA_SUITE = awsCrypto.AlgorithmSuiteIdentifier.ALG_AES256_GCM_IV12_TAG16_HKDF_SHA256;


const {
  encrypt: _encrypt,
  decrypt: _decrypt,
} = awsCrypto.buildClient(KEY_COMMITMENT_POLICY);


/**
 * Construct a keyring from one or more AES 256-bit keys.
 *
 * The first key specified will be used for encryption.  All keys will be
 * considered (in order) for decryption.  This allows for key rotation over
 * time.
 *
 * @param {String} keyParamString - A URL query param string encoding pairs of
 *    key names and base64-encoded key material
 * @returns {Object}
 */
function keyringFromParamString(keyParamString) {
  const keyParams = Array.from((new URLSearchParams(keyParamString)).entries());

  // Decryption with any key passed in.
  const children = keyParams.map(([keyName, encodedKey]) => {
    assert(typeof encodedKey === "string");

    const keyBytes = new Uint8Array(Buffer.from(encodedKey, "base64"));

    assert(keyBytes.byteLength * 8 === KEY_LENGTH_BITS, "invalid key size");

    return new awsCrypto.RawAesKeyringNode({
      /* Namespace part of key identifier disambiguates the name part.  Not
       * super useful in our context, but required.  Embedded (unencrypted) in
       * every encrypted message output (along with keyName), so keep it short!
       * "N" for Nextstrain.
       */
      keyNamespace: "N",
      keyName,
      unencryptedMasterKey: keyBytes,
      wrappingSuite: WRAPPING_SUITE,
    });
  });

  // Encryption with the first key.
  const generator = children[0];

  return new awsCrypto.MultiKeyringNode({generator, children});
}


/**
 * Encrypts the given plaintext with the given keyring.
 *
 * @param {Object} keyring - A keyring object, e.g. from {@link keyringFromParamString}
 * @param {String|Buffer} plaintext
 * @param {Object} [context] - Associated data (key/value pairs of strings) that
 *   contextualizes this plaintext to prevent context shifts; not encrypted!
 * @returns {String} base64-encoded encrypted message (ciphertext)
 */
async function encrypt(keyring, plaintext, context) {
  const {result: encryptedMessage} = await _encrypt(
    keyring,
    plaintext,
    {
      suiteId: DATA_SUITE,
      encryptionContext: context,
    }
  );
  return encryptedMessage.toString("base64");
}


/**
 * Decrypts the given encrypted message (ciphertext) with the given keyring.
 *
 * If a context object is given, the encrypted message's context will be
 * verified to contain the same key/value pairs.
 *
 * @param {Object} keyring - A keyring object, e.g. from {@link keyringFromParamString}
 * @param {String|Buffer} ciphertext - An encrypted message from {@link encrypt}.
 *   Presumed to be in a base64-encoded string representation, though a Buffer is
 *   also accepted.
 * @param {Object} [context] - Associated data (key/value pairs of strings) that
 *   contextualizes the plaintext to prevent context shifts; not encrypted!
 * @returns {String} plaintext
 */
async function decrypt(keyring, ciphertext, context) {
  const {plaintext, messageHeader: {encryptionContext}} =
    await _decrypt(keyring, Buffer.from(ciphertext, "base64"));

  if (context) {
    for (const key of Object.keys(context)) {
      assert(encryptionContext[key] === context[key], "encrypted message context does not match decryption context");
    }
  }

  return plaintext.toString();
}


/**
 * Generate a suitable encryption key from random bytes.
 *
 * Useful for testing and local development.
 *
 * @param {Number} [byteLength] - length of key in bytes
 */
function randomKey(byteLength = KEY_LENGTH_BITS / 8) {
  return Buffer.from(randomBytes(byteLength)).toString("base64url");
}


export {
  KEY_LENGTH_BITS,
  keyringFromParamString,
  encrypt,
  decrypt,
  randomKey,
};
