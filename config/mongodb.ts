import env from '../start/env.js'

export const MongoDBConfig = {
  host: env.get('MONGO_HOST'),
}
