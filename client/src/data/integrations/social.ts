import type { Integration } from './types';

// Social Media Integrations

export const twitterIntegration: Integration = {
  id: 'twitter',
  name: 'Twitter/X',
  description: 'Use the Twitter node to post tweets, manage followers, and interact with the Twitter API. n8n supports posting, searching, and user management.',
  shortDescription: 'Social media platform',
  category: 'marketing',
  icon: 'twitter',
  color: '#1DA1F2',
  website: 'https://twitter.com',
  documentationUrl: 'https://developer.twitter.com/en/docs',

  features: [
    'Post tweets',
    'Search tweets',
    'Follow/unfollow users',
    'Like tweets',
    'Retweets',
    'Direct messages',
    'User lookup',
    'Trending topics',
  ],

  useCases: [
    'Social media automation',
    'Content scheduling',
    'Brand monitoring',
    'Customer engagement',
    'Influencer outreach',
    'Trend analysis',
    'Support via Twitter',
    'Marketing campaigns',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Developer Account',
      description: 'Sign up at developer.twitter.com.',
    },
    {
      step: 2,
      title: 'Create App',
      description: 'Create a new project and app in the developer portal.',
    },
    {
      step: 3,
      title: 'Get API Keys',
      description: 'Copy API Key, API Secret, Access Token, and Access Token Secret.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter all credentials in Integrations > Twitter.',
    },
  ],

  operations: [
    {
      name: 'Post Tweet',
      description: 'Create a new tweet',
      fields: [
        { name: 'text', type: 'string', required: true, description: 'Tweet text (max 280 chars)' },
        { name: 'media_ids', type: 'array', required: false, description: 'Attached media IDs' },
        { name: 'reply_to', type: 'string', required: false, description: 'Tweet ID to reply to' },
      ],
    },
    {
      name: 'Search Tweets',
      description: 'Search for tweets',
      fields: [
        { name: 'query', type: 'string', required: true, description: 'Search query' },
        { name: 'max_results', type: 'number', required: false, description: 'Max tweets to return' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Mention',
      description: 'Triggers when account is mentioned',
      when: 'Someone mentions @username',
      outputFields: ['tweet_id', 'text', 'author', 'created_at'],
    },
  ],

  actions: [
    {
      name: 'Post Tweet',
      description: 'Create new tweet',
      inputFields: ['text', 'media_ids'],
      outputFields: ['id', 'text'],
    },
    {
      name: 'Like Tweet',
      description: 'Like a tweet',
      inputFields: ['tweet_id'],
      outputFields: ['liked'],
    },
  ],

  examples: [
    {
      title: 'Auto-Reply to Mentions',
      description: 'Respond to brand mentions',
      steps: [
        'Trigger: Brand mentioned on Twitter',
        'Analyze sentiment of mention',
        'Generate appropriate response',
        'Post reply tweet',
      ],
      code: `{
  "text": "Thanks for the mention, @{{mention.author.username}}! 🙏 We appreciate your support. Let us know if you have any questions!",
  "reply": {
    "in_reply_to_tweet_id": "{{mention.id}}"
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Rate limit exceeded',
      cause: 'Too many API calls.',
      solution: 'Implement rate limiting and check X-Rate-Limit headers.',
    },
    {
      problem: 'Authentication failed',
      cause: 'Invalid or expired tokens.',
      solution: 'Regenerate tokens in developer portal.',
    },
  ],

  relatedIntegrations: ['instagram', 'linkedin', 'facebook-ads'],
  externalResources: [
    { title: 'Twitter API Docs', url: 'https://developer.twitter.com/en/docs' },
  ],
};

export const instagramIntegration: Integration = {
  id: 'instagram',
  name: 'Instagram',
  description: 'Use the Instagram node to post content, manage stories, and interact with the Instagram Graph API. Requires Facebook Business account.',
  shortDescription: 'Photo sharing platform',
  category: 'marketing',
  icon: 'instagram',
  color: '#E4405F',
  website: 'https://instagram.com',
  documentationUrl: 'https://developers.facebook.com/docs/instagram-api',

  features: [
    'Post photos',
    'Post videos',
    'Stories',
    'Reels',
    'Comment management',
    'Insights analytics',
    'Hashtag search',
    'Business discovery',
  ],

  useCases: [
    'Content scheduling',
    'Brand promotion',
    'Product showcases',
    'Influencer marketing',
    'Customer engagement',
    'Analytics tracking',
    'Contest management',
    'E-commerce integration',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Connect Business Account',
      description: 'Connect Instagram to a Facebook Business Page.',
    },
    {
      step: 2,
      title: 'Create Facebook App',
      description: 'Create an app in Facebook Developer portal.',
    },
    {
      step: 3,
      title: 'Get Access Token',
      description: 'Generate long-lived access token with instagram_basic scope.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter access token and Business Account ID.',
    },
  ],

  operations: [
    {
      name: 'Create Media',
      description: 'Post a photo or video',
      fields: [
        { name: 'image_url', type: 'string', required: true, description: 'Public URL of image' },
        { name: 'caption', type: 'string', required: false, description: 'Post caption' },
        { name: 'location_id', type: 'string', required: false, description: 'Facebook Location Page ID' },
      ],
    },
    {
      name: 'Get Insights',
      description: 'Get media insights',
      fields: [
        { name: 'media_id', type: 'string', required: true, description: 'Media ID' },
        { name: 'metrics', type: 'array', required: true, description: 'Metrics to retrieve' },
      ],
    },
  ],

  triggers: [
    {
      name: 'New Comment',
      description: 'Triggers when someone comments on a post',
      when: 'Comment received',
      outputFields: ['comment_id', 'text', 'username', 'media_id'],
    },
  ],

  actions: [
    {
      name: 'Create Post',
      description: 'Post image or video',
      inputFields: ['image_url', 'caption'],
      outputFields: ['id', 'permalink'],
    },
  ],

  examples: [
    {
      title: 'Product Showcase',
      description: 'Auto-post new products to Instagram',
      steps: [
        'Trigger: New product added to catalog',
        'Generate product image URL',
        'Create caption with details and hashtags',
        'Post to Instagram',
      ],
      code: `{
  "image_url": "{{product.image_url}}",
  "caption": "✨ NEW ARRIVAL ✨\\n\\n{{product.name}}\\n\\n{{product.description}}\\n\\n💰 {{product.price}}\\n🛒 Link in bio!\\n\\n#NewArrival #{{product.category}} #ShopNow"
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Image URL not accessible',
      cause: 'URL must be publicly accessible.',
      solution: 'Host image on public server or CDN.',
    },
  ],

  relatedIntegrations: ['facebook-ads', 'twitter', 'pinterest'],
  externalResources: [
    { title: 'Instagram Graph API', url: 'https://developers.facebook.com/docs/instagram-api' },
  ],
};

export const youtubeIntegration: Integration = {
  id: 'youtube',
  name: 'YouTube',
  description: 'Use the YouTube node to upload videos, manage channels, and interact with the YouTube Data API. Supports video uploads, playlists, and analytics.',
  shortDescription: 'Video sharing platform',
  category: 'marketing',
  icon: 'youtube',
  color: '#FF0000',
  website: 'https://youtube.com',
  documentationUrl: 'https://developers.google.com/youtube/v3',

  features: [
    'Video uploads',
    'Playlist management',
    'Channel statistics',
    'Comment moderation',
    'Live streaming',
    'Video analytics',
    'Thumbnail management',
    'Caption management',
  ],

  useCases: [
    'Content publishing',
    'Video marketing',
    'Educational content',
    'Product demos',
    'Live events',
    'Customer tutorials',
    'Brand channels',
    'Audience analytics',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Google Cloud Project',
      description: 'Go to console.cloud.google.com and create a project.',
    },
    {
      step: 2,
      title: 'Enable YouTube API',
      description: 'Enable YouTube Data API v3.',
    },
    {
      step: 3,
      title: 'Create OAuth Credentials',
      description: 'Create OAuth 2.0 credentials.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter Client ID, Secret, and authorize.',
    },
  ],
  requiredScopes: [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
  ],

  operations: [
    {
      name: 'Upload Video',
      description: 'Upload a video to YouTube',
      fields: [
        { name: 'title', type: 'string', required: true, description: 'Video title' },
        { name: 'description', type: 'string', required: false, description: 'Video description' },
        { name: 'video_file', type: 'string', required: true, description: 'Path or URL to video' },
        { name: 'privacy_status', type: 'select', required: false, description: 'public, unlisted, private' },
        { name: 'tags', type: 'array', required: false, description: 'Video tags' },
      ],
    },
    {
      name: 'Create Playlist',
      description: 'Create a new playlist',
      fields: [
        { name: 'title', type: 'string', required: true, description: 'Playlist title' },
        { name: 'description', type: 'string', required: false, description: 'Playlist description' },
        { name: 'privacy_status', type: 'select', required: false, description: 'Privacy status' },
      ],
    },
  ],

  triggers: [
    {
      name: 'New Comment',
      description: 'Triggers when new comment is posted',
      when: 'Comment on video',
      outputFields: ['comment_id', 'text', 'author', 'video_id'],
    },
  ],

  actions: [
    {
      name: 'Upload Video',
      description: 'Upload new video',
      inputFields: ['title', 'description', 'video_file'],
      outputFields: ['id', 'snippet'],
    },
  ],

  examples: [
    {
      title: 'Webinar Publishing',
      description: 'Auto-upload recorded webinars',
      steps: [
        'Trigger: Webinar recording ready',
        'Download recording from platform',
        'Upload to YouTube with metadata',
        'Add to playlist',
        'Notify subscribers',
      ],
      code: `{
  "snippet": {
    "title": "{{webinar.title}} | {{formatDate(webinar.date)}}",
    "description": "{{webinar.description}}\\n\\n📅 Originally presented: {{webinar.date}}\\n👤 Presenter: {{webinar.presenter}}\\n\\n🔔 Subscribe for more webinars!\\n\\nTimestamps:\\n{{webinar.chapters}}",
    "tags": ["webinar", "{{webinar.topic}}", "education"],
    "categoryId": "27"
  },
  "status": {
    "privacyStatus": "public",
    "selfDeclaredMadeForKids": false
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Quota exceeded',
      cause: 'Daily quota limit reached.',
      solution: 'Request quota increase in Google Cloud Console.',
    },
  ],

  relatedIntegrations: ['google-drive', 'vimeo'],
  externalResources: [
    { title: 'YouTube API Docs', url: 'https://developers.google.com/youtube/v3' },
  ],
};

export const tiktokIntegration: Integration = {
  id: 'tiktok',
  name: 'TikTok',
  description: 'Use the TikTok node to manage videos and interact with the TikTok API. Supports video posting and analytics for business accounts.',
  shortDescription: 'Short-form video platform',
  category: 'marketing',
  icon: 'tiktok',
  color: '#000000',
  website: 'https://tiktok.com',
  documentationUrl: 'https://developers.tiktok.com/doc',

  features: [
    'Video posting',
    'Content management',
    'Analytics',
    'Audience insights',
    'Hashtag research',
    'Trend discovery',
    'Comment management',
    'Sound library',
  ],

  useCases: [
    'Content marketing',
    'Brand awareness',
    'Product launches',
    'Influencer campaigns',
    'Viral marketing',
    'Gen Z engagement',
    'Entertainment content',
    'Educational content',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Developer Account',
      description: 'Sign up at developers.tiktok.com.',
    },
    {
      step: 2,
      title: 'Create App',
      description: 'Create a new app and get credentials.',
    },
    {
      step: 3,
      title: 'Request Permissions',
      description: 'Request video.upload and user.info.basic scopes.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter access token.',
    },
  ],

  operations: [
    {
      name: 'Post Video',
      description: 'Upload a video to TikTok',
      fields: [
        { name: 'video_url', type: 'string', required: true, description: 'URL to video file' },
        { name: 'caption', type: 'string', required: false, description: 'Video caption' },
        { name: 'privacy_level', type: 'select', required: false, description: 'PUBLIC_TO_EVERYONE, SELF_ONLY, etc.' },
      ],
    },
  ],

  triggers: [],

  actions: [
    {
      name: 'Post Video',
      description: 'Upload video',
      inputFields: ['video_url', 'caption'],
      outputFields: ['publish_id', 'status'],
    },
  ],

  examples: [
    {
      title: 'Product Teaser',
      description: 'Post product teaser videos',
      steps: [
        'Trigger: New product video created',
        'Format video for TikTok specs',
        'Add trending audio',
        'Post with hashtags',
      ],
      code: `{
  "video_url": "{{video.url}}",
  "caption": "✨ Coming soon! {{product.name}} 🚀 #NewProduct #ComingSoon #{{brand}}",
  "privacy_level": "PUBLIC_TO_EVERYONE",
  "disable_duet": false,
  "disable_comment": false
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Video format not supported',
      cause: 'Video doesn\'t meet TikTok specs.',
      solution: 'Ensure video is MP4, 9:16 aspect ratio, max 60s.',
    },
  ],

  relatedIntegrations: ['instagram', 'youtube'],
  externalResources: [
    { title: 'TikTok API Docs', url: 'https://developers.tiktok.com/doc' },
  ],
};

export const pinterestIntegration: Integration = {
  id: 'pinterest',
  name: 'Pinterest',
  description: 'Use the Pinterest node to create pins, manage boards, and interact with the Pinterest API. Supports visual content marketing.',
  shortDescription: 'Visual discovery platform',
  category: 'marketing',
  icon: 'pinterest',
  color: '#E60023',
  website: 'https://pinterest.com',
  documentationUrl: 'https://developers.pinterest.com/docs/',

  features: [
    'Create pins',
    'Manage boards',
    'Pin scheduling',
    'Analytics',
    'Rich pins',
    'Video pins',
    'Shopping pins',
    'Audience insights',
  ],

  useCases: [
    'Visual marketing',
    'Product catalogs',
    'Recipe sharing',
    'DIY tutorials',
    'Fashion lookbooks',
    'Home decor ideas',
    'Wedding planning',
    'E-commerce traffic',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Business Account',
      description: 'Convert to Pinterest Business account.',
    },
    {
      step: 2,
      title: 'Create App',
      description: 'Create app in Pinterest Developer portal.',
    },
    {
      step: 3,
      title: 'Get Access Token',
      description: 'Generate access token with required scopes.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter access token and board ID.',
    },
  ],

  operations: [
    {
      name: 'Create Pin',
      description: 'Create a new pin',
      fields: [
        { name: 'board_id', type: 'string', required: true, description: 'Board ID' },
        { name: 'media_source', type: 'json', required: true, description: 'Image/video source' },
        { name: 'title', type: 'string', required: false, description: 'Pin title' },
        { name: 'description', type: 'string', required: false, description: 'Pin description' },
        { name: 'link', type: 'string', required: false, description: 'Destination URL' },
      ],
    },
    {
      name: 'Create Board',
      description: 'Create a new board',
      fields: [
        { name: 'name', type: 'string', required: true, description: 'Board name' },
        { name: 'description', type: 'string', required: false, description: 'Board description' },
        { name: 'privacy', type: 'select', required: false, description: 'PUBLIC or PROTECTED' },
      ],
    },
  ],

  triggers: [],

  actions: [
    {
      name: 'Create Pin',
      description: 'Post new pin',
      inputFields: ['board_id', 'media_source', 'title'],
      outputFields: ['id'],
    },
  ],

  examples: [
    {
      title: 'Product Catalog Sync',
      description: 'Auto-pin new products to Pinterest',
      steps: [
        'Trigger: New product added',
        'Get product image and details',
        'Create pin with product link',
        'Add to appropriate board',
      ],
      code: `{
  "board_id": "{{board_id}}",
  "media_source": {
    "source_type": "image_url",
    "url": "{{product.image_url}}"
  },
  "title": "{{product.name}}",
  "description": "{{product.description}}\\n\\nPrice: {{product.price}}\\nShop now!",
  "link": "{{product.url}}",
  "alt_text": "{{product.name}} - {{product.category}}"
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Image not loading',
      cause: 'Image URL not accessible.',
      solution: 'Ensure image is publicly accessible and meets size requirements.',
    },
  ],

  relatedIntegrations: ['instagram', 'shopify'],
  externalResources: [
    { title: 'Pinterest API Docs', url: 'https://developers.pinterest.com/docs/' },
  ],
};
