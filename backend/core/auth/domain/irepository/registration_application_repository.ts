export interface RegistrationApplication {
  id: string
  lineUserId: string
  displayName: string
  avatarUrl: string | null
  status: "pending" | "approved" | "rejected"
  createdAt: Date
}

export interface InsertRegistrationApplicationParams {
  lineUserId: string
  displayName: string
  avatarUrl: string | null
}

export interface IRegistrationApplicationRepository {
  findPendingByLineUserId(
    lineUserId: string,
  ): Promise<RegistrationApplication | null>
  findById(id: string): Promise<RegistrationApplication | null>
  listByStatus(
    status: "pending" | "approved" | "rejected",
  ): Promise<RegistrationApplication[]>
  insert(params: InsertRegistrationApplicationParams): Promise<string>
  updateStatus(
    id: string,
    status: "approved" | "rejected",
    updatedUser: string,
  ): Promise<void>
}
