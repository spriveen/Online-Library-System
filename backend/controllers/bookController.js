import Issue from "../models/Issue.js";
import User from "../models/User.js";
import FindSetting from "../models/FindSetting.js";

// Helper function
const getLocalIsoDate = (value = new Date()) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}; 


const getStartOfDay = (value) => new Date(new Date(value).setHours(0, 0, 0, 0));

const getDiffInDays = (targetDateString) => 
  Math.round((getStartOfDay(targetDateString) - getStartOfDay(new Date())) / 86400000);

const getOverdueUnits = (overdueDays, interval) => {
  if (overdueDays <= 0) return 0;
  const divisor = { week: 7, month: 30, year: 365 }[interval] || 1;
  return Math.ceil(overdueDays / divisor);
};

// 1. Issue manual book to a student
export async function issueManualBooks (req, res) {
    try {
        const { studentDetails, books} = req.body;
        if(!Array.isArray(books) || books.length === 0) {
            return res.status(400).json({message: "No book were entered"})
        }

        const student = await User.findOne({rollNo: studentDetails.rollNumber});
        if (!student) return res.status(404).json({
            success: false,
            message: "Student not found"
        }) ;
        const todayIso = getLocalIsoDate();
        const validBooks = books.filter(b => b.title && b.bookCode && b.dueDate);
          if(validBooks.length === 0){
            return res.status(400).json({
                message: "Plaese add at least one valid mnaual book entry with book code and a due date"
            });
          }


            const createdIssues = await Promise.all(validBooks.map(book => Issue.create({
      source: "manual",
      bookCode: book.bookCode.trim(),
      title: book.title.trim(),
      userEmail: student.email,
      userName: student.name,
      issuedOn: todayIso,
      dueDate: book.dueDate,
      returnedOn: null,
      fineRate: Number(book.fineRate ?? req.body.fineRate ?? 10),
      fineInterval: book.fineInterval ?? req.body.fineInterval ?? "day",
      manualFine: 0,
      fineCleared: false,
      clearedFineAmount: 0,
      department: studentDetails.department?.trim() || student.department || "General",
      stream: studentDetails.stream?.trim() || student.stream || "General",
      year: studentDetails.academicYear?.trim() || student.year || "1st Year",
      semester: studentDetails.semester?.trim() || student.semester || "Semester 1",
      rollNumber: studentDetails.rollNumber?.trim() || student.rollNo || "Not assigned",
      studentId: student.rollNo || `ST-${student._id.toString().slice(-4)}`
    })));

    res.status(201).json({
        success: true,
        message: `${createdIssues.length} manual book issues successfully!`,
        count: createdIssues.length,
        issues: createdIssues
    })

    } 
    
    catch (error) {
        console.error("Error issuing manual books:", error);
        res.status(500).json({
            message: "Error issuing manual books", error: error.message
        })
    }
}

// 2 Get all manual issues (Admin)
export async function getIssues(req,res){
    try {
       const issues = await Issue.find({}).sort({createdAt:1});
       res.status(200).json({
        success: true,
        issue
    }) 
    } 
    
    catch (error) {
        console.error("Error fetching manual issues:", error);
        res.status(500).json({
            message: "Error fetching manual issues", error: error.message
        })
    }
}

// 3 Get manual issue for logged-in students
export async function getStudentIssues(req,res){
    try {
      const issues = await Issue.find({
        userEmail: req.user.email.toLowerCase().trim()
      }) .sort({
        createdAt: -1 }) ;
        res.status(200).json({sucess: true, issues})
    } 
    
     catch (error) {
        console.error("Error fetching student issues:", error);
        res.status(500).json({
            message: "Error fetching student issues", error: error.message
        })
    }
}

// Return issued manual books
export async function returnBook(req,res) {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({message: "Issue record not found"});

        if (issue.returnedOn) return res.status(400).json({
            message: "Book already returned"
        });
        issue.returnedOn = getLocalIsoDate();
        await issue.save();
        res.status(200).json({
            success: true,
            message: "Book returned sucessfully!",
            issue
        });
    } 
    
    catch (error) {
        console.error("Error returning manual book:", error);
        res.status(500).json({
            message: "Error returning manual book", error: error.message
        })
    }
}

//  5. Apply manuka fine

export async  function applyFine(req,res){
    try {
      const findAmount = Number(req.body.amount);
      if(Number.isNaN(findAmount)) return res.status(404).json({
        message: "Invalid fine amount"
      });
      const issue = await Issue.findById(req.param.id);
      if(!issue) return res.status(404).json({ message: "Issue record not found"});

      issue.manualFine = fineAmount;
      if(findAmount > 0) issue.fineCleared = false;
      await issue.save();

      res.status(200).json({
        success: true,
        message: "Manualfine applied sucessfully!",
        issue
      })

    } 
    
    catch (error) {
        console.error("Error applying manual fine:", error);
        res.status(500).json({
            message: "Error applying manual fine", error: error.message
        })
    }
}