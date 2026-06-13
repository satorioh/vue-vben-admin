import { defHttp } from '@/utils/http/axios';
import { ContentTypeEnum } from '@/enums/httpEnum';

enum Api {
  MD_TO_PDF = '/py-api/md2pdf',
  MD_TO_WORD = '/py-api/md2word',
}

export const mdToPdfApi = (data: FormData) =>
  defHttp.post(
    {
      url: Api.MD_TO_PDF,
      data,
      responseType: 'blob',
      headers: {
        'Content-Type': ContentTypeEnum.FORM_DATA,
      },
    },
    {
      isTransformResponse: false,
    },
  );

export const mdToWordApi = (data: FormData) =>
  defHttp.post(
    {
      url: Api.MD_TO_WORD,
      data,
      responseType: 'blob',
      headers: {
        'Content-Type': ContentTypeEnum.FORM_DATA,
      },
    },
    {
      isTransformResponse: false,
    },
  );
