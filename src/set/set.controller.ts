import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, Query, HttpCode} from '@nestjs/common';
import { SetService } from './set.service';
import { CreateSetDto } from './dto/create-set.dto';
import { UpdateSetTasksDto } from './dto/update-set-tasks.dto';
import {UpdateSetDto} from './dto/update-set-metadata.dto'
import { ObjectId } from 'mongoose';

@Controller('set')
export class SetController {
  constructor(private readonly setService: SetService) {}

  @Post()
  create(@Body() createSetDto: CreateSetDto) {
    return this.setService.create(createSetDto);
  }

  @Get()
  findAll() {
    return this.setService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: ObjectId) {
    return this.setService.findOne(id);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id') id: ObjectId, @Query('type') type: string) {
    this.setService.remove(id, type);
  }

  @Get(':id/tasks')
  getSetTasks(@Param('id') id:  ObjectId,  @Query('page') page: number) {
    return this.setService.getTasks(id, page);
  }

  @Patch(':id/meta')
  updateMeta(@Param('id') id: ObjectId, @Body() updateSetDto: UpdateSetDto) {
    return this.setService.updateMetadata(id, updateSetDto);
  }

  @Get(':id/meta')
  getMeta(@Param('id') id: ObjectId, @Body() updateSetDto: UpdateSetDto) {
    return this.setService.getMetadata(id);
  }

  @Post(':id/add')
  addTask(@Param('id') id: ObjectId, @Body() updateSetTasksDto: UpdateSetTasksDto) {
    return this.setService.alterTasks(id, "add", updateSetTasksDto);
  }
  
  @Post(':id/remove')
  removeTask(@Param('id') id:  ObjectId, @Body() updateSetTasksDto: UpdateSetTasksDto) {
    return this.setService.alterTasks(id, "remove", updateSetTasksDto);
  }

}
