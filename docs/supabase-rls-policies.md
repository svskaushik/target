# Supabase RLS Policies Setup

This document outlines the Row Level Security (RLS) policies required for the Target Sheet app to function properly.

## Overview

The app uses Supabase's Row Level Security to ensure users can only access their own data. Each table has a `user_id` column that stores the authenticated user's ID from Supabase Auth.

## Required Policies

### 1. Targets Table

First, enable RLS on the targets table:

```sql
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
```

Then create the following policies:

#### SELECT Policy
Allow users to view only their own targets:
```sql
CREATE POLICY "Users can view their own targets" ON targets
FOR SELECT USING ( (SELECT auth.uid()) = user_id );
```

#### INSERT Policy
Allow users to create targets for themselves:
```sql
CREATE POLICY "Users can create their own targets" ON targets
FOR INSERT WITH CHECK ( (SELECT auth.uid()) = user_id );
```

#### UPDATE Policy
Allow users to update only their own targets:
```sql
CREATE POLICY "Users can update their own targets" ON targets
FOR UPDATE 
USING ( (SELECT auth.uid()) = user_id )
WITH CHECK ( (SELECT auth.uid()) = user_id );
```

#### DELETE Policy
Allow users to delete only their own targets:
```sql
CREATE POLICY "Users can delete their own targets" ON targets
FOR DELETE USING ( (SELECT auth.uid()) = user_id );
```

### 2. Sessions Table

Enable RLS:
```sql
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
```

Create policies:

#### SELECT Policy
```sql
CREATE POLICY "Users can view their own sessions" ON sessions
FOR SELECT USING ( (SELECT auth.uid()) = user_id );
```

#### INSERT Policy
```sql
CREATE POLICY "Users can create their own sessions" ON sessions
FOR INSERT WITH CHECK ( (SELECT auth.uid()) = user_id );
```

#### UPDATE Policy
```sql
CREATE POLICY "Users can update their own sessions" ON sessions
FOR UPDATE 
USING ( (SELECT auth.uid()) = user_id )
WITH CHECK ( (SELECT auth.uid()) = user_id );
```

#### DELETE Policy
```sql
CREATE POLICY "Users can delete their own sessions" ON sessions
FOR DELETE USING ( (SELECT auth.uid()) = user_id );
```

### 3. Shot Placements Table

Enable RLS:
```sql
ALTER TABLE shot_placements ENABLE ROW LEVEL SECURITY;
```

Create policies:

#### SELECT Policy
```sql
CREATE POLICY "Users can view their own shot placements" ON shot_placements
FOR SELECT USING ( (SELECT auth.uid()) = user_id );
```

#### INSERT Policy
```sql
CREATE POLICY "Users can create their own shot placements" ON shot_placements
FOR INSERT WITH CHECK ( (SELECT auth.uid()) = user_id );
```

#### UPDATE Policy
```sql
CREATE POLICY "Users can update their own shot placements" ON shot_placements
FOR UPDATE 
USING ( (SELECT auth.uid()) = user_id )
WITH CHECK ( (SELECT auth.uid()) = user_id );
```

#### DELETE Policy
```sql
CREATE POLICY "Users can delete their own shot placements" ON shot_placements
FOR DELETE USING ( (SELECT auth.uid()) = user_id );
```

## Implementation Steps

1. Open your Supabase project dashboard
2. Go to the SQL editor
3. Run the SQL commands above for each table
4. Test the policies by trying to create/read/update/delete data through the app

## Performance Considerations

- Ensure `user_id` columns are indexed for efficient policy checks:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_targets_user_id ON targets(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_shot_placements_user_id ON shot_placements(user_id);
  ```

## Testing RLS Policies

After implementing the policies, test them by:

1. Signing in with different users
2. Attempting to create targets
3. Verifying users can only see their own data
4. Confirming 403 errors are resolved

## Troubleshooting

- **403 Forbidden errors**: Usually indicate missing or incorrect RLS policies
- **No data returned**: Check if RLS is enabled and policies are correctly applied
- **Performance issues**: Ensure proper indexing on `user_id` columns

## Notes

- These policies ensure data isolation between users
- The `auth.uid()` function returns the authenticated user's ID from the JWT token
- All policies use the permissive model (default behavior)
- Policies are automatically enforced for all database operations through the Supabase client
