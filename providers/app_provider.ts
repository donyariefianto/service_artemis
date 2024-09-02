import type { ApplicationService } from '@adonisjs/core/types'
import { Schedullers } from '#services/schedullers'
import { MongoDB } from '#services/mongodb_service'
import { Minio } from '#services/minio'
export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {
    const { MongoDBConfig } = this.app.config.get('mongodb')
    const { MinIOConfig } = this.app.config.get('minio')
    this.app.container.bind('schedullers', () => {
      return new Schedullers()
    })
    this.app.container.bind('connection_mongodb', () => {
      return new MongoDB(MongoDBConfig)
    })
    this.app.container.bind('MinIO', () => {
      return new Minio(MinIOConfig)
    })
  }

  /**
   * The container bindings have booted
   */
  async boot() {
    const mongodb = await this.app.container.make('connection_mongodb')
    await mongodb.connectMongoDB()
  }

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {
    await this.app.container.make('schedullers')
    await this.app.container.make('MinIO')
  }

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {}
}
