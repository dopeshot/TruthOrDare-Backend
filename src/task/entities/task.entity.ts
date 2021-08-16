import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, ObjectId, SchemaTypes, Types } from "mongoose";
import { Factory } from "nestjs-seeder";
import { CurrentPlayerGender } from "../enums/currentplayergender.enum";
import { Language } from "../enums/language.enum";
import { TaskStatus } from "../enums/taskstatus.enum";
import { TaskType } from "../enums/tasktype.enum";


@Schema({ _id: false })
export class TaskContent {
    @Factory('@ca')
    @Prop({ default: CurrentPlayerGender.ANYONE })
    currentPlayerGender: CurrentPlayerGender

    @Prop({ default: 0 })
    maleCount: number

    @Prop({ default: 0 })
    femaleCount: number

    @Prop({ default: 0 })
    anyoneCount: number

    @Factory(faker => faker.lorem.sentence(10))
    @Prop({ required: true, index: true })
    message: string
}

export const TaskContentSchema = SchemaFactory.createForClass(TaskContent)

@Schema({ timestamps: true })
export class Task {
    @Factory('en')
    @Prop({ required: true })
    language: Language

    @Factory('en')
    @Prop({ required: true })
    type: TaskType

    @Factory((faker) => ({
        currentPlayerGender: '@ca',
        message: faker.lorem.sentence(10)
    }))
    @Prop({ type: TaskContentSchema, required: true })
    content: TaskContent

    @Factory(() => Types.ObjectId())
    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    author: ObjectId

    @Prop({ default: 0 })
    likes: number | 0

    @Prop({ default: 0 })
    dislikes: number | 0

    @Prop({ default: 0 })
    difference: number | 0

    @Factory('active')
    @Prop({ default: TaskStatus.ACTIVE })
    status: TaskStatus | TaskStatus.ACTIVE
}

export type TaskDocument = Task & Document
export const TaskSchema = SchemaFactory.createForClass(Task)