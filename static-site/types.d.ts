declare module "*.yaml" {
  // Actual type should be set upon import via type assertion.
  const contents: unknown;
  export default contents;
}
