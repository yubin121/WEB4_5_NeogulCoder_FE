'use client';

import React, { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import SetPeriodModal from './SetPeriodModal';
import { TimeVoteStatsType, TimeVoteSubmissionsType } from '@/types/schedule';
import { getSortedDates } from '@/utils/getSortedDates';
import {
  fetchTimeVoteStats,
  fetchMyTimeVote,
  postMyTimeVote,
  putMyTimeVote,
  fetchTimeVoteSubmissions,
} from '@/lib/api/schedule';
import { useParams } from 'next/navigation';
import TimeGridSkeleton from './TimeGridSkeleton';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Flag } from 'lucide-react';
import { hoursToMask } from '@/utils/getTimeMask';

type Cell = { day: number; hour: number };

export const HOURS_IN_DAY = 24 as const;
export const FULL_DAY_MASK: number = (1 << HOURS_IN_DAY) - 1;

export default function TimeGrid({
  isLeader,
  isOpenDeleteModal,
  initialTimeVoteStats,
  // setInitialTimeVoteStats,
  setTimeVoteSubmissions,
}: {
  isLeader: boolean;
  isOpenDeleteModal: boolean;
  initialTimeVoteStats: TimeVoteStatsType;
  // setInitialTimeVoteStats: (v: TimeVoteStatsType) => void;
  setTimeVoteSubmissions: (v: TimeVoteSubmissionsType) => void;
}) {
  const { id } = useParams();

  const currentDates = getSortedDates(
    initialTimeVoteStats.startDate,
    initialTimeVoteStats.endDate
  );
  const day = currentDates.weekdays;
  const date = currentDates.dates;
  const startDay = currentDates.startWeekday;

  const [nullDataIndex, setNullDataIndex] = useState<number[]>([]);

  // const [isLeader, setIsLeader] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [buttonState, setButtonState] = useState<
    '시간 제출' | '완료' | '시간 수정'
  >('시간 제출');

  const [isOpenPeriodModal, setIsOpenPeriodModal] = useState(false);

  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [totalTimeVoteStats, setTotalTimeVoteStats] = useState<
    TimeVoteStatsType['stats']
  >([]);
  const [myTimeVoteStats, setMyTimeVoteStats] = useState([]);
  const [anchorCell, setAnchorCell] = useState<Cell | null>(null);
  const isDragging = useRef(false);
  const isRemoving = useRef(false);
  const [voteMap, setVoteMap] = useState<Map<string, number>>(new Map());

  const handleClosePeriodModal = () => setIsOpenPeriodModal(false);

  const isSameCell = (a: Cell, b: Cell) => a.day === b.day && a.hour === b.hour;
  const isCellSelected = (cell: Cell) =>
    selectedCells.some((c) => isSameCell(c, cell));

  const addCell = (cell: Cell) => {
    setSelectedCells((prev) => (isCellSelected(cell) ? prev : [...prev, cell]));
  };

  const removeCell = (cell: Cell) => {
    setSelectedCells((prev) => prev.filter((c) => !isSameCell(c, cell)));
  };

  const handleMouseDown = (cell: Cell) => {
    if (!isEditing) return;
    isDragging.current = true;
    isRemoving.current = isCellSelected(cell);
    setAnchorCell(cell);
    if (isRemoving.current) {
      removeCell(cell);
    } else {
      addCell(cell);
    }
  };

  const handleMouseUp = (cell: Cell) => {
    if (!isEditing) return;
    isDragging.current = false;
    if (
      anchorCell &&
      !isSameCell(anchorCell, cell) &&
      anchorCell.day === cell.day
    ) {
      const minHour = Math.min(anchorCell.hour, cell.hour);
      const maxHour = Math.max(anchorCell.hour, cell.hour);
      const range = Array.from({ length: maxHour - minHour + 1 }, (_, i) => ({
        day: cell.day,
        hour: minHour + i,
      }));
      if (isRemoving.current) {
        const newSet = selectedCells.filter(
          (c) => !(c.day === cell.day && c.hour >= minHour && c.hour <= maxHour)
        );
        setSelectedCells(newSet);
      } else {
        const key = (c: Cell) => `${c.day}-${c.hour}`;
        const existing = new Map(selectedCells.map((c) => [key(c), c]));
        range.forEach((c) => {
          existing.set(key(c), c);
        });
        setSelectedCells(Array.from(existing.values()));
      }
    }
    setAnchorCell(null);
    isRemoving.current = false;
  };

  const handleMouseEnter = (cell: Cell) => {
    if (!isEditing || !isDragging.current || anchorCell?.day !== cell.day)
      return;
    if (isRemoving.current) {
      removeCell(cell);
    } else {
      addCell(cell);
    }
  };

  const getBgClass = (count: number) => {
    if (count >= 5) return 'bg-blue-700';
    if (count === 4) return 'bg-blue-500';
    if (count === 3) return 'bg-blue-400';
    if (count === 2) return 'bg-blue-300';
    if (count === 1) return 'bg-blue-100';
    return 'bg-[#fafafa] hover:bg-[#f1f1f1]';
  };

  const getNullDataIndex = () => {
    const indexArr = date.map((d, i) => (d.includes('n') ? i : -1));
    setNullDataIndex(indexArr);
  };

  const checkSubmitted = async () => {
    setIsLoading(true);
    try {
      const { timeSlots } = await fetchMyTimeVote(Number(id));
      const hasSubmitted = timeSlots.length !== 0 ? true : false;
      setHasSubmitted(hasSubmitted);
      if (!isEditing) setButtonState(hasSubmitted ? '시간 수정' : '시간 제출');
      else setButtonState('완료');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubmissions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTimeVoteSubmissions(Number(id));
      setTimeVoteSubmissions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getMyVotes = async () => {
    setIsLoading(true);
    try {
      const { timeSlots } = await fetchMyTimeVote(Number(id));
      setMyTimeVoteStats(timeSlots);
      console.log('myTimeVoteStats:', myTimeVoteStats);
      return timeSlots;
    } catch (e) {
      console.error(e);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const parseVoteDataToCells = (data: string[]) => {
    return data.map((iso) => {
      const d = dayjs(iso);
      const dayIndex = date.findIndex((ds) => ds === d.format('MM.DD'));
      console.log({ day: dayIndex, hour: d.hour() });
      return { day: dayIndex, hour: d.hour() };
    });
  };

  const checkYear = (dates: string[], startDate: string) => {
    const fullDateList: (string | null)[] = Array(7).fill(null);

    const base = dayjs(startDate);

    for (let i = 0; i < dates.length; i++) {
      const currentDate = base.add(i, 'day');
      const dayOfWeek = currentDate.day();
      fullDateList[dayOfWeek] = currentDate.format('YYYY-MM-DD');
    }

    return fullDateList;
  };

  const convertSelectedCellsToTime = (
    selectedCells: Cell[],
    dates: string[],
    startDate: string
  ) => {
    const fullDateList = checkYear(dates, startDate);
    console.log('fullDateList:', fullDateList);

    const sorted = [...selectedCells].sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return a.hour - b.hour;
    });
    console.log('sorted:', sorted);

    const timeMasks: {
      date: string;
      timeMask: number;
    }[] = [];

    const hourArray: Record<string, number[]> = {};

    sorted.forEach(({ day, hour }) => {
      const fullDate = fullDateList[day];
      if (!fullDate) return;

      if (!hourArray[fullDate]) {
        hourArray[fullDate] = [];
      }

      hourArray[fullDate].push(hour);
    });

    Object.entries(hourArray).forEach(([fullDate, hours]) => {
      timeMasks.push({
        date: fullDate,
        timeMask: hoursToMask(hours),
      });
    });

    // sorted.forEach(({ day, hour }) => {
    //   const fullDate = fullDateList[day];
    //   if (!fullDate) return;

    //   const time = dayjs(
    //     `${fullDate}T${hour.toString().padStart(2, '0')}:00:00`
    //   );
    //   timeMasks.push(time.format('YYYY-MM-DDTHH:mm:ss'));
    // });

    return timeMasks;
  };

  const refreshVoteStats = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTimeVoteStats(Number(id));
      setTotalTimeVoteStats(data.stats);
      // setInitialTimeVoteStats(data);

      const newMap = new Map<string, number>();
      data.stats.forEach((item: { timeSlot: string; voteCount: number }) => {
        const start = dayjs(item.timeSlot);
        const dateKey = start.format('MM.DD');
        const hour = start.hour();
        newMap.set(`${dateKey}-${hour}`, item.voteCount);
      });
      setVoteMap(newMap);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMainButtonClick = async () => {
    if (buttonState === '시간 제출' || buttonState === '시간 수정') {
      setIsLoading(true);
      try {
        const timeSlots = await getMyVotes();
        console.log('timeSlots:', timeSlots);

        toast.info('클릭 또는 드래그를 통해 선택 가능합니다.');
        setSelectedCells(parseVoteDataToCells(timeSlots));
        setIsEditing(true);
        setButtonState('완료');
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    } else if (buttonState === '완료') {
      const times = convertSelectedCellsToTime(
        selectedCells,
        date,
        initialTimeVoteStats.startDate
      );
      setIsLoading(true);
      try {
        if (selectedCells.length !== 0) {
          if (hasSubmitted) await putMyTimeVote(Number(id), times);
          else await postMyTimeVote(Number(id), times);
          toast.success('시간 선택이 완료되었습니다.');
          setSelectedCells([]);
          setIsEditing(false);
          setHasSubmitted(true);
          setButtonState('시간 수정');
          getSubmissions();
          await refreshVoteStats();
        } else {
          toast.info('시간을 선택해주세요!');
        }
      } catch (e) {
        if (axios.isAxiosError(e)) {
          const code = e.response?.data?.code;
          if (code === 'TVS_003') {
            toast.error('오류가 발생했습니다. 다시 시도해주세요!');
          } else {
            console.error(e);
            toast.error('오류가 발생했습니다. 다시 시도해주세요!');
          }
        } else {
          console.error('Axios 외의 오류: ', e);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelButtonClick = async () => {
    setIsLoading(true);
    try {
      await refreshVoteStats();
      setIsEditing(false);
      setSelectedCells([]);
      if (hasSubmitted) setButtonState('시간 수정');
      else setButtonState('시간 제출');
      getSubmissions();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // if (!isEditing) {
    getNullDataIndex();
    refreshVoteStats();
    checkSubmitted();
    getSubmissions();
    console.log('totalTimeVoteStats:', totalTimeVoteStats);
    // }
  }, []);

  useEffect(() => {
    if (!isOpenDeleteModal) {
      if (isEditing) {
        const setMycells = async () => {
          const timeSlots = await getMyVotes();
          setSelectedCells(parseVoteDataToCells(timeSlots));
        };
        setMycells();
        checkSubmitted();
      } else {
        refreshVoteStats();
        checkSubmitted();
        setSelectedCells([]);
        setIsEditing(false);
        getSubmissions();
      }
    }
  }, [isOpenDeleteModal]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isLoading]);

  return (
    <>
      {isLoading ? (
        <TimeGridSkeleton />
      ) : (
        <>
          <div className='select-none flex flex-col gap-[30px] '>
            {/* px-20 */}
            <div className='grid grid-cols-[6px_repeat(7,minmax(0,1fr))] place-items-center gap-x-4 gap-y-0 '>
              <div></div>
              {startDay.map((d, i) => (
                <div
                  key={i}
                  className='w-full flex justify-center items-center'
                >
                  {d && <Flag className='pl-2 mb-1 w-8 h-8 text-blue' />}
                </div>
              ))}
              <div></div>
              {day.map((d, i) => (
                <div
                  key={d}
                  className={`text-center tm3 bg-white ${
                    nullDataIndex[i] !== -1
                      ? 'text-border1'
                      : 'text-text1 opacity-50'
                  }`}
                >
                  {d}
                </div>
              ))}
              <div></div>
              {date.map((d, i) => (
                <div
                  key={d}
                  className={`text-center tm3 py-2 bg-white ${
                    nullDataIndex[i] !== -1
                      ? 'text-border1'
                      : 'text-text1 opacity-50'
                  }`}
                >
                  {nullDataIndex[i] !== -1 ? d.slice(1) : d}
                </div>
              ))}
              {[...Array(24)].map((_, hour) => (
                <React.Fragment key={hour}>
                  <div className='relative w-[18px] h-9'>
                    <span className='absolute right-0 top-0 transform -translate-y-1/2 text-sm text-text1 opacity-50'>
                      {hour}
                    </span>
                  </div>
                  {date.map((dateStr, dayIdx) => {
                    const cell = { day: dayIdx, hour };
                    const selected = isCellSelected(cell);
                    const key = `${dateStr}-${hour}`;
                    const count = voteMap.get(key) || 0;

                    if (nullDataIndex[dayIdx] !== -1) {
                      return (
                        <div
                          key={`${dayIdx}-${hour}`}
                          className={`w-20 h-9 max-[720px]:w-16 max-[540px]:w-12 max-[420px]:w-10 border-b border-b-border1 bg-border1 cursor-default relative ${
                            hour === 0
                              ? 'rounded-t-xl max-[720px]:rounded-t-lg'
                              : ''
                          } ${
                            hour === 23
                              ? 'rounded-b-xl max-[720px]:rounded-b-lg border-none'
                              : ''
                          }`}
                        ></div>
                      );
                    }

                    return (
                      <div
                        key={`${dayIdx}-${hour}`}
                        onMouseDown={() => handleMouseDown(cell)}
                        onMouseEnter={() => handleMouseEnter(cell)}
                        onMouseUp={() => handleMouseUp(cell)}
                        className={`w-20 h-9 max-[720px]:w-16 max-[540px]:w-12 max-[420px]:w-10 border-b border-b-border1 ${
                          selected
                            ? 'bg-gray1 text-white'
                            : isEditing
                            ? 'bg-[#fafafa] hover:bg-[#f1f1f1]'
                            : getBgClass(count)
                        } ${
                          hour === 0
                            ? 'rounded-t-xl max-[720px]:rounded-t-lg'
                            : ''
                        } ${
                          hour === 23
                            ? 'rounded-b-xl max-[720px]:rounded-b-lg border-none'
                            : ''
                        } cursor-pointer relative group`}
                      >
                        {!isEditing && count > 0 && (
                          <div className='absolute top-[-28px] left-1/2 -translate-x-1/2 bg-white border border-border1 px-2 py-[2px] rounded t5 text-black shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10'>
                            {count}명 선택
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            {/* px-20 */}
            <div className='flex lg:justify-end gap-[10px] '>
              {isLeader && !isEditing && (
                <button
                  className='lg:w-[235px] w-full h-[48px] bg-white border border-main lg:rounded-[10px] rounded-lg tm3 text-text1 hover:bg-gray4'
                  onClick={() => setIsOpenPeriodModal(true)}
                >
                  가능 시간 요청
                </button>
              )}
              {isEditing && (
                <button
                  className='lg:w-[235px] w-full h-[48px] bg-white border border-main lg:rounded-[10px] rounded-lg tm3 text-text1 hover:bg-gray4'
                  onClick={handleCancelButtonClick}
                >
                  취소
                </button>
              )}
              <button
                className={`lg:w-[235px] w-full h-[48px] bg-main lg:rounded-[10px] rounded-lg tm3 text-white hover:bg-[#292929] ${
                  isLoading
                    ? 'cursor-not-allowed! bg-[#c9c9c9] transition-colors duration-300'
                    : ''
                }`}
                disabled={isLoading}
                onClick={handleMainButtonClick}
              >
                {buttonState}
              </button>
            </div>
          </div>

          {isOpenPeriodModal && (
            <SetPeriodModal
              studyId={Number(id)}
              onClose={handleClosePeriodModal}
            />
          )}
        </>
      )}
    </>
  );
}
