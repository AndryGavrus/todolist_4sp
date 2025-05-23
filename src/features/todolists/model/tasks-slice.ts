import { createSlice, nanoid } from "@reduxjs/toolkit"
import { createTodolistAC, deleteTodolistAC } from "./todolists-slice"

export const tasksSlice = createSlice({
  name: "tasks",
  initialState: {} as TasksState,
  reducers: create => ({
    deleteTaskAC: create.reducer<{ todolistId: string; taskId: string }>((state, action) => {
      const tasks = state[action.payload.todolistId]
      const index = tasks.findIndex((task) => task.id === action.payload.taskId)
      if (index !== -1) {
        tasks.splice(index, 1)
      }
    }),
    createTaskAC: create.reducer<{ todolistId: string; title: string }>((state, action) => {
      const newTask: Task = { title: action.payload.title, isDone: false, id: nanoid() }
      state[action.payload.todolistId].unshift(newTask)
    }),
    changeTaskStatusAC: create.reducer<{ todolistId: string; taskId: string; isDone: boolean }>((state, action) => {
      const task = state[action.payload.todolistId].find((task) => task.id === action.payload.taskId)
      if (task) {
        task.isDone = action.payload.isDone
      }
    }),
    changeTaskTitleAC: create.reducer<{ todolistId: string; taskId: string; title: string }>((state, action) => {
      const task = state[action.payload.todolistId].find((task) => task.id === action.payload.taskId)
      if (task) {
        task.title = action.payload.title
      }
    })
  }),
  extraReducers: builder => {
    builder
      .addCase(createTodolistAC, (state, action) => {
        state[action.payload.id] = []
      })
      .addCase(deleteTodolistAC, (state, action) => {
        delete state[action.payload.id]
      })
  },
  selectors: { selectTasks: state => state }
})

export const { changeTaskStatusAC, changeTaskTitleAC, createTaskAC, deleteTaskAC } = tasksSlice.actions
export const tasksReducer = tasksSlice.reducer
export const {selectTasks} = tasksSlice.selectors

// export const changeTaskTitleAC = createAction<{ todolistId: string; taskId: string; title: string }>(
//   "tasks/changeTaskTitle",
// )

// const initialState: TasksState = {}

// export const tasksReducer = createReducer(initialState, (builder) => {
//   builder
// .addCase(deleteTaskAC, (state, action) => {
//   const tasks = state[action.payload.todolistId]
//   const index = tasks.findIndex((task) => task.id === action.payload.taskId)
//   if (index !== -1) {
//     tasks.splice(index, 1)
//   }
//     })
// .addCase(createTaskAC, (state, action) => {
//   const newTask: Task = { title: action.payload.title, isDone: false, id: nanoid() }
//   state[action.payload.todolistId].unshift(newTask)
// })
// .addCase(changeTaskStatusAC, (state, action) => {
//   const task = state[action.payload.todolistId].find((task) => task.id === action.payload.taskId)
//   if (task) {
//     task.isDone = action.payload.isDone
//   }
// })
// .addCase(changeTaskTitleAC, (state, action) => {
//   const task = state[action.payload.todolistId].find((task) => task.id === action.payload.taskId)
//   if (task) {
//     task.title = action.payload.title
//   }
// })
// .addCase(createTodolistAC, (state, action) => {
//   state[action.payload.id] = []
// })
// .addCase(deleteTodolistAC, (state, action) => {
//   delete state[action.payload.id]
// })
// })

export type Task = {
  id: string
  title: string
  isDone: boolean
}

export type TasksState = Record<string, Task[]>
