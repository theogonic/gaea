export interface ListObjectsRequest {
  id?: string;
  userId?: string;
  typeId?: string;
  status?: GeneralObjectStatus;
  limit?: number;
  nextToken?: string;
}
export interface ListObjectsResponse {
  totalCount?: number;
  nextToken?: string;
  items?: string[];
}
export interface UpdateObjectRequest {
  id?: string;
  updatedObject?: string;
}
export interface UpdateObjectResponse {
  updatedObject?: string;
}
export interface DeleteObjectRequest {
  id?: string;
}
export interface DeleteObjectResponse {
  success?: boolean;
}
export interface DaoService {
  listObjects(request: ListObjectsRequest): Promise<ListObjectsResponse>;
  updateObject(request: UpdateObjectRequest): Promise<UpdateObjectResponse>;
  deleteObject(request: DeleteObjectRequest): Promise<DeleteObjectResponse>;
}
export const DAO_SERVICE = Symbol("DAO_SERVICE");
export enum GeneralObjectStatus {
  Active = 1,
  Deleted = 2,
}
export interface GeneralObjectMeta {
  id?: string;
  userId?: string;
  typeId?: string;
  status?: GeneralObjectStatus;
  updatedAt?: number;
  createdAt?: number;
}
