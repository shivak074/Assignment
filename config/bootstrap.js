const { Admin } = require('../models/index');

const createAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({
      where: { email: 'shiva1234@gmail.com' },
    });

    if (!existingAdmin) {
      const newAdmin = await Admin.create({
        name: 'shiva',
        email: 'shiva1234@gmail.com',
        password: 'shiva1234',
      });
    } 
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

createAdmin();
