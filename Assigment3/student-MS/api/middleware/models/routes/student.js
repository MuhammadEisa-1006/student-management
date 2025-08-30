const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// helpers for sorting
const allowedSort = { name: 'name', gpa: 'gpa' };
const allowedOrder = { asc: 1, desc: -1 };

/** GET /students
 * Query:
 *  - search: string (matches name OR department)
 *  - department: string (exact)
 *  - sort: 'name' | 'gpa'
 *  - order: 'asc' | 'desc'
 */
router.get('/', async (req, res) => {
  try {
    const { search = '', department = '', sort = 'name', order = 'asc' } = req.query;

    const criteria = {};
    if (search) {
      criteria.$or = [
        { name: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }
    if (department) {
      criteria.department = department;
    }

    const sortObj = {};
    sortObj[allowedSort[sort] || 'name'] = allowedOrder[order] ?? 1;

    const students = await Student.find(criteria).sort(sortObj).lean();

    res.render('students', {
      title: 'Students',
      students,
      query: { search, department, sort, order },
      msg: req.query.msg || null
    });
  } catch (err) {
    res.status(500).render('layout', {
      title: 'Error',
      body: `<div class="container py-4"><h3>Error</h3><p>${err.message}</p></div>`
    });
  }
});

// GET /students/add (form)
router.get('/add', (req, res) => {
  res.render('addStudent', { title: 'Add Student', errors: [], data: {} });
});

// POST /students/add (create)
router.post('/add', async (req, res) => {
  try {
    const { name, rollNumber, email, department, gpa } = req.body;

    const errors = [];
    if (!name || !rollNumber || !email || !department) errors.push('All fields except GPA are required.');
    if (gpa && (Number(gpa) < 0 || Number(gpa) > 4)) errors.push('GPA must be between 0 and 4.');

    if (errors.length) {
      return res.status(400).render('addStudent', {
        title: 'Add Student',
        errors,
        data: req.body
      });
    }

    await Student.create({
      name,
      rollNumber: Number(rollNumber),
      email,
      department,
      gpa: gpa === '' ? undefined : Number(gpa)
    });

    res.redirect('/students?msg=Student%20added%20successfully');
  } catch (err) {
    let message = err.message;
    // Mongoose unique errors
    if (err.code === 11000) {
      if (err.keyPattern?.rollNumber) message = 'Roll Number must be unique.';
      if (err.keyPattern?.email) message = 'Email must be unique.';
    }
    res.status(400).render('addStudent', {
      title: 'Add Student',
      errors: [message],
      data: req.body
    });
  }
});

// GET /students/:id (details)
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).lean();
    if (!student) return res.status(404).render('layout', {
      title: 'Not found',
      body: `<div class="container py-4"><h3>Not found</h3></div>`
    });
    res.render('studentDetails', { title: 'Student Details', student });
  } catch (err) {
    res.status(400).render('layout', {
      title: 'Error',
      body: `<div class="container py-4"><h3>Error</h3><p>${err.message}</p></div>`
    });
  }
});

// GET /students/edit/:id
router.get('/edit/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).lean();
    if (!student) return res.redirect('/students?msg=Student%20not%20found');
    res.render('editStudent', { title: 'Edit Student', errors: [], data: student });
  } catch (err) {
    res.redirect('/students?msg=' + encodeURIComponent(err.message));
  }
});

// POST /students/edit/:id (update)
router.post('/edit/:id', async (req, res) => {
  try {
    const { name, rollNumber, email, department, gpa } = req.body;

    const errors = [];
    if (!name || !rollNumber || !email || !department) errors.push('All fields except GPA are required.');
    if (gpa && (Number(gpa) < 0 || Number(gpa) > 4)) errors.push('GPA must be between 0 and 4.');

    if (errors.length) {
      return res.status(400).render('editStudent', {
        title: 'Edit Student',
        errors,
        data: { ...req.body, _id: req.params.id }
      });
    }

    await Student.findByIdAndUpdate(req.params.id, {
      name,
      rollNumber: Number(rollNumber),
      email,
      department,
      gpa: gpa === '' ? undefined : Number(gpa)
    }, { runValidators: true });

    res.redirect('/students?msg=Student%20updated%20successfully');
  } catch (err) {
    let message = err.message;
    if (err.code === 11000) {
      if (err.keyPattern?.rollNumber) message = 'Roll Number must be unique.';
      if (err.keyPattern?.email) message = 'Email must be unique.';
    }
    res.status(400).render('editStudent', {
      title: 'Edit Student',
      errors: [message],
      data: { ...req.body, _id: req.params.id }
    });
  }
});

// POST /students/delete/:id
router.post('/delete/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.redirect('/students?msg=Student%20deleted');
  } catch (err) {
    res.redirect('/students?msg=' + encodeURIComponent(err.message));
  }
});

module.exports = router;
