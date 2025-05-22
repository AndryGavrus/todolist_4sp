import type { RootState } from "@/app/store"
import type { TasksState } from "./tasks-slice"

export const selectTasks = (state: RootState): TasksState => state.tasks
