# Getting Started

## Creating an Account

Sign up at app.example.com with your email address. You'll receive a verification email within 2 minutes. Click the link to activate your account.

You can also sign up with Google or GitHub by clicking the social login buttons on the signup page.

## First Steps After Signup

1. Complete your profile by adding your name and company
2. Create your first project from the dashboard
3. Invite team members via Settings > Team
4. Connect your first integration (Slack, GitHub, or Jira)

## Dashboard Overview

The dashboard shows your active projects, recent activity, and usage metrics. The left sidebar has navigation for Projects, Team, Integrations, Billing, and Settings.

## Installing the CLI

```bash
npm install -g example-cli
example-cli login
```

The CLI requires Node.js 18 or later. After logging in, your credentials are stored locally at `~/.example/config.json`.

## Creating Your First Project

```bash
example-cli project create my-project
```

Or from the dashboard: click "New Project", enter a name, and select a template. Templates include Blank, Starter, and Enterprise.
