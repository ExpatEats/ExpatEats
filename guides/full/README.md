# PDF Guide Files

This directory stores the full PDF guide files that users can purchase and view.

## Adding PDF Files

To test the guide viewer system:

1. Add PDF files to this directory
2. Ensure the filename matches the `url` field in the `guides` database table
3. For example, for the test guide: `test-guide.pdf`

## Current Test Guides in Database

- `test-guide.pdf` - Test guide for development
- `lisbon-food-guide.pdf` - Lisbon food guide

## Security

- PDF files are served through authenticated API endpoints only
- Files in this directory should NOT be publicly accessible
- Users must have purchased a guide to view it (or be an admin)
