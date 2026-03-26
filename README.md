# NexusSaaS - Premium SaaS Starter Template

A modern, conversion-focused SaaS landing page and user application built with **HTML**, **Tailwind CSS**, and **Supabase**. This template includes a full authentication flow (Sign Up, Email Verification, and Sign In) and a professional user dashboard.

## 🚀 Features

- **Conversion-Optimized Landing Page**: A premium, responsive landing page with Lucide icons and sleek animations.
- **Full Authentication Flow**: 
    - **Sign Up**: User registration with auto-sync to a custom profile table.
    - **Email Verification**: Powered by Supabase Auth (automatic emails).
    - **Sign In**: Secure login with session protection.
- **Premium User Dashboard**: A professional interface with a sidebar, user profile data infusion, and usage statistics.
- **Database Architecture**: Includes RLS (Row Level Security) and a verification sync trigger for accurate user status.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS (via CDN).
- **Icons**: Lucide Icons.
- **Backend/Auth/DB**: Supabase (PostgreSQL + Auth).
- **Server**: Node.js & Express (Static file server).

## 📋 Setup Instructions

### 1. Supabase Backend Setup

Run the following SQL in your **Supabase SQL Editor** to create the necessary tables and triggers:

```sql
-- Create Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Allow public insert" on public.profiles for insert with check (true);
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);

-- Verification Sync Trigger
create or replace function public.handle_verification_sync()
returns trigger as $$
begin
  if (old.email_confirmed_at is null and new.email_confirmed_at is not null) then
    update public.profiles set verified = true where id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_verified
  after update on auth.users
  for each row execute procedure public.handle_verification_sync();
```

### 2. Local Installation

```bash
# Install dependencies
npm install

# Start the server
npm start
```

Your app will be running at [http://localhost:3005](http://localhost:3005).

## 📄 Project Structure

- `public/index.html`: Main landing page.
- `public/signup.html`: User registration page.
- `public/signin.html`: User login page.
- `public/dashboard.html`: Secure user dashboard.
- `public/js/script.js`: Unified frontend auth and database logic.
- `server.js`: Express server to handle static routing.

## 🔒 License

This project is licensed under the MIT License.
