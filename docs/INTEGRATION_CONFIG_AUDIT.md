# Integration Config Keys Audit

Compares frontend action field keys (AppConfigurations) vs backend executor config usage.

Generated at: 2025-12-27T04:33:38.490Z

## Summary (most missing UI keys)

| App | Action | Missing in UI | Executor |
|---|---|---:|---|
| whatsapp | send_message | 0 | server/integrations/executors/whatsappExecutor.ts |
| whatsapp | send_template | 0 | server/integrations/executors/whatsappExecutor.ts |
| whatsapp | send_media | 0 | server/integrations/executors/whatsappExecutor.ts |
| whatsapp | send_interactive | 0 | server/integrations/executors/whatsappExecutor.ts |
| telegram | send_document | 0 | server/integrations/executors/telegramExecutor.ts |
| gmail | reply_email | 0 | server/integrations/executors/gmailExecutor.ts |
| google_calendar | create_event | 0 | server/integrations/executors/googleCalendarExecutor.ts |
| google_calendar | update_event | 0 | server/integrations/executors/googleCalendarExecutor.ts |
| google_calendar | delete_event | 0 | server/integrations/executors/googleCalendarExecutor.ts |
| google_calendar | get_events | 0 | server/integrations/executors/googleCalendarExecutor.ts |
| google_calendar | quick_add | 0 | server/integrations/executors/googleCalendarExecutor.ts |
| hubspot | create_deal | 0 | server/integrations/executors/hubspotExecutor.ts |
| airtable | create_record | 0 | server/integrations/executors/airtableExecutor.ts |
| airtable | update_record | 0 | server/integrations/executors/airtableExecutor.ts |
| airtable | get_record | 0 | server/integrations/executors/airtableExecutor.ts |
| airtable | list_records | 0 | server/integrations/executors/airtableExecutor.ts |
| airtable | delete_record | 0 | server/integrations/executors/airtableExecutor.ts |
| shopify | create_customer | 0 | server/integrations/executors/shopifyExecutor.ts |
| trello | create_card | 0 | server/integrations/executors/trelloExecutor.ts |
| trello | update_card | 0 | server/integrations/executors/trelloExecutor.ts |
| trello | move_card | 0 | server/integrations/executors/trelloExecutor.ts |
| trello | add_comment | 0 | server/integrations/executors/trelloExecutor.ts |
| trello | add_member | 0 | server/integrations/executors/trelloExecutor.ts |
| asana | update_task | 0 | server/integrations/executors/asanaExecutor.ts |
| asana | complete_task | 0 | server/integrations/executors/asanaExecutor.ts |
| asana | add_comment | 0 | server/integrations/executors/asanaExecutor.ts |
| asana | create_subtask | 0 | server/integrations/executors/asanaExecutor.ts |
| monday | move_item | 0 | server/integrations/executors/mondayExecutor.ts |
| clickup | create_task | 0 | server/integrations/executors/clickupExecutor.ts |
| linear | update_issue | 0 | server/integrations/executors/linearExecutor.ts |
| openai | transcribe_audio | 0 | server/integrations/executors/openaiExecutor.ts |
| google_analytics | run_report | 0 | server/integrations/executors/googleAnalyticsExecutor.ts |
| facebook_ads | get_campaigns | 0 | server/integrations/executors/facebookAdsExecutor.ts |
| facebook_ads | update_campaign | 0 | server/integrations/executors/facebookAdsExecutor.ts |
| google_ads | get_campaigns | 0 | server/integrations/executors/googleAdsExecutor.ts |
| google_ads | get_report | 0 | server/integrations/executors/googleAdsExecutor.ts |
| google_ads | update_campaign_budget | 0 | server/integrations/executors/googleAdsExecutor.ts |
| google_ads | update_campaign_status | 0 | server/integrations/executors/googleAdsExecutor.ts |
| linkedin | create_post | 0 | server/integrations/executors/linkedinExecutor.ts |
| linkedin | get_profile | 0 | server/integrations/executors/linkedinExecutor.ts |
| linkedin | get_connections | 0 | server/integrations/executors/linkedinExecutor.ts |
| linkedin | send_message | 0 | server/integrations/executors/linkedinExecutor.ts |
| zendesk | search_tickets | 0 | server/integrations/executors/zendeskExecutor.ts |
| twitter | get_profile | 0 | server/integrations/executors/twitterExecutor.ts |

## Airtable (airtable)

Executor: server/integrations/executors/airtableExecutor.ts

### Create Record (create_record)

- Present in UI but not referenced in executor: baseId, tableId

### Delete Record (delete_record)

- Present in UI but not referenced in executor: baseId, tableId

### Get Record (get_record)

- Present in UI but not referenced in executor: baseId, tableId

### List Records (list_records)

- Present in UI but not referenced in executor: baseId, tableId

### Update Record (update_record)

- Present in UI but not referenced in executor: baseId, tableId

## Asana (asana)

Executor: server/integrations/executors/asanaExecutor.ts

### Add Comment (add_comment)

- Present in UI but not referenced in executor: projectId, workspaceId

### Complete Task (complete_task)

- Present in UI but not referenced in executor: projectId, workspaceId

### Create Subtask (create_subtask)

- Present in UI but not referenced in executor: projectId, workspaceId

### Update Task (update_task)

- Present in UI but not referenced in executor: projectId, workspaceId

## ClickUp (clickup)

Executor: server/integrations/executors/clickupExecutor.ts

### Create Task (create_task)

- Present in UI but not referenced in executor: folderId, spaceId, teamId

## Facebook Ads (facebook_ads)

Executor: server/integrations/executors/facebookAdsExecutor.ts

### Get Campaigns (get_campaigns)

- Present in UI but not referenced in executor: status

### Update Campaign (update_campaign)

- Present in UI but not referenced in executor: accountId, dailyBudget

## Gmail (gmail)

Executor: server/integrations/executors/gmailExecutor.ts

### Reply to Email (reply_email)

- Present in UI but not referenced in executor: replyAll

## Google Ads (google_ads)

Executor: server/integrations/executors/googleAdsExecutor.ts

### Get Campaigns (get_campaigns)

- Present in UI but not referenced in executor: customerId, status

### Get Report (get_report)

- Present in UI but not referenced in executor: customerId, dateRange, metrics, reportType

### Update Campaign Budget (update_campaign_budget)

- Present in UI but not referenced in executor: customerId

### Update Campaign Status (update_campaign_status)

- Present in UI but not referenced in executor: customerId

## Google Analytics (google_analytics)

Executor: server/integrations/executors/googleAnalyticsExecutor.ts

### Run Report (run_report)

- Present in UI but not referenced in executor: dateRange, endDate, startDate

## Google Calendar (google_calendar)

Executor: server/integrations/executors/googleCalendarExecutor.ts

### Create Event (create_event)

- Present in UI but not referenced in executor: calendarId

### Delete Event (delete_event)

- Present in UI but not referenced in executor: calendarId

### Get Events (get_events)

- Present in UI but not referenced in executor: calendarId

### Quick Add Event (quick_add)

- Present in UI but not referenced in executor: calendarId

### Update Event (update_event)

- Present in UI but not referenced in executor: calendarId

## HubSpot (hubspot)

Executor: server/integrations/executors/hubspotExecutor.ts

### Create Deal (create_deal)

- Present in UI but not referenced in executor: associatedCompanyIds, associatedContactIds

## Linear (linear)

Executor: server/integrations/executors/linearExecutor.ts

### Update Issue (update_issue)

- Present in UI but not referenced in executor: teamId

## LinkedIn (linkedin)

Executor: server/integrations/executors/linkedinExecutor.ts

### Create Post (create_post)

- Present in UI but not referenced in executor: articleUrl, mediaUrl

### Get Connections (get_connections)

- Present in UI but not referenced in executor: personUrn

### Get Profile (get_profile)

- Present in UI but not referenced in executor: personUrn, projection

### Send Message (send_message)

- Present in UI but not referenced in executor: body, recipientUrn, subject

## Monday.com (monday)

Executor: server/integrations/executors/mondayExecutor.ts

### Move Item to Group (move_item)

- Present in UI but not referenced in executor: boardId

## OpenAI (openai)

Executor: server/integrations/executors/openaiExecutor.ts

### Transcribe Audio (transcribe_audio)

- Present in UI but not referenced in executor: file, language, model, prompt

## Shopify (shopify)

Executor: server/integrations/executors/shopifyExecutor.ts

### Create Customer (create_customer)

- Present in UI but not referenced in executor: addresses

## Telegram (telegram)

Executor: server/integrations/executors/telegramExecutor.ts

### Send Document (send_document)

- Present in UI but not referenced in executor: filename

## Trello (trello)

Executor: server/integrations/executors/trelloExecutor.ts

### Add Comment (add_comment)

- Present in UI but not referenced in executor: boardId, listId

### Add Member (add_member)

- Present in UI but not referenced in executor: boardId, listId

### Create Card (create_card)

- Present in UI but not referenced in executor: boardId

### Move Card (move_card)

- Present in UI but not referenced in executor: boardId, listId

### Update Card (update_card)

- Present in UI but not referenced in executor: boardId, listId

## Twitter / X (twitter)

Executor: server/integrations/executors/twitterExecutor.ts

### Get Profile (get_profile)

- Present in UI but not referenced in executor: lookupBy

## WhatsApp Business (whatsapp)

Executor: server/integrations/executors/whatsappExecutor.ts

### Send Interactive Message (send_interactive)

- Present in UI but not referenced in executor: to

### Send Media (send_media)

- Present in UI but not referenced in executor: to

### Send Message (send_message)

- Present in UI but not referenced in executor: to

### Send Template Message (send_template)

- Present in UI but not referenced in executor: to

## Zendesk (zendesk)

Executor: server/integrations/executors/zendeskExecutor.ts

### Search Tickets (search_tickets)

- Present in UI but not referenced in executor: sortBy, sortOrder
