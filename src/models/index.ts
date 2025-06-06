import User from './User';
import Task, { TaskStatus } from './Task';

User.hasMany(Task, {
  foreignKey: 'userId',
  as: 'tasks'
});

Task.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

export { User, Task, TaskStatus };
