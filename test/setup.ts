import { BaseGeneralObject, BaseGeneralObjectDao } from "../src";

export class TestGeneralObject extends BaseGeneralObject {
  num: number;
  str: string;
  deep: {
    num?: number;
  } = {};
  strArr: string[] = [];
  numArr: number[] = [];
}

export class TestGeneralObjectDao extends BaseGeneralObjectDao<TestGeneralObject> {
  target = TestGeneralObject;
}
