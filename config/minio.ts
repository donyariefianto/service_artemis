import env from '../start/env.js'

export const MinIOConfig = {
  endPoint: env.get('MINIO_HOSTNAME'),
  port: Number(env.get('MINIO_PORT')),
  useSSL: Boolean(JSON.parse(env.get('MINIO_SSL'))),
  accessKey: env.get('MINIO_ACCESS_KEY'),
  secretKey: env.get('MINIO_SECRET_KEY'),
}
