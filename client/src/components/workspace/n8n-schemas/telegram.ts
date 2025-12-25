/**
 * Telegram n8n-style Schema
 * 
 * Comprehensive Telegram Bot API operations
 */

import { N8nAppSchema } from './types';

export const telegramSchema: N8nAppSchema = {
  id: 'telegram',
  name: 'Telegram',
  description: 'Telegram Bot API for messaging and automation',
  version: '1.0.0',
  color: '#0088cc',
  icon: 'telegram',
  group: ['communication', 'messaging'],
  
  credentials: [
    {
      name: 'telegramApi',
      displayName: 'Telegram Bot Token',
      required: true,
      type: 'string',
    },
  ],
  
  resources: [
    // ============================================
    // MESSAGE RESOURCE
    // ============================================
    {
      id: 'message',
      name: 'Message',
      value: 'message',
      description: 'Send and manage messages',
      operations: [
        {
          id: 'send_text',
          name: 'Send Text',
          value: 'sendText',
          description: 'Send a text message',
          action: 'Send a text message to a chat',
          fields: [
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'Chat ID',
              type: 'string',
              required: true,
              description: 'Unique identifier for the target chat or username',
              placeholder: '@channelusername or 123456789',
            },
            {
              id: 'text',
              name: 'text',
              displayName: 'Message Text',
              type: 'text',
              required: true,
              description: 'Text of the message to be sent (1-4096 characters)',
              placeholder: 'Enter your message...',
              typeOptions: {
                rows: 4,
              },
            },
          ],
          optionalFields: [
            {
              id: 'parse_mode',
              name: 'parseMode',
              displayName: 'Parse Mode',
              type: 'options',
              required: false,
              default: 'HTML',
              options: [
                { name: 'HTML', value: 'HTML', description: 'HTML formatting' },
                { name: 'Markdown', value: 'Markdown', description: 'Markdown formatting' },
                { name: 'MarkdownV2', value: 'MarkdownV2', description: 'MarkdownV2 formatting' },
              ],
            },
            {
              id: 'disable_notification',
              name: 'disableNotification',
              displayName: 'Disable Notification',
              type: 'boolean',
              required: false,
              default: false,
              description: 'Sends the message silently',
            },
            {
              id: 'reply_to_message_id',
              name: 'replyToMessageId',
              displayName: 'Reply To Message ID',
              type: 'number',
              required: false,
              description: 'If the message is a reply, ID of the original message',
            },
            {
              id: 'reply_markup',
              name: 'replyMarkup',
              displayName: 'Reply Markup (JSON)',
              type: 'json',
              required: false,
              description: 'Inline keyboard, custom reply keyboard, or other options',
              placeholder: '{"inline_keyboard": [[{"text": "Button", "callback_data": "data"}]]}',
            },
          ],
        },
        {
          id: 'send_photo',
          name: 'Send Photo',
          value: 'sendPhoto',
          description: 'Send a photo',
          action: 'Send a photo to a chat',
          fields: [
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'Chat ID',
              type: 'string',
              required: true,
              description: 'Unique identifier for the target chat',
            },
            {
              id: 'photo',
              name: 'photo',
              displayName: 'Photo',
              type: 'string',
              required: true,
              description: 'Photo URL or file_id',
              placeholder: 'https://example.com/photo.jpg',
            },
          ],
          optionalFields: [
            {
              id: 'caption',
              name: 'caption',
              displayName: 'Caption',
              type: 'text',
              required: false,
              description: 'Photo caption (0-1024 characters)',
            },
            {
              id: 'parse_mode',
              name: 'parseMode',
              displayName: 'Parse Mode',
              type: 'options',
              required: false,
              options: [
                { name: 'HTML', value: 'HTML' },
                { name: 'Markdown', value: 'Markdown' },
                { name: 'MarkdownV2', value: 'MarkdownV2' },
              ],
            },
          ],
        },
        {
          id: 'send_document',
          name: 'Send Document',
          value: 'sendDocument',
          description: 'Send a document/file',
          action: 'Send a document to a chat',
          fields: [
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'Chat ID',
              type: 'string',
              required: true,
            },
            {
              id: 'document',
              name: 'document',
              displayName: 'Document',
              type: 'string',
              required: true,
              description: 'Document URL or file_id',
            },
          ],
          optionalFields: [
            {
              id: 'caption',
              name: 'caption',
              displayName: 'Caption',
              type: 'text',
              required: false,
            },
            {
              id: 'filename',
              name: 'filename',
              displayName: 'Filename',
              type: 'string',
              required: false,
              description: 'Custom file name',
            },
          ],
        },
        {
          id: 'send_video',
          name: 'Send Video',
          value: 'sendVideo',
          description: 'Send a video',
          action: 'Send a video to a chat',
          fields: [
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'Chat ID',
              type: 'string',
              required: true,
            },
            {
              id: 'video',
              name: 'video',
              displayName: 'Video',
              type: 'string',
              required: true,
              description: 'Video URL or file_id',
            },
          ],
          optionalFields: [
            {
              id: 'caption',
              name: 'caption',
              displayName: 'Caption',
              type: 'text',
              required: false,
            },
            {
              id: 'duration',
              name: 'duration',
              displayName: 'Duration',
              type: 'number',
              required: false,
              description: 'Duration in seconds',
            },
          ],
        },
        {
          id: 'send_location',
          name: 'Send Location',
          value: 'sendLocation',
          description: 'Send a location',
          action: 'Send a location point to a chat',
          fields: [
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'Chat ID',
              type: 'string',
              required: true,
            },
            {
              id: 'latitude',
              name: 'latitude',
              displayName: 'Latitude',
              type: 'number',
              required: true,
              description: 'Latitude of the location',
            },
            {
              id: 'longitude',
              name: 'longitude',
              displayName: 'Longitude',
              type: 'number',
              required: true,
              description: 'Longitude of the location',
            },
          ],
          optionalFields: [
            {
              id: 'live_period',
              name: 'livePeriod',
              displayName: 'Live Period',
              type: 'number',
              required: false,
              description: 'Period in seconds for live location (60-86400)',
            },
          ],
        },
        {
          id: 'send_contact',
          name: 'Send Contact',
          value: 'sendContact',
          description: 'Send a contact',
          action: 'Send a phone contact to a chat',
          fields: [
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'Chat ID',
              type: 'string',
              required: true,
            },
            {
              id: 'phone_number',
              name: 'phoneNumber',
              displayName: 'Phone Number',
              type: 'string',
              required: true,
            },
            {
              id: 'first_name',
              name: 'firstName',
              displayName: 'First Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'last_name',
              name: 'lastName',
              displayName: 'Last Name',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'edit_message',
          name: 'Edit Message',
          value: 'editMessageText',
          description: 'Edit a sent message',
          action: 'Edit text of a message',
          fields: [
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'Chat ID',
              type: 'string',
              required: true,
            },
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'number',
              required: true,
            },
            {
              id: 'text',
              name: 'text',
              displayName: 'New Text',
              type: 'text',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'parse_mode',
              name: 'parseMode',
              displayName: 'Parse Mode',
              type: 'options',
              required: false,
              options: [
                { name: 'HTML', value: 'HTML' },
                { name: 'Markdown', value: 'Markdown' },
              ],
            },
          ],
        },
        {
          id: 'delete_message',
          name: 'Delete Message',
          value: 'deleteMessage',
          description: 'Delete a message',
          action: 'Delete a message from a chat',
          fields: [
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'Chat ID',
              type: 'string',
              required: true,
            },
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'forward_message',
          name: 'Forward Message',
          value: 'forwardMessage',
          description: 'Forward a message',
          action: 'Forward a message to another chat',
          fields: [
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'To Chat ID',
              type: 'string',
              required: true,
            },
            {
              id: 'from_chat_id',
              name: 'fromChatId',
              displayName: 'From Chat ID',
              type: 'string',
              required: true,
            },
            {
              id: 'message_id',
              name: 'messageId',
              displayName: 'Message ID',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'disable_notification',
              name: 'disableNotification',
              displayName: 'Disable Notification',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // CHAT RESOURCE
    // ============================================
    {
      id: 'chat',
      name: 'Chat',
      value: 'chat',
      description: 'Manage chats and chat settings',
      operations: [
        {
          id: 'get_chat',
          name: 'Get Chat',
          value: 'getChat',
          description: 'Get chat information',
          action: 'Get information about a chat',
          fields: [
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'Chat ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_chat_member',
          name: 'Get Chat Member',
          value: 'getChatMember',
          description: 'Get info about a chat member',
          action: 'Get information about a member of a chat',
          fields: [
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'Chat ID',
              type: 'string',
              required: true,
            },
            {
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_chat_members_count',
          name: 'Get Members Count',
          value: 'getChatMembersCount',
          description: 'Get the number of members in a chat',
          action: 'Get the count of members in a chat',
          fields: [
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'Chat ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'ban_chat_member',
          name: 'Ban Member',
          value: 'banChatMember',
          description: 'Ban a user from a chat',
          action: 'Ban a user in a group, supergroup, or channel',
          fields: [
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'Chat ID',
              type: 'string',
              required: true,
            },
            {
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'until_date',
              name: 'untilDate',
              displayName: 'Ban Until',
              type: 'dateTime',
              required: false,
              description: 'Date when the user will be unbanned',
            },
            {
              id: 'revoke_messages',
              name: 'revokeMessages',
              displayName: 'Delete Messages',
              type: 'boolean',
              required: false,
              default: false,
              description: 'Delete all messages from the user',
            },
          ],
        },
        {
          id: 'unban_chat_member',
          name: 'Unban Member',
          value: 'unbanChatMember',
          description: 'Unban a user from a chat',
          action: 'Unban a previously banned user',
          fields: [
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'Chat ID',
              type: 'string',
              required: true,
            },
            {
              id: 'user_id',
              name: 'userId',
              displayName: 'User ID',
              type: 'number',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'set_chat_title',
          name: 'Set Chat Title',
          value: 'setChatTitle',
          description: 'Change the title of a chat',
          action: 'Change the title of a group or channel',
          fields: [
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'Chat ID',
              type: 'string',
              required: true,
            },
            {
              id: 'title',
              name: 'title',
              displayName: 'New Title',
              type: 'string',
              required: true,
              description: 'New chat title (1-255 characters)',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'set_chat_description',
          name: 'Set Chat Description',
          value: 'setChatDescription',
          description: 'Change the description of a chat',
          action: 'Change the description of a group or channel',
          fields: [
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'Chat ID',
              type: 'string',
              required: true,
            },
            {
              id: 'description',
              name: 'description',
              displayName: 'Description',
              type: 'text',
              required: true,
              description: 'New chat description (0-255 characters)',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'leave_chat',
          name: 'Leave Chat',
          value: 'leaveChat',
          description: 'Leave a group chat',
          action: 'Leave a group, supergroup, or channel',
          fields: [
            {
              id: 'chat_id',
              name: 'chatId',
              displayName: 'Chat ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // CALLBACK RESOURCE
    // ============================================
    {
      id: 'callback',
      name: 'Callback',
      value: 'callback',
      description: 'Handle inline keyboard callbacks',
      operations: [
        {
          id: 'answer_callback_query',
          name: 'Answer Callback',
          value: 'answerCallbackQuery',
          description: 'Answer a callback query',
          action: 'Send an answer to callback query from inline keyboard',
          fields: [
            {
              id: 'callback_query_id',
              name: 'callbackQueryId',
              displayName: 'Callback Query ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'text',
              name: 'text',
              displayName: 'Notification Text',
              type: 'string',
              required: false,
              description: 'Text of the notification (0-200 characters)',
            },
            {
              id: 'show_alert',
              name: 'showAlert',
              displayName: 'Show Alert',
              type: 'boolean',
              required: false,
              default: false,
              description: 'Show an alert instead of a notification',
            },
            {
              id: 'url',
              name: 'url',
              displayName: 'URL',
              type: 'string',
              required: false,
              description: 'URL that will be opened by the client',
            },
          ],
        },
      ],
    },
    
    // ============================================
    // FILE RESOURCE
    // ============================================
    {
      id: 'file',
      name: 'File',
      value: 'file',
      description: 'Get file information',
      operations: [
        {
          id: 'get_file',
          name: 'Get File',
          value: 'getFile',
          description: 'Get file information',
          action: 'Get basic info about a file and prepare it for download',
          fields: [
            {
              id: 'file_id',
              name: 'fileId',
              displayName: 'File ID',
              type: 'string',
              required: true,
              description: 'File identifier to get info about',
            },
          ],
          optionalFields: [],
        },
      ],
    },
  ],
};
