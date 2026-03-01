import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Board from '../models/Board.js';
import Column from '../models/Column.js';
import Task from '../models/Task.js';
import connectDB from '../config/database.js';

dotenv.config();

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
  },
];

const projects = [
  {
    name: 'Website Redesign',
    description: 'Complete redesign of the company website with modern UI/UX',
  },
  {
    name: 'Mobile App Development',
    description: 'Build a cross-platform mobile app for iOS and Android',
  },
];

const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await Task.deleteMany();
    await Column.deleteMany();
    await Board.deleteMany();
    await Project.deleteMany();
    await User.deleteMany();

    // Create users
    console.log('Creating users...');
    const createdUsers = await User.create(users);
    const adminUser = createdUsers[0];
    const johnUser = createdUsers[1];
    const janeUser = createdUsers[2];

    console.log(`Created ${createdUsers.length} users`);

    // Create projects
    console.log('Creating projects...');
    const createdProjects = [];

    for (const projectData of projects) {
      const project = await Project.create({
        ...projectData,
        owner: adminUser._id,
        members: [
          { user: adminUser._id, role: 'admin' },
          { user: johnUser._id, role: 'member' },
          { user: janeUser._id, role: 'member' },
        ],
      });
      createdProjects.push(project);

      // Create default board for each project
      const board = await Board.create({
        name: 'Main Board',
        description: 'Default project board',
        project: project._id,
        isDefault: true,
      });

      // Create columns
      const columns = await Column.create([
        {
          name: 'Todo',
          board: board._id,
          project: project._id,
          order: 0,
          taskIds: [],
        },
        {
          name: 'In Progress',
          board: board._id,
          project: project._id,
          order: 1,
          taskIds: [],
        },
        {
          name: 'Done',
          board: board._id,
          project: project._id,
          order: 2,
          taskIds: [],
        },
      ]);

      // Create sample tasks
      const todoColumn = columns[0];
      const inProgressColumn = columns[1];
      const doneColumn = columns[2];

      const tasks = await Task.create([
        {
          title: 'Design homepage mockup',
          description: 'Create a modern homepage design with Figma',
          priority: 'high',
          status: 'todo',
          column: todoColumn._id,
          board: board._id,
          project: project._id,
          createdBy: adminUser._id,
          assignee: johnUser._id,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Set up project repository',
          description: 'Initialize Git repository and set up CI/CD pipeline',
          priority: 'high',
          status: 'done',
          column: doneColumn._id,
          board: board._id,
          project: project._id,
          createdBy: adminUser._id,
          assignee: adminUser._id,
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Research competitors',
          description: 'Analyze top 5 competitors and document findings',
          priority: 'medium',
          status: 'in-progress',
          column: inProgressColumn._id,
          board: board._id,
          project: project._id,
          createdBy: johnUser._id,
          assignee: janeUser._id,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Write documentation',
          description: 'Create comprehensive API documentation',
          priority: 'low',
          status: 'todo',
          column: todoColumn._id,
          board: board._id,
          project: project._id,
          createdBy: janeUser._id,
          assignee: johnUser._id,
        },
      ]);

      // Update column taskIds
      todoColumn.taskIds = [tasks[0]._id, tasks[3]._id];
      inProgressColumn.taskIds = [tasks[2]._id];
      doneColumn.taskIds = [tasks[1]._id];

      await Promise.all(columns.map(col => col.save()));

      console.log(`Created board with ${columns.length} columns and ${tasks.length} tasks for project: ${project.name}`);
    }

    console.log(`\n✅ Data imported successfully!`);
    console.log(`\nYou can now log in with:`);
    console.log(`  Email: admin@example.com`);
    console.log(`  Password: password123`);
    console.log(`\nOr use any of these accounts:`);
    createdUsers.forEach(user => {
      console.log(`  ${user.email} / password123`);
    });

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    console.log('Destroying data...');
    await Task.deleteMany();
    await Column.deleteMany();
    await Board.deleteMany();
    await Project.deleteMany();
    await User.deleteMany();

    console.log('✅ Data destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run script
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
