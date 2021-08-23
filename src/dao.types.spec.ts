import { BaseGeneralObject } from "./base-general-object";
import { GeneralObjectStatus } from "./generated/types";
import { NIL } from "uuid";
class RandomGeneralObject extends BaseGeneralObject {}

describe("Generic Object Defualt Behaviors", () => {
  it("Generic Object should have type ID", () => {
    const gObject = new RandomGeneralObject({});
    expect(gObject.meta.typeId).toBe(RandomGeneralObject.name);
  });

  it("Generic Object should have default status", () => {
    const gObject = new RandomGeneralObject({});
    expect(gObject.meta.status).toBe(GeneralObjectStatus.Active);
  });

  it("Generic Object should have default user ID", () => {
    const gObject = new RandomGeneralObject({});
    expect(gObject.meta.userId).toBe(NIL);
  });
});
