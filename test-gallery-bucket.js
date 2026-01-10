// Test script to diagnose Gallery bucket issues
// Run with: node test-gallery-bucket.js

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGalleryBucket() {
  console.log('Testing Gallery bucket access...\n');

  try {
    // Test 1: List bucket contents
    console.log('1. Testing bucket list access...');
    const { data: files, error: listError } = await supabase.storage
      .from('gallery')
      .list('', { limit: 5 });

    if (listError) {
      console.error('❌ List error:', listError);
    } else {
      console.log('✅ List successful. Files found:', files?.length || 0);
    }

    // Test 2: Check bucket info
    console.log('\n2. Testing bucket info...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Buckets list error:', bucketsError);
    } else {
      const galleryBucket = buckets?.find(b => b.name === 'gallery');
      if (galleryBucket) {
        console.log('✅ Gallery bucket found:', {
          id: galleryBucket.id,
          name: galleryBucket.name,
          public: galleryBucket.public,
          created_at: galleryBucket.created_at
        });
      } else {
        console.log('❌ Gallery bucket not found in buckets list');
        console.log('Available buckets:', buckets?.map(b => b.name) || []);
      }
    }

    // Test 3: Try to upload a small test file
    console.log('\n3. Testing file upload...');
    const testContent = 'test content';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(testFileName, testBlob);

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
    } else {
      console.log('✅ Upload successful:', uploadData);
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('gallery')
        .remove([testFileName]);
      
      if (deleteError) {
        console.log('⚠️  Could not delete test file:', deleteError);
      } else {
        console.log('✅ Test file cleaned up');
      }
    }

    // Test 4: Check RLS policies
    console.log('\n4. Checking user authentication...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ User auth error:', userError);
    } else if (user) {
      console.log('✅ User authenticated:', {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'not set'
      });
    } else {
      console.log('❌ No authenticated user');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testGalleryBucket();
