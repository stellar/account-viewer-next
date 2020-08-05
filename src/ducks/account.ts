import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DataProvider, Types } from "@stellar/wallet-sdk";
import { getNetworkConfig } from "helpers/getNetworkConfig";
import { ActionStatus, RejectMessage } from "constants/types.d";
import { settingsSelector } from "ducks/settings";
import { RootState } from "config/store";
import { getErrorString } from "helpers/getErrorString";

let accountWatcherStopper: any;

export const fetchAccountAction = createAsyncThunk<
  Types.AccountDetails,
  string,
  { rejectValue: RejectMessage; state: RootState }
>(
  "account/fetchAccountAction",
  async (publicKey, { rejectWithValue, getState }) => {
    const { isTestnet } = settingsSelector(getState());

    const dataProvider = new DataProvider({
      serverUrl: getNetworkConfig(isTestnet).url,
      accountOrKey: publicKey,
      networkPassphrase: getNetworkConfig(isTestnet).network,
    });

    let stellarAccount: Types.AccountDetails | null = null;

    try {
      stellarAccount = await dataProvider.fetchAccountDetails();
    } catch (error) {
      return rejectWithValue({
        errorString: getErrorString(error),
      });
    }

    return stellarAccount;
  },
);

export const startAccountWatcherAction = createAsyncThunk<
  boolean,
  string,
  { rejectValue: RejectMessage; state: RootState }
>(
  "account/startAccountWatcherAction",
  (publicKey, { rejectWithValue, getState, dispatch }) => {
    try {
      const { isTestnet } = settingsSelector(getState());
      const { data } = accountSelector(getState());

      const dataProvider = new DataProvider({
        serverUrl: getNetworkConfig(isTestnet).url,
        accountOrKey: publicKey,
        networkPassphrase: getNetworkConfig(isTestnet).network,
      });

      accountWatcherStopper = dataProvider.watchAccountDetails({
        onMessage: (accountDetails: Types.AccountDetails) => {
          dispatch(updateAccountAction(accountDetails));
        },
        onError: () => {
          const errorString = "We couldn’t update your account at this time.";
          dispatch(updateAccountErrorAction({ errorString, data }));
        },
      });

      return true;
    } catch (error) {
      return rejectWithValue({
        errorString: getErrorString(error),
      });
    }
  },
);

interface AccountInitialState {
  data: Types.AccountDetails | null;
  isAuthenticated: boolean;
  isAccountWatcherStarted: boolean;
  status: ActionStatus | undefined;
  errorString?: string;
}

const initialState: AccountInitialState = {
  data: null,
  isAuthenticated: false,
  isAccountWatcherStarted: false,
  status: undefined,
  errorString: undefined,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    resetAccountAction: () => initialState,
    updateAccountAction: (state, action) => ({
      ...state,
      data: action.payload,
    }),
    updateAccountErrorAction: (state, action) => ({
      ...state,
      // TODO: temp solution to pass "data" until BigNumber issue is fixed
      data: action.payload.data,
      status: ActionStatus.ERROR,
      errorString: action.payload.errorString,
    }),
    stopAccountWatcherAction: () => {
      if (accountWatcherStopper) {
        accountWatcherStopper();
        accountWatcherStopper = undefined;
      }

      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAccountAction.pending, () => ({
      ...initialState,
      status: ActionStatus.PENDING,
    }));
    builder.addCase(fetchAccountAction.fulfilled, (state, action) => ({
      ...state,
      data: { ...action.payload },
      status: ActionStatus.SUCCESS,
      // If something went wrong, action.payload could be null. Just making
      // sure we have the response data to set isAuthenticated correctly.
      isAuthenticated: !!action.payload,
    }));
    builder.addCase(fetchAccountAction.rejected, (state, action) => ({
      ...state,
      data: null,
      status: ActionStatus.ERROR,
      errorString: action.payload?.errorString,
    }));

    // TODO: figure out why it breaks for BigNumber amount
    // @ts-ignore
    builder.addCase(startAccountWatcherAction.fulfilled, (state, action) => ({
      ...state,
      isAccountWatcherStarted: action.payload,
    }));

    // @ts-ignore
    builder.addCase(startAccountWatcherAction.rejected, (state, action) => ({
      ...state,
      status: ActionStatus.ERROR,
      errorString: action.payload?.errorString,
    }));
  },
});

export const accountSelector = (state: RootState) => state.account;

export const { reducer } = accountSlice;
export const {
  resetAccountAction,
  updateAccountAction,
  updateAccountErrorAction,
  stopAccountWatcherAction,
} = accountSlice.actions;
