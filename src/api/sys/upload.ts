import { UploadApiResult } from './model/uploadModel';
import { defHttp } from '@/utils/http/axios';
import { UploadFileParams } from '#/axios';
import { useGlobSetting } from '@/hooks/setting';
import { AxiosProgressEvent } from 'axios';

const { uploadUrl = '' } = useGlobSetting();

/**
 * @description: Upload interface
 */
export function uploadApi(
  params: UploadFileParams,
  onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
) {
  return defHttp.uploadFile<UploadApiResult>(
    {
      url: uploadUrl,
      onUploadProgress,
    },
    params,
  );
}

/**
 * @description: Ocr Upload interface
 */
export function orcUpload(params: UploadFileParams) {
  return defHttp.uploadFile<UploadApiResult>(
    {
      url: 'http://127.0.0.1:8000/py-api/ocr/recognize',
      timeout: 60000, // Set timeout to 60 seconds
    },
    params,
  );
}
