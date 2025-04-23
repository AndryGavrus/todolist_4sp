import { todolistsApi } from "@/features/todolists/api/todolistsApi.ts"
import type { Todolist } from "@/features/todolists/api/todolistsApi.types.ts"
import { createAsyncThunk, createSlice, nanoid } from "@reduxjs/toolkit"

export const todolistsSlice = createSlice({
  name: "todos",
  initialState: [
    // {id:1, title: 'sadasd'}
  ] as DomainTodolist[],
  selectors: {
    selectTodolists: (state) => state,
  },
  reducers: (create) => ({
    deleteTodolistAC: create.reducer<{ id: string }>((state, action) => {
      const index = state.findIndex((todolist) => todolist.id === action.payload.id)
      if (index !== -1) {
        state.splice(index, 1)
      }
    }),
    changeTodolistFilterAC: create.reducer<{ id: string; filter: FilterValues }>((state, action) => {
      const todolist = state.find((todolist) => todolist.id === action.payload.id)
      if (todolist) {
        todolist.filter = action.payload.filter
      }
    }),
    createTodolistAC: create.preparedReducer(
      (title: string) => {
        const newTodolist: DomainTodolist = {
          title,
          id: nanoid(),
          filter: "all",
          order: 1,
          addedDate: "",
        }
        return {
          payload: newTodolist,
        }
      },
      (state, action) => {
        debugger
        state.push(action.payload)
      },
    ),
  }),
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodolistsTC.fulfilled, (_state, action) => {
        return action.payload.todolists.map((todolist) => ({ ...todolist, filter: "all" }))
      })
      .addCase(fetchTodolistsTC.rejected, () => {
        // alert(action.payload.message)
      })
      .addCase(changeTodolistTitleTC.fulfilled, (state, action) => {
        const index = state.findIndex((todolist) => todolist.id === action.payload.id)
        if (index !== -1) {
          state[index].title = action.payload.title
        }
      })
  },
})

export const fetchTodolistsTC = createAsyncThunk(
  `${todolistsSlice.name}/fetchTodolistsTC`,
  async (_, { rejectWithValue }) => {
    try {
      const res = await todolistsApi.getTodolists()
      return { todolists: res.data }
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const changeTodolistTitleTC = createAsyncThunk(
  `${todolistsSlice.name}/changeTodolistTitleTC`,
  async (args: { id: string; title: string }, { rejectWithValue }) => {
    try {
      await todolistsApi.changeTodolistTitle(args)
      return args
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const todolistsReducer = todolistsSlice.reducer
export const { deleteTodolistAC, changeTodolistFilterAC, createTodolistAC } = todolistsSlice.actions
export const { selectTodolists } = todolistsSlice.selectors

export type DomainTodolist = Todolist & { filter: FilterValues }

export type FilterValues = "all" | "active" | "completed"
