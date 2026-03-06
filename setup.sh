#!/bin/bash

echo "🚀 Setting up NITK Nexus..."
echo "----------------------------------------"

# 1. Check for Node.js
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js (v18+) and try again."
    exit 1
fi
echo "✅ Node.js is installed: $(node -v)"

# 2. Check for pnpm and install if missing
if ! command -v pnpm &> /dev/null
then
    echo "⚠️ pnpm is not installed. Installing pnpm globally..."
    npm install -g pnpm
else
    echo "✅ pnpm is installed: $(pnpm -v)"
fi

# 3. Install dependencies
echo "📦 Installing project dependencies via pnpm..."
pnpm install

# 4. Set up environment variables
echo "⚙️ Setting up environment variables..."
if [ -f .env.local ]; then
    echo "✅ .env.local already exists. Preserving your credentials."
else
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo "✅ Created .env.local from .env.example."
    else
        # Create a new .env.local template since .env.example doesn't exist
        echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here" > .env.local
        echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here" >> .env.local
        echo "✅ Created a new .env.local template."
    fi
    echo "⚠️ IMPORTANT: Please open .env.local and update it with your actual Supabase URL and Anon Key."
fi

echo "----------------------------------------"
echo "✨ Setup complete!"
echo "To start the development server, run:"
echo "  pnpm dev"
