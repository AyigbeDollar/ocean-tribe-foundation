// Script to create the gallery bucket in Supabase
// Run this with: node create-gallery-bucket.js

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createGalleryBucket() {
  try {
    console.log('Creating gallery bucket...');
    
    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('gallery', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('Gallery bucket already exists!');
      } else {
        console.error('Error creating bucket:', error);
        return;
      }
    } else {
      console.log('Gallery bucket created successfully!');
    }

    // Test the bucket by trying to list files
    const { data: files, error: listError } = await supabase.storage
      .from('gallery')
      .list();

    if (listError) {
      console.error('Error listing files from bucket:', listError);
    } else {
      console.log('Bucket is accessible. Current files:', files?.length || 0);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createGalleryBucket();
