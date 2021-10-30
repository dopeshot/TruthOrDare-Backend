import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { JwtUserDto } from 'src/auth/dto/jwt.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard';
import { MongoIdDto } from '../shared/dto/mongoId.dto';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { CreateSetDto } from './dto/create-set.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateSetDto } from './dto/update-set.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SetService } from './set.service';

@ApiTags('set')
@Controller('set')
export class SetController {
  constructor(private readonly setService: SetService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create new set' })
  createSet(
    @Body(new ValidationPipe({ whitelist: true })) createSetDto: CreateSetDto, @Request() req) {
    return this.setService.createSet(createSetDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Sets' })
  getAllSets()
     {
    return this.setService.getAllSets();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one Set by id' })
  getOneSet(
    @Param(new ValidationPipe({ whitelist: true })) { id }: MongoIdDto) {
    return this.setService.getOneSet(id);
  }

  @Get('/user/:id')
  @ApiOperation({ summary: 'Get one Set by id' })
  getSetsByUser(
    @Param(new ValidationPipe({ whitelist: true })) { id }: MongoIdDto) {
    return this.setService.getSetsByUser(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update Set by id' })
  updateMeta(
    @Param('id') id: ObjectId, 
    @Body() updateSetDto: UpdateSetDto, 
    @Request() { user }: ParameterDecorator & { user: JwtUserDto }) {
    return this.setService.updateSetMetadata(id, updateSetDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  // TODO MC: Can not reprocude error
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete Set by id' })
  deleteSet(
    @Param(new ValidationPipe({ whitelist: true })) { id }: MongoIdDto, 
    @Query('type') type: string, 
    @Request() { user }: ParameterDecorator & { user: JwtUserDto }) {
    return this.setService.deleteSet(id, type, user)
  }

  



  //REWORK=====================================================================================
  @Post(':id/task')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create Task to Set via id and Json' })
  createTask(
    @Param('id') id: ObjectId, 
    @Body() createTaskDto: CreateTaskDto,
    @Request() { user }: ParameterDecorator & { user: JwtUserDto }) {
    return this.setService.createTask(id, createTaskDto, user);
  }

  //REWORK=====================================================================================
  @Delete(':id/task/:taskid/:type')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove one Task via id' })
  removeTask(
    @Param('id') id: ObjectId, 
    @Param('taskid') taskId: ObjectId, 
    @Param('type') type: string, 
    @Request() { user }: ParameterDecorator & { user: JwtUserDto }) {
    return this.setService.removeTask(id, taskId, type, user);
  }

  //REWORK=====================================================================================
  @Patch(':id/task/:taskid')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update one Task via id and Json' })
  updateTask(
    @Param('id') setId: ObjectId,
    @Param('taskid') taskId: ObjectId, 
    @Body() updateTaskDto: UpdateTaskDto, 
    @Request() { user }: ParameterDecorator & { user: JwtUserDto }) {
    return this.setService.updateTask(setId, taskId, updateTaskDto, user);
  }
}
