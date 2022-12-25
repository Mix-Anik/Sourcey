import {Entity, Column, Index} from 'typeorm'
import {BaseModel} from '../BaseModel'


@Entity()
export class VkGroup extends BaseModel {
    @Index()
    @Column({
        length: 64,
        nullable: false,
        unique: true
    })
    groupId: string

    @Column({
        nullable: true
    })
    lastPostId: number
}
