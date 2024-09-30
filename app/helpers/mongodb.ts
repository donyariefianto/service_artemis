import { collections, database } from '#services/mongodb_service'
import { ObjectId } from 'mongodb'
import moment from 'moment'
import env from '#start/env'

const collection = env.get('MONGO_COLLECTION')
// const collection = 'poc'
class MongoDBModels {
  public async AggregationsRaw(query) {
    const collections = database.data?.collection(collection)
    return await collections?.aggregate(query).toArray()
  }

  public async FindRaw(query: object) {
    if (query._id) {
      query._id = new ObjectId(query._id)
    }
    const collections = database.data?.collection(collection)
    return await collections.find(query).toArray()
  }

  public async FindOneSort(query: object, sort: object) {
    if (query._id) {
      query._id = new ObjectId(query._id)
    }
    const collections = database.data?.collection(collection)
    return await collections.find(query).limit(1).sort(sort).toArray()
  }

  public async FindOne(query: object) {
    if (query._id) {
      query._id = new ObjectId(query._id)
    }
    const collections = database.data?.collection(collection)
    return await collections.findOne(query)
  }

  public async FindWithPaging(query: object, skip: number, paging: number, sort: object) {
    const collections = database.data?.collection(collection)
    return await collections.find(query).skip(skip).limit(paging).sort(sort).toArray()
  }

  public async GetLength(query: object) {
    const collections = database.data?.collection(collection)
    return await collections.countDocuments(query)
  }

  public async InsertOne(query: object) {
    const collections = database.data?.collection(collection)
    return await collections?.insertOne(query)
  }

  public async InsertMany(query: object) {
    const collections = database.data?.collection(collection)
    return await collections?.insertMany(query)
  }

  public async DeletetOne(unique: string | number, query: object) {
    if (query._id) {
      query._id = new ObjectId(unique)
    }
    const collections = database.data?.collection(collection)
    return await collections?.deleteOne(query)
  }

  public async DeleteMany(query: object) {
    if (query._id) {
      query._id = new ObjectId(query._id)
    }
    const collections = database.data?.collection(collection)
    return await collections?.deleteMany(query)
  }

  public async UpdateOne(unique: string | number, query: object) {
    let newQuery = {}
    for (const q of Object.keys(query)) {
      newQuery[`detail.${q}`] = query[q]
    }
    const collections = database.data?.collection(collection)
    newQuery.updated_at = moment().format()
    return await collections?.updateOne({ _id: new ObjectId(unique) }, { $set: newQuery })
  }
}

export default new MongoDBModels()
