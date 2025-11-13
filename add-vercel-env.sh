#!/bin/bash

# Script to add environment variables to Vercel
# Usage: ./add-vercel-env.sh

echo "Adding environment variables to Vercel..."

# Read .env file and add each variable
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  [[ "$key" =~ ^#.*$ ]] && continue
  [[ -z "$key" ]] && continue
  
  # Remove quotes from value
  value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//')
  
  echo "Adding $key..."
  echo "$value" | vercel env add "$key" production
  
done < .env

echo "Done! All environment variables added."
echo ""
echo "Now run: vercel --prod"
