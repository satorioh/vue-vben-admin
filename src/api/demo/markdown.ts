import { defHttp } from '@/utils/http/axios';

enum Api {
  MD_TO_PDF = '/py-api/md2pdf',
  MD_TO_WORD = '/py-api/md2word',
}

export const mdToPdfApi = (params: FormData) =>
  defHttp.post(
    {
      url: Api.MD_TO_PDF,
      params,
      responseType: 'blob',
    },
    {
      isTransformResponse: false,
    },
  );

export const mdToWordApi = (params: FormData) =>
  defHttp.post(
    {
      url: Api.MD_TO_WORD,
      params,
      responseType: 'blob',
    },
    {
      isTransformResponse: false,
    },
  );
