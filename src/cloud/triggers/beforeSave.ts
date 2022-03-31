import logger from '../../utils/WinstonLogger';
export function StockLot(request: Parse.Cloud.BeforeSaveRequest): void {
  LogBeforeSave(request);
}

export function UserData(request: Parse.Cloud.BeforeSaveRequest): void {
  LogBeforeSave(request);
}

export function Wallet(request: Parse.Cloud.BeforeSaveRequest): void {
  LogBeforeSave(request);
}

// #region module level functions
function LogBeforeSave(request: Parse.Cloud.BeforeSaveRequest) {
  logger.info(
    `BeforeSave Triggered for ${request.object.id} with objectId: ${request.triggerName}`
  );
}
//#endregion
