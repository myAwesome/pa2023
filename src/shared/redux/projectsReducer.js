export const IN_PROGRESS_LOADED = '@post/IN_PROGRESS_LOADED';
export const PROJECT_LOADED = '@post/PROJECT_LOADED';
export const TASKS_LOADED = '@post/TASKS_LOADED';

const initialState = {
  inProgress: [],
  projects: {},
  tasks: {},
  tasksByStatus: {},
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case IN_PROGRESS_LOADED:
      return { ...state, inProgress: action.payload.data };
    case PROJECT_LOADED:
      return {
        ...state,
        projects: { ...state.projects, [action.payload.data.id]: action.payload.data },
      };
    case TASKS_LOADED:
      const tasksByStatus = {
        incoming: [],
        todo: [],
        in_progress: [],
        done: [],
      };
      action.payload.data.forEach((task) => {
        tasksByStatus[task.status].push({
          id: task.id,
          body: task.body,
          status: task.status,
          created_at: task.created_at,
          priority: task.priority,
          outcome: task.outcome,
        });
      });
      return {
        ...state,
        tasks: { ...state.tasks, [action.payload.id]: action.payload.data },
        tasksByStatus: { ...state.tasksByStatus, [action.payload.id]: tasksByStatus },
      };
    default:
      return state;
  }
};

export default reducer;
