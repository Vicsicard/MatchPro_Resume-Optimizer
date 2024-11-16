# Instructions Directory

This directory contains documentation and instructions for the MatchPro project setup and configuration.

## Purpose
- Store configuration files
- Document setup instructions
- Maintain reference materials
- Track implementation details

## Expected Files
1. `supabase-schema.sql` - Database schema and RLS policies
Database Schema SQL
To create a database schema in Supabase, you can use the following SQL command, substituting myschema with the name you want to use for your schema:

1CREATE SCHEMA myschema;

By default, your database has a public schema which is automatically exposed on data APIs.

If you want to prepare your database with relevant tables, you can create a new table using SQL. For example, to create a table called cities with columns id, name, and population, you can use the following SQL:

1create table "public"."cities" (
2    "id" bigint primary key generated always as identity,
3    "name" text,
4    "population" bigint
5);

You can also view your table definitions directly from the Table Editor in the Supabase Dashboard. This allows you to see the SQL that corresponds to your table structure.

If you make changes through the Studio UI, you can auto-generate a schema diff to capture those changes.

Row Level Security (RLS) policies are special objects within the Postgres database that limit the available operations or data returned to clients. RLS policies use information contained in a JWT to identify users and the actions and data they are allowed to perform or view.

Creating RLS Policies
You can create RLS policies to restrict access to rows in a table. For example, if you have a posts table, you can restrict updates to just the user who created it with the following policy:

1create policy "Allow update for owners" on posts for
2update
3  using ((select auth.uid()) = user_id);

This policy allows the post owner to update the row, but it gives full access to update all columns.

Policy Examples
An easy way to get started with RLS policies is to create policies for SELECT, INSERT, UPDATE, and DELETE operations. For instance, you can start with an INSERT policy like this:

1create policy "policy_name"
2ON storage.objects
3for insert with check (
4  true
5);

You can modify it to allow only authenticated users to upload assets to a specific bucket:

1create policy "policy_name"
2on storage.objects for insert to authenticated with check (
3    bucket_id = 'my_bucket_id'
4);

Individual User Access
To allow a user to access a file that was previously uploaded by the same user, you can use the following policy:

1create policy "Individual user Access"
2on storage.objects for select
3to authenticated
4using ( (select auth.uid()) = owner_id );

Updating RLS Policies
Client access policies are cached for the duration of the connection. Your database is not queried for every Channel message. Realtime updates the access policy cache for a client based on your RLS policies when:

A client connects to Realtime and subscribes to a Channel
A new JWT is sent to Realtime from a client via the access_token message
Make sure to keep the JWT expiration window short to maintain security.

You can attach as many policies as you want to each table, and Supabase provides SQL helper functions to simplify RLS if you're using Supabase Auth.


2. `auth-flow.md` - Authentication flow documentation
The authentication flow in Supabase involves several steps to ensure that users can securely sign in and manage their accounts. Below are the basic steps for using the authentication flow, assuming that configuration is already done.

Basic Authentication Flow (Client-side Sign In with Password)
Sign In: Use the following code to allow users to sign in with their email and password.

1const { user, session, error } = await supabase.auth.signIn({
2  email: 'user@example.com',
3  password: 'password',
4});

Check for Errors: After attempting to sign in, check if there was an error.

1if (error) {
2  console.error('Error signing in:', error.message);
3} else {
4  console.log('User signed in:', user);
5}

Additional Authentication Flows
You can also implement other related flows, such as changing a password or using the PKCE version of the flow. Here’s a brief overview of how to change a password:

Change Password: Use the following code to allow users to change their password.

1const { user, error } = await supabase.auth.update({
2  password: 'new-password',
3});

Check for Errors: Again, check for any errors that may occur during the password change.

1if (error) {
2  console.error('Error changing password:', error.message);
3} else {
4  console.log('Password changed successfully for user:', user);
5}

Important Notes
Ensure that you handle user sessions appropriately and manage JWT tokens for secure authentication.
For more advanced authentication methods, consider implementing social logins or passwordless logins via magic links.
For detailed information on each flow, you can refer to the respective sections in the Supabase documentation.


3. `client-config.md` - Supabase client configuration details
To configure the Supabase client, you need to set up some essential parameters. Below are the key details for client configuration:

Creating a Supabase Client
You can create a Supabase client using the createClient utility function. Here’s a basic example:

1import { createClient } from '@supabase/supabase-js';
2
3const supabaseUrl = 'https://<your-project-ref>.supabase.co';
4const supabaseAnonKey = '<your-anon-key>';
5
6const supabase = createClient(supabaseUrl, supabaseAnonKey);

Configuration Options
When initializing the Supabase client, you can pass configuration options. Here are some of the options you can set:

Presence Options: These options allow you to manage real-time presence in your application.
Broadcast Options: These options can be used to configure how messages are broadcasted in real-time.
Client Settings
After creating the client, ensure that you set the following settings:

Client Protocol: Set to openid-connect.
Access Type: Set to confidential.
Valid Redirect URIs: Should be set to: https://<project-ref>.supabase.co/auth/v1/callback.
Example of Setting Up the Client
Here’s an example of how to set up the client with the necessary configurations:

1const { createClient } = require('@supabase/supabase-js');
2
3const supabaseUrl = 'https://<your-project-ref>.supabase.co';
4const supabaseAnonKey = '<your-anon-key>';
5
6const supabase = createClient(supabaseUrl, supabaseAnonKey, {
7  auth: {
8    persistSession: true,
9    detectSessionInUrl: true,
10  },
11});

Important Considerations
Make sure to replace <your-project-ref> and <your-anon-key> with your actual Supabase project reference and anon key.
Always keep your keys secure and do not expose them in client-side code if possible.
For more detailed information, you can refer to the Supabase documentation on client libraries and configuration options.


4. Any other relevant documentation files
user auth table schema:
CREATE TABLE auth_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,  -- We'll add hashing later
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Add a test user so we can verify the login
INSERT INTO auth_users (email, password)
VALUES ('test@example.com', 'testpassword123');
auth_users: rls policies:rls currently disabled
No policies created yet
Database Functions
Docs

schema:

public

Search for a function

Create a new function
Name	Arguments	Return type	Security	
handle_new_user

-

trigger

Definer	

Database Triggers
Execute a set of actions automatically on specified table events

Docs

schema:

public

Search for a trigger

Create a new trigger
Name	Table	Function	Events	Orientation	Enabled	
No triggers created yet

There are no triggers found in the schema "public"

Email Templates
Customize the emails that will be sent out to your users.

Docs
Confirm signup
Invite user
Magic Link
Change Email Address
Reset Password
Reauthentication
Subject heading
Confirm Your Signup
Message body
Message variables
{{ .ConfirmationURL }} : URL to confirm the e-mail address for the new account
{{ .Token }} : The 6-digit numeric email OTP
{{ .TokenHash }} : The hashed token used in the URL
{{ .SiteURL }} : The URL of the site
{{ .Email }} : The user's email address
{{ .Data }} : The user's user_metadata
{{ .RedirectTo }} : The URL of emailRedirectTo passed in options
Source
Preview
1234
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>
Email content is unlikely to be marked as spam

Auth Providers
Authenticate your users through a suite of providers and login methods

OTP expiry exceeds recommended threshold
We have detected that you have enabled the email provider with the OTP expiry set to more than an hour. It is recommended to set this value to less than an hour.

View security recommendations

Email auth icon
Email
Enabled

Phone auth icon
Phone
Disabled

SAML 2.0 auth icon
SAML 2.0
Disabled

Apple auth icon
Apple
Disabled

Azure auth icon
Azure
Disabled

Bitbucket auth icon
Bitbucket
Disabled

Discord auth icon
Discord
Disabled

Facebook auth icon
Facebook
Disabled

Figma auth icon
Figma
Disabled

GitHub auth icon
GitHub
Disabled

GitLab auth icon
GitLab
Disabled

Google auth icon
Google
Disabled

Kakao auth icon
Kakao
Disabled

KeyCloak auth icon
KeyCloak
Disabled

LinkedIn (OIDC) auth icon
LinkedIn (OIDC)
Disabled

Notion auth icon
Notion
Disabled

Twitch auth icon
Twitch
Disabled

Twitter auth icon
Twitter
Disabled

Slack (OIDC) auth icon
Slack (OIDC)
Disabled

Slack (Deprecated) auth icon
Slack (Deprecated)
Disabled

Spotify auth icon
Spotify
Disabled

WorkOS auth icon
WorkOS
Disabled

Zoom auth icon
Zoom
Dis

CREATE TABLE auth_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,  -- We'll add hashing later
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Add a test user so we can verify the login
INSERT INTO auth_users (email, password)
VALUES ('test@example.com', 'testpassword123');

-- Create the user_credits table
create table if not exists public.user_credits (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) not null unique,
    credits_remaining integer not null default 10,
    total_optimizations integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.user_credits enable row level security;

-- Update the default value for credits_remaining
ALTER TABLE public.user_credits 
ALTER COLUMN credits_remaining SET DEFAULT 10;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;

-- Create policy to allow users to read only their own credits
CREATE POLICY "Users can view their own credits"
    ON public.user_credits
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow the application to update user credits
CREATE POLICY "Users can update their own credits"
    ON public.user_credits
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Function to automatically create credits for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_credits (user_id, credits_remaining)
    VALUES (new.id, 10);
    RETURN new;
END;
$$;

-- Trigger to call handle_new_user() when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update existing users to have 10 credits if they have less
UPDATE public.user_credits 
SET credits_remaining = 10 
WHERE credits_remaining < 10;

create table public.user_optimizations (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    remaining_optimizations integer default 0,
    total_optimizations integer default 0,
    last_purchase_date timestamp with time zone default now(),
    created_at timestamp with time zone default now(),
    
    constraint user_optimizations_user_id_key unique (user_id)
);

-- Set up RLS (Row Level Security) policies
alter table public.user_optimizations enable row level security;

-- Allow users to read only their own optimization data
create policy "Users can view their own optimization data"
on public.user_optimizations for select
using (auth.uid() = user_id);

-- Allow authenticated users to update their own optimization data
create policy "Users can update their own optimization data"
on public.user_optimizations for update
using (auth.uid() = user_id);

-- Allow system to insert new optimization records
create policy "System can insert optimization records"
on public.user_optimizations for insert
with check (true);

-- First, check if the table exists
DO $$ 
BEGIN
    CREATE TABLE IF NOT EXISTS public.user_trial_table (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id uuid REFERENCES auth.users(id) NOT NULL,
        used_trial boolean DEFAULT false,
        trial_start_date timestamp with time zone,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
    );

    -- Enable RLS
    ALTER TABLE public.user_trial_table ENABLE ROW LEVEL SECURITY;

    -- Create policies
    DROP POLICY IF EXISTS "Users can read their own trial status" ON public.user_trial_table;
    DROP POLICY IF EXISTS "Users can update their own trial status" ON public.user_trial_table;

    CREATE POLICY "Users can read their own trial status"
    ON public.user_trial_table FOR SELECT
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can update their own trial status"
    ON public.user_trial_table FOR INSERT
    WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own trial status"
    ON public.user_trial_table FOR UPDATE
    USING (auth.uid() = user_id);

    -- Add unique constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'unique_user_trial' 
        AND conrelid = 'public.user_trial_table'::regclass
    ) THEN
        ALTER TABLE public.user_trial_table
        ADD CONSTRAINT unique_user_trial UNIQUE (user_id);
    END IF;

EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error creating table or constraints: %', SQLERRM;
END $$;

SELECT 
    u.email,
    r.original_filename,
    r.storage_path,
    r.status,
    r.created_at,
    r.updated_at
FROM resumes r
JOIN users u ON r.user_id = u.id
ORDER BY r.created_at DESC;

-- Supabase AI is experimental and may produce incorrect answers
-- Always verify the output before executing

-- Drop existing table if it exists
drop table if exists resumes;

-- Create resumes table
create table
  resumes (
    id uuid primary key default uuid_generate_v4 (),
    user_id uuid not null references users (id) on delete cascade,
    original_filename text not null,
    storage_path text not null,
    optimized_storage_path text,
    created_at TIMESTAMPTZ not null default now(),
    updated_at TIMESTAMPTZ not null default now(),
    status text not null default 'pending'
    -- Removed redundant foreign key constraint definition
  );

-- Enable RLS
alter table resumes enable row level security;

-- Enable realtime
alter publication supabase_realtime
add table resumes;

-- Create policies
create policy "Users can view own resumes" on resumes for
select
  using (auth.uid () = user_id);

create policy "Users can insert own resumes" on resumes for insert
with
  check (auth.uid () = user_id);

create policy "Users can update own resumes" on resumes
for update
  using (auth.uid () = user_id);

  Site URL
Configure the default redirect URL used when a redirect URL is not specified or doesn't match one from the allow list. This value is also exposed as a template variable in the email templates section. Wildcards cannot be used here.

Site URL
http://localhost:5174

Cancel

Save
Redirect URLs
URLs that auth providers are permitted to redirect to post authentication. Wildcards are allowed, for example, https://*.domain.com

Docs

Add URL

http://localhost:5174/**

http://localhost:5174/auth-callback

http://localhost:5174/auth-confirmation
Total URLs: 3

Auth settings
Configure security and user session settings
User Signups

Allow new users to sign up
If this is disabled, new users will not be able to sign up to your application.

Allow manual linking
Enable manual linking APIs for your project.


Allow anonymous sign-ins
Enable anonymous sign-ins for your project.

Passwords
Minimum password length
6
characters
Passwords shorter than this value will be rejected as weak. Minimum 6, recommended 8 or more.
Password Requirements

No required characters (default)
Passwords that do not have at least one of each will be rejected as weak.
Upgrade to Pro

Leaked password protection available on Pro plans and up.

Upgrade to Pro

Prevent use of leaked passwords (recommended)
Rejects the use of known or easy to guess passwords on sign up or password change. Powered by the HaveIBeenPwned.org Pwned Passwords API.
User Sessions
Upgrade to Pro

Configuring user sessions requires the Pro Plan.

Upgrade to Pro

Enforce single session per user
If enabled, all but a user's most recently active session will be terminated.
Time-box user sessions
0
never
The amount of time before a user is forced to sign in again. Use 0 for never
Inactivity timeout
0
never
The amount of time a user needs to be inactive to be forced to sign in again. Use 0 for never.
Bot and Abuse Protection

Enable Captcha protection
Protect authentication endpoints from bots and abuse.

Cancel

Save
SMTP Settings
You can use your own SMTP server instead of the built-in email service.


Enable Custom SMTP
Emails will be sent using your custom SMTP provider. Email rate limits can be adjusted here.

Sender details
Sender email
info@digitalrascalmarketing.com
This is the email address the emails are sent from
Sender name
MatchPro Resume
Name displayed in the recipient's inbox
SMTP Provider Settings
Your SMTP Credentials will always be encrypted in our database.

Host
smtp.mailchannels.net
Hostname or IP address of your SMTP server.
Port number
25
Port used by your SMTP server. Common ports include 25, 465, and 587.
Avoid using port 25 as modern SMTP email clients shouldn't use this port, it is traditionally blocked by residential ISPs and Cloud Hosting Providers, to curb the amount of spam.
Minimum interval between emails being sent
60
seconds
How long between each email can a new email be sent via your SMTP server.
Username
digitalrascalmarketing
Password
••••••••

For security reasons, the password is write-only. Once saved, it cannot be retrieved or displayed.

Cancel

Save
Advanced Settings
These settings rarely need to be changed.

Access Tokens (JWT)
Access token (JWT) expiry time
3600
seconds
How long access tokens are valid for before a refresh token has to be used. Recommendation: 3600 (1 hour).
Refresh Tokens

Detect and revoke potentially compromised refresh tokens
Prevent replay attacks from potentially compromised refresh tokens. Recommendation: ON.
Refresh token reuse interval
10
seconds
Time interval where the same refresh token can be used multiple times to request for an access token. Recommendation: 10 seconds.
Multi-Factor Authentication (MFA)
TOTP (App Authenticator)

Enabled
Control use of TOTP (App Authenticator) factors
Maximum number of per-user MFA factors
10
factors
How many MFA factors can be enrolled at once per user.
Advanced MFA
Upgrade to Pro

Advanced MFA requires the Pro Plan

Upgrade to Pro
Phone

Disabled
Control use of phone factors
Phone OTP Length
6
Number of digits in OTP
Phone verification message
Your code is {{ .Code }}
To format the OTP code use {{ .Code }}

Max Direct Database Connections
Upgrade to Team or Enterprise

Max Direct Database Connections settings are only available on the Team Plan and up.

Upgrade to Team
Max direct database connections used by Auth
10
connections
Auth will take up no more than this number of connections from the total number of available connections to serve requests. These connections are not reserved, so when unused they are released.
Max Request Duration
Upgrade to Team or Enterprise

Max Request Duration settings are only available on the Team Plan and up.

Upgrade to Team
Maximum time allowed for an Auth request to last
10
seconds
Number of seconds to wait for an Auth request to complete before canceling it. In certain high-load situations setting a larger or smaller value can be used to control load-shedding. Recommended: 10 seconds.

Cancel

Save
Third Party Auth
Use third-party authentication (TPA) systems based on JWTs to access your project.

Docs
Billing is based on the number of monthly active users (MAUs) requesting your API throughout the billing period (50 included then you'll be charged $0.00325 per MAU).
No providers configured yet


Add provider

Rate Limits Documentation
Sure! Here’s the information about rate limits from the Supabase documentation:

Auth Rate Limits
Supabase Auth enforces rate limits on endpoints to prevent abuse. You can configure the auth rate limits for your project here.

Endpoint	Path	Limited By	Rate Limit
All endpoints that send emails	/auth/v1/signup /auth/v1/recover /auth/v1/user[^1]	Sum of combined requests	As of 3 Sep 2024, this has been updated to emails per hour. You can only change this with your own custom SMTP setup.
All endpoints that send One-Time-Passwords (OTP)	/auth/v1/otp	Sum of combined requests	Defaults to 360 OTPs per hour. Is customizable.
Send OTPs or magiclinks	/auth/v1/otp	Last request	Defaults to 60 seconds window before a new request is allowed. Is customizable.
Signup confirmation request	/auth/v1/signup	Last request	Defaults to 60 seconds window before a new request is allowed. Is customizable.
Password Reset Request	/auth/v1/recover	Last request	Defaults to 60 seconds window before a new request is allowed. Is customizable.
Verification requests	/auth/v1/verify	IP Address	360 requests per hour (with bursts up to 30 requests)
Token refresh requests	/auth/v1/token	IP Address	1800 requests per hour (with bursts up to 30 requests)
Create or Verify an MFA challenge	/auth/v1/factors/:id/challenge /auth/v1/factors/:id/verify	IP Address	15 requests per minute (with bursts up to 30 requests)
Anonymous sign-ins	/auth/v1/signup[^2]	IP Address	30 requests per hour (with bursts up to 30 requests)
Abuse Prevention and Rate Limits
Since anonymous users are stored in your database, bad actors can abuse the endpoint to increase your database size drastically. It is strongly recommended to enable invisible Captcha or Cloudflare Turnstile to prevent abuse for anonymous sign-ins. An IP-based rate limit is enforced at 30 requests per hour which can be modified in your dashboard. You can refer to the full list of rate limits here.

If you have any more questions about rate limits or anything else, feel free to ask!

Configuring an Email Server
To send emails, you will need to use a production-ready SMTP server. You can configure the SMTP server by updating the following environment variables in your .env file:

SMTP_ADMIN_EMAIL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_SENDER_NAME=

We recommend using AWS SES as it is extremely cheap and reliable. After updating the configuration, make sure to restart all services to apply the changes.

Supabase Auth Email Configuration
If you're using Supabase Auth with the following configurations:

Email and password accounts
Passwordless accounts using one-time passwords or links sent over email (OTP, magic link, invites)
Email-based user invitations from the Users page or from the Auth admin APIs
Social login with email confirmation
You will need to set up a custom SMTP server to handle the delivery of messages to your users.

Default SMTP Server
Supabase provides a simple SMTP server for all projects to help you get started. However, this server has some important restrictions and is not meant for production use:

Send messages only to pre-authorized addresses. Supabase Auth will refuse to deliver messages to addresses that are not part of the project's team.
Significant rate-limits that can change over time. The number of messages your project can send is limited and can change without notice.
No SLA guarantee on message delivery or uptime for the default SMTP service. This service is provided on a best-effort basis and is intended for non-production use cases.
Setting Up a Custom SMTP Server
Supabase Auth works with any email sending service that supports the SMTP protocol. Here’s how to set it up:

Choose an email sending service and create an account (if you don’t have one).
Obtain the SMTP server settings and credentials for your account, including:
SMTP server host
Port
User
Password
Choose a default From address, usually something like no-reply@example.com.
Some services that work with Supabase Auth include:

Resend
AWS SES
Postmark
Twilio SendGrid
ZeptoMail
Brevo
Once you have set up your account with an email sending service, head to the Authentication settings page to enable and configure custom SMTP.

If you have any more questions or need further assistance, feel free to ask!

Setting up for Sendmail
Avatar Sridhar Kakkillaya June 20, 2024 16:54 
Instructions for updating the Sendmail configuration to use MailChannels as a relay host are provided in this article. Authentication with MailChannels is required and is relatively simple to setup.

Note: Sendmail requires libsasl in order to properly send authentication requests to MailChannels servers. The saslauthd server daemon is not required unless you plan to receive authentication requests to the same server. For more information on configuring Sendmail, see the Sendmail SASL support page.

Authentication Credentials
Sendmail stores SMTP authentication credentials in /etc/mail/access. Add the provided line of code to the file, or edit an existing authentication line if there is already one present, replacing MailChannelsSMTPUsername with the SMTP username we provided you in the activation email. Replace MailChannelsSMTPPassword with one of the SMTP passwords you generated in the MailChannels Customer Console.

 AuthInfo:smtp.mailchannels.net "U:MailChannelsSMTPUsername" "P:MailChannelsSMTPPassword" "M:PLAIN" 
Do not use your MailChannels Customer Console user name in the Sendmail configuration. The MailChannels Customer Console user name is different than the MailChannels Outbound Filtering authentication user name that you will specify in /etc/mail/access.

Define Smart Host
This section sets up MailChannels Outbound Filtering as the smart host to relay all outbound emails. You should add code lines 1,3, and 4 around line 2 as shown below by editing /etc/mail/sendmail.mc.

define(`SMART_HOST', `smtp.mailchannels.net')dnl
FEATURE(`access_db')dnl 
define(`RELAY_MAILER_ARGS', `TCP $h 25')dnl
define(`ESMTP_MAILER_ARGS', `TCP $h 25')dnl
Be sure to comment out the FEATURE(`access_db', , `skip')dnl line in the file as shown below.

# FEATURE(`access_db', , `skip')dnl 
Adding Headers
An authenticated sender header is required to track sender reputation within the MailChannels system. To add the authenticated sender header to outgoing emails, append the following line of code just before the MAILER DEFINITIONS section in /etc/mail/sendmail.mc.

LOCAL_CONFIG 
HX-AuthUser: ${auth_authen} 
X-AuthUser headers will be added only if the users are authenticated. When there are no headers, MailChannels Outbound Filtering treats these as forwarded mails so different policies are applied.

Updating sendmail.cf and access.db files
You must run these commands as a super user (su) or root. This is required to ensure that the changes are compiled and added to the Sendmail configuration files.  

$ cd /etc/mail 
$ m4 sendmail.mc >sendmail.cf 
$ makemap hash access < access 
On older distributions, you can restart Sendmail with the following command:

$ /etc/init.d/sendmail restart
If you are using a newer version, type the following to restart:

$ service sendmail restart

Configure your mail server
Avatar Sridhar Kakkillaya August 14, 2023 11:09 
How It Works

Send your email through MailChannels Outbound Filtering by configuring a "smart host" in your mail server.
MailChannels delivers your email to your recipient, removes spam, and manages IP blocklisting on your behalf.
When we find a spammer in your system, we notify you at an email address you configure.
Sender Authentication

To improve our ability to deliver your email reliably, your system needs to tell our system which user, script, or system was responsible for each message.
A header is inserted in to each message. This X-Auth header often contains the authenticated sender address but can contain any unique identifier which you can use locate the responsible sending entity.
Choose the applicable Mail Server set up guide from the following list of supported MTAs:

MTA Configurations

If your mail server is not on this list, chances are you will be able to find smart host setup instructions in your mail server's documentation or by asking our support team for assistance.

Important points to keep in mind:

Use TLS encryption (do not use "SSL" encryption)
TLS encrypted connections from your Mail Server to MailChannels is a requirement begining June 30th, 2023.
The host name of the relay server is "smtp.mailchannels.net"
The user name is the SMTP username we assigned you
The password is the password we assigned you (Login to your Host Console and navigate to Settings > Account > SMTP Passwords)
The port is "25" unless disabled in your network, then please choose 587, or 2525 as an alternative port.
Once you have completed setting up your Mail Server, move to the next and final step and configure some service monitors in your Host Console. We notify you of potential compromise and abuse by sending email or automated webhook type notification alerts to help keep your system healthy. By removing compromised accounts quickly, spammers are not allowed to continue making SMTP connections outbound and driving up your service invoice with overage charges.

end emails with custom SMTP
If you're using Supabase Auth with the following configuration:

Email and password accounts
Passwordless accounts using one-time passwords or links sent over email (OTP, magic link, invites)
Email-based user invitations from the Users page or from the Auth admin APIs
Social login with email confirmation
You will need to set up a custom SMTP server to handle the delivery of messages to your users.

To get you started and let you explore and set up email message templates for your application, Supabase provides a simple SMTP server for all projects. This server imposes a few important restrictions and is not meant for production use.

Send messages only to pre-authorized addresses.

Unless you configure a custom SMTP server for your project, Supabase Auth will refuse to deliver messages to addresses that are not part of the project's team. You can manage this in the Team tab of the organization's settings.

For example, if your project's organization has these member accounts person-a@example.com, person-b@example.com and person-c@example.com then Supabase Auth will only send messages to these addresses. All other addresses will fail with the error message Email address not authorized.

Significant rate-limits that can change over time.

To maintain the health and reputation of the default SMTP sending service, the number of messages your project can send is limited and can change without notice. Currently this value is set to 2 messages per hour.

No SLA guarantee on message delivery or uptime for the default SMTP service.

The default SMTP service is provided as best-effort only and intended for the following non-production use cases:

Exploring and getting started with Supabase Auth
Setting up and testing email templates with the members of the project's team
Building toy projects, demos or any non-mission-critical application
We urge all customers to set up custom SMTP server for all other use cases.

How to set up a custom SMTP server?#
Supabase Auth works with any email sending service that supports the SMTP protocol. First you will need to choose a service, create an account (if you already do not have one) and obtain the SMTP server settings and credentials for your account. These include: the SMTP server host, port, user and password. You will also need to choose a default From address, usually something like no-reply@example.com.

A non-exhaustive list of services that work with Supabase Auth is:

Resend
AWS SES
Postmark
Twilio SendGrid
ZeptoMail
Brevo
Once you've set up your account with an email sending service, head to the Authentication settings page to enable and configure custom SMTP.

Once you save these settings, your project's Auth server will send messages to all addresses. To protect the reputation of your newly set up service a low rate-limit of 30 messages per hour is imposed. To adjust this to an acceptable value for your use case head to the Rate Limits configuration page.

Dealing with abuse: How to maintain the sending reputation of your SMTP server?#
As you make your application known to the public and it grows in popularity, you can expect to see a few types of abuse that can negatively impact the reputation of your sending domain.

A common source of abuse is bots or attackers signing up users to your application.

They use lists of known email addresses to sign up users to your project with pre-determined passwords. These can vary in scale and intensity: sometimes the bots slowly send sign up requests over many months, or they send a lot of requests at once.

Usually the goal for this behavior is:

To negatively affect your email sending reputation, after which they might ask for a ransom promising to stop the behavior.
To cause a short-term or even long-term Denial of Service attack on your service, by preventing new account creation, sign ins with magic links or one-time passwords, or to severely impact important security flows in your application (such as reset password or forgot password).
To force you to reduce the security posture of your project, such as by disabling email confirmations. At that point, they may target specific or a broad number of users by creating an account in their name. Then they can use social engineering techniques to trick them to use your application in such a way that both attacker and victim have access to the same account.
Mitigation strategies:

Configure CAPTCHA protection for your project, which is the most effective way to control bots in this scenario. You can use CAPTCHA services which provide invisible challenges where real users won't be asked to solve puzzles most of the time.
Prefer social login (OAuth) or SSO with SAML instead of email-based authentication flows in your apps.
Prefer passwordless authentication (one-time password) as this limits the attacker's value to gain from this behavior.
Do not disable email confirmations under pressure.
Additional best practices#
Set up and maintain DKIM, DMARC and SPF configurations.

Work with your email sending service to configure DKIM, DMARC and SPF for your sending domain. This will significantly increase the deliverability of your messages.

Set up a custom domain.

Authentication messages often contain links to your project's Auth server. Setting up a custom domain will reduce the likelihood of your messages being picked up as spam due to another Supabase project's bad reputation.

Don't mix Auth emails with marketing emails.

Use separate services for Auth and marketing messages. If the reputation of one falls, it won't affect your whole application or operation.

This includes:

Use a separate sending domain for authentication -- auth.example.com and a separate domain for marketing marketing.example.com.
Use a separate From address -- no-reply@auth.example.com vs no-reply@marketing.example.com.
Have another SMTP service set up on stand-by.

In case the primary SMTP service you're using is experiencing difficulty, or your account is under threat of being blocked due to spam, you have another service to quickly turn to.

Use consistent branding and focused content.

Make sure you've separated out authentication messages from marketing messages.

Don't include promotional content as part of authentication messages.
Avoid talking about what your application is inside authentication messages. This can be picked up by automated spam filters which will classify the message as marketing and increase its chances of being regarded as spam. This problem is especially apparent if your project is related to: Web3, Blockchain, AI, NFTs, Gambling, Pornography.
Avoid taglines or other short-form marketing material in authentication messages.
Reduce the number of links and call-to-actions in authentication messages.
Change the authentication messages templates infrequently. Prefer a single big change over multiple smaller changes.
Avoid A/B testing content in authentication messages.
Use a separate base template (HTML) from your marketing messages.
Avoid the use of email signatures in authentication messages. If you do, make sure the signatures are different in style and content from your marketing messages.
Use short and to-the-point subject lines. Avoid or reduce the number of emojis in subjects.
Reduce the number of images placed in authentication messages.
Avoid including user-provided data such as names, usernames, email addresses or salutations in authentication messages. If you do, make sure they are sanitized.
Prepare for large surges ahead of time.

If you are planning on having a large surge of users coming at a specific time, work with your email sending service to adjust the rate limits and their expectations accordingly. Most email sending services dislike spikes in the number of messages being sent, and this may affect your sending reputation.

Consider implementing additional protections for such events:

Build a queuing or waitlist system instead of allowing direct sign-up, which will help you control the number of messages being sent from the email sending service.
Disable email-based sign ups for the event and use social login only. Alternatively you can deprioritize the email-based sign-up flows for the event by hiding them in the UI or making them harder to reach.
Use the Send Email Auth Hook for more control.

If you need more control over the sending process, instead of using a SMTP server you can use the Send Email Auth Hook. This can be useful in advanced scenarios such as:

You want to use React or a different email templating engine.
You want to use an email sending service that does not provide an SMTP service, or the non-SMTP API is more powerful.
You want to queue up messages instead of sending them immediately, in an effort to smooth out spikes in email sending or do additional filtering (avoid repetitive messages).
You want to use multiple email sending services to increase reliability (if primary service is unavailable, use backup service automatically).
You want to use different email sending services based on the email address or user data (e.g. service A for users in the USA, service B for users in the EU, service C for users in China).
You want to add or include additional email headers in messages, for tracking or other reasons.
You want to add attachments to the messages (generally not recommended).
You want to add S/MIME signatures to messages.
You want to use an email server not open to the Internet, such as some corporate or government mail servers.
Increase the duration of user sessions.

Having short lived user sessions can be problematic for email sending, as it forces active users to sign-in frequently, increasing the number of messages needed to be sent. Consider increasing the maximum duration of user sessions. If you do see an unnecessary increase in logins without a clear cause, check your frontend application for bugs.

If you are using a SSR framework on the frontend and are seeing an increased number of user logins without a clear cause, check your set up. Make sure to keep the @supabase/ssr package up to date and closely follow the guides we publish. Make sure that the middleware components of your SSR frontend works as intended and matches the guides we've published. Sometimes a misplaced return or conditional can cause early session terminatio

Please place your instruction files in this directory for reference.
