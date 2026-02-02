/**
 * Chat Component - Redesigned
 * Mode-based tool/workflow selection with Flowversal branding
 * Modes: Auto, Agent (tools), Plan, Debug, Ask (workflows)
 */

import { useAuth } from '@/core/auth/AuthContext';
import { useTheme } from '@/core/theme/ThemeContext';
import { supabase } from '@/shared/lib/supabase';
import {
  Bot,
  Brain,
  Bug,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code,
  Database,
  Download, Eye,
  FileText,
  GitBranch,
  HelpCircle,
  Image,
  Lightbulb,
  Mic,
  Paperclip,
  Plus,
  Search,
  Send,
  Sparkles,
  Wrench,
  X,
  XCircle
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { actionExecutorService } from '../services/action-executor.service';
import { chatService } from '../services/chat.service';
import { ChatConversation, ChatSidebar } from './ChatSidebar';
import { ChatToolsPicker, SelectedTool } from './ChatToolsPicker';
import { MemoriesModal } from './MemoriesModal';
import { PromptLibrary } from './PromptLibrary';

// Chat Modes
type ChatMode = 'agent' | 'plan' | 'debug' | 'ask';

interface ModeConfig {
  id: ChatMode;
  label: string;
  icon: any;
  description: string;
  color: string;
}

const chatModes: ModeConfig[] = [
  { id: 'agent', label: 'Agent', icon: Bot, description: 'Use tools and execute actions', color: 'from-[#9D50BB] to-[#6E45E2]' },
  { id: 'plan', label: 'Plan', icon: Lightbulb, description: 'Create step-by-step plans', color: 'from-amber-400 to-amber-600' },
  { id: 'debug', label: 'Debug', icon: Bug, description: 'Debug and troubleshoot', color: 'from-red-400 to-red-600' },
  { id: 'ask', label: 'Ask', icon: HelpCircle, description: 'Ask questions about workflows', color: 'from-[#00C6FF] to-[#9D50BB]' },
];

// AI Models
type AIModel = 'Auto' | 'Flowversal' | 'Chat GPT' | 'Gemini' | 'Grok';
const aiModels: AIModel[] = ['Auto', 'Flowversal', 'Chat GPT', 'Gemini', 'Grok'];


interface AgentReasoning {
  thoughts?: Array<{ content: string; timestamp: Date; confidence?: number }>;
  toolCalls?: Array<{ toolName: string; arguments: any; result?: any; success: boolean; duration?: number }>;
  decisions?: Array<{ decisionPoint: string; reasoning: string; selectedOption: any; confidence?: number }>;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  workflowData?: any;
  type?: 'text' | 'workflow' | 'error' | 'tool-config';
  tools?: SelectedTool[];
  configTool?: string;
  agentReasoning?: AgentReasoning;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ChatMode>('agent');
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>('Auto');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [conversationId, setConversationId] = useState<string>('');
  const [useRealAI, setUseRealAI] = useState(true); // Use real AI by default
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);
  
  // Tool Configuration State
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  
  // Sidebar state
  const [conversations, setConversations] = useState<ChatConversation[]>([
    { id: '1', title: 'Email: Today\'s Delhi Weather', preview: 'Weather update...', timestamp: new Date(Date.now() - 86400000) },
  ]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Tools picker state
  const [showToolsPicker, setShowToolsPicker] = useState(false);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  const [selectedTools, setSelectedTools] = useState<SelectedTool[]>([]);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  
  // Debug: Log when showToolsPicker changes
  useEffect(() => {
    console.log('[Chat] showToolsPicker changed:', showToolsPicker);
  }, [showToolsPicker]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Flowversal theme colors
  const bgColor = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const inputBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';

  // Get current mode config
  const currentMode = chatModes.find(m => m.id === selectedMode) || chatModes[0];

  const workflowOptions = [
    { icon: Image, label: 'Image Creation', color: 'text-purple-400' },
    { icon: Search, label: 'Deep Search', color: 'text-blue-400' },
    { icon: FileText, label: 'Content Writer', color: 'text-green-400' },
    { icon: Code, label: 'Code Generator', color: 'text-orange-400' },
    { icon: Database, label: 'Data Analysis', color: 'text-cyan-400' },
  ];

  const suggestionChips = [
    { icon: '✨', label: 'Create a workflow for email automation' },
    { icon: '🤖', label: 'Generate a customer onboarding workflow' },
    { label: 'Build a data processing pipeline' },
    { label: 'Create an AI content generator' },
    { label: 'Automate social media posting' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get access token
  useEffect(() => {
    const getToken = async () => {
      try {
        const sessionStr = localStorage.getItem('flowversal_auth_session');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          if (session.accessToken) {
            setAccessToken(session.accessToken);
            return;
          }
        }
      } catch (error) {
        console.error('[Chat] Error getting token:', error);
      }

      if (isAuthenticated && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            setAccessToken(session.access_token);
          }
        } catch (error) {
          console.error('[Chat] Error getting Supabase token:', error);
        }
      }
      
      // Don't set a fake token - let authentication handle it properly
      if (!accessToken) {
        console.warn('[Chat] No access token available');
      }
    };
    getToken();
  }, [isAuthenticated]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowModeDropdown(false);
      setShowOptionsDropdown(false);
      setShowModelDropdown(false);
    };

    if (showModeDropdown || showOptionsDropdown || showModelDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showModeDropdown, showOptionsDropdown, showModelDropdown]);

  // Sidebar handlers
  const handleNewChat = () => {
    const newConversation: ChatConversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      preview: '',
      timestamp: new Date(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setMessages([]);
    setConversationId('');
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
    toast.success('Chat deleted');
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, title: newTitle } : c))
    );
    toast.success('Chat renamed');
  };

  // Open tools picker
  const handleOpenTools = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('[Chat] Opening tools picker');
    setShowToolsPicker(true);
    console.log('[Chat] showToolsPicker set to true');
  };

  const handleSelectTool = (tool: SelectedTool) => {
    setSelectedTools(prev => {
      const exists = prev.some(t => t.type === tool.type);
      if (exists) {
        return prev.filter(t => t.type !== tool.type);
      }
      return [...prev, tool];
    });
  };

  const removeTool = (type: string) => {
    setSelectedTools(prev => prev.filter(t => t.type !== type));
  };

  const callRealAI = async (userMessage: string) => {
    // Prevent duplicate calls if already processing
    if (isTyping) {
      console.warn('[Chat] Already processing a request, ignoring duplicate call');
      return;
    }

    // Prevent rapid successive calls (minimum 500ms between requests)
    const now = Date.now();
    if (now - lastRequestTime < 500) {
      console.warn('[Chat] Request throttled - too soon after previous request');
      return;
    }
    setLastRequestTime(now);

    setIsTyping(true);

    try {
      if (!isAuthenticated || !accessToken) {
        throw new Error('Please log in to use AI features');
      }

      // Parse action intent
      const intent = actionExecutorService.parseActionIntent(
        userMessage,
        selectedTools.map(t => t.type)
      );

      // Execute action if intent is actionable
      if (intent && intent.type !== 'query' && intent.confidence && intent.confidence > 0.6) {
        const actionResult = await actionExecutorService.executeAction(
          intent,
          userMessage,
          {
            mode: selectedMode,
            selectedTools: selectedTools.map(t => t.type),
          }
        );

        if (actionResult.success) {
          // Handle successful action execution
          if (actionResult.actionType === 'workflow' && actionResult.workflowNode) {
            const aiMessage: Message = {
              id: Date.now().toString(),
              text: `I've generated a workflow for you: "${actionResult.result?.name || 'New Workflow'}"\n\n${actionResult.result?.description || 'Workflow created successfully'}\n\nYou can now open it in the workflow builder to edit and execute it.`,
              isUser: false,
              timestamp: new Date(),
              workflowData: actionResult.result,
              type: 'workflow',
              tools: selectedTools,
            };
            setMessages(prev => [...prev, aiMessage]);
            toast.success('Workflow generated successfully! Click to open in workflow builder.');
            setIsTyping(false);
            return;
          } else if (actionResult.actionType === 'tool') {
            // Tool executed, now get AI response with tool results
            const toolResultText = actionResult.result 
              ? `Tool "${intent.toolName}" executed successfully. Result: ${typeof actionResult.result === 'string' ? actionResult.result : JSON.stringify(actionResult.result, null, 2)}`
              : `Tool "${intent.toolName}" executed successfully.`;
            
            // Continue with chat to get AI interpretation
            userMessage = `${userMessage}\n\n[Tool Result: ${toolResultText}]`;
          }
        } else if (actionResult.error) {
          // Action failed, show error but continue with chat
          toast.error(`Action failed: ${actionResult.error}`);
          userMessage = `${userMessage}\n\n[Note: Action execution failed - ${actionResult.error}]`;
        }
      }

      // Send chat message using chat service
      const chatResponse = await chatService.sendMessage({
        message: userMessage,
        conversationId: conversationId || undefined,
        mode: selectedMode,
        tools: selectedTools.length > 0 ? selectedTools.map(t => t.type) : undefined,
        model: selectedModel === 'Chat GPT' ? 'gpt4' : 
               selectedModel === 'Gemini' ? 'gemini' : 
               selectedModel === 'Flowversal' ? 'vllm' : 'claude',
        temperature: 0.7,
        maxTokens: 2000,
        context: `You are Flowversal AI in ${selectedMode} mode. ${
          selectedMode === 'agent' ? 'You have access to tools and can execute actions. When you use tools, explain what you did.' :
          selectedMode === 'plan' ? 'Create detailed step-by-step plans.' :
          selectedMode === 'debug' ? 'Help debug and troubleshoot issues.' :
          selectedMode === 'ask' ? 'Answer questions about workflows.' :
          'Automatically decide the best approach.'
        }`,
      });

      if (chatResponse.success && chatResponse.response) {
        // Update conversation ID if provided
        if (chatResponse.conversationId) {
          setConversationId(chatResponse.conversationId);
        }

        const aiMessage: Message = {
          id: Date.now().toString(),
          text: chatResponse.response,
          isUser: false,
          timestamp: new Date(),
          type: 'text',
          tools: chatResponse.toolsUsed && chatResponse.toolsUsed.length > 0
            ? selectedTools.filter(t => chatResponse.toolsUsed?.includes(t.type))
            : undefined,
        };

        setMessages(prev => [...prev, aiMessage]);

        // Show tool usage notification
        if (chatResponse.toolsUsed && chatResponse.toolsUsed.length > 0) {
          toast.success(`Used ${chatResponse.toolsUsed.length} tool(s): ${chatResponse.toolsUsed.join(', ')}`);
        }

        // Update conversation title if first message
        if (activeConversationId && messages.length === 0) {
          const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '');
          handleRenameConversation(activeConversationId, title);
        }
      } else {
        throw new Error(chatResponse.error || 'No response from AI');
      }
    } catch (error: any) {
      console.error('[Chat] AI Error:', error);
      
      // Don't set component error for API errors, just show in chat
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `Error: ${error.message}. ${useRealAI ? 'Please check your connection and try again.' : 'Falling back to demo mode.'}`,
        isUser: false,
        timestamp: new Date(),
        type: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);

      if (!useRealAI && !error.message.includes('log in')) {
        setTimeout(() => simulateAIResponse(userMessage), 1000);
      } else {
        toast.error(`Chat error: ${error.message}`);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleConfigSave = (toolId: string, values: Record<string, string>) => {
    if (toolId === 'email') {
      setEmailConfigured(true);
      setConfigValues(prev => ({ ...prev, ...values }));
      
      const successMessage: Message = {
        id: Date.now().toString(),
        text: "✅ Email configured successfully! I'll proceed with sending the email now.",
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, successMessage]);
      
      setTimeout(() => {
        const actionMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Sending email with Delhi's weather details...",
          isUser: false,
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, actionMessage]);
      }, 1000);
    }
  };

  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let aiResponse = '';
      const lowerMessage = userMessage.toLowerCase();

      // Check for email intent
      if (lowerMessage.includes('email') || lowerMessage.includes('send') || lowerMessage.includes('gmail')) {
        // Check if email tool is configured
        if (!emailConfigured) {
          const configMessage: Message = {
            id: Date.now().toString(),
            text: "I can help you send that email, but I need to connect to your email account first.",
            isUser: false,
            timestamp: new Date(),
            type: 'tool-config',
            configTool: 'email'
          };
          setMessages(prev => [...prev, configMessage]);
          setIsTyping(false);
          return;
        }
      }

      if (lowerMessage.includes('workflow') || lowerMessage.includes('automation')) {
        aiResponse = `I can help you set up a workflow in ${selectedMode} mode!\n\n${
          selectedTools.length > 0 
            ? `Using the tools you've selected (${selectedTools.map(t => t.label).join(', ')}), I can:\n\n` 
            : ''
        }1. What task do you want to automate?\n2. What triggers should start the workflow?\n3. What's the desired outcome?\n4. Do you have any specific tools in mind?`;
      } else {
        aiResponse = `I understand you're asking about "${userMessage}" in ${currentMode.label} mode.\n\nI can help with that! Would you like me to:\n\n1. Set up an automated workflow for this task?\n2. Provide step-by-step guidance?\n3. Generate the results directly?`;
      }

      const aiMessage: Message = {
        id: Date.now().toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
      tools: selectedTools.length > 0 ? [...selectedTools] : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Update conversation title if first message
    if (activeConversationId && messages.length === 0) {
      const title = inputValue.slice(0, 50) + (inputValue.length > 50 ? '...' : '');
      handleRenameConversation(activeConversationId, title);
    }

    setInputValue('');
    
    if (useRealAI) {
      callRealAI(inputValue);
    } else {
      simulateAIResponse(inputValue);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleFileAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} file(s) attached`);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleVoiceRecording = async () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      setIsRecording(true);
      toast.info('🎤 Listening...');
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsRecording(false);
        toast.success('Voice recorded!');
      };
      
      recognition.onerror = () => {
        setIsRecording(false);
        toast.error('Voice recording failed');
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      setIsRecording(false);
      toast.error('Microphone access denied');
    }
  };

  return (
    <div className={`h-screen ${bgColor} flex overflow-hidden`}>
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onOpenTools={handleOpenTools}
        onOpenPrompts={() => setShowPromptLibrary(true)}
        onOpenMemories={() => setShowMemories(true)}
        isCollapsed={isSidebarCollapsed}
        selectedToolsCount={selectedTools.length}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 flex flex-col">
          {/* Welcome Header - Only show when no messages */}
          {messages.length === 0 && (
            <div className="text-center mb-8 flex-shrink-0">
              <h1 className="text-4xl mb-8 font-semibold">
                <span className="text-[#00C6FF]">Hello, </span>
                <span className="bg-gradient-to-r from-[#00C6FF] via-[#0072FF] to-[#9D50BB] bg-clip-text text-transparent">
                  {user?.name || 'Flowversal User'}
                </span>
              </h1>
            </div>
          )}

          {/* Messages Container */}
          {messages.length > 0 && (
            <div className="flex-1 mb-6 space-y-6 overflow-y-auto max-h-[60vh] pr-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                      message.isUser
                        ? 'bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white shadow-[0_0_15px_rgba(0,198,255,0.3)]'
                        : `${bgCard} ${textPrimary} border ${borderColor}`
                    }`}
                  >
                    {!message.isUser && (
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-[#00C6FF]" />
                        <span className="text-sm text-[#00C6FF]">
                          {message.type === 'workflow' ? 'Workflow Generated' : 'AI Assistant'}
                        </span>
                      </div>
                    )}
                    
                    {/* Show tools used if any */}
                    {message.tools && message.tools.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {message.tools.map((tool) => {
                          const Icon = tool.icon;
                          return (
                            <span
                              key={tool.type}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-white/20"
                            >
                              <Icon className="w-3 h-3" />
                              {tool.label}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Agent Reasoning Visualization (Bhindi-style) */}
                    {message.agentReasoning && (
                      <div className="mt-3 mb-2 space-y-2">
                        {/* Thoughts */}
                        {message.agentReasoning.thoughts && message.agentReasoning.thoughts.length > 0 && (
                          <details className="group">
                            <summary className="flex items-center gap-2 cursor-pointer text-xs text-[#00C6FF] hover:text-[#0072FF] transition-colors">
                              <Brain className="w-3 h-3" />
                              <span>Agent Reasoning ({message.agentReasoning.thoughts.length} steps)</span>
                              <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
                            </summary>
                            <div className="mt-2 ml-5 space-y-1.5 pl-3 border-l-2 border-[#00C6FF]/30">
                              {message.agentReasoning.thoughts.map((thought, idx) => (
                                <div key={idx} className="text-xs text-gray-300">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[#00C6FF]">•</span>
                                    {thought.confidence !== undefined && (
                                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                                        thought.confidence > 0.8 ? 'bg-green-500/20 text-green-400' :
                                        thought.confidence > 0.5 ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                      }`}>
                                        {Math.round(thought.confidence * 100)}%
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-gray-400">{thought.content}</div>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}

                        {/* Tool Calls */}
                        {message.agentReasoning.toolCalls && message.agentReasoning.toolCalls.length > 0 && (
                          <details className="group">
                            <summary className="flex items-center gap-2 cursor-pointer text-xs text-[#00C6FF] hover:text-[#0072FF] transition-colors">
                              <Wrench className="w-3 h-3" />
                              <span>Tool Calls ({message.agentReasoning.toolCalls.length})</span>
                              <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
                            </summary>
                            <div className="mt-2 ml-5 space-y-1.5 pl-3 border-l-2 border-[#00C6FF]/30">
                              {message.agentReasoning.toolCalls.map((toolCall, idx) => (
                                <div key={idx} className="text-xs">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    {toolCall.success ? (
                                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                                    ) : (
                                      <XCircle className="w-3 h-3 text-red-400" />
                                    )}
                                    <span className="text-[#00C6FF] font-medium">{toolCall.toolName}</span>
                                    {toolCall.duration && (
                                      <span className="text-gray-500">({toolCall.duration}ms)</span>
                                    )}
                                  </div>
                                  {toolCall.result && (
                                    <div className="text-gray-400 ml-5 text-xs">
                                      Result: {typeof toolCall.result === 'string' 
                                        ? toolCall.result.substring(0, 100) + (toolCall.result.length > 100 ? '...' : '')
                                        : JSON.stringify(toolCall.result).substring(0, 100)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </details>
                        )}

                        {/* Decisions */}
                        {message.agentReasoning.decisions && message.agentReasoning.decisions.length > 0 && (
                          <details className="group">
                            <summary className="flex items-center gap-2 cursor-pointer text-xs text-[#00C6FF] hover:text-[#0072FF] transition-colors">
                              <GitBranch className="w-3 h-3" />
                              <span>Decisions ({message.agentReasoning.decisions.length})</span>
                              <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
                            </summary>
                            <div className="mt-2 ml-5 space-y-1.5 pl-3 border-l-2 border-[#00C6FF]/30">
                              {message.agentReasoning.decisions.map((decision, idx) => (
                                <div key={idx} className="text-xs">
                                  <div className="text-[#00C6FF] font-medium mb-0.5">{decision.decisionPoint}</div>
                                  <div className="text-gray-400">{decision.reasoning}</div>
                                  {decision.confidence !== undefined && (
                                    <div className="text-gray-500 mt-0.5">
                                      Confidence: {Math.round(decision.confidence * 100)}%
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    )}
                    
                    {message.type === 'tool-config' && message.configTool === 'email' && (
                      <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 w-full max-w-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <span className="text-xl">📧</span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">Configure Email</div>
                            <div className="text-xs text-gray-400">Connect your account</div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Email Provider</label>
                            <select className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00C6FF]">
                              <option>Gmail</option>
                              <option>Outlook</option>
                              <option>SMTP</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">API Key / Password</label>
                            <input 
                              type="password" 
                              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00C6FF]"
                              placeholder="••••••••••••"
                            />
                          </div>
                          <button 
                            onClick={() => handleConfigSave('email', { provider: 'gmail' })}
                            className="w-full py-2 bg-[#00C6FF] hover:bg-[#0072FF] rounded-lg text-white text-sm font-medium transition-colors"
                          >
                            Connect Account
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <p className={`whitespace-pre-wrap ${message.type === 'error' ? 'text-red-400' : ''}`}>
                      {message.text}
                    </p>
                    
                    {/* Workflow Actions */}
                    {message.type === 'workflow' && message.workflowData && (
                      <div className="mt-4 flex gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            // Open workflow in workflow builder
                            // Dispatch custom event to open workflow builder
                            const event = new CustomEvent('openWorkflowBuilder', {
                              detail: {
                                workflowData: message.workflowData,
                                workflowName: message.workflowData.name || 'Generated Workflow',
                              },
                            });
                            window.dispatchEvent(event);
                            toast.success('Opening workflow in builder...');
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#00C6FF] to-[#0072FF] hover:from-[#0072FF] hover:to-[#9D50BB] text-white rounded-lg text-sm transition-all shadow-lg"
                        >
                          <Code className="w-4 h-4" />
                          Open in Builder
                        </button>
                        <button
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(message.workflowData, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${message.workflowData.name || 'workflow'}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                            toast.success('Workflow downloaded');
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#00C6FF]/20 hover:bg-[#00C6FF]/30 rounded-lg text-sm transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={() => toast.info('Preview coming soon!')}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#9D50BB]/20 hover:bg-[#9D50BB]/30 rounded-lg text-sm transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className={`${bgCard} rounded-2xl px-6 py-4 border ${borderColor}`}>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#00C6FF] animate-pulse" />
                      <span className={`text-sm ${textSecondary}`}>AI is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input Container */}
          <div className="sticky bottom-8 max-w-4xl mx-auto w-full">
            <div className={`${bgCard} border ${borderColor} rounded-3xl shadow-xl`}>
              {/* Attached Files */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 pt-4">
                  {attachedFiles.map((file, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${bgColor} border ${borderColor}`}
                    >
                      <Paperclip className="w-3 h-3 text-[#00C6FF]" />
                      <span className={`${textSecondary} text-xs max-w-[150px] truncate`}>{file.name}</span>
                      <button onClick={() => removeFile(index)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className="px-4 pt-4">
                <div className="flex items-start gap-3">
                  <button 
                    onClick={handleFileAttachment}
                    className={`mt-1 p-1.5 rounded-xl ${textSecondary} hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10 transition-all`}
                    title="Attach files"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask Flowversal"
                    className={`w-full ${inputBg} ${textPrimary} placeholder:${textSecondary} focus:outline-none resize-none max-h-32 text-base py-1`}
                    rows={1}
                    style={{ minHeight: '2.5rem' }}
                  />
                  <button 
                    onClick={handleVoiceRecording}
                    className={`mt-1 p-1.5 rounded-xl transition-all ${
                      isRecording 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/50 animate-pulse' 
                        : `${textSecondary} hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10`
                    }`}
                    title={isRecording ? 'Recording... Click to stop' : 'Click to record voice'}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Bottom Bar: Tools & Actions */}
              <div className="px-4 pb-3 pt-2 flex items-center justify-between">
                {/* Left: Tools */}
                <div className="flex items-center gap-2 flex-wrap flex-1 mr-4">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowToolsPicker(true);
                      setShowOptionsDropdown(false);
                    }}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${textSecondary} hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10 transition-all text-sm relative group`}
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Tools</span>
                    {selectedTools.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white text-[10px] items-center justify-center font-bold shadow-lg">
                          {selectedTools.length}
                        </span>
                      </span>
                    )}
                  </button>

                  {/* Selected Tools Chips - Compact */}
                  {selectedTools.slice(0, 3).map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <div
                        key={tool.type}
                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#00C6FF]/10 border border-[#00C6FF] shadow-[0_0_10px_rgba(0,198,255,0.2)] transition-all group/chip"
                      >
                        <Icon className="w-3 h-3 text-[#00C6FF]" />
                        <span className={`text-[11px] font-medium ${textPrimary} truncate max-w-[80px]`}>{tool.label}</span>
                        <button 
                          onClick={() => removeTool(tool.type)}
                          className="opacity-0 group-hover/chip:opacity-100 transition-opacity hover:text-red-400 ml-0.5"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })}
                  {selectedTools.length > 3 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowToolsPicker(true);
                        setShowOptionsDropdown(false);
                      }}
                      className={`text-[10px] ${textSecondary} px-2 py-1 hover:bg-white/10 rounded transition-colors cursor-pointer`}
                    >
                      +{selectedTools.length - 3}
                    </button>
                  )}
                </div>

                {/* Right: Model, Mode & Send */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Model Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowModelDropdown(!showModelDropdown);
                        setShowModeDropdown(false);
                      }}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg ${textSecondary} hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10 transition-all text-sm`}
                    >
                      <Sparkles className="w-3 h-3 text-[#00C6FF]" />
                      <span className='font-medium text-[#00C6FF]'>
                        {selectedModel}
                      </span>
                      <ChevronDown className={`w-3 h-3 ${textSecondary}`} />
                    </button>

                    {showModelDropdown && (
                      <div className={`absolute bottom-full right-0 mb-2 w-48 ${bgCard} border ${borderColor} rounded-xl shadow-2xl z-50 py-1`}>
                        {aiModels.map((model) => (
                          <button
                            key={model}
                            onClick={() => {
                              setSelectedModel(model);
                              setShowModelDropdown(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 ${
                              selectedModel === model
                                ? 'bg-gradient-to-r from-[#00C6FF]/10 to-[#9D50BB]/10 text-[#00C6FF]'
                                : `${textPrimary} hover:bg-white/5`
                            } transition-all text-sm`}
                          >
                            <span className={selectedModel === model ? 'font-medium' : ''}>{model}</span>
                            {selectedModel === model && (
                              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00C6FF]" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mode Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowModeDropdown(!showModeDropdown);
                        setShowModelDropdown(false);
                      }}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg ${textSecondary} hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10 transition-all text-sm`}
                    >
                      <span className='bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-transparent bg-clip-text font-medium'>
                        {currentMode.label}
                      </span>
                      <ChevronDown className={`w-3 h-3 ${textSecondary}`} />
                    </button>

                    {showModeDropdown && (
                      <div className={`absolute bottom-full right-0 mb-2 w-48 ${bgCard} border ${borderColor} rounded-xl shadow-2xl z-50 py-1`}>
                        {chatModes.map((mode) => {
                          const Icon = mode.icon;
                          return (
                            <button
                              key={mode.id}
                              onClick={() => {
                                setSelectedMode(mode.id);
                                setShowModeDropdown(false);
                                if (mode.id !== 'agent') {
                                  setSelectedTools([]);
                                }
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2 ${
                                selectedMode === mode.id
                                  ? 'bg-gradient-to-r from-[#00C6FF]/10 to-[#9D50BB]/10 text-[#00C6FF]'
                                  : `${textPrimary} hover:bg-white/5`
                              } transition-all text-sm`}
                            >
                              <Icon className={`w-4 h-4 ${selectedMode === mode.id ? 'text-[#00C6FF]' : textSecondary}`} />
                              <span className={selectedMode === mode.id ? 'font-medium' : ''}>{mode.label}</span>
                              {selectedMode === mode.id && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00C6FF]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className={`p-2 rounded-xl transition-all ${
                      inputValue.trim()
                        ? 'text-[#00C6FF] hover:bg-[#00C6FF]/10'
                        : `${textSecondary} opacity-50 cursor-not-allowed`
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Suggestion Chips */}
            {messages.length === 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-6 px-4">
                {suggestionChips.map((chip, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(chip.label)}
                    className={`px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 text-sm hover:border-[#00C6FF]/50 hover:text-[#00C6FF] transition-all shadow-sm`}
                  >
                    {chip.icon && <span className="mr-2">{chip.icon}</span>}
                    {chip.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tools Picker Modal - Always show all tools/nodes/triggers */}
      <ChatToolsPicker
        isOpen={showToolsPicker}
        onClose={() => {
          setShowToolsPicker(false);
        }}
        onSelectTool={handleSelectTool}
        selectedTools={selectedTools}
        mode="agent" // Always show all tools, nodes, and triggers
      />

      {/* Prompt Library Modal */}
      <PromptLibrary
        isOpen={showPromptLibrary}
        onClose={() => setShowPromptLibrary(false)}
        onSelectPrompt={(promptText) => {
          setInputValue(promptText);
          setShowPromptLibrary(false);
          // Optional: automatically focus input
          const textarea = document.querySelector('textarea');
          if (textarea) textarea.focus();
        }}
      />

      {/* Memories Modal */}
      <MemoriesModal
        isOpen={showMemories}
        onClose={() => setShowMemories(false)}
      />
    </div>
  );
}
