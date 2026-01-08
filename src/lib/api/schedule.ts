import axiosInstance from '@/lib/api/axiosInstance';

export const fetchTimeVoteStats = async (studyId: number) => {
  const { data } = await axiosInstance.get(
    `/api/studies/${studyId}/time-vote/periods/stats`
  );
  return data.data;
};

export const fetchTimeVoteSubmissions = async (studyId: number) => {
  const { data } = await axiosInstance.get(
    `/api/studies/${studyId}/time-vote/periods/submissions`
  );
  return data.data;
};

export const checkMyRoleInStudy = async (studyId: number) => {
  const { data } = await axiosInstance.get(`/api/studies/${studyId}/me`);
  return data.data;
};

export const fetchMyTimeVote = async (studyId: number) => {
  const { data } = await axiosInstance.get(
    `/api/studies/${studyId}/time-vote/votes`
  );
  return data.data;
};

export const postMyTimeVote = async (
  studyId: number,
  timeMasks: {
    date: string;
    timeMask: number;
  }[]
) => {
  const { data } = await axiosInstance.post(
    `/api/studies/${studyId}/time-vote/votes`,
    { timeMasks }
  );
  return data;
};

export const putMyTimeVote = async (
  studyId: number,
  timeMasks: {
    date: string;
    timeMask: number;
  }[]
) => {
  const { data } = await axiosInstance.put(
    `/api/studies/${studyId}/time-vote/votes`,
    { timeMasks }
  );
  return data;
};

export const deleteMyTimeVote = async (studyId: number) => {
  const { data } = await axiosInstance.delete(
    `/api/studies/${studyId}/time-vote/votes`
  );
  return data;
};

export const setTimeVotePeriods = async (
  studyId: number,
  startDate: string,
  endDate: string
) => {
  const { data } = await axiosInstance.post(
    `/api/studies/${studyId}/time-vote/periods`,
    { startDate, endDate }
  );
  return data;
};
