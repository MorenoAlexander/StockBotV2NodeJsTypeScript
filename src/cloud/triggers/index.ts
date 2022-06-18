import Parse from 'parse/node';
import * as beforeSaves from './beforeSave';

export default function RegisterControllers() {
  Parse.Cloud.beforeSave('StockLot', beforeSaves.StockLot);
}
