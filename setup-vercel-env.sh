#!/bin/bash

# Add all required Appwrite environment variables to Vercel

echo "🚀 Adding environment variables to Vercel Production..."
echo ""

# Collection IDs (using default names as IDs)
echo "📦 Adding Collection IDs..."
echo "surveys" | vercel env add NEXT_PUBLIC_APPWRITE_SURVEYS_COLLECTION_ID production
echo "questions" | vercel env add NEXT_PUBLIC_APPWRITE_QUESTIONS_COLLECTION_ID production
echo "options" | vercel env add NEXT_PUBLIC_APPWRITE_OPTIONS_COLLECTION_ID production
echo "enumerators" | vercel env add NEXT_PUBLIC_APPWRITE_ENUMERATORS_COLLECTION_ID production
echo "respondents" | vercel env add NEXT_PUBLIC_APPWRITE_RESPONDENTS_COLLECTION_ID production
echo "sessions" | vercel env add NEXT_PUBLIC_APPWRITE_SESSIONS_COLLECTION_ID production
echo "responses" | vercel env add NEXT_PUBLIC_APPWRITE_RESPONSES_COLLECTION_ID production
echo "answers" | vercel env add NEXT_PUBLIC_APPWRITE_ANSWERS_COLLECTION_ID production

# Storage Bucket ID
echo ""
echo "🗄️  Adding Storage Bucket ID..."
echo "survey-files" | vercel env add NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID production

# Optional settings
echo ""
echo "⚙️  Adding optional settings..."
echo "production" | vercel env add NODE_ENV production

echo ""
echo "✅ Done! All environment variables added to Vercel."
echo ""
echo "📝 Next steps:"
echo "1. Verify variables: https://vercel.com/patrags-projects/geospasial-dental-modeler/settings/environment-variables"
echo "2. Deploy to production: vercel --prod"
echo ""
