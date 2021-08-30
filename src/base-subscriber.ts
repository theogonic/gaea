import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from "typeorm";
import { GenericEntity } from "./entities/GeneralEntity";

@EventSubscriber()
export abstract class BaseGenericObjectSubscriber
  implements EntitySubscriberInterface<GenericEntity>
{
  listenTo() {
    return GenericEntity;
  }

  abstract afterInsert(event: InsertEvent<GenericEntity>): Promise<void>;
  abstract afterUpdate(event: UpdateEvent<GenericEntity>): Promise<void>;
  abstract afterRemove(event: RemoveEvent<GenericEntity>): Promise<void>;
}
