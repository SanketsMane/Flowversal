// Mock for @google-cloud/storage
class Storage {
  bucket() {
    return {
      file: jest.fn(() => ({
        createWriteStream: jest.fn(() => ({
          on: jest.fn(),
          end: jest.fn(),
        })),
        createReadStream: jest.fn(() => ({
          on: jest.fn(),
          pipe: jest.fn(),
        })),
        getSignedUrl: jest.fn(),
        exists: jest.fn(),
        delete: jest.fn(),
        getMetadata: jest.fn(),
      })),
    };
  }
}

export { Storage };
