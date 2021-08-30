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
}
