import { Body, Controller, HttpCode, Post } from "@nestjs/common";

import { Public } from "@shared/decorators/public.decorator";

import { AuthenticateUserDto } from "./dto/authenticate-user.dto";
import { AuthenticateUserUseCase } from "./useCases/authenticateUser/AuthenticateUserUseCase";

@Controller()
export class AuthController {
  constructor(
    private readonly authenticateUserUseCase: AuthenticateUserUseCase
  ) {}

  @Public()
  @Post("login")
  @HttpCode(200)
  async login(@Body() authenticateUserDto: AuthenticateUserDto) {
    return this.authenticateUserUseCase.execute(authenticateUserDto);
  }
}
