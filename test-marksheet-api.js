// Test script to verify marksheet API functionality
// Run with: node test-marksheet-api.js

const testMarksheetAPI = async () => {
  const baseURL = 'http://localhost:3000';
  
  try {
    console.log('🧪 Testing Marksheet API...\n');
    
    // Test 1: Fetch students
    console.log('1. Testing GET /api/admin/students');
    const studentsResponse = await fetch(`${baseURL}/api/admin/students`);
    const studentsData = await studentsResponse.json();
    
    if (studentsData.success && studentsData.data) {
      console.log('✅ Students API working');
      console.log(`   Found ${studentsData.data.length} students`);
    } else {
      console.log('❌ Students API failed:', studentsData.error);
      return;
    }
    
    // Test 2: Fetch marksheets
    console.log('\n2. Testing GET /api/admin/marksheets');
    const marksheetsResponse = await fetch(`${baseURL}/api/admin/marksheets`);
    const marksheetsData = await marksheetsResponse.json();
    
    if (marksheetsData.success) {
      console.log('✅ Marksheets API working');
      console.log(`   Found ${marksheetsData.data?.length || 0} marksheets`);
    } else {
      console.log('❌ Marksheets API failed:', marksheetsData.error);
    }
    
    // Test 3: Create a sample marksheet (if we have students)
    if (studentsData.data && studentsData.data.length > 0) {
      const sampleStudent = studentsData.data[0];
      
      console.log('\n3. Testing POST /api/admin/marksheets');
      const sampleMarksheet = {
        studentId: sampleStudent._id,
        examTitle: 'Test Exam',
        examType: 'Unit Test',
        examDate: '2024-01-15',
        subjects: [
          {
            subject: 'Mathematics',
            fullMarks: 100,
            passMarks: 33,
            assignmentMarks: 20,
            theoryMarks: 75,
            obtainedMarks: 95,
            grade: 'Diamond',
            remark: 'Excellent'
          },
          {
            subject: 'English',
            fullMarks: 100,
            passMarks: 33,
            assignmentMarks: 18,
            theoryMarks: 70,
            obtainedMarks: 88,
            grade: 'Gold',
            remark: 'Very Good'
          }
        ],
        generatedBy: 'test-admin'
      };
      
      const createResponse = await fetch(`${baseURL}/api/admin/marksheets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sampleMarksheet)
      });
      
      const createData = await createResponse.json();
      
      if (createData.success) {
        console.log('✅ Marksheet creation working');
        console.log(`   Created marksheet with ID: ${createData.data._id}`);
      } else {
        console.log('❌ Marksheet creation failed:', createData.error);
      }
    }
    
    console.log('\n🎉 API testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure your Next.js server is running on port 3000');
    console.log('   Run: npm run dev');
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  testMarksheetAPI();
}

module.exports = { testMarksheetAPI };