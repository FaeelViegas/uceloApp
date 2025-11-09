export interface User {
  userId: number;
  name: string;
  mail: string;
  pwd?: string;
  accountId: number;
  master: number;
  active: number;
  createDate: Date;
  changeDate: Date;
}