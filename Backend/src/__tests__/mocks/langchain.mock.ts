// Mock for @langchain packages
export const BaseChatModel = jest.fn();
export const ChatPromptTemplate = jest.fn();
export const MessagesPlaceholder = jest.fn();
export const BaseMessage = jest.fn();
export const HumanMessage = jest.fn();
export const AIMessage = jest.fn();
export const SystemMessage = jest.fn();
export const RunnableSequence = jest.fn();

// Mock the entire module structure
const mockLangChain = {
  BaseChatModel,
  ChatPromptTemplate,
  MessagesPlaceholder,
  BaseMessage,
  HumanMessage,
  AIMessage,
  SystemMessage,
  RunnableSequence,
};

export default mockLangChain;
