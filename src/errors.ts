export class InvalidGeneralObject extends Error {}

export class MismatchedGeneralObjectType extends Error {
  constructor(expectTy: string, actualTy: string) {
    super(`expect type '${expectTy}', actual type '${actualTy}'`);
  }
}
