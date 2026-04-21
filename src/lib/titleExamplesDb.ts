const STORAGE_KEY = "redlist_title_examples_v1";

type TitleExamplesMap = Record<string, string[]>;

export const titleExamplesDb = {
  getAll: (): TitleExamplesMap => {
    if (typeof window === "undefined") return {};
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as TitleExamplesMap) : {};
  },

  get: (campaignId: string): string[] => {
    return titleExamplesDb.getAll()[campaignId] || [];
  },

  set: (campaignId: string, examples: string[]): void => {
    if (typeof window === "undefined") return;
    const all = titleExamplesDb.getAll();
    all[campaignId] = examples.filter((e) => e.trim() !== "");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },
};
