import {Entity, Column, ManyToOne, Index} from 'typeorm'
import {BaseModel} from '../BaseModel'
import {RoleManager} from './RoleManager.model'


@Entity()
export class RoleManagerRole extends BaseModel {
    @Index()
    @Column({
        length: 64,
        nullable: false
    })
    roleId: string

    @Column({
        default: 64,
        nullable: false
    })
    emojiId: string

    @Column({
        default: 128,
        nullable: true
    })
    description: string

    @ManyToOne(() => RoleManager, rm => rm.roles)
    roleManager: RoleManager
}
