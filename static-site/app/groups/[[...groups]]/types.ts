export type DataResource = {
  request: string;
};

export type AvailableGroups = {
  datasets: DataResource[];
  narratives: DataResource[];
  avatars: Record<string, string | undefined>;
};
