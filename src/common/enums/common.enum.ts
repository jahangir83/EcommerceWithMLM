export enum UserStatus{
    ADVANCED_ACCESS_USER = 'advanced_access_user',
    ADVANCED_UDDOKTA= 'advanced_uddokta',
    ADVANCED_ASSOCIATE = 'advanced_associate',
}


export enum WalletType {
  MONEY = 'MONEY',
  POINTS = 'POINTS',
  COMMISSION = 'COMMISSION',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum TransactionType {
 INCOME = 'income',
  WITHDRAWAL = 'withdrawal',
  POINT_INCOME = 'point_income',
  PURCHASE = 'purchase',
  REFUND = 'refund',
  TRANSFER = 'transfer',
  COMMISSION = 'commission',
}

export enum ValueType {
  MONEY = 'money',
  POINTS = 'points',
}

export enum TransactionDirection {
  INFLOW = 'inflow',
  OUTFLOW = 'outflow',
}
