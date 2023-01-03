import { Application } from '../declarations';
import users from './users/users.service';
import wish from './wish/wish.service';
import lastTime from './last-time/last-time.service';
import periods from './periods/periods.service';
import note from './note/note.service';
import noteCategory from './note-category/note-category.service';
import transaction from './transaction/transaction.service';
import transactionCategory from './transaction-category/transaction-category.service';
import projects from './projects/projects.service';
import tasks from './tasks/tasks.service';
import posts from './posts/posts.service';
import postLabels from './post-labels/post-labels.service';
import labels from './labels/labels.service';
import comments from './comments/comments.service';
import countdown from './countdown/countdown.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(users);
  app.configure(wish);
  app.configure(lastTime);
  app.configure(periods);
  app.configure(note);
  app.configure(noteCategory);
  app.configure(transaction);
  app.configure(transactionCategory);
  app.configure(projects);
  app.configure(tasks);
  app.configure(posts);
  app.configure(postLabels);
  app.configure(labels);
  app.configure(comments);
  app.configure(countdown);
}
