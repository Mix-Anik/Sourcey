import {
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  Index
} from 'typeorm'


export abstract class BaseModel extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({type: 'timestamptz', default: 'now()'})
  createdAt: Date

  // TODO: make modifiedAt update on row change
  // @Column({type: 'timestamptz', default: 'now()'})
  // modifiedAt: Date

  @Index()
  @Column({
    length: 32,
    nullable: false
  })
  guildId: string

  constructor(model?: Partial<any>) {
    super()
    Object.assign(this, model)
  }

  toJSON(): string {
    return JSON.stringify(this)
  }
}
