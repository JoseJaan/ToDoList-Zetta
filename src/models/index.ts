import User from './User';
import Task, { TaskStatus } from './Task';
import PasswordReset from './PasswordReset';

User.hasMany(Task, {
  foreignKey: 'userId',
  as: 'tasks'
});

Task.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(PasswordReset, { 
    foreignKey: 'userId', 
    as: 'passwordResets' 
});

PasswordReset.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

export { User, Task, TaskStatus, PasswordReset};
