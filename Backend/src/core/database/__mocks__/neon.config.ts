
// Manual mock for NeonConfig
export const neonDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnValue([{ id: 'test-user-id', email: 'test@example.com' }]),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
};

export class NeonDatabase {
  static getClient() {
    return neonDb;
  }
  static healthCheck() {
    return Promise.resolve(true);
  }
}
