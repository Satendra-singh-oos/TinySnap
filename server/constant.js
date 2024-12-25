// db connection related
export const DB_MAX_RETRIES = 3;
export const DB_RETRY_INTERVAL = 5000; // 5 seconds
export const DB_NAME = "tinysnap";

export const UserLoginType = {
  GOOGLE: "GOOGLE",
  EMAIL_PASSWORD: "EMAIL_PASSWORD",
};
export const UserRolesEnum = {
  ADMIN: "ADMIN",
  USER: "USER",
};

export const AvailableUserRoles = Object.values(UserRolesEnum);

export const AccountStatusEnum = {
  UNVERIFIED: "UNVERIFIED",
  VERIFIED: "VERIFIED",
  SUSPENDED: "SUSPENDED",
  DEACTIVATED: "DEACTIVATED",
};

export const RESET_PASSWORD_TOKEN_EXPIRY = 10 * 60 * 1000; // 10 minutes
export const URL_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
export const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000; // 20 minutes
