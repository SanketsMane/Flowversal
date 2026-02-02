// Mock for p-retry
const pRetry = jest.fn().mockImplementation((fn, options) => fn());

export default pRetry;
