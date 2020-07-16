import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { KeyManager } from "@stellar/wallet-sdk";
import { storePrivateKey, CreateKeyManagerResponse } from "helpers/keyManager";

export const storePrivateKeyThunk = createAsyncThunk<
  CreateKeyManagerResponse,
  string,
  { rejectValue: RejectMessage }
>("keyManagerThunk", async (secret: string, { rejectWithValue }) => {
  let result;
  try {
    result = await storePrivateKey(secret);
  } catch (error) {
    return rejectWithValue({
      errorMessage: error.response?.detail || error.toString(),
    });
  }
  return result;
});

interface RejectMessage {
  errorMessage: string;
}

interface InitialState {
  keyManager?: KeyManager;
  id: string;
  password: string;
  errorMessage?: string;
}

const initialState: InitialState = {
  keyManager: undefined,
  id: "",
  password: "",
  errorMessage: undefined,
};

const keyStoreSlice = createSlice({
  name: "keyStore",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(storePrivateKeyThunk.pending, () => ({
      ...initialState,
    }));
    builder.addCase(storePrivateKeyThunk.fulfilled, (state, action) => ({
      ...state,
      keyManager: action.payload.keyManager,
      id: action.payload.id,
      password: action.payload.password,
    }));
    builder.addCase(storePrivateKeyThunk.rejected, (state, action) => ({
      ...state,
      keyManager: undefined,
      errorMessage: action?.payload?.errorMessage,
    }));
  },
});

export const { reducer } = keyStoreSlice;
