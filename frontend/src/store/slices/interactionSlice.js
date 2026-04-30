import { createSlice } from '@reduxjs/toolkit';

const interactionSlice = createSlice({
  name: 'interaction',
  initialState: {
    current: {},
    extracted: {}
  },
  reducers: {
    setInteraction: (state, action) => {
      state.current = action.payload;
    },
    setExtracted: (state, action) => {
      state.extracted = action.payload;
    }
  },
});

export const { setInteraction, setExtracted } = interactionSlice.actions;
export default interactionSlice.reducer;