# Troubleshooting

## Common Errors

### "Authentication Failed"
Your session may have expired. Log out and log back in. If using the CLI, run `example-cli login` again. Check that your API key is valid at Settings > API Keys.

### "Rate Limit Exceeded"
You've exceeded your plan's API call limit. Check your usage at Settings > Usage. Upgrade to a higher plan for more calls, or wait until your limit resets on the 1st of the month.

### "Project Not Found"
The project may have been deleted or you may not have access. Check with your team admin. If using the CLI, make sure you're in the correct directory and the project ID is correct.

### "Build Failed"
Check the build logs at Projects > [Your Project] > Builds. Common causes:
- Missing dependencies (run `npm install` first)
- Environment variables not set (check Settings > Environment)
- Syntax errors in configuration files

## Connectivity Issues

If you can't reach the dashboard:
1. Check our status page at status.example.com
2. Try clearing your browser cache and cookies
3. Disable browser extensions that might interfere
4. Try a different browser or incognito mode

## Browser Compatibility

We support the latest two versions of Chrome, Firefox, Safari, and Edge. Internet Explorer is not supported.

## Contacting Support

- Email: support@example.com (response within 4 hours on Pro, 1 hour on Enterprise)
- Live chat: Available on Pro and Enterprise plans, weekdays 9am-6pm EST
- Community forum: community.example.com (free for all users)
