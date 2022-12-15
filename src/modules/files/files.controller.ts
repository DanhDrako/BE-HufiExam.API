import { Controller, Post, UseInterceptors, UploadedFile, Get, Res, Param, UseGuards, Body, Delete, HttpCode, Req } from '@nestjs/common';
import { FilesService } from './files.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { RolesGaurd } from '../auth/Guards/roles.gaurd';
import { RolerUser } from 'src/common/Enums';
import { TextToJsonDto } from './dto/text2json.dto';

@Controller('files')
@ApiTags('FILE')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Post('image/ipfs')
  @ApiBearerAuth()
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  @ApiOperation({ summary: 'Upload an image to IPFS free' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImageToIpfs(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    return await this.filesService.uploadImageToIpfs(req, file);
  }

  @Post('image/imgur')
  @ApiBearerAuth()
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  @ApiOperation({ summary: 'Upload an image to IMGUR free' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImageToImgur(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    return await this.filesService.uploadImageToImgur(req, file);
  }

  @Post('image/server')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Upload an image to SERVER' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImageToServer(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    return await this.filesService.uploadImageToServer(req, file);
  }

  @HttpCode(200)
  @Post('image/server/ckeditor')
  @ApiOperation({ summary: 'Upload an image to SERVER' })
  @UseInterceptors(FileInterceptor('upload'))
  async uploadImageToServerCkeditor(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    return await this.filesService.uploadImageToServerCkeditor(req, file);
  }

  @Get('image/:name')
  @ApiOperation({ summary: 'View image by image name' })
  async viewImage(@Param('name') imageName: string, @Res() res: any) {
    if (imageName === 'banner-default.jpeg')
      return await res.sendFile(join(process.cwd(), '/uploads/common/banner-default.jpeg'));
    const path = join(process.cwd(), '/uploads/images/' + imageName);
    const fs = require("fs");
    if (!fs.existsSync(path))
      return await res.sendFile(join(process.cwd(), '/uploads/common/IMAGE_NOT_FOUND.png'));
    return res.sendFile(path);
  }

  @Get('image_ck/:name')
  @ApiOperation({ summary: 'View image by image_ck name' })
  async viewImageCk(@Param('name') imageName: string, @Res() res: any) {
    if (imageName === 'banner-default.jpeg')
      return await res.sendFile(join(process.cwd(), '/uploads/common/banner-default.jpeg'));
    const path = join(process.cwd(), '/uploads/images_ck/' + imageName);
    const fs = require("fs");
    if (!fs.existsSync(path))
      return await res.sendFile(join(process.cwd(), '/uploads/common/IMAGE_NOT_FOUND.png'));
    return res.sendFile(path);
  }

  @Post('image/ipfs-and-server')
  @ApiBearerAuth()
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  @ApiOperation({ summary: 'Upload image to ipfs and save on server' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImageToIpfsAndServer(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    return await this.filesService.uploadImageToIpfsAndServer(req, file);
  }

  @Post('other/ipfs')
  @ApiBearerAuth()
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  @ApiOperation({ summary: 'Upload other file to IPFS free' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadOtherToIpfs(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    return await this.filesService.uploadImageToIpfs(req, file);
  }

  @Post('/pdf2text/:fileName')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'To text after upload pdf role [ Admin ]' })
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  async pdf2Text(@Req() req: any, @Param('fileName') fileName: string) {
    return await this.filesService.pdf2Text(req, fileName);
  }

  @Post('/text2json/:fileName')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'To json after pdf to text [ Admin ]' })
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  async text2Json(@Req() req: any, @Param('fileName') fileName: string, @Body() text2Json: TextToJsonDto) {
    return await this.filesService.text2Json(req, fileName, text2Json);
  }

  @Delete(':fileName')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a file role [ Admin ]' })
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  async deleteFile(@Req() req: any, @Param('fileName') fileName: string) {
    return await this.filesService.deleteFile(req, fileName);
  }

  @Post('/insert-qa/:postid/:fileName')
  @ApiBearerAuth()
  @UseGuards(AuthGuard(), new RolesGaurd(RolerUser.ADMIN))
  @ApiOperation({ summary: 'Insert Questions For Post role [ADMIN]' })
  async insertQA(@Req() req: any, @Param('postid') postId: number, @Param('fileName') fileName: string, @Body() dto: TextToJsonDto) {
    return await this.filesService.insertQA(req, postId, fileName, dto);
  }
}
