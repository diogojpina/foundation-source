import { Body, Controller, Param, Post } from '@nestjs/common';
import { AddMembersDto, CreateManagementGroupDto } from '../dtos';
import { ManagementGroup } from '../entities/management.group';
import { ManagementGroupService } from '../services/management.group.service';

@Controller('management-group')
export class ManagementGroupController {
  constructor(
    private readonly managementGroupService: ManagementGroupService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateManagementGroupDto,
  ): Promise<ManagementGroup> {
    return await this.managementGroupService.create(dto);
  }

  @Post('/add-members/:id')
  async addMembers(
    @Param('id') id: number,
    @Body() dto: AddMembersDto,
  ): Promise<boolean> {
    return await this.managementGroupService.addMembers(id, dto);
  }
}
