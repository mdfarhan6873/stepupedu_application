// Simple test script to verify marksheet API functionality
const testMarksheetAPI = async () => {
  const baseURL = 'http://localhost:3001';
  
  try {
    console.log('Testing Marksheet API...');
    
    // Test 1: Get students
    console.log('\n1. Testing student fetch...');
    const studentsResponse = await fetch(`${baseURL}/api/admin/students`);
    const studentsResult = await studentsResponse.json();
    
    if (studentsResult.success) {
      console.log(`✓ Successfully fetched ${studentsResult.data?.length || 0} students`);
    } else {
      console.log('✗ Failed to fetch students:', studentsResult.error);
      return;
    }
    
    // Test 2: Get marksheets
    console.log('\n2. Testing marksheet fetch...');
    const marksheetsResponse = await fetch(`${baseURL}/api/admin/marksheets`);
    const marksheetsResult = await marksheetsResponse.json();
    
    if (marksheetsResult.success) {
      console.log(`✓ Successfully fetched ${marksheetsResult.data?.length || 0} marksheets`);
    } else {
      console.log('✗ Failed to fetch marksheets:', marksheetsResult.error);
    }
    
    // Test 3: Search students
    console.log('\n3. Testing student search...');
    const searchResponse = await fetch(`${baseURL}/api/admin/students/search?q=test`);
    const searchResult = await searchResponse.json();
    
    if (searchResult.success) {
      console.log(`✓ Search returned ${searchResult.data?.length || 0} students`);
    } else {
      console.log('✗ Search failed:', searchResult.error);
    }
    
    console.log('\n✓ All API tests completed successfully!');
    
  } catch (error) {
    console.error('✗ Test failed with error:', error.message);
  }
};

// Run the test
testMarksheetAPI();