import { createAsyncThunk, createSlice, nanoid } from "@reduxjs/toolkit"
import { todolistsApi } from "../api/todolistsApi"
import { Todolist } from "../api/todolistsApi.types"

export const todolistsSlice = createSlice({
  name: "todolists",
  initialState: [] as DomainTodolist[],
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodolistsTC.fulfilled, (state, action) => {
        action.payload?.todolists.forEach((tl) => {
          state.push({ ...tl, filter: "all" })
        })
      })
      .addCase(fetchTodolistsTC.rejected, (state, action) => {
        // обработка ошибки при запросе за тудулистами
      })
      .addCase(changeTodolistTitleTC.fulfilled, (state, action) => {
        const index = state.findIndex((todolist) => todolist.id === action.payload.id)
        if (index !== -1) {
          state[index].title = action.payload.title
        }
      })
      .addCase(changeTodolistTitleTC.rejected, (state, action) => {
        // обработка ошибки при запросе за тудулистами
      })
      .addCase(createTodolistTC.fulfilled, (state, action) => {
        state.unshift({ ...action.payload.todolist, filter: "all" })
      })
      .addCase(createTodolistTC.rejected, (state, action) => {
        // обработка ошибки при запросе за тудулистами
      })
      .addCase(deleteTodolistTC.fulfilled, (state, action) => {
        const index = state.findIndex((todolist) => todolist.id === action.payload.id)
      if (index !== -1) {
        state.splice(index, 1)
      }
      })
      .addCase(deleteTodolistTC.rejected, (state, action) => {
        // обработка ошибки при запросе за тудулистами
      })
  },
  reducers: (create) => ({
    changeTodolistFilterAC: create.reducer<{ id: string; filter: FilterValues }>((state, action) => {
      const todolist = state.find((todolist) => todolist.id === action.payload.id)
      if (todolist) {
        todolist.filter = action.payload.filter
      }
    }),
  }),
  selectors: { selectTodolists: (state) => state },
})

export const fetchTodolistsTC = createAsyncThunk(`${todolistsSlice.name}/fetchTodolistsTC`, async (_, thunkAPI) => {
  try {
    const res = await todolistsApi.getTodolists()
    return { todolists: res.data }
  } catch (error) {
    return thunkAPI.rejectWithValue(error)
  }
})

export const changeTodolistTitleTC = createAsyncThunk(
  `${todolistsSlice.name}/changeTodolistTitleTC`,
  async (payload: { id: string; title: string }, thunkAPI) => {
    try {
      await todolistsApi.changeTodolistTitle(payload)
      return payload
    } catch (error) {
      return thunkAPI.rejectWithValue(error)
    }
  },
)

export const createTodolistTC = createAsyncThunk(
  `${todolistsSlice.name}/createTodolistTC`,
  async (title: string, thunkAPI) => {
    try {
      const res = await todolistsApi.createTodolist(title)
      return { todolist: res.data.data.item }
    } catch (error) {
      return thunkAPI.rejectWithValue(error)
    }
  },
)

export const deleteTodolistTC = createAsyncThunk(
  `${todolistsSlice.name}/deleteTodolistTC`,
  async (id: string, thunkAPI) => {
    try {
      await todolistsApi.deleteTodolist(id)
      return { id }
    } catch (error) {
      return thunkAPI.rejectWithValue(error)
    }
  },
)

export const { changeTodolistFilterAC } = todolistsSlice.actions
export const todolistsReducer = todolistsSlice.reducer
export const { selectTodolists } = todolistsSlice.selectors

export type DomainTodolist = Todolist & {
  filter: FilterValues
}

export type FilterValues = "all" | "active" | "completed"
