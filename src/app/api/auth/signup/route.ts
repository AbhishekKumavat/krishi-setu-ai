import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, password, username, displayName, isFarmer = false, region } = await request.json();

    // Validate input
    if (!email || !password || !username || !displayName || !region) {
      return NextResponse.json(
        { error: 'Email, password, username, displayName, and region are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const userType = isFarmer ? 'farmer' : 'customer';

    // Create the new user in Supabase
    const { data: storedUser, error } = await supabase
      .from('users')
      .insert([{
        email,
        username,
        display_name: displayName,
        password_hash: passwordHash,
        role: userType,
        region: region || '',
        is_verified: false
      }])
      .select()
      .single();

    if (error || !storedUser) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: `Failed to create user in database: ${error?.message || JSON.stringify(error) || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Return success response with the created user (excluding sensitive data)
    return NextResponse.json(
      {
        message: 'User registered successfully!',
        user: {
          id: storedUser.id,
          email: storedUser.email,
          username: storedUser.username,
          name: storedUser.display_name,
          role: storedUser.role,
          region: storedUser.region,
          isVerified: storedUser.is_verified,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}