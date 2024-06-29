import { ObjectId } from 'mongodb'
import _ from 'lodash'

const convertToObjectIdMongodb = (id: string) => new ObjectId(id)
type InfoDataParams = {
  fields: string[];
  object: Record<string, any>;
};

const getInfoData = ({ fields = [] , object = {} }: InfoDataParams) => {
  return _.pick(object, fields)
}

export { convertToObjectIdMongodb, getInfoData }
