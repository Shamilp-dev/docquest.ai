export interface SearchResultDocument {
  _id: string;
  filename?: string;
  extractedText?: string;
  type?: string;
  score?: number;
}
