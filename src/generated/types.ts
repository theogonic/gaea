export enum GeneralObjectStatus {
  Active = 1,
  Deleted = 2,
}
export interface GeneralObjectMeta {
  id: string;
  userId: string;
  typeId: string;
  status: GeneralObjectStatus;
  updatedAt: number;
  createdAt: number;
}
