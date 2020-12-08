export enum JournalStatus {
  ACTIVE = 1,
  DISABLED = 0,
}

export type Journal = {
    id: string;
    name: string;
    exchangeId: number;
    status: JournalStatus;
};
