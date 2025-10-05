-- Fix admin profile issue
-- This migration ensures that existing users have profiles with admin role

-- First, let's see what users exist without profiles
DO $$
DECLARE
    user_record RECORD;
    admin_email TEXT := 'admin@example.com'; -- Change this to your admin email
BEGIN
    -- Loop through all users in auth.users who don't have profiles
    FOR user_record IN 
        SELECT au.id, au.email 
        FROM auth.users au 
        LEFT JOIN public.profiles p ON au.id = p.user_id 
        WHERE p.user_id IS NULL
    LOOP
        -- Create profile for user
        INSERT INTO public.profiles (user_id, first_name, last_name, role)
        VALUES (
            user_record.id,
            COALESCE(user_record.email, 'User'),
            '',
            CASE 
                WHEN user_record.email = admin_email THEN 'admin'
                ELSE 'viewer'
            END
        );
        
        RAISE NOTICE 'Created profile for user: % with role: %', 
            user_record.email, 
            CASE 
                WHEN user_record.email = admin_email THEN 'admin'
                ELSE 'viewer'
            END;
    END LOOP;
END $$;

-- Update existing profiles to ensure admin role is set correctly
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id IN (
    SELECT au.id 
    FROM auth.users au 
    WHERE au.email = 'admin@example.com' -- Change this to your admin email
);

-- Create a function to easily create admin users
CREATE OR REPLACE FUNCTION create_admin_user(
    user_email TEXT,
    user_password TEXT DEFAULT 'admin123456'
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Create user in auth.users (this will trigger handle_new_user)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        user_email,
        crypt(user_password, gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"first_name": "Admin", "last_name": "User", "role": "admin"}',
        FALSE,
        '',
        '',
        '',
        ''
    ) RETURNING id INTO new_user_id;
    
    RETURN 'Admin user created with ID: ' || new_user_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION create_admin_user(TEXT, TEXT) TO postgres;

-- Create a function to check and fix user profiles
CREATE OR REPLACE FUNCTION fix_user_profiles() RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    fixed_count INTEGER := 0;
BEGIN
    -- Loop through all users in auth.users who don't have profiles
    FOR user_record IN 
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au 
        LEFT JOIN public.profiles p ON au.id = p.user_id 
        WHERE p.user_id IS NULL
    LOOP
        -- Create profile for user
        INSERT INTO public.profiles (user_id, first_name, last_name, role)
        VALUES (
            user_record.id,
            COALESCE(user_record.raw_user_meta_data->>'first_name', 'User'),
            COALESCE(user_record.raw_user_meta_data->>'last_name', ''),
            COALESCE(user_record.raw_user_meta_data->>'role', 'viewer')
        );
        
        fixed_count := fixed_count + 1;
    END LOOP;
    
    RETURN 'Fixed ' || fixed_count || ' user profiles';
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION fix_user_profiles() TO postgres;

-- Run the fix function
SELECT fix_user_profiles();
