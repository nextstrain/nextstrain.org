declare module "*.css" {
  const value: unknown;
  export default value;
}

declare module "*.jpg" {
  const value: { src: string };
  export default value;
}

declare module "*.png" {
  const value: { src: string };
  export default value;
}

declare module "*.svg" {
  const value: { src: string };
  export default value;
}

declare module "*.yaml" {
  // Actual type should be set upon import via type assertion.
  const contents: unknown;
  export default contents;
}
