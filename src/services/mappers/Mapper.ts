export interface Mapper<InputEntity, OutputEntity> {
  toEntity(entity: InputEntity, ...args: never[]): OutputEntity
  toEntityBulk(entities: InputEntity[], ...args: never[]): OutputEntity[]
}
