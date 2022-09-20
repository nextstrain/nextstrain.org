import { keyringFromParamString, encrypt, decrypt, randomKey } from '../src/cryptography.js';


/* See comments in jest.config.js.  If this test fails, then something's amiss
 * and the tests below are hopeless.
 */
test("Buffer is subclass of Uint8Array", () => {
  expect(Buffer.from("foo") instanceof Uint8Array)
    .toBeTrue();
});


test("keyring construction", () => {
  const keyring = keyringFromParamString(`a=${randomKey()}&b=${randomKey()}&c=${randomKey()}`);

  expect(keyring.children)
    .toHaveLength(3);

  expect(keyring.generator)
    .toStrictEqual(keyring.children[0]);
});


test("encrypt/decrypt roundtrip", async () => {
  const plaintext = "'Twas brillig, and the slithy toves";

  const keyring = keyringFromParamString(`a=${randomKey()}`);
  const ciphertext = await encrypt(keyring, plaintext);

  expect(ciphertext)
    .toMatch(/^[A-Za-z0-9+/=]+$/); // base64

  await expect(decrypt(keyring, ciphertext))
    .resolves
    .toStrictEqual(plaintext);
});


test("key rotation", async () => {
  const plaintext = "Did gyre and gimble in the wabe";

  const keyA = `a=${randomKey()}`;
  const keyB = `b=${randomKey()}`;

  // Encrypt with key A
  const keyringA = keyringFromParamString(keyA);
  const ciphertext = await encrypt(keyringA, plaintext);

  // Decrypt after rotating primary key to B
  const keyringBA = keyringFromParamString(`${keyB}&${keyA}`);

  await expect(decrypt(keyringBA, ciphertext))
    .resolves
    .toStrictEqual(plaintext);

  // Decrypt fails if we don't retain key A
  const keyringB = keyringFromParamString(keyB);

  await expect(decrypt(keyringB, ciphertext))
    .rejects
    .toThrow("unencryptedDataKey has not been set");
});


test("invalid key size", () => {
  expect(() => keyringFromParamString(`a=${randomKey(8)}`))
    .toThrow("invalid key size");

  expect(() => keyringFromParamString(`a=${randomKey(512)}`))
    .toThrow("invalid key size");
});


test("encrypt/decrypt context", async () => {
  const plaintext = "All mimsy were the borogoves";

  const keyring = keyringFromParamString(`a=${randomKey()}`);
  const ciphertext = await encrypt(keyring, plaintext, {testing: "yes", poem: "Jabberwocky"});

  expect(ciphertext)
    .toMatch(/^[A-Za-z0-9+/=]+$/); // base64

  // Matching full context
  await expect(decrypt(keyring, ciphertext, {testing: "yes", poem: "Jabberwocky"}))
    .resolves
    .toStrictEqual(plaintext);

  // Matching subset context
  await expect(decrypt(keyring, ciphertext, {testing: "yes"}))
    .resolves
    .toStrictEqual(plaintext);

  // Mismatching contexts
  await expect(decrypt(keyring, ciphertext, {testing: "no"}))
    .rejects
    .toThrow("encrypted message context does not match decryption context");

  await expect(decrypt(keyring, ciphertext, {something: "else"}))
    .rejects
    .toThrow("encrypted message context does not match decryption context");
});
