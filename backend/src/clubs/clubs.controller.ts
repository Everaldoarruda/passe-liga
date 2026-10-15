import { Body, Controller, Get, Post } from '@nestjs/common';
import { ClubsService } from './clubs.service';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Get()
  list() {
    return this.clubsService.list();
  }

  @Post()
  create(@Body() body: { name: string; acronym: string }) {
    return this.clubsService.create(body);
  }
}