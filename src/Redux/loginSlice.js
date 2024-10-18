import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    user: null,
    loading: false,
    error: null,
    pipelines: [],
    branches: [],
    products: [],
    productNames: [],
    leadType: [],
};

// Thunk to handle user login
export const loginApi = createAsyncThunk(
    'user/login',
    async (values, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/users/login`, {
                email: values.email,
                password: values.password,
            });

            // Fetch related data after successful login
            await dispatch(fetchPipelines());
            await dispatch(fetchBranches());
            await dispatch(fetchAllProducts());
            await dispatch(fetchProductNames());
            await dispatch(fetchLeadType()); // Dispatch fetchLeadType here
            return response.data;

        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Thunk to fetch pipelines data
export const fetchPipelines = createAsyncThunk(
    'pipeline/fetchPipelines',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/pipelines/get-pipelines`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Thunk to fetch Branches data
export const fetchBranches = createAsyncThunk(
    'branches/fetchBranches',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/branch/get-branches`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Thunk to fetch Products stages data
export const fetchAllProducts = createAsyncThunk(
    'products/fetchAllProducts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/products/get-all-products`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Thunk to fetch Products Names data
export const fetchProductNames = createAsyncThunk(
    'productNames/fetchProductNames',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/products/get-all-products`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Thunk to fetch Lead Type data
export const fetchLeadType = createAsyncThunk(
    'leadType/fetchLeadType',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/leadtypes/get-all-leadtypes`);
            console.log(response.data, 'responsefetch')
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const loginSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.loading = false;
            state.error = null;
            state.pipelines = [];
            state.branches = [];
            state.products = [];
            state.productNames = [];
            state.leadType = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginApi.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginApi.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(loginApi.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchPipelines.fulfilled, (state, action) => {
                state.pipelines = action.payload;
            })
            .addCase(fetchPipelines.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(fetchBranches.fulfilled, (state, action) => {
                state.branches = action.payload;
            })
            .addCase(fetchBranches.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(fetchAllProducts.fulfilled, (state, action) => {
                state.products = action.payload;
            })
            .addCase(fetchAllProducts.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(fetchProductNames.fulfilled, (state, action) => {
                state.productNames = action.payload;
            })
            .addCase(fetchProductNames.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(fetchLeadType.fulfilled, (state, action) => {
                state.leadType = action.payload; // Corrected to assign leadType
            })
            .addCase(fetchLeadType.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { logout } = loginSlice.actions;

export default loginSlice.reducer;
