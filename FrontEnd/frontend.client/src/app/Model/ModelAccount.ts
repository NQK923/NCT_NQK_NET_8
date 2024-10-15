export interface ModelAccount {
  id_account?: number;

  username?: string; // Đặt tên theo chuẩn PascalCase

  password: string; // Đặt tên theo chuẩn PascalCase

  banDate?: Date
  role?: boolean;
  status?: boolean;

}
