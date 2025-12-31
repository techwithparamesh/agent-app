# Integration Config Keys Audit

Compares frontend action field keys (AppConfigurations) vs backend executor config usage.

Generated at: 2025-12-31T12:56:07.623Z

## Summary (most missing UI keys)

| App | Action | Missing in UI | Executor |
|---|---|---:|---|
| google_calendar | create_event | 13 | server/integrations/executors/googleCalendarExecutor.ts |
| hubspot | create_contact | 8 | server/integrations/executors/hubspotExecutor.ts |
| google_calendar | update_event | 6 | server/integrations/executors/googleCalendarExecutor.ts |
| hubspot | create_company | 6 | server/integrations/executors/hubspotExecutor.ts |
| stripe | create_customer | 6 | server/integrations/executors/stripeExecutor.ts |
| hubspot | create_deal | 5 | server/integrations/executors/hubspotExecutor.ts |
| google_sheets | find_row | 4 | server/integrations/executors/googleSheetsExecutor.ts |
| google_drive | upload_file | 4 | server/integrations/executors/googleDriveExecutor.ts |
| google_sheets | append_row | 3 | server/integrations/executors/googleSheetsExecutor.ts |
| google_sheets | delete_row | 3 | server/integrations/executors/googleSheetsExecutor.ts |
| google_drive | copy_file | 3 | server/integrations/executors/googleDriveExecutor.ts |
| notion | query_database | 3 | server/integrations/executors/notionExecutor.ts |
| stripe | create_subscription | 3 | server/integrations/executors/stripeExecutor.ts |
| slack | send_message | 2 | server/integrations/executors/slackExecutor.ts |
| slack | upload_file | 2 | server/integrations/executors/slackExecutor.ts |
| google_sheets | update_row | 2 | server/integrations/executors/googleSheetsExecutor.ts |
| google_sheets | get_rows | 2 | server/integrations/executors/googleSheetsExecutor.ts |
| google_drive | create_folder | 2 | server/integrations/executors/googleDriveExecutor.ts |
| google_drive | move_file | 2 | server/integrations/executors/googleDriveExecutor.ts |
| google_drive | share_file | 2 | server/integrations/executors/googleDriveExecutor.ts |
| google_calendar | delete_event | 2 | server/integrations/executors/googleCalendarExecutor.ts |
| google_calendar | get_events | 2 | server/integrations/executors/googleCalendarExecutor.ts |
| stripe | create_payment_intent | 2 | server/integrations/executors/stripeExecutor.ts |
| stripe | cancel_subscription | 2 | server/integrations/executors/stripeExecutor.ts |
| stripe | create_invoice | 2 | server/integrations/executors/stripeExecutor.ts |
| google_sheets | clear_range | 1 | server/integrations/executors/googleSheetsExecutor.ts |
| google_drive | delete_file | 1 | server/integrations/executors/googleDriveExecutor.ts |
| google_drive | get_file | 1 | server/integrations/executors/googleDriveExecutor.ts |
| stripe | get_customer | 1 | server/integrations/executors/stripeExecutor.ts |
| stripe | refund_payment | 1 | server/integrations/executors/stripeExecutor.ts |
| whatsapp | send_message | 0 | server/integrations/executors/whatsappExecutor.ts |
| whatsapp | send_template | 0 | server/integrations/executors/whatsappExecutor.ts |
| whatsapp | send_media | 0 | server/integrations/executors/whatsappExecutor.ts |
| whatsapp | send_interactive | 0 | server/integrations/executors/whatsappExecutor.ts |
| telegram | send_document | 0 | server/integrations/executors/telegramExecutor.ts |
| gmail | reply_email | 0 | server/integrations/executors/gmailExecutor.ts |
| google_calendar | quick_add | 0 | server/integrations/executors/googleCalendarExecutor.ts |
| airtable | create_record | 0 | server/integrations/executors/airtableExecutor.ts |
| airtable | update_record | 0 | server/integrations/executors/airtableExecutor.ts |
| airtable | get_record | 0 | server/integrations/executors/airtableExecutor.ts |
| airtable | list_records | 0 | server/integrations/executors/airtableExecutor.ts |
| airtable | delete_record | 0 | server/integrations/executors/airtableExecutor.ts |
| shopify | create_order | 0 | server/integrations/executors/shopifyExecutor.ts |
| shopify | create_product | 0 | server/integrations/executors/shopifyExecutor.ts |
| shopify | update_product | 0 | server/integrations/executors/shopifyExecutor.ts |
| shopify | create_customer | 0 | server/integrations/executors/shopifyExecutor.ts |
| trello | create_card | 0 | server/integrations/executors/trelloExecutor.ts |
| trello | update_card | 0 | server/integrations/executors/trelloExecutor.ts |
| trello | move_card | 0 | server/integrations/executors/trelloExecutor.ts |
| trello | add_comment | 0 | server/integrations/executors/trelloExecutor.ts |

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

- Missing in UI fields: all_day, allDay, colorId, conference_data, conference_data_type, conferenceDataType, end_date_time, recurrence, reminders, send_updates, start_date_time, time_zone, visibility
- Present in UI but not referenced in executor: calendarId

### Delete Event (delete_event)

- Missing in UI fields: event_id, send_updates
- Present in UI but not referenced in executor: calendarId

### Get Events (get_events)

- Missing in UI fields: max_results, search_query
- Present in UI but not referenced in executor: calendarId

### Quick Add Event (quick_add)

- Present in UI but not referenced in executor: calendarId

### Update Event (update_event)

- Missing in UI fields: attendees, end_date_time, event_id, location, start_date_time, time_zone
- Present in UI but not referenced in executor: calendarId

## Google Drive (google_drive)

Executor: server/integrations/executors/googleDriveExecutor.ts

### Copy File (copy_file)

- Missing in UI fields: file_id, folder_id, new_name

### Create Folder (create_folder)

- Missing in UI fields: folder_name, parent_folder_id

### Delete File (delete_file)

- Missing in UI fields: file_id

### Get File Info (get_file)

- Missing in UI fields: file_id

### Move File (move_file)

- Missing in UI fields: file_id, new_folder_id

### Share File (share_file)

- Missing in UI fields: file_id, send_notification

### Upload File (upload_file)

- Missing in UI fields: file_content, file_name, folder_id, mime_type

## Google Sheets (google_sheets)

Executor: server/integrations/executors/googleSheetsExecutor.ts

### Append Row (append_row)

- Missing in UI fields: insert_data_option, sheet_name, spreadsheet_id

### Clear Range (clear_range)

- Missing in UI fields: spreadsheet_id

### Delete Row (delete_row)

- Missing in UI fields: row_index, sheet_name, spreadsheet_id

### Find Row (find_row)

- Missing in UI fields: lookup_column, lookup_value, sheet_name, spreadsheet_id

### Get Rows (get_rows)

- Missing in UI fields: sheet_name, spreadsheet_id

### Update Row (update_row)

- Missing in UI fields: sheet_name, spreadsheet_id

## HubSpot (hubspot)

Executor: server/integrations/executors/hubspotExecutor.ts

### Create Company (create_company)

- Missing in UI fields: annualrevenue, description, hubspot_owner_id, hubspotOwnerId, numberofemployees, state

### Create Contact (create_contact)

- Missing in UI fields: address, city, country, hs_lead_status, hubspot_owner_id, hubspotOwnerId, state, zip

### Create Deal (create_deal)

- Missing in UI fields: dealtype, description, hs_priority, hubspot_owner_id, hubspotOwnerId
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

## Notion (notion)

Executor: server/integrations/executors/notionExecutor.ts

### Query Database (query_database)

- Missing in UI fields: page_size, start_cursor, startCursor

## OpenAI (openai)

Executor: server/integrations/executors/openaiExecutor.ts

### Transcribe Audio (transcribe_audio)

- Present in UI but not referenced in executor: file, language, model, prompt

## Shopify (shopify)

Executor: server/integrations/executors/shopifyExecutor.ts

### Create Customer (create_customer)

- Present in UI but not referenced in executor: acceptsMarketing, addresses, email, firstName, lastName, note, phone, tags

### Create Order (create_order)

- Present in UI but not referenced in executor: customerId, email, financialStatus, lineItems, shippingAddress, tags

### Create Product (create_product)

- Present in UI but not referenced in executor: bodyHtml, productType, tags, vendor

### Update Product (update_product)

- Present in UI but not referenced in executor: bodyHtml

## Slack (slack)

Executor: server/integrations/executors/slackExecutor.ts

### Send Message (send_message)

- Missing in UI fields: icon_emoji, thread_ts

### Upload File (upload_file)

- Missing in UI fields: file_url, initial_comment

## Stripe (stripe)

Executor: server/integrations/executors/stripeExecutor.ts

### Cancel Subscription (cancel_subscription)

- Missing in UI fields: cancel_at_period_end, subscription_id

### Create Customer (create_customer)

- Missing in UI fields: address, invoice_settings, invoiceSettings, payment_method, paymentMethod, shipping

### Create Invoice (create_invoice)

- Missing in UI fields: auto_advance, customer_id

### Create Payment Intent (create_payment_intent)

- Missing in UI fields: customer_id, payment_method_types

### Create Subscription (create_subscription)

- Missing in UI fields: customer_id, price_id, trial_period_days

### Get Customer (get_customer)

- Missing in UI fields: customer_id

### Create Refund (refund_payment)

- Missing in UI fields: payment_intent_id

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
