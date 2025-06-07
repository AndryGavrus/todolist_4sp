import { setAppStatusAC } from "@/app/app-slice"
import { ResultCode } from "@/common/enums"
import { RequestStatus } from "@/common/types"
import { createAppSlice } from "@/common/utils"
import { handleServerAppError } from "@/common/utils/handleServerAppError"
import { handleServerNetworkError } from "@/common/utils/handleServerNetworkError"
import { todolistsApi } from "@/features/todolists/api/todolistsApi"
import type { Todolist } from "@/features/todolists/api/todolistsApi.types"

export const todolistsSlice = createAppSlice({
    name: "todolists",
    initialState: [] as DomainTodolist[],
    selectors: {
        selectTodolists: (state) => state,
    },
    reducers: (create) => ({
        fetchTodolistsTC: create.asyncThunk(
            async (_, { dispatch, rejectWithValue }) => {
                try {
                    dispatch(setAppStatusAC({ status: "loading" }))
                    const res = await todolistsApi.getTodolists()
                    dispatch(setAppStatusAC({ status: "succeeded" }))
                    return { todolists: res.data }
                } catch (error) {
                    dispatch(setAppStatusAC({ status: "failed" }))
                    return rejectWithValue(null)
                }
            },
            {
                fulfilled: (state, action) => {
                    action.payload?.todolists.forEach((tl) => {
                        state.push({
                            ...tl,
                            filter: "all",
                            entityStatus: "idle",
                        })
                    })
                },
            },
        ),
        createTodolistTC: create.asyncThunk(
            async (title: string, { dispatch, rejectWithValue }) => {
                try {
                    dispatch(setAppStatusAC({ status: "loading" }))
                    const res = await todolistsApi.createTodolist(title)
                    if (res.data.resultCode === ResultCode.Success) {
                        dispatch(setAppStatusAC({ status: "succeeded" }))
                        return { todolist: res.data.data.item }
                    }
                    handleServerAppError(res.data, dispatch)
                    return rejectWithValue(null)
                } catch (error: any) {
                    handleServerNetworkError(dispatch, error)
                    return rejectWithValue(null)
                }
            },
            {
                fulfilled: (state, action) => {
                    state.unshift({
                        ...action.payload.todolist,
                        filter: "all",
                        entityStatus: "idle",
                    })
                },
            },
        ),
        deleteTodolistTC: create.asyncThunk(
            async (id: string, { dispatch, rejectWithValue }) => {
                try {
                    dispatch(setAppStatusAC({ status: "loading" }))
                    dispatch(changeTodolistStatusAC({ id, status: "loading" }))
                    await todolistsApi.deleteTodolist(id)
                    dispatch(setAppStatusAC({ status: "succeeded" }))
                    dispatch(changeTodolistStatusAC({ id, status: "succeeded" }))
                    return { id }
                } catch (error) {
                    dispatch(setAppStatusAC({ status: "failed" }))
                    dispatch(changeTodolistStatusAC({ id, status: "failed" }))
                    return rejectWithValue(null)
                }
            },
            {
                fulfilled: (state, action) => {
                    const index = state.findIndex((todolist) => todolist.id === action.payload.id)
                    if (index !== -1) {
                        state.splice(index, 1)
                    }
                },
            },
        ),
        changeTodolistTitleTC: create.asyncThunk(
            async (payload: { id: string; title: string }, { dispatch, rejectWithValue }) => {
                try {
                    dispatch(setAppStatusAC({ status: "loading" }))
                    await todolistsApi.changeTodolistTitle(payload)
                    dispatch(setAppStatusAC({ status: "succeeded" }))
                    return payload
                } catch (error) {
                    dispatch(setAppStatusAC({ status: "failed" }))
                    return rejectWithValue(null)
                }
            },
            {
                fulfilled: (state, action) => {
                    const index = state.findIndex((todolist) => todolist.id === action.payload.id)
                    if (index !== -1) {
                        state[index].title = action.payload.title
                    }
                },
            },
        ),
        changeTodolistFilterAC: create.reducer<{ id: string; filter: FilterValues }>((state, action) => {
            const todolist = state.find((todolist) => todolist.id === action.payload.id)
            if (todolist) {
                todolist.filter = action.payload.filter
            }
        }),
        changeTodolistStatusAC: create.reducer<{ id: string; status: RequestStatus }>((state, action) => {
            const todolist = state.find((todolist) => todolist.id === action.payload.id)
            if (todolist) {
                todolist.entityStatus = action.payload.status
            }
        }),
    }),
})

export const { selectTodolists } = todolistsSlice.selectors
export const {
    fetchTodolistsTC,
    createTodolistTC,
    deleteTodolistTC,
    changeTodolistTitleTC,
    changeTodolistFilterAC,
    changeTodolistStatusAC,
} = todolistsSlice.actions
export const todolistsReducer = todolistsSlice.reducer

export type DomainTodolist = Todolist & {
    filter: FilterValues
    entityStatus: RequestStatus
}

export type FilterValues = "all" | "active" | "completed"
