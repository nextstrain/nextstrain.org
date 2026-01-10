export type DataResource = {
  request: string;
  lastUpdated?: string;
};

export type AvailableGroups = {
  datasets: DataResource[];
  narratives: DataResource[];
};
