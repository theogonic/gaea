import { GeneralObject } from "./types";
import { NIL as NIL_UUID } from "uuid";
import { GeneralObjectMeta, GeneralObjectStatus } from "./generated/types";

/**
 * BaseGeneralObject provides the standard way for other object to inherit generic object.
 */
export abstract class BaseGeneralObject implements GeneralObject {
  public meta: Partial<GeneralObjectMeta>;
  constructor(meta?: Partial<Omit<GeneralObjectMeta, "typeId">>) {
    if (!meta) {
      meta = {};
    }
    this.meta = {
      ...meta,
    };
    if (!this.meta.status) {
      this.meta.status = GeneralObjectStatus.Active;
    }
    if (!this.meta.userId) {
      this.meta.userId = NIL_UUID;
    }
    if (!this.meta.typeId) {
      this.meta.typeId = Object.getPrototypeOf(this).constructor.typeId;
    }
  }

  static get typeId(): string {
    return this.name;
  }
}
