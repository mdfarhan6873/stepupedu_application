import mongoose from 'mongoose';

// Schema for individual subject marks
const SubjectMarkSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  fullMarks: { type: Number, required: true },
  passMarks: { type: Number, required: true },
  assignmentMarks: { type: Number, default: 0 },
  theoryMarks: { type: Number, default: 0 },
  obtainedMarks: { type: Number, required: true },
  grade: { type: String, required: true },
  remark: { type: String, default: '' }
}, { _id: false });

// Main student marksheet schema
const StudentMarksheetSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  studentName: { type: String, required: true },
  rollNumber: { type: String, required: true },
  class: { type: String, required: true },
  section: { type: String, required: true },
  
  // Exam details
  examTitle: { type: String, required: true },
  examType: { type: String, required: true },
  examDate: { type: Date, required: true },
  
  // Subject wise marks
  subjects: [SubjectMarkSchema],
  
  // Calculated values (auto-calculated in pre-save middleware)
  totalMarks: { type: Number, default: 0 },
  obtainedMarks: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  grade: { type: String, default: 'C' },
  division: { type: String, default: '1st' },
  rank: { type: String, default: '' }, // Student rank as string field
  
  // Additional info
  principalSignature: { type: String, default: '' }, // URL/path to signature image
  classTeacherSignature: { type: String, default: '' },
  parentSignature: { type: String, default: '' },
  
  // Metadata
  generatedBy: { 
    type: String, 
    required: true 
  },
  generatedDate: { type: Date, default: Date.now },
  
  // Institution details
  schoolName: { type: String, default: 'StepUp Education Institute' },
  schoolLogo: { type: String, default: '/logo.png' },
  schoolAddress: { type: String, default: 'Amber, Shekhana Kalan, Sekhana Kala, BiharSharif, Bihar 803101' },
  schoolPhone: { type: String, default: '9262801624' }
  
}, {
  timestamps: true
});

// Calculate grade based on percentage
StudentMarksheetSchema.methods.calculateGrade = function() {
  const percentage = this.percentage;

  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 0) return 'C';
  return 'C';
};

// Calculate division based on percentage
StudentMarksheetSchema.methods.calculateDivision = function() {
  const percentage = this.percentage;
  
  if (percentage >= 75) return '1st Division';
  if (percentage >= 60) return '2nd Division';
  if (percentage >= 0) return '3rd Division';
  return '3rd Division';
};

// Pre-save middleware to calculate values
StudentMarksheetSchema.pre('save', function(next) {
  if (this.subjects && this.subjects.length > 0) {
    this.totalMarks = this.subjects.reduce((sum, subject) => sum + subject.fullMarks, 0);
    this.obtainedMarks = this.subjects.reduce((sum, subject) => sum + subject.obtainedMarks, 0);
    this.percentage = Math.round((this.obtainedMarks / this.totalMarks) * 100);
    
    // Calculate grade based on percentage
    const percentage = this.percentage;
    if (percentage >= 90) this.grade = 'A+';
    else if (percentage >= 80) this.grade = 'A';
    else if (percentage >= 70) this.grade = 'B+';
    else if (percentage >= 60) this.grade = 'B';
    else if (percentage >= 0) this.grade = 'C';
    else this.grade = 'C';
    
    // Calculate division based on percentage
    if (percentage >= 75) this.division = '1st Division';
    else if (percentage >= 60) this.division = '2nd Division';
    else if (percentage >= 0) this.division = '3rd Division';
    else this.division = '3rd Division';
  }
  next();
});

export default mongoose.models.StudentMarksheet || mongoose.model('StudentMarksheet', StudentMarksheetSchema);