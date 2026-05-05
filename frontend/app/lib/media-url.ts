import { filesApi } from '@/api/files';

const ALIYUN_OSS_HTTP_PATTERN = /^https?:\/\/[^/]+\.aliyuncs\.com\/.+/i;

export function isSignableOssMediaUrl(src: string): boolean {
  if (!src) return false;
  if (src.startsWith('oss://')) return true;
  return ALIYUN_OSS_HTTP_PATTERN.test(src);
}

export async function resolveSignedMediaUrl(src: string): Promise<string> {
  if (!isSignableOssMediaUrl(src)) {
    return src;
  }
  const result = await filesApi.getSignedUrl(src);
  return result.signed_url || src;
}
