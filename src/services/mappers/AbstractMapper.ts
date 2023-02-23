import { Mapper } from './Mapper'

export abstract class AbstractMapper<InputEntity, OutputEntity>
  implements Mapper<InputEntity, OutputEntity>
{
  abstract toEntity(entity: InputEntity, ...args: never[]): OutputEntity

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toEntityBulk(entities: InputEntity[], ...args: never[]): OutputEntity[] {
    return entities.map((e) => this.toEntity(e))
  }
}
