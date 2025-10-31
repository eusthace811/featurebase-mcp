Changelogs
Changelogs are one of the core features in Featurebase. On this page, we'll dive into the different changelog endpoints you can use to manage them programmatically. We'll look into subscribing your users to your changelog so that they always receive updates when you post changes.

The Changelog model
The Changelog model contains all the information about a changelog, such as its title, content, date of creation, and much more. It has the following properties:

Properties
Name
id
Type
string
Description
The id of the changelog.

Name
slug
Type
string
Description
The slug of the changelog. Example: "my-changelog-slug".
Can be used to create a URL for the changelog: https://{yourorg}.featurebase.app/changelog/ {slug}

Name
featuredImage
Type
string
Description
The URL of the featured image of the changelog.

Name
title
Type
string
Description
The title of the changelog.

Name
content
Type
string
Description
The HTML content of the changelog. Images with external URLs or base64 data URIs are automatically processed and stored in our system.

Name
markdownContent
Type
string
Description
The markdown content of the changelog. Images with external URLs or base64 data URIs are automatically processed and stored in our system.

Name
date
Type
Date
Description
The date when the changelog was made.

Name
state
Type
string
Description
State can either be "draft" or "live".

Name
changelogCategories
Type
object[]
Description
An array of category objects associated with the changelog.

Name
organization
Type
string
Description
The organization that this changelog belongs to.

Name
emailSentToSubscribers
Type
boolean
Description
Flag indicating whether the email has been sent to subscribers for this changelog.

Name
commentCount
Type
number
Description
The number of comments on the changelog.

Name
allowedSegmentIds
Type
string[]
Description
An array of segment ids that are allowed to view the changelog. If empty, everyone can view the changelog.

Name
locale
Type
string
Description
The locale of the changelog, defaulting to "en".

GET
/v2/changelog
Get changelogs
This endpoint allows you to retrieve a paginated list of all your changelogs. By default, a maximum of ten changelogs are shown per page.

Query Parameters
Name
id
Type
string
Description
Find changelog by its id.

Name
q
Type
string
Description
Search for changelogs by title or content.

Name
categories
Type
string[]
Description
Filter changelogs by category, by providing an array of category names.

Name
limit
Type
integer
Description
Number of results per page. Maximum: 100.

Name
page
Type
integer
Description
Page number.

Name
locale
Type
string
Description
The locale of the changelogs. Defaults to 'en'.

Name
state
Type
string
Description
The state of the changelog, either 'draft' or 'live'.

Request
cURL
Node.js
Python
GET
/v2/changelog
curl -G https://do.featurebase.app/v2/changelog \
  -H "X-API-Key: {token}"

Copy
Copied!
Response
{
    "results": [
        {
            "title": "Your awesome changelog!",
            "slug": "your-awesome-changelog",
            "content": "<p>Your changelog content in HTML format.</p>",
            "markdownContent": "Your changelog content in markdown format.",
            "date": "2023-05-07T17:46:39.168Z",
            "state": "live",
            "sendNotification": true,
            "emailSentToSubscribers": true,
            "commentCount": 2,
            "changelogCategories": [
                {
                    "name": "Test2",
                    "roles": [],
                    "id": "6438a1efda3640f8feb72121"
                }
            ],
            "organization": "robiorg",
            "id": "6457e3ff70afca5d8c27dccc",
        },
        {
            ...
        },
        ...
    ],
    "page": 1,
    "limit": 10,
    "totalPages": 30,
    "totalResults": 292
}

Copy
Copied!
POST
/v2/changelog
Create changelog
This endpoint allows you to create a new changelog.

Required Attributes
Name
title
Type
string
Description
The title of the changelog.

Name
htmlContent
Type
string
Description
The HTML content of the changelog. Provide either htmlContent or markdownContent depending on the format your data is in.

Note: For images, you can use external URLs in img src attributes and our system will automatically pull them into our own storage. If no external URL is available, we also support base64 encoded data URIs (data:image/...) in img src attributes, which will also be processed and stored in our system.

Name
markdownContent
Type
string
Description
The markdown content of the changelog.

Note: Markdown image syntax works the same as HTML - you can use external URLs or base64 encoded data URIs in image references and our system will automatically pull them into our own storage and process them accordingly.

Optional Attributes
Name
changelogCategories
Type
string[]
Description
An array of category identifiers to which the changelog belongs.
Example: ["New", "Fixed", "Improved"]

Name
featuredImage
Type
string
Description
The URL of the featured image for the changelog.

Name
allowedSegmentIds
Type
string[]
Description
An array of segment ids that are allowed to view the changelog.

Name
locale
Type
string
Description
The locale of the changelog, defaulting to "en".

Name
date
Type
Date
Description
The date of the changelog.

Request
cURL
Node.js
Python
POST
/v2/changelog
curl -X 'POST' 'https://do.featurebase.app/v2/changelog' \
  -H 'X-API-Key: {token}' \
  -H 'Content-Type: application/json' \
  -d '{
        "title": "New Features Update",
        "markdownContent": "Exciting new features to explore.",
        "changelogCategories": ["New", "Fixed", "Improved"],
        "state": "draft",
        "featuredImage": "http://example.com/image.png",
      }'      

Copy
Copied!
Response
{
    "results": {
        "title": "Your awesome changelog!",
        "slug": "your-awesome-changelog",
        "content": "<p>Your changelog content in HTML format.</p>",
        "markdownContent": "Your changelog content in markdown format.",
        "date": "2023-05-07T17:46:39.168Z",
        "state": "live",
        "sendNotification": true,
        "emailSentToSubscribers": true,
        "commentCount": 2,
        "changelogCategories": [
            {
                "name": "Test2",
                "roles": [],
                "id": "6438a1efda3640f8feb72121"
            }
        ],
        "organization": "robiorg",
        "id": "6457e3ff70afca5d8c27dccc",
    },
    "success": true
}

Copy
Copied!
PATCH
/v2/changelog
Update changelog
This endpoint allows you to update an existing changelog. Only send the fields you want to update.

Required Attributes
Name
id
Type
string
Description
The id of the changelog to update.

Fields to Update
Name
title
Type
string
Description
The title of the changelog.

Name
htmlContent
Type
string
Description
The HTML content of the changelog. Provide either htmlContent or markdownContent depending on the format your data is in.

Note: For images, you can use external URLs in img src attributes and our system will automatically pull them into our own storage. If no external URL is available, we also support base64 encoded data URIs (data:image/...) in img src attributes, which will also be processed and stored in our system.

Name
markdownContent
Type
string
Description
The markdown content of the changelog.

Note: Markdown image syntax works the same as HTML - you can use external URLs or base64 encoded data URIs in image references and our system will automatically pull them into our own storage and process them accordingly.

Name
changelogCategories
Type
string[]
Description
An array of category identifiers to which the changelog belongs.
Example: ["New", "Fixed", "Improved"]

Name
date
Type
Date
Description
The date of the changelog.

Name
featuredImage
Type
string
Description
The URL of the featured image for the changelog.

Name
allowedSegmentIds
Type
string[]
Description
An array of segment ids that are allowed to view the changelog.

Request
cURL
Node.js
Python
PATCH
/v2/changelog
curl -X 'PATCH' 'https://do.featurebase.app/v2/changelog' \
  -H 'X-API-Key: {token}' \
  -H 'Content-Type: application/json' \
  -d '{
        "id": "6457e3ff70afca5d8c27dccc",
        "title": "New Features Update",
        "markdownContent": "Exciting new features to explore.",
        "changelogCategories": ["New", "Fixed", "Improved"],
        "state": "draft",
        "featuredImage": "http://example.com/image.png",
        "sendNotification": true,
      }'      

Copy
Copied!
Response
{
    "changelog": {
        "title": "Your awesome changelog!",
        "slug": "your-awesome-changelog",
        "content": "<p>Your changelog content in HTML format.</p>",
        "markdownContent": "Your changelog content in markdown format.",
        "date": "2023-05-07T17:46:39.168Z",
        "state": "draft",
        "sendNotification": true,
        "emailSentToSubscribers": true,
        "commentCount": 2,
        "changelogCategories": [
            {
                "name": "Test2",
                "roles": [],
                "id": "6438a1efda3640f8feb72121"
            }
        ],
        "organization": "robiorg",
        "id": "6457e3ff70afca5d8c27dccc",
    },
    "success": true
}

Copy
Copied!
DELETE
/v2/changelog
Delete changelog
This endpoint allows you to delete a changelog.

Required Attributes
Name
id
Type
string
Description
The id of the changelog to delete.

Request
cURL
Node.js
Python
DELETE
/v2/changelog
curl -X 'DELETE' 'https://do.featurebase.app/v2/changelog' \
  -H 'X-API-Key: {token}' \
  -H 'Content-Type: application/json' \
  -d '{
        "id": "6457e3ff70afca5d8c27dccc"
      }'      


Copy
Copied!
Response
{
    "success": true
}

Copy
Copied!
GET
/v2/changelog/subscribers
Get changelog subscribers
This endpoint allows you to retrieve a list of all your changelog subscribers.

Request
cURL
Node.js
Python
GET
/v2/changelog/subscribers
curl -G https://do.featurebase.app/v2/changelog/subscribers \
  -H "X-API-Key: {token}"

Copy
Copied!
Response
{
    "success": true,
    "emails": [
        "yourcustomer@gmail.com"
    ]
}

Copy
Copied!
POST
/v2/changelog/subscribers
Add new changelog subscribers
This endpoint allows you to add changelog subscribers. They will then receive emails when you post changelogs.

Required Attributes
Name
emails
Type
string[]
Description
An array of emails to add as subscribers.

Name
locale
Type
string
Description
The locale for the subscribers, defaulting to "en".

Request
cURL
Node.js
Python
POST
/v2/changelog/subscribers
curl -X 'POST' 'https://do.featurebase.app/v2/changelog/subscribe' \
  -H 'X-API-Key: {token}' \
  -H 'Content-Type: application/json' \
  -d '{
        "emails": [
            "yourcustomer@gmail.com",
            "yoursecondcustomer@gmail.com"
        ],
      }'


Copy
Copied!
Response
{
    "success": true
}

Copy
Copied!
DELETE
/v2/changelog/subscribers
Remove changelog subscribers by email
This endpoint allows you to remove changelog subscribers.

Required Attributes
Name
emails
Type
string[]
Description
An array of emails to remove from subscribers.

Name
locale
Type
string
Description
The locale for the subscribers, defaulting to "en".

Request
cURL
Node.js
Python
DELETE
/v2/changelog/subscribers
 curl -X 'DELETE' 'https://do.featurebase.app/v2/changelog/subscribe' \
   -H 'X-API-Key: {token}' \
   -H 'Content-Type: application/json' \
   -d '{
         "emails": [
             "yourcustomer@gmail.com"
         ],
       }'


Copy
Copied!
Response
{
  "success": true
}

Copy
Copied!
POST
/v2/changelog/publish
Publish changelog
This endpoint allows you to publish a changelog and optionally send an email notification.

Required Attributes
Name
id
Type
string
Description
The id of the changelog to publish.

Name
sendEmail
Type
boolean
Description
A flag indicating whether to send an email notification to subscribers.

Name
locales
Type
string[]
Description
An array of locales to publish the changelog to. An empty array publishes to all locales.

Name
scheduledDate
Type
Date
Description
The date when the changelog should be published. Must be a future date.

Request
cURL
Node.js
Python
POST
/v2/changelog/publish
 curl -X 'POST' 'https://do.featurebase.app/v2/changelog/publish' \
   -H 'X-API-Key: {token}' \
   -H 'Content-Type: application/json' \
   -d '{
         "id": "6457e3ff70afca5d8c27dccc",
         "sendEmail": true,
         "scheduledDate": "2023-12-01T00:00:00Z"
       }'


Copy
Copied!
Response
{
  "success": true
}

Copy
Copied!
POST
/v2/changelog/unpublish
Unpublish changelog
This endpoint allows you to unpublish a changelog.

Required Attributes
Name
id
Type
string
Description
The id of the changelog to unpublish.

Name
locales
Type
string[]
Description
An array of locales to unpublish the changelog from. An empty array unpublishes from all locales.

Request
cURL
Node.js
Python
POST
/v2/changelog/unpublish
 curl -X 'POST' 'https://do.featurebase.app/v2/changelog/unpublish' \
   -H 'X-API-Key: {token}' \
   -H 'Content-Type: application/json' \
   -d '{
         "id": "6457e3ff70afca5d8c27dccc",
       }'


Copy
Copied!
Response
{
  "success": true
}