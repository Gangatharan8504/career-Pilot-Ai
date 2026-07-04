import User from '../models/User.js';
import Resume from '../models/Resume.js';
import Progress from '../models/Progress.js';

export async function getAllStudents(req, res) {
  try {
    const adminUserId = req.headers['x-user-id'];
    if (!adminUserId) {
      return res.status(400).json({ error: 'User ID is required in headers.' });
    }

    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }

    // Load all users registered as students
    const students = await User.find({ role: 'student' }).select('name email isVerified createdAt');

    const studentDataList = [];
    for (const student of students) {
      const studentId = student._id.toString();
      
      const resume = await Resume.findOne({ userId: studentId }).select('atsScore');
      const progress = await Progress.findOne({ userId: studentId }).select('interviewScore studyDays streak');

      studentDataList.push({
        id: studentId,
        name: student.name,
        email: student.email,
        isVerified: student.isVerified,
        createdAt: student.createdAt,
        resumeScore: resume ? resume.atsScore : 0,
        interviewScore: progress ? progress.interviewScore : 0,
        studyDays: progress ? progress.studyDays : 0,
        streak: progress ? progress.streak : 0
      });
    }

    return res.status(200).json({
      totalStudents: studentDataList.length,
      students: studentDataList
    });

  } catch (err) {
    console.error('Error fetching admin student list:', err);
    return res.status(500).json({ error: 'Server error retrieving students data.' });
  }
}
