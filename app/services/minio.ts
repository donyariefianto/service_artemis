import * as minio from 'minio'
import { Client } from 'minio'
import { MinIOConfig } from 'Config/minio'

export const clientMinio: { data: Client } = {}

export class Minio {
  constructor(config: typeof MinIOConfig) {
    clientMinio.data = new minio.Client(config)
  }
}
