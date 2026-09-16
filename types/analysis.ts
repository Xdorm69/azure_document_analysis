export type KeyFinding = {
  title: string;
  description: string;
  importance: "low" | "medium" | "high";
  pages: number[];
};

export type Risk = {
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  pages: number[];
};

export type Entity = {
  name: string;
  type:
    | "person"
    | "organization"
    | "location"
    | "product"
    | "other";
};

export type ImportantDate = {
  date: string;
  description: string;
  pages: number[];
};

export type ImportantNumber = {
  value: string;
  description: string;
  pages: number[];
};

export type ActionItem = {
  action: string;
  priority: "low" | "medium" | "high";
  pages: number[];
};

export type DocumentAnalysisResult = {
  summary: string;

  riskScore: number;

  keyFindings: KeyFinding[];

  risks: Risk[];

  entities: Entity[];

  importantDates: ImportantDate[];

  importantNumbers: ImportantNumber[];

  actionItems: ActionItem[];
};