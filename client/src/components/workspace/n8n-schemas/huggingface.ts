/**
 * Hugging Face Integration Schema
 * Resources: Text Generation, Analysis, Vision
 */

import type { N8nAppSchema } from './types';

export const huggingfaceSchema: N8nAppSchema = {
  id: 'huggingface',
  name: 'Hugging Face',
  description: 'Hugging Face AI models and inference',
  icon: 'cpu',
  color: '#FFCC00',
  version: '1.0',
  group: ['ai'],
  credentials: [
    {
      id: 'huggingface_api',
      name: 'Hugging Face API',
      type: 'apiKey',
      fields: [
        { id: 'api_key', displayName: 'API Key', name: 'apiKey', type: 'string', required: true },
      ],
    },
  ],
  resources: [
    {
      id: 'text',
      name: 'Text',
      value: 'text',
      description: 'Text generation and processing',
      operations: [
        {
          id: 'text_generation',
          name: 'Text Generation',
          value: 'text_generation',
          description: 'Generate text using a model',
          action: 'Generate text',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'string',
              required: true,
              default: 'gpt2',
              description: 'Model ID (e.g., gpt2, meta-llama/Llama-2-7b)',
            },
            {
              id: 'inputs',
              name: 'inputs',
              displayName: 'Input Text',
              type: 'text',
              required: true,
              typeOptions: { rows: 4 },
            },
          ],
          optionalFields: [
            {
              id: 'max_new_tokens',
              name: 'maxNewTokens',
              displayName: 'Max New Tokens',
              type: 'number',
              default: 250,
            },
            {
              id: 'temperature',
              name: 'temperature',
              displayName: 'Temperature',
              type: 'number',
              default: 1.0,
            },
            {
              id: 'top_p',
              name: 'topP',
              displayName: 'Top P',
              type: 'number',
              default: 0.9,
            },
          ],
        },
        {
          id: 'summarization',
          name: 'Summarization',
          value: 'summarization',
          description: 'Summarize text',
          action: 'Summarize text',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'string',
              required: true,
              default: 'facebook/bart-large-cnn',
            },
            {
              id: 'inputs',
              name: 'inputs',
              displayName: 'Text to Summarize',
              type: 'text',
              required: true,
              typeOptions: { rows: 6 },
            },
          ],
          optionalFields: [
            {
              id: 'max_length',
              name: 'maxLength',
              displayName: 'Max Length',
              type: 'number',
              default: 130,
            },
            {
              id: 'min_length',
              name: 'minLength',
              displayName: 'Min Length',
              type: 'number',
              default: 30,
            },
          ],
        },
        {
          id: 'translation',
          name: 'Translation',
          value: 'translation',
          description: 'Translate text',
          action: 'Translate text',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'string',
              required: true,
              default: 'Helsinki-NLP/opus-mt-en-de',
              description: 'Translation model ID',
            },
            {
              id: 'inputs',
              name: 'inputs',
              displayName: 'Text to Translate',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      id: 'analysis',
      name: 'Analysis',
      value: 'analysis',
      description: 'Text analysis tasks',
      operations: [
        {
          id: 'sentiment_analysis',
          name: 'Sentiment Analysis',
          value: 'sentiment_analysis',
          description: 'Analyze sentiment of text',
          action: 'Analyze sentiment',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'string',
              required: true,
              default: 'distilbert-base-uncased-finetuned-sst-2-english',
            },
            {
              id: 'inputs',
              name: 'inputs',
              displayName: 'Text',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          id: 'question_answering',
          name: 'Question Answering',
          value: 'question_answering',
          description: 'Answer questions based on context',
          action: 'Answer question',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'string',
              required: true,
              default: 'deepset/roberta-base-squad2',
            },
            {
              id: 'question',
              name: 'question',
              displayName: 'Question',
              type: 'string',
              required: true,
            },
            {
              id: 'context',
              name: 'context',
              displayName: 'Context',
              type: 'text',
              required: true,
              typeOptions: { rows: 5 },
            },
          ],
        },
      ],
    },
    {
      id: 'vision',
      name: 'Vision',
      value: 'vision',
      description: 'Image processing tasks',
      operations: [
        {
          id: 'image_classification',
          name: 'Image Classification',
          value: 'image_classification',
          description: 'Classify an image',
          action: 'Classify image',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'string',
              required: true,
              default: 'google/vit-base-patch16-224',
            },
            {
              id: 'image_url',
              name: 'imageUrl',
              displayName: 'Image URL',
              type: 'string',
              required: true,
            },
          ],
        },
        {
          id: 'image_to_text',
          name: 'Image to Text',
          value: 'image_to_text',
          description: 'Generate text description of an image',
          action: 'Image to text',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'string',
              required: true,
              default: 'Salesforce/blip-image-captioning-base',
            },
            {
              id: 'image_url',
              name: 'imageUrl',
              displayName: 'Image URL',
              type: 'string',
              required: true,
            },
          ],
        },
      ],
    },
  ],
};
