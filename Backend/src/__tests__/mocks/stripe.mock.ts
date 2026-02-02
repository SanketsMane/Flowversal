// Mock for stripe
const Stripe = jest.fn().mockImplementation(() => ({
  checkout: {
    sessions: {
      create: jest.fn(),
    },
  },
  billingPortal: {
    sessions: {
      create: jest.fn(),
    },
  },
  subscriptions: {
    list: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
}));

export default Stripe;
